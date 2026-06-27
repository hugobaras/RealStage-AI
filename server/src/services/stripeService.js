import Stripe from "stripe";
import { getStripeConfig } from "../config.js";
import {
  getPlanRank,
  isValidPlanId,
  getStripePriceIdForPlan,
} from "./planService.js";
import { applyStripeSubscription } from "./subscriptionService.js";

let stripeClient = null;
let planChangePortalConfigId = null;

export function isStripeConfigured() {
  return getStripeConfig().configured;
}

export function getStripe() {
  if (!isStripeConfigured()) {
    throw new Error("Stripe non configuré.");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(getStripeConfig().secretKey);
  }
  return stripeClient;
}

export function getPriceIdForPlan(planId) {
  return getStripePriceIdForPlan(planId);
}

export function getPlanIdForPriceId(priceId) {
  const { prices } = getStripeConfig();
  return Object.entries(prices).find(([, id]) => id === priceId)?.[0] ?? null;
}

function planIdFromSubscription(stripeSubscription) {
  const priceId = stripeSubscription.items?.data?.[0]?.price?.id;
  const planFromPrice = getPlanIdForPriceId(priceId);
  // Le prix actif prime sur les métadonnées (changement de forfait via portail).
  if (planFromPrice) return planFromPrice;
  return stripeSubscription.metadata?.planId ?? null;
}

function isActiveStripeStatus(status) {
  return status === "active" || status === "trialing";
}

/** Unix period end from Stripe subscription (handles test payloads + API variants). */
export function parseStripePeriodEnd(subscription) {
  const unix =
    subscription?.current_period_end ??
    subscription?.items?.data?.[0]?.current_period_end ??
    null;

  if (unix == null || !Number.isFinite(Number(unix))) {
    return null;
  }

  const date = new Date(Number(unix) * 1000);
  return Number.isFinite(date.getTime()) ? date : null;
}

/**
 * Résout les abonnements multiples : conserve le forfait le plus élevé,
 * annule les doublons actifs côté Stripe, met à jour Firestore.
 */
export async function reconcileCustomerSubscriptions(uid, customerId) {
  if (!customerId) return null;

  const stripe = getStripe();
  const [active, trialing, pastDue] = await Promise.all([
    stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 100,
    }),
    stripe.subscriptions.list({
      customer: customerId,
      status: "trialing",
      limit: 100,
    }),
    stripe.subscriptions.list({
      customer: customerId,
      status: "past_due",
      limit: 100,
    }),
  ]);

  const candidates = [...active.data, ...trialing.data, ...pastDue.data].filter(
    (sub) => isActiveStripeStatus(sub.status) || sub.status === "past_due",
  );

  if (candidates.length === 0) {
    await applyStripeSubscription(uid, {
      planId: null,
      status: "canceled",
      stripeCustomerId: customerId,
      stripeSubscriptionId: null,
      currentPeriodEnd: null,
    });
    return null;
  }

  const ranked = candidates
    .map((sub) => ({
      sub,
      planId: planIdFromSubscription(sub),
      rank: getPlanRank(planIdFromSubscription(sub)),
    }))
    .sort((a, b) => {
      if (b.rank !== a.rank) return b.rank - a.rank;
      return b.sub.created - a.sub.created;
    });

  const winner = ranked[0];

  for (let i = 1; i < ranked.length; i++) {
    try {
      await stripe.subscriptions.cancel(ranked[i].sub.id);
      console.info(
        `Abonnement en double annulé : ${ranked[i].sub.id} (${ranked[i].planId})`,
      );
    } catch (err) {
      console.warn(
        `Impossible d'annuler l'abonnement ${ranked[i].sub.id}:`,
        err.message,
      );
    }
  }

  const status =
    winner.sub.status === "past_due"
      ? "past_due"
      : mapStripeStatus(winner.sub.status);

  await applyStripeSubscription(uid, {
    planId: status === "active" ? winner.planId : null,
    status,
    stripeCustomerId: customerId,
    stripeSubscriptionId: winner.sub.id,
    currentPeriodEnd: parseStripePeriodEnd(winner.sub),
    resetUsage: false,
  });

  return winner;
}

export async function getOrCreateStripeCustomer(uid, email) {
  const stripe = getStripe();
  const { getUserData } = await import("./subscriptionService.js");
  const { ref, data } = await getUserData(uid);

  const existingId = data.subscription?.stripeCustomerId;
  if (existingId) {
    try {
      await stripe.customers.retrieve(existingId);
      return existingId;
    } catch {
      // Customer supprimé côté Stripe — on en recrée un
    }
  }

  const customer = await stripe.customers.create({
    email: email ?? undefined,
    metadata: { firebaseUid: uid },
  });

  await ref.set(
    {
      subscription: {
        ...(data.subscription ?? {}),
        stripeCustomerId: customer.id,
      },
    },
    { merge: true },
  );

  return customer.id;
}

/**
 * Configuration portail avec subscription_update activé (requis pour
 * subscription_update_confirm). Créée/mise à jour automatiquement via l'API.
 */
async function ensurePlanChangePortalConfiguration() {
  if (planChangePortalConfigId) {
    return planChangePortalConfigId;
  }

  const stripe = getStripe();
  const { prices } = getStripeConfig();
  const priceIds = Object.values(prices).filter(Boolean);
  if (priceIds.length === 0) {
    throw new Error("Aucun prix Stripe configuré.");
  }

  const priceRecords = await Promise.all(
    priceIds.map((id) => stripe.prices.retrieve(id)),
  );

  const productIds = [
    ...new Set(
      priceRecords.map((price) =>
        typeof price.product === "string" ? price.product : price.product.id,
      ),
    ),
  ];

  // Tous les forfaits interchangeables, y compris entre produits distincts.
  const products = productIds.map((product) => ({
    product,
    prices: priceIds,
  }));

  const subscriptionUpdate = {
    enabled: true,
    default_allowed_updates: ["price"],
    proration_behavior: "create_prorations",
    products,
  };

  const configs = await stripe.billingPortal.configurations.list({
    limit: 100,
    active: true,
  });
  const existing = configs.data.find(
    (config) => config.metadata?.realstage_plan_changes === "true",
  );

  if (existing) {
    const updated = await stripe.billingPortal.configurations.update(
      existing.id,
      { features: { subscription_update: subscriptionUpdate } },
    );
    planChangePortalConfigId = updated.id;
    return planChangePortalConfigId;
  }

  const created = await stripe.billingPortal.configurations.create({
    name: "RealStage AI — changement de forfait",
    metadata: { realstage_plan_changes: "true" },
    features: {
      subscription_update: subscriptionUpdate,
      payment_method_update: { enabled: true },
      invoice_history: { enabled: true },
      customer_update: { enabled: false },
      subscription_cancel: { enabled: false },
    },
  });

  planChangePortalConfigId = created.id;
  return planChangePortalConfigId;
}

/**
 * Changement de forfait : portail Stripe avec confirmation de paiement
 * (prorata facturé), au lieu d'une mise à jour silencieuse côté API.
 */
async function createPlanChangePortalSession({ planId, stripeSubscription }) {
  const stripe = getStripe();
  const { clientUrl } = getStripeConfig();
  const priceId = getPriceIdForPlan(planId);
  if (!priceId) {
    throw new Error(`Prix Stripe manquant pour le forfait ${planId}.`);
  }

  const customerId =
    typeof stripeSubscription.customer === "string"
      ? stripeSubscription.customer
      : stripeSubscription.customer?.id;

  const itemId = stripeSubscription.items?.data?.[0]?.id;
  if (!customerId || !itemId) {
    throw new Error("Abonnement Stripe invalide.");
  }

  const configuration = await ensurePlanChangePortalConfiguration();

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    configuration,
    return_url: `${clientUrl}/pricing`,
    flow_data: {
      type: "subscription_update_confirm",
      subscription_update_confirm: {
        subscription: stripeSubscription.id,
        items: [
          {
            id: itemId,
            price: priceId,
            quantity: 1,
          },
        ],
      },
      after_completion: {
        type: "redirect",
        redirect: {
          return_url: `${clientUrl}/?checkout=success`,
        },
      },
    },
  });

  return { url: session.url, planChange: true, planId };
}

export async function createCheckoutSession({
  uid,
  email,
  planId,
  embedded = false,
}) {
  if (!isValidPlanId(planId)) {
    throw new Error("Forfait invalide.");
  }

  const priceId = getPriceIdForPlan(planId);
  if (!priceId) {
    throw new Error(`Prix Stripe manquant pour le forfait ${planId}.`);
  }

  const stripe = getStripe();
  const { clientUrl } = getStripeConfig();
  const { getUserData } = await import("./subscriptionService.js");
  const customerId = await getOrCreateStripeCustomer(uid, email);

  try {
    await reconcileCustomerSubscriptions(uid, customerId);
  } catch (err) {
    console.warn("Réconciliation Stripe avant checkout:", err.message);
  }

  const { data: freshData } = await getUserData(uid);
  const existingSubId = freshData.subscription?.stripeSubscriptionId;
  if (existingSubId && freshData.subscription?.status === "active") {
    const existing = await stripe.subscriptions.retrieve(existingSubId);
    if (isActiveStripeStatus(existing.status)) {
      const currentPlanId = planIdFromSubscription(existing);
      if (currentPlanId === planId) {
        throw new Error("Vous êtes déjà abonné à ce forfait.");
      }
      return createPlanChangePortalSession({
        planId,
        stripeSubscription: existing,
      });
    }
  }

  const sessionParams = {
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: {
      firebaseUid: uid,
      planId,
    },
    subscription_data: {
      metadata: {
        firebaseUid: uid,
        planId,
      },
    },
    allow_promotion_codes: true,
  };

  if (embedded) {
    sessionParams.ui_mode = "embedded_page";
    sessionParams.return_url = `${clientUrl}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
  } else {
    sessionParams.success_url = `${clientUrl}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
    sessionParams.cancel_url = `${clientUrl}/pricing?checkout=canceled`;
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  if (embedded) {
    return {
      clientSecret: session.client_secret,
      sessionId: session.id,
    };
  }

  return { url: session.url, sessionId: session.id };
}

export async function createBillingPortalSession(uid) {
  const stripe = getStripe();
  const { getUserData } = await import("./subscriptionService.js");
  const { ref, data } = await getUserData(uid);
  let customerId = data.subscription?.stripeCustomerId;

  if (!customerId && data.subscription?.stripeSubscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(
      data.subscription.stripeSubscriptionId,
    );
    customerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer?.id;

    if (customerId) {
      await ref.set(
        {
          subscription: {
            ...(data.subscription ?? {}),
            stripeCustomerId: customerId,
          },
        },
        { merge: true },
      );
    }
  }

  if (!customerId) {
    throw new Error(
      "Aucun compte de facturation Stripe. Réabonnez-vous via la page Tarifs.",
    );
  }

  const { clientUrl } = getStripeConfig();
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${clientUrl}/`,
  });

  return { url: session.url };
}

export function constructWebhookEvent(rawBody, signature) {
  const { webhookSecret } = getStripeConfig();
  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET manquant.");
  }
  return getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
}

function mapStripeStatus(status) {
  if (status === "active" || status === "trialing") return "active";
  if (status === "past_due") return "past_due";
  return "canceled";
}

export async function syncStripeSubscription(stripeSubscription) {
  const uid =
    stripeSubscription.metadata?.firebaseUid ??
    (await resolveUidFromCustomer(stripeSubscription.customer));

  if (!uid) {
    console.warn(
      "Webhook Stripe : uid Firebase introuvable",
      stripeSubscription.id,
    );
    return;
  }

  const customerId =
    typeof stripeSubscription.customer === "string"
      ? stripeSubscription.customer
      : stripeSubscription.customer?.id;

  await reconcileCustomerSubscriptions(uid, customerId);
}

async function resolveUidFromCustomer(customerId) {
  if (!customerId) return null;
  const stripe = getStripe();
  const customer = await stripe.customers.retrieve(
    typeof customerId === "string" ? customerId : customerId.id,
  );
  if (customer.deleted) return null;
  return customer.metadata?.firebaseUid ?? null;
}

export async function syncSubscriptionForUser(uid) {
  const { getUserData } = await import("./subscriptionService.js");
  const { data } = await getUserData(uid);
  const customerId = data.subscription?.stripeCustomerId;
  if (!customerId) {
    throw new Error("Aucun compte Stripe associé.");
  }
  return reconcileCustomerSubscriptions(uid, customerId);
}

export async function handleCheckoutSessionCompleted(session) {
  const uid = session.metadata?.firebaseUid;
  if (!uid || !session.subscription) return;

  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription.id,
  );

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id;

  await reconcileCustomerSubscriptions(uid, customerId);
}

export async function handleStripeWebhook(event) {
  let uid = null;

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      uid = session.metadata?.firebaseUid ?? null;
      await handleCheckoutSessionCompleted(session);
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      uid =
        subscription.metadata?.firebaseUid ??
        (await resolveUidFromCustomer(subscription.customer));
      if (event.type === "customer.subscription.deleted") {
        await syncStripeSubscription({
          ...subscription,
          status: "canceled",
        });
      } else {
        await syncStripeSubscription(subscription);
      }
      break;
    }
    case "invoice.payment_failed":
    case "invoice.paid": {
      const invoice = event.data.object;
      uid = await resolveUidFromCustomer(invoice.customer);
      break;
    }
    default:
      break;
  }

  return { uid };
}

export async function cancelStripeSubscription(uid) {
  const stripe = getStripe();
  const { getUserData } = await import("./subscriptionService.js");
  const { data } = await getUserData(uid);
  const subscriptionId = data.subscription?.stripeSubscriptionId;

  if (!subscriptionId) {
    throw new Error("Aucun abonnement actif à annuler.");
  }

  await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await syncStripeSubscription(subscription);
}
