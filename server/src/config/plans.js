export const TRIAL_LIMIT = 3;

export const PLANS = {
  starter: {
    id: "starter",
    label: "Starter",
    priceMonthly: 29,
    generationsPerMonth: 30,
    deepThinkingPerMonth: 10,
    features: [
      "30 générations / mois",
      "10 réflexions approfondies / mois",
      "Meubler, remplacer & vider",
      "Historique sauvegardé",
      "Export HD",
    ],
  },
  pro: {
    id: "pro",
    label: "Pro",
    priceMonthly: 59,
    generationsPerMonth: 100,
    deepThinkingPerMonth: 50,
    popular: true,
    features: [
      "100 générations / mois",
      "50 réflexions approfondies / mois",
      "Tous les styles & pièces",
      "Support prioritaire",
    ],
  },
  agence: {
    id: "agence",
    label: "Agence",
    priceMonthly: 149,
    generationsPerMonth: null,
    deepThinkingPerMonth: null,
    features: [
      "Générations illimitées",
      "Réflexion approfondie illimitée",
      "Usage multi-projets",
      "Historique complet",
      "Support dédié",
    ],
  },
};

export const PLAN_IDS = Object.keys(PLANS);

export function getPlan(planId) {
  return PLANS[planId] ?? null;
}

export function isValidPlanId(planId) {
  return planId in PLANS;
}

const PLAN_RANK = { starter: 0, pro: 1, agence: 2 };

export function getPlanRank(planId) {
  if (!planId) return -1;
  return PLAN_RANK[planId] ?? -1;
}
