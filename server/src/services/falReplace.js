import { getFalConfig } from "../config.js";
import { buildReplacePrompt } from "./promptBuilder.js";
import { runFluxEdit } from "./falFluxEdit.js";

/**
 * Remplacement strict du mobilier existant (même agencement, nouveau style).
 */
export async function runReplace(
  baseImageBuffer,
  style,
  roomType,
  deepThinking = false,
) {
  const { replaceModel } = getFalConfig();
  const prompt = buildReplacePrompt(style, roomType);
  return runFluxEdit(baseImageBuffer, prompt, replaceModel, deepThinking);
}
