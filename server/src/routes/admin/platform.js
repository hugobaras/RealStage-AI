import { Router } from "express";
import {
  getPublicConfig,
  updateConfigSection,
} from "../../services/configStore.js";
import { requireRole } from "../../middleware/requireRole.js";
import { logAdminAction } from "../../services/auditLogService.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const platform = await getPublicConfig("platform");
    res.json({ platform });
  } catch (err) {
    next(err);
  }
});

router.put("/", requireRole("super_admin"), async (req, res, next) => {
  try {
    const platform = await updateConfigSection(
      "platform",
      req.body ?? {},
      req.user.uid,
    );
    await logAdminAction({
      adminUid: req.user.uid,
      action: "update_config",
      target: "platform",
    });
    res.json({ platform });
  } catch (err) {
    next(err);
  }
});

export default router;
