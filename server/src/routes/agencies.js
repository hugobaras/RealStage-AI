import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  createAgency,
  inviteAgencyMember,
  acceptAgencyInvite,
  getAgencyDetail,
} from "../services/agencyWorkspaceService.js";
import { assertPlan } from "../middleware/requirePlan.js";

const router = Router();

router.post("/", requireAuth, async (req, res, next) => {
  try {
    await assertPlan(req.user.uid, "agence");
    const { name } = req.body ?? {};
    const agency = await createAgency({
      name,
      ownerUid: req.user.uid,
    });
    res.json({ agency });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});

router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const agency = await getAgencyDetail(req.params.id);
    res.json({ agency });
  } catch (err) {
    if (err.status === 404) return res.status(404).json({ error: err.message });
    next(err);
  }
});

router.post("/:id/invite", requireAuth, async (req, res, next) => {
  try {
    const { email } = req.body ?? {};
    if (!email) return res.status(400).json({ error: "email requis." });
    const invite = await inviteAgencyMember(req.params.id, email, req.user.uid);
    res.json({ invite });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});

router.post("/invites/:token/accept", requireAuth, async (req, res, next) => {
  try {
    const result = await acceptAgencyInvite(
      req.params.token,
      req.user.uid,
      req.user.email,
    );
    res.json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});

export default router;
