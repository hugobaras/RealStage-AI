import { Router } from "express";
import {
  getBlacklist,
  updateBlacklist,
} from "../../services/blacklistService.js";
import { logAdminAction } from "../../services/auditLogService.js";
import { requireRole } from "../../middleware/requireRole.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const blacklist = await getBlacklist();
    res.json({ blacklist });
  } catch (err) {
    next(err);
  }
});

router.put("/", requireRole("super_admin"), async (req, res, next) => {
  try {
    const blacklist = await updateBlacklist(req.body ?? {}, req.user.uid);
    await logAdminAction({
      adminUid: req.user.uid,
      action: "update_blacklist",
      target: "blacklist",
      details: req.body,
    });
    res.json({ blacklist });
  } catch (err) {
    next(err);
  }
});

export default router;
