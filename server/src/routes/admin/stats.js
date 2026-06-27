import { Router } from "express";
import { getAdminStats } from "../../services/adminStatsService.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const stats = await getAdminStats();
    res.json({ stats });
  } catch (err) {
    next(err);
  }
});

export default router;
