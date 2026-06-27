import { getStripe } from "./stripeService.js";
import { getStripeConfig } from "../config.js";
import { getFirestore } from "firebase-admin/firestore";
import { initFirebaseAdmin, isFirebaseConfigured } from "./firebaseAdmin.js";
import { getStripeCustomerUrl } from "./adminStripeService.js";
import { listStripeWebhooks } from "./stripeWebhookLogService.js";
import { getPlan } from "./planService.js";

export async function listCoupons() {
  const stripe = getStripe();
  const coupons = await stripe.coupons.list({ limit: 50 });
  const codes = await stripe.promotionCodes.list({ limit: 50 });
  return {
    coupons: coupons.data,
    promotionCodes: codes.data,
  };
}

export async function createCoupon({
  percentOff,
  amountOff,
  duration,
  durationInMonths,
  name,
  code,
}) {
  const stripe = getStripe();
  const coupon = await stripe.coupons.create({
    percent_off: percentOff ?? undefined,
    amount_off: amountOff ?? undefined,
    currency: amountOff ? "eur" : undefined,
    duration: duration ?? "once",
    duration_in_months: durationInMonths ?? undefined,
    name: name ?? undefined,
  });

  let promotionCode = null;
  if (code) {
    promotionCode = await stripe.promotionCodes.create({
      coupon: coupon.id,
      code,
    });
  }

  return { coupon, promotionCode };
}

export async function listUserInvoices(uid) {
  if (!isFirebaseConfigured()) {
    throw Object.assign(new Error("Firebase non configuré."), { status: 503 });
  }

  initFirebaseAdmin();
  const doc = await getFirestore().collection("users").doc(uid).get();
  const customerId = doc.data()?.subscription?.stripeCustomerId;
  if (!customerId) return { invoices: [] };

  const stripe = getStripe();
  const result = await stripe.invoices.list({
    customer: customerId,
    limit: 24,
  });
  return {
    invoices: result.data.map((inv) => ({
      id: inv.id,
      number: inv.number,
      status: inv.status,
      amountDue: inv.amount_due,
      currency: inv.currency,
      created: inv.created * 1000,
      hostedInvoiceUrl: inv.hosted_invoice_url,
      pdf: inv.invoice_pdf,
    })),
  };
}

export async function listPastDueUsers() {
  if (!isFirebaseConfigured()) return [];

  initFirebaseAdmin();
  const snapshot = await getFirestore()
    .collection("users")
    .where("subscription.status", "==", "past_due")
    .limit(50)
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      uid: doc.id,
      email: data.email ?? null,
      planId: data.subscription?.planId ?? null,
      stripeCustomerId: data.subscription?.stripeCustomerId ?? null,
      stripeCustomerUrl: getStripeCustomerUrl(
        data.subscription?.stripeCustomerId,
      ),
    };
  });
}

export async function reconcileBillingHealth() {
  if (!isFirebaseConfigured()) {
    throw Object.assign(new Error("Firebase non configuré."), { status: 503 });
  }

  initFirebaseAdmin();
  const db = getFirestore();
  const snapshot = await db.collection("users").get();
  const mismatches = [];

  if (!getStripeConfig().secretKey) {
    return { mismatches, stripeConfigured: false };
  }

  const stripe = getStripe();

  for (const doc of snapshot.docs) {
    const sub = doc.data().subscription ?? {};
    if (!sub.stripeSubscriptionId) continue;

    try {
      const stripeSub = await stripe.subscriptions.retrieve(
        sub.stripeSubscriptionId,
      );
      const firestoreStatus = sub.status ?? "none";
      const stripeStatus =
        stripeSub.status === "active" || stripeSub.status === "trialing"
          ? "active"
          : stripeSub.status === "past_due"
            ? "past_due"
            : "canceled";

      if (firestoreStatus !== stripeStatus) {
        mismatches.push({
          uid: doc.id,
          firestoreStatus,
          stripeStatus,
          subscriptionId: sub.stripeSubscriptionId,
        });
      }
    } catch {
      mismatches.push({
        uid: doc.id,
        firestoreStatus: sub.status,
        stripeStatus: "not_found",
        subscriptionId: sub.stripeSubscriptionId,
      });
    }
  }

  const failedWebhooks = await listStripeWebhooks(20);
  const webhookErrors = failedWebhooks.filter((w) => w.status === "error");

  return {
    mismatches,
    webhookErrors,
    pastDueCount: (await listPastDueUsers()).length,
    stripeConfigured: true,
  };
}

export function estimateMrrFromUsers(users) {
  let mrr = 0;
  for (const user of users) {
    const plan = getPlan(user.planId);
    if (plan?.priceMonthly) mrr += plan.priceMonthly;
  }
  return mrr;
}
