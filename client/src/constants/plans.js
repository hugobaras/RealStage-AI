export const TRIAL_LIMIT = 3;

export const PLANS = [
  {
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
  {
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
      "Réglages IA avancés (fidélité / créativité)",
      "Support prioritaire",
    ],
  },
  {
    id: "agence",
    label: "Agence",
    priceMonthly: 149,
    generationsPerMonth: null,
    deepThinkingPerMonth: null,
    features: [
      "Générations illimitées",
      "Réflexion approfondie illimitée",
      "Réglages IA avancés (fidélité / créativité)",
      "Usage multi-projets",
      "Historique complet",
      "Support dédié",
    ],
  },
];

export function getPlan(planId) {
  return PLANS.find((p) => p.id === planId) ?? null;
}

export function getPlanDisplayFeatures(plan) {
  const index = PLANS.findIndex((p) => p.id === plan.id);
  if (index <= 0) return plan.features;

  const previousPlan = PLANS[index - 1];
  return [`Fonctions ${previousPlan.label} +`, ...plan.features];
}

export function formatGenerationsLimit(plan) {
  if (!plan) return "—";
  return plan.generationsPerMonth == null
    ? "Illimité"
    : `${plan.generationsPerMonth} / mois`;
}

export function formatDeepThinkingLimit(plan) {
  if (!plan) return "—";
  return plan.deepThinkingPerMonth == null
    ? "Illimité"
    : `${plan.deepThinkingPerMonth} / mois`;
}
