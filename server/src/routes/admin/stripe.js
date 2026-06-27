import { Router } from "express";
import { getAdminStripeOverview } from "../../services/adminStripeService.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const overview = await getAdminStripeOverview();
    res.json({ overview });
  } catch (err) {
    next(err);
  }
});

export default router;
