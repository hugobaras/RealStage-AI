import { Router } from "express";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { getFalConfig } from "../../config.js";
import {
  getConfigCacheSync,
  ensureConfigCache,
} from "../../services/configStore.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let inFlightGenerations = 0;

export function trackGenerationStart() {
  inFlightGenerations += 1;
}

export function trackGenerationEnd() {
  inFlightGenerations = Math.max(0, inFlightGenerations - 1);
}

const router = Router();

router.get("/health", async (req, res, next) => {
  try {
    await ensureConfigCache();
    const platform = getConfigCacheSync().platform ?? {};
    const fal = getFalConfig();
    let version = "0.1.0";
    try {
      const pkg = JSON.parse(
        readFileSync(path.resolve(__dirname, "../../../package.json"), "utf8"),
      );
      version = pkg.version ?? version;
    } catch {
      // ignore
    }

    res.json({
      uptimeSeconds: Math.floor(process.uptime()),
      version,
      deployVersion: process.env.DEPLOY_VERSION ?? null,
      inFlightGenerations,
      fal: {
        configured: fal.keyLoaded,
        model: platform.falModels?.staging ?? fal.model,
        declutterModel: platform.falModels?.declutter ?? fal.declutterModel,
        replaceModel: platform.falModels?.replace ?? fal.replaceModel,
      },
      maintenance: platform.maintenance ?? { enabled: false },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
