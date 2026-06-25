/**
 * Transforme les erreurs Fal.ai en messages lisibles pour l'utilisateur.
 */
export function formatFalError(err) {
  const detail =
    (typeof err.body?.detail === "string" && err.body.detail) ||
    err.message ||
    "";

  if (
    detail.includes("Exhausted balance") ||
    detail.includes("User is locked")
  ) {
    return {
      status: 402,
      code: "FAL_BALANCE_EXHAUSTED",
      message:
        "Solde Fal.ai insuffisant. Sur fal.ai, une carte enregistrée ne suffit pas : il faut recharger des crédits (Billing → Add credits). Vérifiez aussi que la clé API dans server/.env correspond au compte où vous avez ajouté la carte (Dashboard → API Keys).",
    };
  }

  if (detail.includes("Invalid API key") || detail.includes("Unauthorized")) {
    return {
      status: 401,
      code: "FAL_INVALID_KEY",
      message:
        "Clé API Fal.ai invalide. Copiez une nouvelle clé depuis fal.ai/dashboard/keys dans server/.env puis redémarrez le serveur.",
    };
  }

  if (detail.includes("FAL_KEY is not configured")) {
    return {
      status: 500,
      code: "FAL_KEY_MISSING",
      message: detail,
    };
  }

  return {
    status: err.status || err.statusCode || 500,
    code: "FAL_ERROR",
    message: detail || "Erreur Fal.ai lors de la génération.",
  };
}
