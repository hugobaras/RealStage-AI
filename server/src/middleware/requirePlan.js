import { getSubscriptionState } from "../services/subscriptionService.js";
import { isFirebaseConfigured } from "../services/firebaseAdmin.js";

const PLAN_RANK = { starter: 0, pro: 1, agence: 2 };

export class PlanError extends Error {
  constructor(message, code = "plan_required", status = 403) {
    super(message);
    this.name = "PlanError";
    this.code = code;
    this.status = status;
  }
}

export function getPlanRank(planId) {
  if (!planId) return -1;
  return PLAN_RANK[planId] ?? -1;
}

export async function assertPlan(uid, minPlan) {
  if (!isFirebaseConfigured()) return null;

  const state = await getSubscriptionState(uid);
  const currentPlanId = state.subscription?.planId;
  const currentRank = getPlanRank(currentPlanId);
  const requiredRank = PLAN_RANK[minPlan];

  if (requiredRank == null) {
    throw new PlanError("Forfait requis invalide.");
  }

  if (minPlan === "agence") {
    if (currentPlanId !== "agence") {
      throw new PlanError(
        "Cette fonctionnalité est réservée au forfait Agence.",
        "agence_required",
      );
    }
    return state;
  }

  if (currentRank < requiredRank) {
    const labels = { pro: "Pro", agence: "Agence" };
    throw new PlanError(
      `Cette fonctionnalité nécessite le forfait ${labels[minPlan] ?? minPlan} ou supérieur.`,
      `${minPlan}_required`,
    );
  }

  return state;
}

export function requirePlan(minPlan) {
  return async (req, res, next) => {
    try {
      if (!req.user?.uid) {
        return res.status(401).json({ error: "Authentification requise." });
      }
      await assertPlan(req.user.uid, minPlan);
      return next();
    } catch (err) {
      if (err instanceof PlanError) {
        return res.status(err.status).json({
          error: err.message,
          code: err.code,
        });
      }
      return next(err);
    }
  };
}
