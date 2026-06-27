export const DEFAULT_AI_LABEL_TEXT = "Image générée par IA";

export function normalizeExportLabel(prefs) {
  if (!prefs?.aiLabelEnabled) return null;
  const text = prefs.aiLabelText?.trim() || DEFAULT_AI_LABEL_TEXT;
  return { enabled: true, text };
}
