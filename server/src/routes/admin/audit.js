import { Router } from "express";
import { AUDIT_ACTIONS, listAuditLog } from "../../services/auditLogService.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const { adminUid, action, from, to, limit, cursor } = req.query;

    if (action && !AUDIT_ACTIONS.includes(action)) {
      return res.status(400).json({ error: "Action d'audit invalide." });
    }

    const result = await listAuditLog({
      adminUid: adminUid || null,
      action: action || null,
      from: from || null,
      to: to || null,
      limit: limit ? Number(limit) : 50,
      cursor: cursor || null,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
