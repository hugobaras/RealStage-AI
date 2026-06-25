import { getFalConfig } from "../config.js";
import { buildDeclutterPrompt } from "./promptBuilder.js";
import { runFluxEdit } from "./falFluxEdit.js";

/**
 * Désencombrement en une seule passe (évite les artefacts des passes multiples).
 */
export async function runDeclutter(
  baseImageBuffer,
  roomType,
  deepThinking = false,
) {
  const { declutterModel } = getFalConfig();
  const prompt = buildDeclutterPrompt(roomType);
  return runFluxEdit(baseImageBuffer, prompt, declutterModel, deepThinking);
}
