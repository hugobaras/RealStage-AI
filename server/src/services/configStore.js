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
import { applyPromptCatalog } from "./promptCatalog.js";

const CACHE_TTL_MS = 60_000;
let cache = null;
let cacheTime = 0;

function defaultStylesConfig() {
  return {
    definitions: STYLE_DEFINITIONS,
    outdoorOnlyDefinitions: OUTDOOR_ONLY_STYLE_PROMPTS,
    items: [],
    updatedAt: null,
  };
}

function defaultRoomTypesConfig() {
  return {
    prompts: ROOM_PROMPTS,
    outdoorRoomTypeIds: [...OUTDOOR_ROOM_TYPES],
    items: [],
    updatedAt: null,
  };
}

function defaultPlansConfig() {
  return {
    items: Object.values(PLANS),
    trialLimit: TRIAL_LIMIT,
    updatedAt: null,
  };
}

function defaultFeaturesConfig() {
  return {
    features: FEATURES,
    updatedAt: null,
  };
}

function defaultTuningConfig() {
  return {
    defaults: TUNING_DEFAULTS,
    presets: TUNING_PRESETS,
    updatedAt: null,
  };
}

function defaultBlacklistConfig() {
  return { emails: [], domains: [], updatedAt: null };
}

function defaultPlatformConfig() {
  return {
    maintenance: { enabled: false, message: "" },
    flags: {
      modes: { meubler: true, desencombrer: true, remplacer: true },
      generationTuning: true,
    },
    falModels: { staging: null, declutter: null, replace: null },
    dailyGenerationCap: null,
    updatedAt: null,
  };
}

function defaultLandingConfig() {
  return { faq: [], testimonials: [], stats: [], updatedAt: null };
}

function defaultAnnouncementsConfig() {
  return { items: [], updatedAt: null };
}

function defaultAdminNotificationsConfig() {
  return {
    emails: [],
    slackWebhookUrl: null,
    triggers: { newReport: true, webhookError: true, usageSpike: false },
    updatedAt: null,
  };
}

function getDefaults() {
  return {
    styles: defaultStylesConfig(),
    roomTypes: defaultRoomTypesConfig(),
    plans: defaultPlansConfig(),
    features: defaultFeaturesConfig(),
    generationTuning: defaultTuningConfig(),
    blacklist: defaultBlacklistConfig(),
    platform: defaultPlatformConfig(),
    landing: defaultLandingConfig(),
    announcements: defaultAnnouncementsConfig(),
    adminNotifications: defaultAdminNotificationsConfig(),
  };
}

async function loadDoc(id) {
  if (!isFirebaseConfigured()) return null;
  initFirebaseAdmin();
  const doc = await getFirestore().collection("config").doc(id).get();
  return doc.exists ? doc.data() : null;
}

function mergeConfig(defaults, firestoreData) {
  if (!firestoreData) return defaults;
  return { ...defaults, ...firestoreData };
}

function applyCatalogToPrompts(config) {
  applyPromptCatalog({
    styleDefinitions: config.styles?.definitions,
    outdoorOnlyDefinitions: config.styles?.outdoorOnlyDefinitions,
    roomPromptOverrides: config.roomTypes?.prompts,
    outdoorRoomTypeIds: config.roomTypes?.outdoorRoomTypeIds,
  });
}

export async function refreshConfigCache() {
  const defaults = getDefaults();

  if (!isFirebaseConfigured()) {
    cache = defaults;
    cacheTime = Date.now();
    applyCatalogToPrompts(cache);
    return cache;
  }

  const [
    styles,
    roomTypes,
    plans,
    features,
    generationTuning,
    blacklist,
    platform,
    landing,
    announcements,
    adminNotifications,
  ] = await Promise.all([
    loadDoc("styles"),
    loadDoc("roomTypes"),
    loadDoc("plans"),
    loadDoc("features"),
    loadDoc("generationTuning"),
    loadDoc("blacklist"),
    loadDoc("platform"),
    loadDoc("landing"),
    loadDoc("announcements"),
    loadDoc("adminNotifications"),
  ]);

  cache = {
    styles: mergeConfig(defaults.styles, styles),
    roomTypes: mergeConfig(defaults.roomTypes, roomTypes),
    plans: mergeConfig(defaults.plans, plans),
    features: mergeConfig(defaults.features, features),
    generationTuning: mergeConfig(defaults.generationTuning, generationTuning),
    blacklist: mergeConfig(defaults.blacklist, blacklist),
    platform: mergeConfig(defaults.platform, platform),
    landing: mergeConfig(defaults.landing, landing),
    announcements: mergeConfig(defaults.announcements, announcements),
    adminNotifications: mergeConfig(
      defaults.adminNotifications,
      adminNotifications,
    ),
  };
  cacheTime = Date.now();
  applyCatalogToPrompts(cache);
  return cache;
}

export async function ensureConfigCache() {
  if (!cache || Date.now() - cacheTime > CACHE_TTL_MS) {
    await refreshConfigCache();
  }
  return cache;
}

export function getConfigCacheSync() {
  if (!cache) {
    cache = getDefaults();
    applyCatalogToPrompts(cache);
  }
  return cache;
}

export async function getPublicConfig(section) {
  const config = await ensureConfigCache();
  return config[section] ?? null;
}

export async function updateConfigSection(section, data, adminUid) {
  if (!isFirebaseConfigured()) {
    throw Object.assign(new Error("Firebase non configuré."), { status: 503 });
  }

  initFirebaseAdmin();
  const ref = getFirestore().collection("config").doc(section);
  const payload = {
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: adminUid,
  };
  await ref.set(payload, { merge: true });
  await refreshConfigCache();
  return getConfigCacheSync()[section];
}

export function getPlansFromConfig() {
  const config = getConfigCacheSync();
  const items = config.plans?.items ?? Object.values(PLANS);
  const map = {};
  for (const plan of items) {
    if (plan?.id) map[plan.id] = plan;
  }
  return { plans: map, trialLimit: config.plans?.trialLimit ?? TRIAL_LIMIT };
}
