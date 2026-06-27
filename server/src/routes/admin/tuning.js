import { Router } from "express";
import { randomUUID } from "crypto";
import { getAuth } from "firebase-admin/auth";
import {
  initFirebaseAdmin,
  isFirebaseConfigured,
} from "../../services/firebaseAdmin.js";
import { logAdminAction } from "../../services/auditLogService.js";
import { requireRole } from "../../middleware/requireRole.js";
import { runDeclutter } from "../../services/falDeclutter.js";
import { dataUrlToBuffer } from "../../services/maskGenerator.js";
import { resolveFalParams } from "../../services/generationTuning.js";

const router = Router();

router.post("/test", requireRole("super_admin"), async (req, res, next) => {
  try {
    const { image, generation_tuning: tuning } = req.body ?? {};
    if (!image) {
      return res.status(400).json({ error: "image requise (data URL)." });
    }

    const imageBuffer = dataUrlToBuffer(image);
    const falParams = resolveFalParams(tuning ?? {}, false);
    const prompt = "Test admin tuning lab — lightly stage this room.";
    const result = await runDeclutter({
      imageBuffer,
      prompt,
      falParams,
    });

    res.json({
      imageUrl: result.imageUrl,
      falParams,
      requestId: randomUUID(),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
