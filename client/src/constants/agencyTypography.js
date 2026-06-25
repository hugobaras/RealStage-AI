export const DEFAULT_AGENCY_TYPOGRAPHY = {
  signatureFontSize: 16,
  signatureBold: true,
  legalFontSize: 12,
  legalBold: false,
};

export function normalizeAgencyTypography(branding = {}) {
  return {
    signatureFontSize: clampFontSize(
      branding.signatureFontSize,
      10,
      48,
      DEFAULT_AGENCY_TYPOGRAPHY.signatureFontSize,
    ),
    signatureBold:
      branding.signatureBold !== undefined
        ? Boolean(branding.signatureBold)
        : DEFAULT_AGENCY_TYPOGRAPHY.signatureBold,
    legalFontSize: clampFontSize(
      branding.legalFontSize,
      8,
      32,
      DEFAULT_AGENCY_TYPOGRAPHY.legalFontSize,
    ),
    legalBold:
      branding.legalBold !== undefined
        ? Boolean(branding.legalBold)
        : DEFAULT_AGENCY_TYPOGRAPHY.legalBold,
  };
}

function clampFontSize(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}
