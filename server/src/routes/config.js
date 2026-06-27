import { Router } from "express";
import { ensureConfigCache, getPublicConfig } from "../services/configStore.js";

const router = Router();

const SECTIONS = {
  styles: "styles",
  "room-types": "roomTypes",
  plans: "plans",
  features: "features",
  "generation-tuning": "generationTuning",
  platform: "platform",
  landing: "landing",
  announcements: "announcements",
};

router.get("/:section", async (req, res, next) => {
  try {
    const key = SECTIONS[req.params.section];
    if (!key) {
      return res.status(404).json({ error: "Section introuvable." });
    }
    await ensureConfigCache();
    const data = await getPublicConfig(key);
    res.json({ [key]: data });
  } catch (err) {
    next(err);
  }
});

export default router;
