import { FieldValue, getFirestore } from "firebase-admin/firestore";
import {
  INTERIOR_STYLES,
  OUTDOOR_STYLES,
} from "../../../client/src/constants/styles.js";
import {
  ROOM_TYPES,
  OUTDOOR_ROOM_IDS,
} from "../../../client/src/constants/roomTypes.js";
import { PLANS, TRIAL_LIMIT } from "../config/plans.js";
import { FEATURES } from "../config/features.js";
import { TUNING_DEFAULTS } from "./generationTuning.js";
import { TUNING_PRESETS } from "../config/generationTuningPresets.js";
import {
  STYLE_DEFINITIONS,
  OUTDOOR_ONLY_STYLE_PROMPTS,
  ROOM_PROMPTS,
} from "./promptBuilder.js";
import { initFirebaseAdmin, isFirebaseConfigured } from "./firebaseAdmin.js";
import { refreshConfigCache } from "./configStore.js";

export async function seedAllConfig(updatedBy = "system") {
  if (!isFirebaseConfigured()) {
    throw Object.assign(new Error("Firebase non configuré."), { status: 503 });
  }

  initFirebaseAdmin();
  const db = getFirestore();

  const payload = {
    styles: {
      definitions: STYLE_DEFINITIONS,
      outdoorOnlyDefinitions: OUTDOOR_ONLY_STYLE_PROMPTS,
      items: [...INTERIOR_STYLES, ...OUTDOOR_STYLES],
    },
    roomTypes: {
      prompts: ROOM_PROMPTS,
      outdoorRoomTypeIds: [...OUTDOOR_ROOM_IDS],
      items: ROOM_TYPES,
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
