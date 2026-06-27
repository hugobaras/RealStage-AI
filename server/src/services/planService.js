import {
  PLANS,
  TRIAL_LIMIT,
  getPlanFromStatic,
  isValidPlanIdStatic,
  getPlanRank,
} from "../config/plans.js";
import { getPlansFromConfig } from "./configStore.js";
import { getStripeConfig } from "../config.js";

export { PLANS, TRIAL_LIMIT, getPlanRank };

export function getPlan(planId) {
  const { plans } = getPlansFromConfig();
  return plans[planId] ?? getPlanFromStatic(planId);
}

export function isValidPlanId(planId) {
  const { plans } = getPlansFromConfig();
  return planId in plans || isValidPlanIdStatic(planId);
}

export function getStripePriceIdForPlan(planId) {
  const plan = getPlan(planId);
  if (plan?.stripePriceId) return plan.stripePriceId;
  const prices = getStripeConfig().prices;
  return prices[planId] ?? null;
}
