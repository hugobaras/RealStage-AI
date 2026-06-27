import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { requireAdmin } from "../../middleware/requireAdmin.js";
import usersRouter from "./users.js";
import statsRouter from "./stats.js";
import reportsRouter from "./reports.js";
import generationsRouter from "./generations.js";
import configRouter from "./config.js";

const router = Router();

router.use(requireAuth, requireAdmin);
router.use("/users", usersRouter);
router.use("/stats", statsRouter);
router.use("/reports", reportsRouter);
router.use("/generations", generationsRouter);
router.use("/config", configRouter);

export default router;
