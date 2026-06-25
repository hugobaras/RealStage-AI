import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getPlan, isValidPlanId, TRIAL_LIMIT } from "../config/plans.js";
import { getStripeConfig } from "../config.js";
import { initFirebaseAdmin, isFirebaseConfigured } from "./firebaseAdmin.js";

function currentMonthKey() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
}

function addOneMonth(date = new Date()) {
  const end = new Date(date);
  end.setMonth(end.getMonth() + 1);
  return end;
}

async function getUserRef(uid) {
  initFirebaseAdmin();
  return getFirestore().collection("users").doc(uid);
}

export async function getUserData(uid) {
  const ref = await getUserRef(uid);
  const doc = await ref.get();
  return { ref, data: doc.exists ? doc.data() : {} };
}

function normalizeSubscription(data) {
  const sub = data.subscription ?? {};
  return {
    status: sub.status ?? "none",
    planId: sub.planId ?? null,
    activatedAt: sub.activatedAt ?? null,
    currentPeriodEnd: sub.currentPeriodEnd ?? null,
    stripeCustomerId: sub.stripeCustomerId ?? null,
    stripeSubscriptionId: sub.stripeSubscriptionId ?? null,
  };
}

function getMonthlyUsage(data) {
  const usage = data.usage ?? {};
  const month = currentMonthKey();
  if (usage.month !== month) {
    return { month, count: 0, deepThinkingCount: 0 };
  }
  return {
    month: usage.month,
    count: usage.count ?? 0,
    deepThinkingCount: usage.deepThinkingCount ?? 0,
  };
}

function resolveDeepThinkingAccess(plan, usage) {
  if (!plan) {
    return {
      deepThinkingLimit: 0,
      deepThinkingRemaining: 0,
      canUseDeepThinking: false,
    };
  }

  const limit = plan.deepThinkingPerMonth;

  if (limit == null) {
    return {
      deepThinkingLimit: null,
      deepThinkingRemaining: null,
      canUseDeepThinking: true,
    };
  }

  const remaining = Math.max(0, limit - usage.deepThinkingCount);
  return {
    deepThinkingLimit: limit,
    deepThinkingRemaining: remaining,
    canUseDeepThinking: remaining > 0,
  };
}

function isSubscriptionActive(subscription) {
  if (!subscription.planId) return false;
  if (subscription.status !== "active") return false;
  if (!subscription.currentPeriodEnd) return true;
  const end =
    subscription.currentPeriodEnd.toDate?.() ??
    new Date(subscription.currentPeriodEnd);
  return end > new Date();
}

function isDemoMode() {
  return !getStripeConfig().configured;
}

export class SubscriptionError extends Error {
  constructor(message, code, status = 402) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export async function getSubscriptionState(uid) {
  if (!isFirebaseConfigured()) {
    return {
      trialLimit: TRIAL_LIMIT,
      trialUsed: 0,
      trialRemaining: TRIAL_LIMIT,
      subscription: { status: "none", planId: null },
      plan: null,
      canGenerate: true,
      usage: { month: currentMonthKey(), count: 0, deepThinkingCount: 0 },
      monthlyLimit: null,
      monthlyRemaining: null,
      deepThinkingLimit: null,
      deepThinkingRemaining: null,
      canUseDeepThinking: true,
      reason: null,
      demoMode: true,
      stripeConfigured: false,
      canManageBilling: false,
    };
  }

  const { data } = await getUserData(uid);
  const trialUsed = data.trialUsed ?? 0;
  const subscription = normalizeSubscription(data);
  const active = isSubscriptionActive(subscription);
  const plan = active ? getPlan(subscription.planId) : null;
  const usage = getMonthlyUsage(data);
  const deepThinking = resolveDeepThinkingAccess(plan, usage);

  let canGenerate = false;
  let reason = null;
  let monthlyLimit = null;
  let monthlyRemaining = null;

  if (active && plan) {
    monthlyLimit = plan.generationsPerMonth;
    if (monthlyLimit == null) {
      canGenerate = true;
      monthlyRemaining = null;
    } else {
      monthlyRemaining = Math.max(0, monthlyLimit - usage.count);
      canGenerate = usage.count < monthlyLimit;
      if (!canGenerate) reason = "quota_exceeded";
    }
  } else if (trialUsed < TRIAL_LIMIT) {
    canGenerate = true;
    reason = null;
  } else {
    canGenerate = false;
    reason =
      subscription.status === "canceled"
        ? "no_subscription"
        : "trial_exhausted";
  }

  return {
    trialLimit: TRIAL_LIMIT,
    trialUsed,
    trialRemaining: Math.max(0, TRIAL_LIMIT - trialUsed),
    subscription: {
      status: active ? "active" : subscription.status,
      planId: active ? subscription.planId : null,
      currentPeriodEnd: subscription.currentPeriodEnd,
    },
    plan: plan
      ? {
          id: plan.id,
          label: plan.label,
          generationsPerMonth: plan.generationsPerMonth,
          deepThinkingPerMonth: plan.deepThinkingPerMonth,
        }
      : null,
    canGenerate,
    usage,
    monthlyLimit,
    monthlyRemaining,
    deepThinkingLimit: deepThinking.deepThinkingLimit,
    deepThinkingRemaining: deepThinking.deepThinkingRemaining,
    canUseDeepThinking: deepThinking.canUseDeepThinking,
    reason,
    demoMode: isDemoMode(),
    stripeConfigured: getStripeConfig().configured,
    canManageBilling: Boolean(
      getStripeConfig().configured &&
      (subscription.stripeCustomerId || subscription.stripeSubscriptionId),
    ),
  };
}

export async function assertCanGenerate(uid) {
  const state = await getSubscriptionState(uid);
  if (state.canGenerate) return state;

  const messages = {
    trial_exhausted:
      "Vos 3 essais gratuits sont épuisés. Choisissez un abonnement pour continuer.",
    quota_exceeded:
      "Quota mensuel atteint. Passez à un forfait supérieur ou attendez le prochain cycle.",
    no_subscription: "Abonnement requis. Choisissez un forfait pour continuer.",
  };

  throw new SubscriptionError(
    messages[state.reason] ?? "Génération non autorisée.",
    state.reason ?? "no_subscription",
  );
}

export async function assertCanUseDeepThinking(uid) {
  const state = await getSubscriptionState(uid);

  if (state.canUseDeepThinking) return state;

  const message =
    state.deepThinkingLimit === 0
      ? "La réflexion approfondie est disponible avec un abonnement Starter ou supérieur."
      : "Quota de réflexion approfondie atteint pour ce mois. Passez à un forfait supérieur ou attendez le prochain cycle.";

  throw new SubscriptionError(message, "deep_thinking_quota_exceeded");
}

export async function recordGenerationUsage(
  uid,
  { deepThinking = false } = {},
) {
  if (!isFirebaseConfigured()) return;

  const { ref, data } = await getUserData(uid);
  const subscription = normalizeSubscription(data);
  const active = isSubscriptionActive(subscription);
  const month = currentMonthKey();
  const usage = getMonthlyUsage(data);

  const updates = {
    creditsUsed: FieldValue.increment(1),
  };

  if (active && subscription.planId) {
    updates.usage = {
      month,
      count: usage.count + 1,
      deepThinkingCount: usage.deepThinkingCount + (deepThinking ? 1 : 0),
    };
  } else {
    updates.trialUsed = (data.trialUsed ?? 0) + 1;
  }

  await ref.set(updates, { merge: true });
}

export async function activatePlanDemo(uid, planId) {
  if (!isValidPlanId(planId)) {
    throw new Error("Forfait invalide.");
  }

  if (!isFirebaseConfigured()) {
    return getSubscriptionState(uid);
  }

  const { ref } = await getUserData(uid);
  const now = new Date();
  const periodEnd = addOneMonth(now);

  await ref.set(
    {
      subscription: {
        status: "active",
        planId,
        activatedAt: now,
        currentPeriodEnd: periodEnd,
        stripeCustomerId: null,
      },
      usage: {
        month: currentMonthKey(),
        count: 0,
        deepThinkingCount: 0,
      },
    },
    { merge: true },
  );

  return getSubscriptionState(uid);
}

export async function cancelSubscriptionDemo(uid) {
  if (!isFirebaseConfigured()) {
    return getSubscriptionState(uid);
  }

  const { ref } = await getUserData(uid);
  await ref.set(
    {
      subscription: {
        status: "canceled",
        planId: null,
        activatedAt: null,
        currentPeriodEnd: null,
      },
    },
    { merge: true },
  );

  return getSubscriptionState(uid);
}

export async function applyStripeSubscription(
  uid,
  {
    planId,
    status,
    stripeCustomerId,
    stripeSubscriptionId,
    currentPeriodEnd,
    resetUsage = false,
  },
) {
  if (!isFirebaseConfigured()) return;

  const { ref, data } = await getUserData(uid);
  const now = new Date();
  const existingSubId = data.subscription?.stripeSubscriptionId;

  // Webhook d'annulation d'un ancien abonnement : ne pas écraser le forfait actif.
  if (
    status !== "active" &&
    existingSubId &&
    stripeSubscriptionId &&
    stripeSubscriptionId !== existingSubId
  ) {
    return;
  }

  const subscription = {
    status,
    planId: status === "active" ? planId : null,
    stripeCustomerId:
      stripeCustomerId ?? data.subscription?.stripeCustomerId ?? null,
    stripeSubscriptionId:
      stripeSubscriptionId ?? data.subscription?.stripeSubscriptionId ?? null,
    currentPeriodEnd: currentPeriodEnd ?? null,
    activatedAt:
      status === "active"
        ? (data.subscription?.activatedAt ?? now)
        : (data.subscription?.activatedAt ?? null),
  };

  const updates = { subscription };

  if (resetUsage && status === "active") {
    updates.usage = {
      month: currentMonthKey(),
      count: 0,
      deepThinkingCount: 0,
    };
  }

  await ref.set(updates, { merge: true });
}

// Mode démo uniquement (sans Stripe)
