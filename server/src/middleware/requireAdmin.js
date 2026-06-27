import { isFirebaseConfigured } from "../services/firebaseAdmin.js";

import { resolveAdminRole } from "./requireRole.js";

export function requireAdmin(req, res, next) {
  if (!isFirebaseConfigured()) {
    return res.status(503).json({
      error: "L'administration nécessite Firebase configuré.",
    });
  }

  if (!req.user) {
    return res.status(401).json({ error: "Authentification requise." });
  }

  if (!resolveAdminRole(req.user)) {
    return res.status(403).json({ error: "Accès administrateur requis." });
  }

  req.adminRole = resolveAdminRole(req.user);
  return next();
}
