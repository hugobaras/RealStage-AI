import { Router } from "express";
import { listReports, updateReportStatus } from "../../services/reportStore.js";
import { logAdminAction } from "../../services/auditLogService.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const { status, limit } = req.query;
    const reports = await listReports({
      status: status || null,
      limit: limit ? Number(limit) : 50,
    });
    res.json({ reports });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const { status } = req.body ?? {};
    if (!["open", "resolved"].includes(status)) {
      return res.status(400).json({ error: "Statut invalide." });
    }
    const report = await updateReportStatus(req.params.id, status);
    await logAdminAction({
      adminUid: req.user.uid,
      action: "update_report",
      target: req.params.id,
      details: { status },
    });
    res.json({ report });
  } catch (err) {
    if (err.status === 404) {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
});

export default router;
