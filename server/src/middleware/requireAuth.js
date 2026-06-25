import {
  isFirebaseConfigured,
  verifyIdToken,
} from "../services/firebaseAdmin.js";

export async function requireAuth(req, res, next) {
  if (!isFirebaseConfigured()) {
    return next();
  }

  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentification requise." });
  }

  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    return res.status(401).json({ error: "Token manquant." });
  }

  try {
    const decoded = await verifyIdToken(token);
    req.user = {
      uid: decoded.uid,
      email: decoded.email ?? null,
      name: decoded.name ?? null,
    };
    return next();
  } catch {
    return res.status(401).json({ error: "Session invalide ou expirée." });
  }
}
