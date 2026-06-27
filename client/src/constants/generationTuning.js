export const GENERATION_TUNING_DEFAULTS = {
  creativity: 50,
  promptPrecision: 50,
  detailLevel: 50,
};

export const GENERATION_TUNING_PRESETS = [
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
    values: { ...GENERATION_TUNING_DEFAULTS },
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

export function normalizeGenerationTuning(value) {
  const base = value ?? GENERATION_TUNING_DEFAULTS;
  const clamp = (n, fallback) => {
    const v = Number(n);
    if (!Number.isFinite(v)) return fallback;
    return Math.max(0, Math.min(100, Math.round(v)));
  };
  return {
    creativity: clamp(base.creativity, GENERATION_TUNING_DEFAULTS.creativity),
    promptPrecision: clamp(
      base.promptPrecision,
      GENERATION_TUNING_DEFAULTS.promptPrecision,
    ),
    detailLevel: clamp(
      base.detailLevel,
      GENERATION_TUNING_DEFAULTS.detailLevel,
    ),
  };
}

export function tuningEquals(a, b) {
  const left = normalizeGenerationTuning(a);
  const right = normalizeGenerationTuning(b);
  return (
    left.creativity === right.creativity &&
    left.promptPrecision === right.promptPrecision &&
    left.detailLevel === right.detailLevel
  );
}

export function toApiGenerationTuning(tuning) {
  const t = normalizeGenerationTuning(tuning);
  return {
    creativity: t.creativity,
    prompt_precision: t.promptPrecision,
    detail_level: t.detailLevel,
  };
}
