import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { initFirebaseAdmin, isFirebaseConfigured } from "./firebaseAdmin.js";

function serializeTimestamp(value) {
  if (!value) return null;
  if (value.toDate) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  return value;
}

export async function logStripeWebhook({
  eventId,
  type,
  status,
  error = null,
  uid = null,
  payloadPreview = null,
}) {
  if (!isFirebaseConfigured()) return;

  initFirebaseAdmin();
  await getFirestore()
    .collection("stripeWebhookLog")
    .add({
      eventId: eventId ?? null,
      type: type ?? "unknown",
      status,
      error: error ?? null,
      uid: uid ?? null,
      payloadPreview: payloadPreview ?? null,
      createdAt: FieldValue.serverTimestamp(),
    });
}

export async function listStripeWebhooks({
  limit = 50,
  status = null,
  type = null,
} = {}) {
  if (!isFirebaseConfigured()) {
    throw Object.assign(new Error("Firebase non configuré."), { status: 503 });
  }

  initFirebaseAdmin();
  const pageSize = Math.min(Math.max(limit, 1), 100);

  let query = getFirestore().collection("stripeWebhookLog");
  if (status) query = query.where("status", "==", status);
  if (type) query = query.where("type", "==", type);
  query = query.orderBy("createdAt", "desc").limit(pageSize);

  const snapshot = await query.get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      eventId: data.eventId ?? null,
      type: data.type,
      status: data.status,
      error: data.error ?? null,
      uid: data.uid ?? null,
      payloadPreview: data.payloadPreview ?? null,
      createdAt: serializeTimestamp(data.createdAt),
    };
  });
}
