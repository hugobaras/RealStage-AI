import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { PLANS, TRIAL_LIMIT } from "../config/plans.js";
import { FEATURES } from "../config/features.js";
import { TUNING_DEFAULTS } from "./generationTuning.js";
import { TUNING_PRESETS } from "../config/generationTuningPresets.js";
import {
  STYLE_DEFINITIONS,
  OUTDOOR_ONLY_STYLE_PROMPTS,
  ROOM_PROMPTS,
  OUTDOOR_ROOM_TYPES,
} from "./promptBuilder.js";
import { initFirebaseAdmin, isFirebaseConfigured } from "./firebaseAdmin.js";
import { refreshConfigCache } from "./configStore.js";

async function loadClientCatalog() {
  try {
    const [stylesMod, roomsMod] = await Promise.all([
      import("../../../client/src/constants/styles.js"),
      import("../../../client/src/constants/roomTypes.js"),
    ]);
    return {
      styleItems: [...stylesMod.INTERIOR_STYLES, ...stylesMod.OUTDOOR_STYLES],
      roomItems: roomsMod.ROOM_TYPES,
      outdoorRoomTypeIds: [...roomsMod.OUTDOOR_ROOM_IDS],
    };
  } catch {
    return {
      styleItems: [],
      roomItems: [],
      outdoorRoomTypeIds: [...OUTDOOR_ROOM_TYPES],
    };
  }
}

export async function seedAllConfig(updatedBy = "system") {
  if (!isFirebaseConfigured()) {
    throw Object.assign(new Error("Firebase non configuré."), { status: 503 });
  }

  initFirebaseAdmin();
  const db = getFirestore();
  const { styleItems, roomItems, outdoorRoomTypeIds } =
    await loadClientCatalog();

  const payload = {
    styles: {
      definitions: STYLE_DEFINITIONS,
      outdoorOnlyDefinitions: OUTDOOR_ONLY_STYLE_PROMPTS,
      items: styleItems,
    },
    roomTypes: {
      prompts: ROOM_PROMPTS,
      outdoorRoomTypeIds,
      items: roomItems,
    },
    plans: {
      items: Object.values(PLANS),
      trialLimit: TRIAL_LIMIT,
    },
    features: {
      features: FEATURES,
    },
    generationTuning: {
      defaults: TUNING_DEFAULTS,
      presets: TUNING_PRESETS,
    },
  };

  for (const [section, data] of Object.entries(payload)) {
    await db
      .collection("config")
      .doc(section)
      .set({
        ...data,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy,
      });
  }

  return refreshConfigCache();
}
