import { fal } from "@fal-ai/client";
import { getFalConfig } from "../config.js";
import { formatFalError } from "../utils/falErrors.js";

async function uploadBuffer(buffer, mimeType) {
  const blob = new Blob([buffer], { type: mimeType });
  return fal.storage.upload(blob);
}

function isApartmentStagingModel(model) {
  return model.includes("apartment-staging");
}

function buildModelInput(model, imageUrl, prompt, deepThinking) {
  if (isApartmentStagingModel(model)) {
    return {
      prompt,
      image_urls: [imageUrl],
      lora_scale: deepThinking ? 1.2 : 1,
      num_inference_steps: deepThinking ? 40 : 28,
      guidance_scale: 2.5,
      output_format: "jpeg",
    };
  }

  return {
    prompt,
    image_url: imageUrl,
    strength: deepThinking ? 0.82 : 0.75,
    num_inference_steps: deepThinking ? 40 : 28,
    guidance_scale: deepThinking ? 4 : 3.5,
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
) {
  const { key, model } = getFalConfig();

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
      input: buildModelInput(model, imageUrl, prompt, deepThinking),
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
