/** Valeurs par défaut (équilibre fidélité / créativité). */
export const TUNING_DEFAULTS = {
  creativity: 50,
  promptPrecision: 50,
  detailLevel: 50,
};

function clampPercent(value, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function normalizeGenerationTuning(raw) {
  if (!raw || typeof raw !== "object") return null;

  return {
    creativity: clampPercent(
      raw.creativity ?? raw.creativite,
      TUNING_DEFAULTS.creativity,
    ),
    promptPrecision: clampPercent(
      raw.prompt_precision ?? raw.promptPrecision ?? raw.precision,
      TUNING_DEFAULTS.promptPrecision,
    ),
    detailLevel: clampPercent(
      raw.detail_level ?? raw.detailLevel ?? raw.detail,
      TUNING_DEFAULTS.detailLevel,
    ),
  };
}

function legacyFalParams(deepThinking) {
  if (deepThinking) {
    return {
      strength: 0.82,
      guidance_scale: 4,
      num_inference_steps: 40,
      lora_scale: 1.2,
      mask_expansion: 20,
    };
  }
  return {
    strength: 0.75,
    guidance_scale: 3.5,
    num_inference_steps: 28,
    lora_scale: 1,
    mask_expansion: 15,
  };
}

/**
 * Convertit les curseurs utilisateur en paramètres Fal.ai.
 * @param {object|null} tuning - null → comportement historique (deep thinking seul)
 */
export function resolveFalParams(tuning, deepThinking = false) {
  if (!tuning) {
    return legacyFalParams(deepThinking);
  }

  let strength = 0.52 + (tuning.creativity / 100) * 0.38;
  let guidance_scale = 1.8 + (tuning.promptPrecision / 100) * 3.2;
  let num_inference_steps = 18 + Math.round((tuning.detailLevel / 100) * 32);
  let lora_scale = 0.85 + (tuning.creativity / 100) * 0.45;
  let mask_expansion = 8 + Math.round((tuning.creativity / 100) * 18);

  if (deepThinking) {
    strength = Math.min(0.95, strength + 0.06);
    guidance_scale = Math.min(5.5, guidance_scale + 0.4);
    num_inference_steps = Math.min(50, num_inference_steps + 10);
    lora_scale = Math.min(1.4, lora_scale + 0.1);
    mask_expansion = Math.min(28, mask_expansion + 4);
  }

  return {
    strength,
    guidance_scale,
    num_inference_steps,
    lora_scale,
    mask_expansion,
  };
}
