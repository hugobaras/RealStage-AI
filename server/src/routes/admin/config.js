import { Router } from "express";
import {
  getConfigCacheSync,
  updateConfigSection,
} from "../../services/configStore.js";
import { seedAllConfig } from "../../services/seedConfig.js";
import { logAdminAction } from "../../services/auditLogService.js";

const router = Router();
const SECTIONS = [
  "styles",
  "roomTypes",
  "plans",
  "features",
  "generationTuning",
];

router.get("/:section", (req, res) => {
  const { section } = req.params;
  if (!SECTIONS.includes(section)) {
    return res.status(400).json({ error: "Section invalide." });
  }
  const config = getConfigCacheSync();
  res.json({ [section]: config[section] });
});

router.put("/:section", async (req, res, next) => {
  try {
    const { section } = req.params;
    if (!SECTIONS.includes(section)) {
      return res.status(400).json({ error: "Section invalide." });
    }
    const updated = await updateConfigSection(
      section,
      req.body ?? {},
      req.user.uid,
    );
    await logAdminAction({
      adminUid: req.user.uid,
      action: "update_config",
      target: section,
    });
    res.json({ [section]: updated });
  } catch (err) {
    next(err);
  }
});

router.post("/seed", async (req, res, next) => {
  try {
    const config = await seedAllConfig(req.user.uid);
    await logAdminAction({
      adminUid: req.user.uid,
      action: "seed_config",
      target: "all",
    });
    res.json({ config });
  } catch (err) {
    next(err);
  }
});

export default router;
