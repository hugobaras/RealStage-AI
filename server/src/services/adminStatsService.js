import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { PLANS } from "../config/plans.js";
import { initFirebaseAdmin, isFirebaseConfigured } from "./firebaseAdmin.js";
import { countOpenReports } from "./reportStore.js";

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getAdminStats() {
  if (!isFirebaseConfigured()) {
    throw Object.assign(new Error("Firebase non configuré."), { status: 503 });
  }

  initFirebaseAdmin();
  const db = getFirestore();
  const auth = getAuth();
  const monthKey = currentMonthKey();

  const [usersSnapshot, openReports, listResult] = await Promise.all([
    db.collection("users").count().get(),
    countOpenReports(),
    auth.listUsers(1000),
  ]);

  const totalUsers = usersSnapshot.data().count;
  const planDistribution = { starter: 0, pro: 0, agence: 0, none: 0, trial: 0 };

  const userDocs = await Promise.all(
    listResult.users.map(async (u) => {
      const doc = await db.collection("users").doc(u.uid).get();
      return doc.exists ? doc.data() : {};
    }),
  );

  for (const data of userDocs) {
    const sub = data.subscription ?? {};
    if (sub.status === "active" && sub.planId && PLANS[sub.planId]) {
      planDistribution[sub.planId] = (planDistribution[sub.planId] ?? 0) + 1;
    } else if ((data.trialUsed ?? 0) < 3) {
      planDistribution.trial += 1;
    } else {
      planDistribution.none += 1;
    }
  }

  let generationsThisMonth = 0;
  let generationsLast7Days = [];
  const dayBuckets = Array.from({ length: 7 }, (_, i) => ({
    date: daysAgo(6 - i)
      .toISOString()
      .slice(0, 10),
    count: 0,
  }));

  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const genSnapshot = await db
      .collectionGroup("generations")
      .where("createdAt", ">=", startOfMonth)
      .get();

    generationsThisMonth = genSnapshot.size;

    const sevenDaysAgo = daysAgo(6);
    for (const doc of genSnapshot.docs) {
      const createdAt = doc.data().createdAt?.toDate?.();
      if (createdAt && createdAt >= sevenDaysAgo) {
        const key = createdAt.toISOString().slice(0, 10);
        const bucket = dayBuckets.find((b) => b.date === key);
        if (bucket) bucket.count += 1;
      }
    }
  } catch {
    generationsThisMonth = userDocs.reduce((sum, d) => {
      const usage = d.usage ?? {};
      if (usage.month === monthKey) return sum + (usage.count ?? 0);
      return sum;
    }, 0);
  }

  const activeThisMonth = userDocs.filter((d) => {
    const usage = d.usage ?? {};
    return usage.month === monthKey && (usage.count ?? 0) > 0;
  }).length;

  return {
    totalUsers,
    activeUsersThisMonth: activeThisMonth,
    generationsThisMonth,
    openReports,
    planDistribution,
    generationsLast7Days: dayBuckets,
    monthKey,
  };
}
