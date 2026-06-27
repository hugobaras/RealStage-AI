import { getFirestore } from "firebase-admin/firestore";
import { initFirebaseAdmin, isFirebaseConfigured } from "./firebaseAdmin.js";

export async function updateExportPrefs(uid, exportPrefs) {
  if (!isFirebaseConfigured()) return null;

  initFirebaseAdmin();
  const ref = getFirestore().collection("users").doc(uid);
  await ref.set(
    {
      exportPrefs: {
        aiLabelEnabled: Boolean(exportPrefs?.aiLabelEnabled),
        updatedAt: new Date(),
      },
    },
    { merge: true },
  );
  return exportPrefs;
}

export async function getAiLabelComplianceStats() {
  if (!isFirebaseConfigured()) {
    throw Object.assign(new Error("Firebase non configuré."), { status: 503 });
  }

  initFirebaseAdmin();
  const snapshot = await getFirestore().collection("users").get();

  let total = 0;
  let enabled = 0;
  const byPlan = {
    starter: { total: 0, enabled: 0 },
    pro: { total: 0, enabled: 0 },
    agence: { total: 0, enabled: 0 },
    other: { total: 0, enabled: 0 },
  };

  for (const doc of snapshot.docs) {
    const data = doc.data();
    total += 1;
    const labelOn = data.exportPrefs?.aiLabelEnabled === true;
    if (labelOn) enabled += 1;

    const planId = data.subscription?.planId;
    const bucket = planId && byPlan[planId] ? planId : "other";
    byPlan[bucket].total += 1;
    if (labelOn) byPlan[bucket].enabled += 1;
  }

  const percentEnabled = total > 0 ? Math.round((enabled / total) * 100) : 0;

  return {
    totalUsers: total,
    labelEnabledCount: enabled,
    percentEnabled,
    byPlan: Object.fromEntries(
      Object.entries(byPlan).map(([plan, stats]) => [
        plan,
        {
          ...stats,
          percentEnabled:
            stats.total > 0
              ? Math.round((stats.enabled / stats.total) * 100)
              : 0,
        },
      ]),
    ),
  };
}
