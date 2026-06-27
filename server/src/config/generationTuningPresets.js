export const TUNING_PRESETS = [
  {
    id: "fidelity",
    label: "Fidèle",
    description: "Photo d'origine respectée au maximum",
    values: { creativity: 18, promptPrecision: 72, detailLevel: 48 },
  },
  {
    id: "balanced",
    label: "Équilibré",
    description: "Bon compromis staging / réalisme",
    values: { creativity: 50, promptPrecision: 50, detailLevel: 50 },
  },
  {
    id: "creative",
    label: "Créatif",
    description: "Staging plus audacieux et stylisé",
    values: { creativity: 78, promptPrecision: 42, detailLevel: 62 },
  },
  {
    id: "magazine",
    label: "Magazine",
    description: "Rendu premium, détails soignés",
    values: { creativity: 42, promptPrecision: 68, detailLevel: 82 },
  },
];
