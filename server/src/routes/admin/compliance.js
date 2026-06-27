import { Router } from "express";
import { getAiLabelComplianceStats } from "../../services/complianceService.js";

const router = Router();

router.get("/ai-label", async (req, res, next) => {
  try {
    const stats = await getAiLabelComplianceStats();
    res.json({ stats });
  } catch (err) {
    next(err);
  }
});

export default router;
