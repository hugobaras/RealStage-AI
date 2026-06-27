import { Router } from "express";
import {
  getAdminUserDetail,
  listAdminUsers,
  patchAdminUser,
  setUserAdminClaim,
  setUserAdminRole,
  forceLogoutUser,
  syncStripeForUser,
} from "../../services/adminUserService.js";
import { listUserInvoices } from "../../services/adminBillingService.js";
import { getAuth } from "firebase-admin/auth";
import {
  initFirebaseAdmin,
  isFirebaseConfigured,
} from "../../services/firebaseAdmin.js";
import { logAdminAction } from "../../services/auditLogService.js";
import { requireRole } from "../../middleware/requireRole.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const { pageToken, limit, search } = req.query;
    const result = await listAdminUsers({
      pageToken: pageToken || null,
      limit: limit ? Number(limit) : 50,
      search: search || "",
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/:uid/invoices", async (req, res, next) => {
  try {
    const data = await listUserInvoices(req.params.uid);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get("/:uid", async (req, res, next) => {
  try {
    const user = await getAdminUserDetail(req.params.uid);
    res.json({ user });
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      return res.status(404).json({ error: "Utilisateur introuvable." });
    }
    next(err);
  }
});

router.patch("/:uid", async (req, res, next) => {
  try {
    const user = await patchAdminUser(
      req.params.uid,
      req.body ?? {},
      req.user.uid,
    );
    res.json({ user });
  } catch (err) {
    if (err.status === 400) {
      return res.status(400).json({ error: err.message });
    }
    if (err.code === "auth/user-not-found") {
      return res.status(404).json({ error: "Utilisateur introuvable." });
    }
    next(err);
  }
});

router.post("/:uid/sync-stripe", async (req, res, next) => {
  try {
    const user = await syncStripeForUser(req.params.uid, req.user.uid);
    res.json({ user });
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      return res.status(404).json({ error: "Utilisateur introuvable." });
    }
    if (err.message?.includes("Stripe") || err.message?.includes("compte")) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
});

router.post(
  "/:uid/impersonate",
  requireRole("super_admin"),
  async (req, res, next) => {
    try {
      if (!isFirebaseConfigured()) {
        return res.status(503).json({ error: "Firebase non configuré." });
      }
      initFirebaseAdmin();
      const targetUid = req.params.uid;
      await getAuth().getUser(targetUid);
      const token = await getAuth().createCustomToken(targetUid, {
        impersonating: true,
        impersonatorUid: req.user.uid,
      });
      await logAdminAction({
        adminUid: req.user.uid,
        action: "impersonate_start",
        target: targetUid,
      });
      res.json({ token, uid: targetUid, expiresIn: 3600 });
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        return res.status(404).json({ error: "Utilisateur introuvable." });
      }
      next(err);
    }
  },
);

router.post("/:uid/grant-admin", async (req, res, next) => {
  try {
    const { grant = true, role } = req.body ?? {};
    let user;
    if (role) {
      user = await setUserAdminRole(req.params.uid, role, req.user.uid);
    } else {
      user = await setUserAdminClaim(
        req.params.uid,
        Boolean(grant),
        req.user.uid,
      );
    }
    res.json({ user });
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      return res.status(404).json({ error: "Utilisateur introuvable." });
    }
    next(err);
  }
});

router.post("/:uid/force-logout", async (req, res, next) => {
  try {
    const user = await forceLogoutUser(req.params.uid, req.user.uid);
    res.json({ user });
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      return res.status(404).json({ error: "Utilisateur introuvable." });
    }
    next(err);
  }
});

router.post("/:uid/sync-stripe", async (req, res, next) => {
  try {
    const user = await syncStripeForUser(req.params.uid, req.user.uid);
    res.json({ user });
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      return res.status(404).json({ error: "Utilisateur introuvable." });
    }
    if (err.message?.includes("Stripe") || err.message?.includes("compte")) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
});

export default router;
