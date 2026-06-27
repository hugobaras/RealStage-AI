import { Router } from "express";
import {
  listReports,
  getReport,
  updateReport,
  batchUpdateReports,
  REPORT_STATUSES,
} from "../../services/reportStore.js";
import { logAdminAction } from "../../services/auditLogService.js";
import { patchAdminUser } from "../../services/adminUserService.js";

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

router.get("/:id", async (req, res, next) => {
  try {
    const report = await getReport(req.params.id);
    res.json({ report });
  } catch (err) {
    if (err.status === 404) {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const { status, resolutionNote } = req.body ?? {};
    if (status && !REPORT_STATUSES.includes(status)) {
      return res.status(400).json({ error: "Statut invalide." });
    }
    const report = await updateReport(req.params.id, {
      status,
      resolutionNote,
      resolvedBy: req.user.uid,
    });
    await logAdminAction({
      adminUid: req.user.uid,
      action: "update_report",
      target: req.params.id,
      details: { status, resolutionNote },
    });
    res.json({ report });
  } catch (err) {
    if (err.status === 404) {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
});

router.post("/batch", async (req, res, next) => {
  try {
    const { ids, action } = req.body ?? {};
    if (!Array.isArray(ids) || !ids.length) {
      return res.status(400).json({ error: "ids requis." });
    }
    const results = await batchUpdateReports(ids, action, req.user.uid);
    await logAdminAction({
      adminUid: req.user.uid,
      action: "update_report",
      target: "batch",
      details: { ids, action },
    });
    res.json({ results });
  } catch (err) {
    if (err.status === 400) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
});

router.post("/:id/ban-author", async (req, res, next) => {
  try {
    const report = await getReport(req.params.id);
    const ownerUid = report.generationOwnerUid ?? report.userId;
    if (!ownerUid) {
      return res.status(400).json({ error: "Auteur introuvable." });
    }
    const user = await patchAdminUser(
      ownerUid,
      { disabled: true },
      req.user.uid,
    );
    res.json({ user, reportId: report.id });
  } catch (err) {
    if (err.status === 404) {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
});

export default router;
