import { Router } from "express";
import {
  listEmailTemplates,
  sendTemplateEmail,
  sendRawEmail,
  isEmailConfigured,
} from "../../services/emailService.js";
import { getAuth } from "firebase-admin/auth";
import { requireRole } from "../../middleware/requireRole.js";

const router = Router();

router.get("/templates", async (req, res, next) => {
  try {
    res.json({
      templates: listEmailTemplates(),
      configured: isEmailConfigured(),
    });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/send-test",
  requireRole("super_admin", "support"),
  async (req, res, next) => {
    try {
      const { templateId } = req.body ?? {};
      const admin = await getAuth().getUser(req.user.uid);
      if (!admin.email) {
        return res.status(400).json({ error: "E-mail admin introuvable." });
      }
      await sendTemplateEmail(admin.email, templateId);
      res.json({ ok: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
);

export default router;
