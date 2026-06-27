import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { isValidPlanId } from "./planService.js";
import { initFirebaseAdmin, isFirebaseConfigured } from "./firebaseAdmin.js";
import { getSubscriptionState, getUserData } from "./subscriptionService.js";
import { logAdminAction } from "./auditLogService.js";
import { listGenerationsAdmin } from "./generationStore.js";
import { listProperties } from "./propertyStore.js";
import { syncSubscriptionForUser } from "./stripeService.js";
import { getStripeCustomerUrl } from "./adminStripeService.js";

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function serializeTimestamp(value) {
  if (!value) return null;
  if (value.toDate) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  return value;
}

function normalizeSubscription(data) {
  const sub = data.subscription ?? {};
  return {
    status: sub.status ?? "none",
    planId: sub.planId ?? null,
    activatedAt: serializeTimestamp(sub.activatedAt),
    currentPeriodEnd: serializeTimestamp(sub.currentPeriodEnd),
    stripeCustomerId: sub.stripeCustomerId ?? null,
    stripeSubscriptionId: sub.stripeSubscriptionId ?? null,
  };
}

async function countSubcollection(uid, name) {
  const snapshot = await getFirestore()
    .collection("users")
    .doc(uid)
    .collection(name)
    .count()
    .get();
  return snapshot.data().count;
}

export async function buildUserSummary(authUser, firestoreData = {}) {
  const subscription = normalizeSubscription(firestoreData);
  const usage = firestoreData.usage ?? {};
  const generationCount = await countSubcollection(
    authUser.uid,
    "generations",
  ).catch(() => 0);

  return {
    uid: authUser.uid,
    email: authUser.email ?? null,
    name: authUser.displayName ?? null,
    disabled: authUser.disabled,
    createdAt: authUser.metadata.creationTime,
    lastSignIn: authUser.metadata.lastSignInTime,
    admin: authUser.customClaims?.admin === true,
    subscription,
    trialUsed: firestoreData.trialUsed ?? 0,
    creditsUsed: firestoreData.creditsUsed ?? 0,
    usage: {
      month: usage.month ?? null,
      count: usage.count ?? 0,
      deepThinkingCount: usage.deepThinkingCount ?? 0,
    },
    generationCount,
  };
}

export async function listAdminUsers({
  pageToken = null,
  limit = 50,
  search = "",
} = {}) {
  if (!isFirebaseConfigured()) {
    throw Object.assign(new Error("Firebase non configuré."), { status: 503 });
  }

  initFirebaseAdmin();
  const auth = getAuth();
  const db = getFirestore();
  const trimmedSearch = search.trim().toLowerCase();

  if (trimmedSearch && trimmedSearch.includes("@")) {
    try {
      const authUser = await auth.getUserByEmail(trimmedSearch);
      const doc = await db.collection("users").doc(authUser.uid).get();
      const summary = await buildUserSummary(
        authUser,
        doc.exists ? doc.data() : {},
      );
      return { users: [summary], nextPageToken: null };
    } catch {
      return { users: [], nextPageToken: null };
    }
  }

  const result = await auth.listUsers(
    Math.min(limit, 100),
    pageToken || undefined,
  );
  const users = await Promise.all(
    result.users.map(async (authUser) => {
      const doc = await db.collection("users").doc(authUser.uid).get();
      return buildUserSummary(authUser, doc.exists ? doc.data() : {});
    }),
  );

  let filtered = users;
  if (trimmedSearch) {
    filtered = users.filter(
      (u) =>
        u.email?.toLowerCase().includes(trimmedSearch) ||
        u.name?.toLowerCase().includes(trimmedSearch) ||
        u.uid.includes(trimmedSearch),
    );
  }

  return {
    users: filtered,
    nextPageToken: result.pageToken ?? null,
  };
}

export async function getAdminUserDetail(uid) {
  if (!isFirebaseConfigured()) {
    throw Object.assign(new Error("Firebase non configuré."), { status: 503 });
  }

  initFirebaseAdmin();
  const auth = getAuth();
  const db = getFirestore();

  const authUser = await auth.getUser(uid);
  const doc = await db.collection("users").doc(uid).get();
  const data = doc.exists ? doc.data() : {};

  const [
    generationCount,
    propertyCount,
    subscriptionState,
    generations,
    properties,
  ] = await Promise.all([
    countSubcollection(uid, "generations"),
    countSubcollection(uid, "properties"),
    getSubscriptionState(uid),
    listGenerationsAdmin({ uid, limit: 20 }),
    listProperties(uid),
  ]);

  return {
    ...(await buildUserSummary(authUser, data)),
    agencySettings: data.agencySettings ?? null,
    generationCount,
    propertyCount,
    subscriptionState,
    generations,
    properties,
    stripeCustomerUrl: getStripeCustomerUrl(
      data.subscription?.stripeCustomerId ?? null,
    ),
  };
}

export async function patchAdminUser(uid, body, adminUid) {
  if (!isFirebaseConfigured()) {
    throw Object.assign(new Error("Firebase non configuré."), { status: 503 });
  }

  initFirebaseAdmin();
  const { ref, data } = await getUserData(uid);
  const updates = {};

  if (body.planId !== undefined) {
    if (body.planId !== null && !isValidPlanId(body.planId)) {
      throw Object.assign(new Error("Forfait invalide."), { status: 400 });
    }
    const status = body.status ?? (body.planId ? "active" : "canceled");
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    updates.subscription = {
      ...(data.subscription ?? {}),
      status,
      planId: body.planId,
      activatedAt: body.planId ? now : null,
      currentPeriodEnd: body.planId ? periodEnd : null,
    };
  } else if (body.status !== undefined) {
    updates.subscription = {
      ...(data.subscription ?? {}),
      status: body.status,
      planId:
        body.status === "active" ? (data.subscription?.planId ?? null) : null,
    };
  }

  if (body.resetMonthlyUsage) {
    const month = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
    updates.usage = { month, count: 0, deepThinkingCount: 0 };
  }

  if (body.resetTrial) {
    updates.trialUsed = 0;
  }

  if (body.extendedTrialDays !== undefined) {
    const days = Math.max(0, Number(body.extendedTrialDays) || 0);
    const expires = new Date();
    expires.setDate(expires.getDate() + days);
    updates.trialExpiresAt = expires;
    updates.trialUsed = 0;
  }

  if (body.resetCredits) {
    updates.creditsUsed = 0;
  }

  const month = currentMonthKey();
  const usage = data.usage ?? {};

  if (body.creditGenerations !== undefined) {
    const credit = Math.max(0, Number(body.creditGenerations) || 0);
    const currentCount = usage.month === month ? (usage.count ?? 0) : 0;
    updates.usage = {
      month,
      count: Math.max(0, currentCount - credit),
      deepThinkingCount:
        usage.month === month ? (usage.deepThinkingCount ?? 0) : 0,
    };
  }

  if (body.creditDeepThinking !== undefined) {
    const credit = Math.max(0, Number(body.creditDeepThinking) || 0);
    const currentDeep =
      usage.month === month ? (usage.deepThinkingCount ?? 0) : 0;
    const currentCount =
      updates.usage?.count ?? (usage.month === month ? (usage.count ?? 0) : 0);
    updates.usage = {
      month,
      count: currentCount,
      deepThinkingCount: Math.max(0, currentDeep - credit),
    };
  }

  if (body.disabled !== undefined) {
    await getAuth().updateUser(uid, { disabled: Boolean(body.disabled) });
  }

  if (body.forceLogout) {
    await getAuth().revokeRefreshTokens(uid);
    await logAdminAction({
      adminUid,
      action: "force_logout",
      target: uid,
    });
  }

  if (Object.keys(updates).length > 0) {
    await ref.set(updates, { merge: true });
  }

  const auditAction =
    body.creditGenerations !== undefined ||
    body.creditDeepThinking !== undefined
      ? "credit_usage"
      : "patch_user";

  if (
    Object.keys(updates).length > 0 ||
    body.planId !== undefined ||
    body.status !== undefined ||
    body.resetMonthlyUsage ||
    body.resetTrial ||
    body.resetCredits ||
    body.disabled !== undefined
  ) {
    await logAdminAction({
      adminUid,
      action: auditAction,
      target: uid,
      details: body,
    });
  }

  return getAdminUserDetail(uid);
}

export async function setUserAdminClaim(uid, grant, adminUid) {
  if (!isFirebaseConfigured()) {
    throw Object.assign(new Error("Firebase non configuré."), { status: 503 });
  }

  initFirebaseAdmin();
  if (grant) {
    await getAuth().setCustomUserClaims(uid, {
      admin: true,
      role: "super_admin",
    });
  } else {
    await getAuth().setCustomUserClaims(uid, { admin: false, role: null });
  }

  await logAdminAction({
    adminUid,
    action: grant ? "grant_admin" : "revoke_admin",
    target: uid,
  });

  return getAdminUserDetail(uid);
}

export async function setUserAdminRole(uid, role, adminUid) {
  const allowed = ["super_admin", "support", "readonly", null];
  if (!allowed.includes(role)) {
    throw Object.assign(new Error("Rôle admin invalide."), { status: 400 });
  }

  if (!isFirebaseConfigured()) {
    throw Object.assign(new Error("Firebase non configuré."), { status: 503 });
  }

  initFirebaseAdmin();
  if (role) {
    await getAuth().setCustomUserClaims(uid, { admin: true, role });
  } else {
    await getAuth().setCustomUserClaims(uid, { admin: false, role: null });
  }

  await logAdminAction({
    adminUid,
    action: role ? "grant_admin" : "revoke_admin",
    target: uid,
    details: { role },
  });

  return getAdminUserDetail(uid);
}

export async function disableUser(uid, disabled, adminUid) {
  return patchAdminUser(uid, { disabled }, adminUid);
}

export async function forceLogoutUser(uid, adminUid) {
  if (!isFirebaseConfigured()) {
    throw Object.assign(new Error("Firebase non configuré."), { status: 503 });
  }

  initFirebaseAdmin();
  await getAuth().revokeRefreshTokens(uid);

  await logAdminAction({
    adminUid,
    action: "force_logout",
    target: uid,
  });

  return getAdminUserDetail(uid);
}

export async function syncStripeForUser(uid, adminUid) {
  await syncSubscriptionForUser(uid);

  await logAdminAction({
    adminUid,
    action: "sync_stripe",
    target: uid,
  });

  return getAdminUserDetail(uid);
}
