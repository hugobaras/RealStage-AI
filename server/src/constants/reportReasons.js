export const REPORT_REASONS = [
  { id: "non_conforme", label: "Résultat non conforme" },
  { id: "quality", label: "Qualité insuffisante" },
  { id: "architecture", label: "Architecture / proportions incorrectes" },
  { id: "furniture", label: "Meubles irréalistes ou mal placés" },
  { id: "style", label: "Style incorrect" },
  { id: "artifacts", label: "Artefacts visuels" },
  { id: "other", label: "Autre" },
];

const REASON_IDS = new Set(REPORT_REASONS.map((r) => r.id));

export function isValidReportReason(reason) {
  return typeof reason === "string" && REASON_IDS.has(reason);
}

export function getReportReasonLabel(reason) {
  return REPORT_REASONS.find((r) => r.id === reason)?.label ?? reason;
}
