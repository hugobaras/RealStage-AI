const PLAN_RANK = { starter: 0, pro: 1, agence: 2 };

export const FEATURES = {
  multiProjects: { minPlan: "agence", exact: true },
  agencyPresets: { minPlan: "agence", exact: true },
  listingWorkflow: { minPlan: "pro", exact: false },
  variantCompare: { minPlan: "pro", exact: false },
};

export function getPlanRank(planId) {
  if (!planId) return -1;
  return PLAN_RANK[planId] ?? -1;
}

export function hasFeature(planId, featureKey) {
  const feature = FEATURES[featureKey];
  if (!feature) return false;
  if (!planId) return false;

  if (feature.exact) {
    return planId === feature.minPlan;
  }

  return getPlanRank(planId) >= getPlanRank(feature.minPlan);
}

export function getRequiredPlanLabel(featureKey) {
  const feature = FEATURES[featureKey];
  if (!feature) return "Pro";
  const labels = { pro: "Pro", agence: "Agence" };
  return labels[feature.minPlan] ?? feature.minPlan;
}
