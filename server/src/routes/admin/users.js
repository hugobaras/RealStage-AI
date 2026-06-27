import { Router } from "express";
import {
  getAdminUserDetail,
  listAdminUsers,
  patchAdminUser,
  setUserAdminClaim,
} from "../../services/adminUserService.js";

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

router.post("/:uid/grant-admin", async (req, res, next) => {
  try {
    const { grant = true } = req.body ?? {};
    const user = await setUserAdminClaim(
      req.params.uid,
      Boolean(grant),
      req.user.uid,
    );
    res.json({ user });
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      return res.status(404).json({ error: "Utilisateur introuvable." });
    }
    next(err);
  }
});

export default router;
