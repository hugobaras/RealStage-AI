import { fal } from "@fal-ai/client";
import { getFalConfig } from "../config.js";
import { formatFalError } from "../utils/falErrors.js";
import { resolveFalParams } from "./generationTuning.js";

export async function uploadBuffer(buffer, mimeType) {
  const blob = new Blob([buffer], { type: mimeType });
  return fal.storage.upload(blob);
}

function isFluxEditModel(model) {
  return model.includes("flux-2/edit") || model.includes("flux-2-max/edit");
}

function isEditingModel(model) {
  return model.includes("image-editing");
}

function isObjectRemovalModel(model) {
  return model.includes("object-removal") && !isEditingModel(model);
}

export function buildFluxEditInput(model, imageUrl, prompt, resolved) {
  if (isFluxEditModel(model)) {
    return {
      image_urls: [imageUrl],
      prompt,
      guidance_scale: resolved.guidance_scale,
      num_inference_steps: resolved.num_inference_steps,
      enable_prompt_expansion: false,
      output_format: "jpeg",
    };
  }

  if (isEditingModel(model)) {
    return {
      image_url: imageUrl,
      prompt,
      guidance_scale: resolved.guidance_scale,
      num_inference_steps: resolved.num_inference_steps,
      output_format: "jpeg",
    };
  }

  if (isObjectRemovalModel(model)) {
    return {
      image_url: imageUrl,
      prompt: "all furniture, rugs, lamps, plants, and decorations",
      model: "best_quality",
      mask_expansion: resolved.mask_expansion,
    };
  }

  return {
    image_url: imageUrl,
    prompt,
    strength: resolved.strength,
    num_inference_steps: resolved.num_inference_steps,
    guidance_scale: resolved.guidance_scale,
    output_format: "jpeg",
  };
}

/**
 * Exécute une édition image-to-image via Fal.ai (flux-2/edit ou modèle compatible).
 */
export async function runFluxEdit(
  baseImageBuffer,
  prompt,
  model,
  deepThinking = false,
  tuning = null,
) {
  const { key } = getFalConfig();
  const resolved = resolveFalParams(tuning, deepThinking);

  if (!key) {
    const formatted = formatFalError(
      new Error("FAL_KEY is not configured. Add it to server/.env"),
    );
    const apiErr = new Error(formatted.message);
    apiErr.status = formatted.status;
    throw apiErr;
  }

  fal.config({ credentials: key });

  try {
    const imageUrl = await uploadBuffer(baseImageBuffer, "image/png");

    const result = await fal.subscribe(model, {
      input: buildFluxEditInput(model, imageUrl, prompt, resolved),
      logs: false,
    });

    const imageUrlResult = result.data?.images?.[0]?.url;
    if (!imageUrlResult) {
      throw new Error("Fal.ai did not return an image");
    }

    return imageUrlResult;
  } catch (err) {
    const formatted = formatFalError(err);
    const apiErr = new Error(formatted.message);
    apiErr.status = formatted.status;
    apiErr.body = { detail: formatted.message };
    apiErr.code = formatted.code;
    throw apiErr;
  }
}
