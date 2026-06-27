import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { initFirebaseAdmin, isFirebaseConfigured } from "./firebaseAdmin.js";
import { getGeneration, toGenerationEntryFromDoc } from "./generationStore.js";
import { sendGenerationModeratedEmail } from "./emailService.js";
import { logAdminAction } from "./auditLogService.js";

export async function moderateGeneration(
  uid,
  generationId,
  { hidden, sensitive, reason, notifyUser },
  adminUid,
) {
  if (!isFirebaseConfigured()) {
    throw Object.assign(new Error("Firebase non configuré."), { status: 503 });
  }

  initFirebaseAdmin();
  const ref = getFirestore()
    .collection("users")
    .doc(uid)
    .collection("generations")
    .doc(generationId);

  const doc = await ref.get();
  if (!doc.exists) {
    throw Object.assign(new Error("Génération introuvable."), { status: 404 });
  }

  const moderation = {
    hidden:
      hidden !== undefined
        ? Boolean(hidden)
        : (doc.data().moderation?.hidden ?? false),
    sensitive:
      sensitive !== undefined
        ? Boolean(sensitive)
        : (doc.data().moderation?.sensitive ?? false),
    reason: reason ?? doc.data().moderation?.reason ?? null,
    moderatedBy: adminUid,
    moderatedAt: FieldValue.serverTimestamp(),
  };

  await ref.update({ moderation });

  await logAdminAction({
    adminUid,
    action: "moderate_generation",
    target: `${uid}/${generationId}`,
    details: moderation,
  });

  if (notifyUser) {
    try {
      const authUser = await getAuth().getUser(uid);
      const generation = await getGeneration(uid, generationId);
      await sendGenerationModeratedEmail({
        email: authUser.email,
        generation,
        reason: moderation.reason,
      });
    } catch (err) {
      console.error("Notification modération échouée:", err.message);
    }
  }

  const updated = await ref.get();
  return toGenerationEntryFromDoc(generationId, updated.data());
}
