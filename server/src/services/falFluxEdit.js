import { fal } from "@fal-ai/client";
import { getFalConfig } from "../config.js";
import { formatFalError } from "../utils/falErrors.js";

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

export function buildFluxEditInput(model, imageUrl, prompt, deepThinking) {
  if (isFluxEditModel(model)) {
    return {
      image_urls: [imageUrl],
      prompt,
      guidance_scale: deepThinking ? 3 : 2.5,
      num_inference_steps: deepThinking ? 40 : 28,
      enable_prompt_expansion: false,
      output_format: "jpeg",
    };
  }

  if (isEditingModel(model)) {
    return {
      image_url: imageUrl,
      prompt,
      guidance_scale: deepThinking ? 4 : 3.5,
      num_inference_steps: deepThinking ? 40 : 30,
      output_format: "jpeg",
    };
  }

  if (isObjectRemovalModel(model)) {
    return {
      image_url: imageUrl,
      prompt: "all furniture, rugs, lamps, plants, and decorations",
      model: "best_quality",
      mask_expansion: deepThinking ? 20 : 15,
    };
  }

  return {
    image_url: imageUrl,
    prompt,
    strength: deepThinking ? 0.7 : 0.65,
    num_inference_steps: deepThinking ? 40 : 28,
    guidance_scale: deepThinking ? 3.5 : 3,
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
) {
  const { key } = getFalConfig();

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
      input: buildFluxEditInput(model, imageUrl, prompt, deepThinking),
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
