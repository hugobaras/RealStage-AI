import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { isFirebaseConfigured } from "../services/firebaseAdmin.js";

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
  });
});

export default router;
