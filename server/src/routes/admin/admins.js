import { Router } from "express";
import { getAuth } from "firebase-admin/auth";
import {
  initFirebaseAdmin,
  isFirebaseConfigured,
} from "../../services/firebaseAdmin.js";
import { resolveAdminRole } from "../../middleware/requireRole.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    if (!isFirebaseConfigured()) {
      return res.status(503).json({ error: "Firebase non configuré." });
    }

    initFirebaseAdmin();
    const auth = getAuth();
    const result = await auth.listUsers(1000);

    const admins = result.users
      .map((u) => ({
        uid: u.uid,
        email: u.email,
        role: resolveAdminRole({
          admin: u.customClaims?.admin === true,
          role: u.customClaims?.role,
        }),
        disabled: u.disabled,
      }))
      .filter((u) => u.role);

    res.json({ admins });
  } catch (err) {
    next(err);
  }
});

export default router;
