import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { isValidReportReason } from "../constants/reportReasons.js";
import { getGeneration } from "../services/generationStore.js";
import { createReport } from "../services/reportStore.js";
import {
  isEmailConfigured,
  sendGenerationReportEmail,
} from "../services/emailService.js";
import { isFirebaseConfigured } from "../services/firebaseAdmin.js";

const router = Router();
const MAX_COMMENT_LENGTH = 1000;

router.post("/reports/generation", requireAuth, async (req, res, next) => {
  try {
    if (!isFirebaseConfigured() || !req.user?.uid) {
      return res.status(503).json({ error: "Historique non disponible." });
    }

    const { generation_id: generationId, reason, comment } = req.body ?? {};

    if (!generationId || typeof generationId !== "string") {
      return res.status(400).json({ error: "generation_id est requis." });
    }

    if (!isValidReportReason(reason)) {
      return res.status(400).json({ error: "Motif de signalement invalide." });
    }

    const trimmedComment = typeof comment === "string" ? comment.trim() : "";

    if (trimmedComment.length > MAX_COMMENT_LENGTH) {
      return res.status(400).json({
        error: `Le commentaire ne peut pas dépasser ${MAX_COMMENT_LENGTH} caractères.`,
      });
    }

    if (reason === "other" && !trimmedComment) {
      return res.status(400).json({
        error: "Un commentaire est requis pour le motif « Autre ».",
      });
    }

    const generation = await getGeneration(req.user.uid, generationId);

    const report = await createReport({
      generationId,
      userId: req.user.uid,
      userEmail: req.user.email,
      reason,
      comment: trimmedComment || null,
      generationMeta: {
        mode: generation.mode ?? null,
        roomType: generation.roomType ?? null,
        style: generation.style ?? null,
      },
    });

    if (isEmailConfigured()) {
      try {
        await sendGenerationReportEmail({
          user: req.user,
          generation,
          reason,
          comment: trimmedComment || null,
        });
      } catch (emailErr) {
        console.error("Envoi e-mail signalement échoué:", emailErr);
      }
    }

    res.json({ ok: true, reportId: report.id });
  } catch (err) {
    if (err.status === 404) {
      return res.status(404).json({ error: err.message });
    }
    if (err.status === 503) {
      return res.status(503).json({ error: err.message });
    }
    next(err);
  }
});

export default router;
