import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { initFirebaseAdmin, isFirebaseConfigured } from "./firebaseAdmin.js";

export const AUDIT_ACTIONS = [
  "patch_user",
  "grant_admin",
  "revoke_admin",
  "delete_generation",
  "update_report",
  "update_config",
  "seed_config",
  "sync_stripe",
  "force_logout",
  "moderate_generation",
  "update_blacklist",
  "impersonate_start",
  "impersonate_end",
];

function serializeTimestamp(value) {
  if (!value) return null;
  if (value.toDate) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  return value;
}

export async function logAdminAction({
  adminUid,
  action,
  target,
  details = null,
}) {
  if (!isFirebaseConfigured()) return;

  initFirebaseAdmin();
  await getFirestore()
    .collection("auditLog")
    .add({
      adminUid,
      action,
      target: target ?? null,
      details: details ?? null,
      createdAt: FieldValue.serverTimestamp(),
    });
}

async function resolveAdminEmails(adminUids) {
  const unique = [...new Set(adminUids.filter(Boolean))];
  const cache = new Map();
  initFirebaseAdmin();
  const auth = getAuth();

  await Promise.all(
    unique.map(async (uid) => {
      try {
        const user = await auth.getUser(uid);
        cache.set(uid, user.email ?? null);
      } catch {
        cache.set(uid, null);
      }
    }),
  );

  return cache;
}

export async function listAuditLog({
  adminUid = null,
  action = null,
  from = null,
  to = null,
  limit = 50,
  cursor = null,
} = {}) {
  if (!isFirebaseConfigured()) {
    throw Object.assign(new Error("Firebase non configuré."), { status: 503 });
  }

  initFirebaseAdmin();
  const db = getFirestore();
  const pageSize = Math.min(Math.max(limit, 1), 100);

  let query = db.collection("auditLog");
  const filterActionInMemory = Boolean(adminUid && action);

  if (adminUid) {
    query = query.where("adminUid", "==", adminUid);
  } else if (action) {
    query = query.where("action", "==", action);
  }
  if (from) {
    query = query.where("createdAt", ">=", new Date(from));
  }
  if (to) {
    query = query.where("createdAt", "<=", new Date(to));
  }

  query = query.orderBy("createdAt", "desc").limit(pageSize);

  if (cursor) {
    const cursorDoc = await db.collection("auditLog").doc(cursor).get();
    if (cursorDoc.exists) {
      query = query.startAfter(cursorDoc);
    }
  }

  const snapshot = await query.get();
  const emailCache = await resolveAdminEmails(
    snapshot.docs.map((doc) => doc.data().adminUid),
  );

  let entries = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      adminUid: data.adminUid,
      adminEmail: emailCache.get(data.adminUid) ?? null,
      action: data.action,
      target: data.target ?? null,
      details: data.details ?? null,
      createdAt: serializeTimestamp(data.createdAt),
    };
  });

  if (filterActionInMemory) {
    entries = entries.filter((e) => e.action === action);
  }

  const lastDoc = snapshot.docs[snapshot.docs.length - 1];

  return {
    entries,
    nextCursor:
      snapshot.docs.length === pageSize && lastDoc ? lastDoc.id : null,
  };
}
