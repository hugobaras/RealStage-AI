import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requirePlan } from "../middleware/requirePlan.js";
import {
  getAgencySettings,
  updateAgencySettings,
  uploadAgencyLogo,
} from "../services/agencySettingsStore.js";
import { isFirebaseConfigured } from "../services/firebaseAdmin.js";

const router = Router();

router.get(
  "/agency-settings",
  requireAuth,
  requirePlan("agence"),
  async (req, res, next) => {
    try {
      const settings = await getAgencySettings(req.user.uid);
      res.json({ settings });
    } catch (err) {
      next(err);
    }
  },
);

router.put(
  "/agency-settings",
  requireAuth,
  requirePlan("agence"),
  async (req, res, next) => {
    try {
      if (!isFirebaseConfigured()) {
        return res.status(503).json({ error: "Firebase non configuré." });
      }

      const settings = await updateAgencySettings(req.user.uid, req.body);
      res.json({ settings });
    } catch (err) {
      if (err.status === 400) {
        return res.status(400).json({ error: err.message });
      }
      next(err);
    }
  },
);

router.post(
  "/agency-settings/logo",
  requireAuth,
  requirePlan("agence"),
  async (req, res, next) => {
    try {
      if (!isFirebaseConfigured()) {
        return res.status(503).json({ error: "Firebase non configuré." });
      }

      const { image } = req.body;
      if (!image?.startsWith("data:image/")) {
        return res.status(400).json({ error: "image data URL requis." });
      }

      const match = image.match(/^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i);
      if (!match) {
        return res.status(400).json({ error: "Format image invalide." });
      }

      const contentType = match[1];
      const buffer = Buffer.from(match[2], "base64");

      if (buffer.length > 2 * 1024 * 1024) {
        return res
          .status(400)
          .json({ error: "Logo trop volumineux (max 2 Mo)." });
      }

      const settings = await uploadAgencyLogo(
        req.user.uid,
        buffer,
        contentType,
        image,
      );
      res.json({ settings });
    } catch (err) {
      if (err.status === 503) {
        return res.status(503).json({ error: err.message });
      }
      if (err.status === 400) {
        return res.status(400).json({ error: err.message });
      }
      next(err);
    }
  },
);

export default router;
