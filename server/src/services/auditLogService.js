import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { initFirebaseAdmin, isFirebaseConfigured } from "./firebaseAdmin.js";

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
