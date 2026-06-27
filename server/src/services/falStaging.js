import { fal } from "@fal-ai/client";
import { getFalConfig } from "../config.js";
import { formatFalError } from "../utils/falErrors.js";
import { resolveFalParams } from "./generationTuning.js";

async function uploadBuffer(buffer, mimeType) {
  const blob = new Blob([buffer], { type: mimeType });
  return fal.storage.upload(blob);
}

function isApartmentStagingModel(model) {
  return model.includes("apartment-staging");
}

export function buildModelInput(model, imageUrl, prompt, resolved) {
  if (isApartmentStagingModel(model)) {
    return {
      prompt,
      image_urls: [imageUrl],
      lora_scale: resolved.lora_scale,
      num_inference_steps: resolved.num_inference_steps,
      guidance_scale: resolved.guidance_scale,
      output_format: "jpeg",
    };
  }

  return {
    prompt,
    image_url: imageUrl,
    strength: resolved.strength,
    num_inference_steps: resolved.num_inference_steps,
    guidance_scale: resolved.guidance_scale,
    output_format: "jpeg",
  };
}

/**
 * Virtual staging via Fal.ai (LoRA apartment-staging ou FLUX image-to-image).
 */
export async function runStaging(
  baseImageBuffer,
  prompt,
  deepThinking = false,
  tuning = null,
) {
  const { key, model } = getFalConfig();
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
      input: buildModelInput(model, imageUrl, prompt, resolved),
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
