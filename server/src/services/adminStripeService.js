import { getFirestore } from "firebase-admin/firestore";
import { getPlan } from "./planService.js";
import { getStripeConfig } from "../config.js";
import { initFirebaseAdmin, isFirebaseConfigured } from "./firebaseAdmin.js";
import {
  listPastDueUsers,
  reconcileBillingHealth,
} from "./adminBillingService.js";
import { listStripeWebhooks } from "./stripeWebhookLogService.js";

export function getStripeDashboardUrl() {
  const { secretKey } = getStripeConfig();
  if (!secretKey) return null;
  const isTest = secretKey.startsWith("sk_test_");
  return isTest
    ? "https://dashboard.stripe.com/test/dashboard"
    : "https://dashboard.stripe.com/dashboard";
}

export function getStripeCustomerUrl(customerId) {
  if (!customerId) return null;
  const { secretKey } = getStripeConfig();
  const isTest = secretKey?.startsWith("sk_test_");
  const prefix = isTest
    ? "https://dashboard.stripe.com/test"
    : "https://dashboard.stripe.com";
  return `${prefix}/customers/${customerId}`;
}

export async function getAdminStripeOverview() {
  if (!isFirebaseConfigured()) {
    throw Object.assign(new Error("Firebase non configuré."), { status: 503 });
  }

  initFirebaseAdmin();
  const db = getFirestore();
  const snapshot = await db.collection("users").get();

  const subscriptionCounts = {
    active: 0,
    past_due: 0,
    canceled: 0,
    none: 0,
  };

  let estimatedMrr = 0;

  for (const doc of snapshot.docs) {
    const sub = doc.data().subscription ?? {};
    const status = sub.status ?? "none";

    if (status === "active" && sub.planId) {
      const plan = getPlan(sub.planId);
      if (plan?.priceMonthly) {
        subscriptionCounts.active += 1;
        estimatedMrr += plan.priceMonthly ?? 0;
      }
    } else if (status === "past_due") {
      subscriptionCounts.past_due += 1;
    } else if (status === "canceled") {
      subscriptionCounts.canceled += 1;
    } else {
      subscriptionCounts.none += 1;
    }
  }

  const webhooks = await listStripeWebhooks({ limit: 50 });
  const pastDueUsers = await listPastDueUsers();
  const billingHealth = await reconcileBillingHealth();

  return {
    estimatedMrr,
    subscriptionCounts,
    stripeConfigured: Boolean(getStripeConfig().secretKey),
    dashboardUrl: getStripeDashboardUrl(),
    webhooks,
    pastDueUsers,
    billingHealth,
  };
}
