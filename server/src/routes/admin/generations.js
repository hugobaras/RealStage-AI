import { Router } from "express";
import {
  deleteGeneration,
  listGenerationsAdmin,
} from "../../services/generationStore.js";
import { logAdminAction } from "../../services/auditLogService.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const { uid, mode, limit } = req.query;
    const generations = await listGenerationsAdmin({
      uid: uid || null,
      mode: mode || null,
      limit: limit ? Number(limit) : 50,
    });
    res.json({ generations });
  } catch (err) {
    next(err);
  }
});

router.delete("/:uid/:id", async (req, res, next) => {
  try {
    const result = await deleteGeneration(req.params.uid, req.params.id);
    await logAdminAction({
      adminUid: req.user.uid,
      action: "delete_generation",
      target: `${req.params.uid}/${req.params.id}`,
    });
    res.json(result);
  } catch (err) {
    if (err.status === 404) {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
});

export default router;
