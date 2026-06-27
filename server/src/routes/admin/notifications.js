import { Router } from "express";
import { getAdminNotificationConfig } from "../../services/notificationService.js";
import { updateConfigSection } from "../../services/configStore.js";
import { requireRole } from "../../middleware/requireRole.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const config = await getAdminNotificationConfig();
    res.json({ config });
  } catch (err) {
    next(err);
  }
});

router.put("/", requireRole("super_admin"), async (req, res, next) => {
  try {
    const config = await updateConfigSection(
      "adminNotifications",
      req.body ?? {},
      req.user.uid,
    );
    res.json({ config });
  } catch (err) {
    next(err);
  }
});

export default router;
