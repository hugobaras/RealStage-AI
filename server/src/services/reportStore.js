import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { initFirebaseAdmin, isFirebaseConfigured } from "./firebaseAdmin.js";

function stripUndefined(value) {
  if (value === undefined) return null;
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(stripUndefined);
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, stripUndefined(v)]),
  );
}

export async function createReport({
  generationId,
  userId,
  userEmail,
  reason,
  comment,
  generationMeta = null,
}) {
  if (!isFirebaseConfigured()) {
    throw Object.assign(new Error("Firebase non configuré."), { status: 503 });
  }

  initFirebaseAdmin();
  const ref = getFirestore().collection("reports").doc();
  const record = stripUndefined({
    generationId,
    userId,
    userEmail: userEmail ?? null,
    reason,
    comment: comment ?? null,
    generationMeta,
    status: "open",
    createdAt: FieldValue.serverTimestamp(),
  });

  await ref.set(record);
  return { id: ref.id, ...record };
}

async function fetchReportsSnapshot(limit) {
  const db = getFirestore();
  const capped = Math.min(limit, 100);

  try {
    return await db
      .collection("reports")
      .orderBy("createdAt", "desc")
      .limit(capped)
      .get();
  } catch (err) {
    console.warn(
      "reports orderBy(createdAt) indisponible — lecture sans index:",
      err.message,
    );
    const snapshot = await db.collection("reports").limit(capped).get();
    const docs = [...snapshot.docs].sort((a, b) => {
      const aTime = a.data().createdAt?.toMillis?.() ?? 0;
      const bTime = b.data().createdAt?.toMillis?.() ?? 0;
      return bTime - aTime;
    });
    return { docs, empty: docs.length === 0, size: docs.length };
  }
}

export async function listReports({ status = null, limit = 50 } = {}) {
  if (!isFirebaseConfigured()) return [];

  initFirebaseAdmin();
  const snapshot = await fetchReportsSnapshot(limit);

  let results = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toMillis?.() ?? null,
    };
  });

  if (status) {
    results = results.filter((r) => r.status === status);
  }

  return results;
}

export async function updateReportStatus(id, status) {
  if (!isFirebaseConfigured()) {
    throw Object.assign(new Error("Firebase non configuré."), { status: 503 });
  }

  initFirebaseAdmin();
  const ref = getFirestore().collection("reports").doc(id);
  const doc = await ref.get();
  if (!doc.exists) {
    throw Object.assign(new Error("Signalement introuvable."), { status: 404 });
  }

  await ref.update({ status, updatedAt: FieldValue.serverTimestamp() });
  const updated = await ref.get();
  const data = updated.data();
  return {
    id: updated.id,
    ...data,
    createdAt: data.createdAt?.toMillis?.() ?? null,
  };
}

export async function countOpenReports() {
  if (!isFirebaseConfigured()) return 0;

  initFirebaseAdmin();
  const snapshot = await getFirestore().collection("reports").get();
  return snapshot.docs.filter((doc) => doc.data().status === "open").length;
}
