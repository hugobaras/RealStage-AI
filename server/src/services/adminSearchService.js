import { FieldPath, getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { initFirebaseAdmin, isFirebaseConfigured } from "./firebaseAdmin.js";
import { buildUserSummary } from "./adminUserService.js";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FIREBASE_UID_RE = /^[a-zA-Z0-9]{20,}$/;

async function findUserByAuth(authUser) {
  initFirebaseAdmin();
  const doc = await getFirestore().collection("users").doc(authUser.uid).get();
  const summary = await buildUserSummary(
    authUser,
    doc.exists ? doc.data() : {},
  );
  return { type: "user", user: summary };
}

async function findUserByStripeCustomerId(customerId) {
  initFirebaseAdmin();
  const db = getFirestore();
  const snapshot = await db
    .collection("users")
    .where("subscription.stripeCustomerId", "==", customerId)
    .limit(5)
    .get();

  if (snapshot.empty) return null;

  const auth = getAuth();
  const results = await Promise.all(
    snapshot.docs.map(async (doc) => {
      const authUser = await auth.getUser(doc.id);
      return buildUserSummary(authUser, doc.data());
    }),
  );

  return { type: "users", users: results };
}

async function findUserByStripeSubscriptionId(subscriptionId) {
  initFirebaseAdmin();
  const db = getFirestore();
  const snapshot = await db
    .collection("users")
    .where("subscription.stripeSubscriptionId", "==", subscriptionId)
    .limit(5)
    .get();

  if (snapshot.empty) return null;

  const auth = getAuth();
  const results = await Promise.all(
    snapshot.docs.map(async (doc) => {
      const authUser = await auth.getUser(doc.id);
      return buildUserSummary(authUser, doc.data());
    }),
  );

  return { type: "users", users: results };
}

async function findGenerationById(generationId) {
  initFirebaseAdmin();
  const db = getFirestore();

  try {
    const snapshot = await db
      .collectionGroup("generations")
      .where(FieldPath.documentId(), "==", generationId)
      .limit(1)
      .get();

    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      const uid = doc.ref.parent.parent?.id;
      const data = doc.data();
      return {
        type: "generation",
        generation: {
          id: doc.id,
          uid,
          mode: data.mode,
          roomType: data.roomType,
          style: data.style ?? null,
          propertyId: data.propertyId ?? null,
          createdAt: data.createdAt?.toMillis?.() ?? null,
        },
      };
    }
  } catch {
    // collection group index may be missing — fallback below
  }

  const usersSnap = await db.collection("users").limit(50).get();
  for (const userDoc of usersSnap.docs) {
    const genDoc = await userDoc.ref
      .collection("generations")
      .doc(generationId)
      .get();
    if (genDoc.exists) {
      const data = genDoc.data();
      return {
        type: "generation",
        generation: {
          id: genDoc.id,
          uid: userDoc.id,
          mode: data.mode,
          roomType: data.roomType,
          style: data.style ?? null,
          propertyId: data.propertyId ?? null,
          createdAt: data.createdAt?.toMillis?.() ?? null,
        },
      };
    }
  }

  return null;
}

export async function adminGlobalSearch(query) {
  if (!isFirebaseConfigured()) {
    throw Object.assign(new Error("Firebase non configuré."), { status: 503 });
  }

  const trimmed = query?.trim();
  if (!trimmed) {
    return { results: [] };
  }

  initFirebaseAdmin();
  const auth = getAuth();
  const results = [];

  if (trimmed.includes("@")) {
    try {
      const authUser = await auth.getUserByEmail(trimmed.toLowerCase());
      results.push(await findUserByAuth(authUser));
    } catch {
      // not found
    }
  }

  if (trimmed.startsWith("cus_")) {
    const match = await findUserByStripeCustomerId(trimmed);
    if (match) results.push(match);
  }

  if (trimmed.startsWith("sub_")) {
    const match = await findUserByStripeSubscriptionId(trimmed);
    if (match) results.push(match);
  }

  if (UUID_RE.test(trimmed)) {
    const match = await findGenerationById(trimmed);
    if (match) results.push(match);
  }

  if (FIREBASE_UID_RE.test(trimmed) && !trimmed.startsWith("cus_")) {
    try {
      const authUser = await auth.getUser(trimmed);
      const existing = results.some(
        (r) =>
          (r.type === "user" && r.user.uid === trimmed) ||
          (r.type === "users" && r.users.some((u) => u.uid === trimmed)),
      );
      if (!existing) {
        results.push(await findUserByAuth(authUser));
      }
    } catch {
      // not found
    }
  }

  if (results.length === 0 && trimmed.length >= 3) {
    const listResult = await auth.listUsers(100);
    const lower = trimmed.toLowerCase();
    const matches = listResult.users.filter(
      (u) =>
        u.email?.toLowerCase().includes(lower) ||
        u.uid.includes(trimmed) ||
        u.displayName?.toLowerCase().includes(lower),
    );
    if (matches.length > 0) {
      const users = await Promise.all(
        matches.slice(0, 10).map((u) => findUserByAuth(u)),
      );
      results.push({
        type: "users",
        users: users.map((r) => r.user),
      });
    }
  }

  return { results, query: trimmed };
}
