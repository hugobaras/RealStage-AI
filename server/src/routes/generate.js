import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { dataUrlToBuffer } from "../services/maskGenerator.js";
import {
  buildPrompt,
  buildDeclutterPrompt,
  buildReplacePrompt,
  isValidStyle,
  isValidStyleForRoom,
  isValidRoomType,
  isValidRoomSqm,
} from "../services/promptBuilder.js";
import { runStaging } from "../services/falStaging.js";
import { runDeclutter } from "../services/falDeclutter.js";
import { runReplace } from "../services/falReplace.js";
import { saveGeneration } from "../services/generationStore.js";
import { isFirebaseConfigured } from "../services/firebaseAdmin.js";
import {
  assertCanGenerate,
  assertCanUseDeepThinking,
  recordGenerationUsage,
  SubscriptionError,
} from "../services/subscriptionService.js";
import { assertPropertyOwned } from "../services/propertyStore.js";
import { assertPlan, PlanError } from "../middleware/requirePlan.js";
import { normalizeGenerationTuning } from "../services/generationTuning.js";
import { ensureConfigCache } from "../services/configStore.js";

const router = Router();

const VALID_MODES = new Set(["meubler", "desencombrer", "remplacer"]);

function needsStyle(mode) {
  return mode === "meubler" || mode === "remplacer";
}

router.post("/generate", requireAuth, async (req, res, next) => {
  try {
    await ensureConfigCache();

    const {
      base_image,
      mode = "meubler",
      room_type,
      style,
      deep_thinking,
      room_sqm,
      variant_group_id,
      variant_index,
      property_id,
      generation_tuning,
    } = req.body;

    if (!base_image) {
      return res.status(400).json({ error: "base_image is required" });
    }

    if (!VALID_MODES.has(mode)) {
      return res.status(400).json({
        error: "Invalid mode. Use: meubler, desencombrer, or remplacer",
      });
    }

    if (!room_type || !isValidRoomType(room_type)) {
      return res.status(400).json({
        error: "Invalid room_type.",
      });
    }

    if (!isValidRoomSqm(room_sqm)) {
      return res.status(400).json({
        error: "Invalid room_sqm. Use a number between 5 and 200.",
      });
    }

    const parsedSqm =
      room_sqm != null && room_sqm !== "" ? Number(room_sqm) : null;

    if (
      needsStyle(mode) &&
      (!style || !isValidStyleForRoom(style, room_type))
    ) {
      return res.status(400).json({
        error: "Invalid style for this room type.",
      });
    }

    const deepThinking = Boolean(deep_thinking);

    let generationTuning = null;
    if (generation_tuning != null && typeof generation_tuning === "object") {
      if (req.user?.uid) {
        await assertPlan(req.user.uid, "pro");
      }
      generationTuning = normalizeGenerationTuning(generation_tuning);
      if (!generationTuning) {
        return res.status(400).json({
          error: "Invalid generation_tuning. Use values between 0 and 100.",
        });
      }
    }

    if (req.user?.uid) {
      await assertCanGenerate(req.user.uid);
      if (deepThinking) {
        await assertCanUseDeepThinking(req.user.uid);
      }
    }

    let propertyId = null;
    if (property_id && req.user?.uid) {
      await assertPlan(req.user.uid, "agence");
      await assertPropertyOwned(req.user.uid, property_id);
      propertyId = property_id;
    }

    const baseBuffer = dataUrlToBuffer(base_image);

    let prompt;
    let falImageUrl;

    if (mode === "desencombrer") {
      prompt = buildDeclutterPrompt(room_type);
      falImageUrl = await runDeclutter(
        baseBuffer,
        room_type,
        deepThinking,
        generationTuning,
      );
    } else if (mode === "remplacer") {
      prompt = buildReplacePrompt(style, room_type);
      falImageUrl = await runReplace(
        baseBuffer,
        style,
        room_type,
        deepThinking,
        generationTuning,
      );
    } else {
      prompt = buildPrompt(style, room_type, parsedSqm);
      falImageUrl = await runStaging(
        baseBuffer,
        prompt,
        deepThinking,
        generationTuning,
      );
    }

    let generation = null;
    if (req.user?.uid && isFirebaseConfigured()) {
      generation = await saveGeneration(req.user.uid, {
        mode,
        roomType: room_type,
        style: needsStyle(mode) ? style : null,
        prompt,
        baseBuffer,
        resultUrl: falImageUrl,
        variantGroupId: variant_group_id ?? null,
        variantIndex:
          variant_index != null && variant_index !== ""
            ? Number(variant_index)
            : null,
        propertyId,
      });
      await recordGenerationUsage(req.user.uid, { deepThinking });
    }

    res.json({
      imageUrl: generation?.imageUrl ?? falImageUrl,
      prompt,
      mode,
      generation,
    });
  } catch (err) {
    if (err instanceof SubscriptionError || err instanceof PlanError) {
      return res.status(err.status).json({
        error: err.message,
        code: err.code,
      });
    }
    next(err);
  }
});

export default router;
