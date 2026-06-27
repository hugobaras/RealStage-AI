import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { isFirebaseConfigured } from "../services/firebaseAdmin.js";
import { updateExportPrefs } from "../services/complianceService.js";

const router = Router();

router.get("/me", requireAuth, (req, res) => {
  if (!isFirebaseConfigured()) {
    return res.json({
      authenticated: false,
      firebaseConfigured: false,
      user: null,
    });
  }

  if (!req.user) {
    return res.status(401).json({ error: "Authentification requise." });
  }

  res.json({
    authenticated: true,
    firebaseConfigured: true,
    user: req.user,
    admin: req.user.admin === true,
    role: req.user.role ?? null,
    impersonating: req.user.impersonating === true,
  });
});

router.patch("/me/preferences", requireAuth, async (req, res, next) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: "Authentification requise." });
    }
    const { exportPrefs } = req.body ?? {};
    if (exportPrefs) {
      await updateExportPrefs(req.user.uid, exportPrefs);
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
