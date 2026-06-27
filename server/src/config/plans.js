export const TRIAL_LIMIT = 3;

export const PLANS = {
  starter: {
    id: "starter",
    label: "Starter",
    priceMonthly: 19,
    generationsPerMonth: 30,
    deepThinkingPerMonth: 10,
    stripePriceId: null,
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
    priceMonthly: 39,
    generationsPerMonth: 100,
    deepThinkingPerMonth: 50,
    stripePriceId: null,
    popular: true,
    features: [
      "100 générations / mois",
      "50 réflexions approfondies / mois",
      "Tous les styles & pièces",
      "Réglages IA avancés (fidélité / créativité)",
      "Support prioritaire",
    ],
  },
  agence: {
    id: "agence",
    label: "Agence",
    priceMonthly: 99,
    generationsPerMonth: null,
    deepThinkingPerMonth: null,
    stripePriceId: null,
    features: [
      "Générations illimitées",
      "Réflexion approfondie illimitée",
      "Réglages IA avancés (fidélité / créativité)",
      "Usage multi-projets",
      "Historique complet",
      "Support dédié",
    ],
  },
};

export const PLAN_IDS = Object.keys(PLANS);

const PLAN_RANK = { starter: 0, pro: 1, agence: 2 };

export function getPlanFromStatic(planId) {
  return PLANS[planId] ?? null;
}

export function isValidPlanIdStatic(planId) {
  return planId in PLANS;
}

export function getPlanRank(planId) {
  if (!planId) return -1;
  return PLAN_RANK[planId] ?? -1;
}
