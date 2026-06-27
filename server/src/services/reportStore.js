import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { initFirebaseAdmin, isFirebaseConfigured } from "./firebaseAdmin.js";
import { getGeneration } from "./generationStore.js";

export const REPORT_STATUSES = ["open", "resolved", "rejected", "escalated"];

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

function serializeReport(doc) {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toMillis?.() ?? null,
    updatedAt: data.updatedAt?.toMillis?.() ?? null,
  };
}

export async function createReport({
  generationId,
  userId,
  userEmail,
  reason,
  comment,
  generationMeta = null,
  generationOwnerUid = null,
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
    generationOwnerUid: generationOwnerUid ?? userId,
    reason,
    comment: comment ?? null,
    generationMeta,
    status: "open",
    createdAt: FieldValue.serverTimestamp(),
  });

  await ref.set(record);
  return { id: ref.id, ...record };
}

async function fetchReportsSnapshot({ status, limit }) {
  const db = getFirestore();
  const capped = Math.min(limit, 100);

  if (status) {
    try {
      return await db
        .collection("reports")
        .where("status", "==", status)
        .orderBy("createdAt", "desc")
        .limit(capped)
        .get();
    } catch {
      // fallback below
    }
  }

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

async function enrichReportWithImages(report) {
  const ownerUid = report.generationOwnerUid ?? report.userId;
  if (!ownerUid || !report.generationId) return report;

  try {
    const generation = await getGeneration(ownerUid, report.generationId);
    return {
      ...report,
      generation: {
        imageUrl: generation.imageUrl ?? null,
        baseImageUrl: generation.baseImageUrl ?? null,
        mode: generation.mode,
        roomType: generation.roomType,
        style: generation.style ?? null,
      },
    };
  } catch {
    return report;
  }
}

export async function listReports({ status = null, limit = 50 } = {}) {
  if (!isFirebaseConfigured()) return [];

  initFirebaseAdmin();
  const snapshot = await fetchReportsSnapshot({ status, limit });

  let results = snapshot.docs.map(serializeReport);

  if (status && !snapshot.docs.length) {
    results = results.filter((r) => r.status === status);
  } else if (status) {
    results = results.filter((r) => r.status === status);
  }

  return Promise.all(results.map(enrichReportWithImages));
}

export async function getReport(id) {
  if (!isFirebaseConfigured()) {
    throw Object.assign(new Error("Firebase non configuré."), { status: 503 });
  }

  initFirebaseAdmin();
  const doc = await getFirestore().collection("reports").doc(id).get();
  if (!doc.exists) {
    throw Object.assign(new Error("Signalement introuvable."), { status: 404 });
  }

  return enrichReportWithImages(serializeReport(doc));
}

export async function updateReport(id, { status, resolutionNote, resolvedBy }) {
  if (!isFirebaseConfigured()) {
    throw Object.assign(new Error("Firebase non configuré."), { status: 503 });
  }

  if (status && !REPORT_STATUSES.includes(status)) {
    throw Object.assign(new Error("Statut invalide."), { status: 400 });
  }

  initFirebaseAdmin();
  const ref = getFirestore().collection("reports").doc(id);
  const doc = await ref.get();
  if (!doc.exists) {
    throw Object.assign(new Error("Signalement introuvable."), { status: 404 });
  }

  const updates = { updatedAt: FieldValue.serverTimestamp() };
  if (status) updates.status = status;
  if (resolutionNote !== undefined) updates.resolutionNote = resolutionNote;
  if (resolvedBy) updates.resolvedBy = resolvedBy;

  await ref.update(updates);
  return getReport(id);
}

export async function batchUpdateReports(ids, action, adminUid) {
  const statusMap = { resolve: "resolved", reject: "rejected" };
  const status = statusMap[action];
  if (!status) {
    throw Object.assign(new Error("Action batch invalide."), { status: 400 });
  }

  const results = await Promise.all(
    ids.map((id) =>
      updateReport(id, { status, resolvedBy: adminUid }).catch((err) => ({
        id,
        error: err.message,
      })),
    ),
  );

  return results;
}

export async function countOpenReports() {
  if (!isFirebaseConfigured()) return 0;

  initFirebaseAdmin();
  try {
    const snapshot = await getFirestore()
      .collection("reports")
      .where("status", "==", "open")
      .count()
      .get();
    return snapshot.data().count;
  } catch {
    const snapshot = await getFirestore().collection("reports").get();
    return snapshot.docs.filter((doc) => doc.data().status === "open").length;
  }
}
