import { Router } from "express";
import {
  listCoupons,
  createCoupon,
  listUserInvoices,
  listPastDueUsers,
  reconcileBillingHealth,
} from "../../services/adminBillingService.js";
import { requireRole } from "../../middleware/requireRole.js";

const router = Router();

router.get("/coupons", async (req, res, next) => {
  try {
    const data = await listCoupons();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/coupons",
  requireRole("super_admin", "support"),
  async (req, res, next) => {
    try {
      const result = await createCoupon(req.body ?? {});
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

router.get("/past-due", async (req, res, next) => {
  try {
    const users = await listPastDueUsers();
    res.json({ users });
  } catch (err) {
    next(err);
  }
});

router.get("/health", async (req, res, next) => {
  try {
    const health = await reconcileBillingHealth();
    res.json({ health });
  } catch (err) {
    next(err);
  }
});

export default router;
