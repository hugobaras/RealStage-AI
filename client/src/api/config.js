import { INTERIOR_STYLES, OUTDOOR_STYLES } from "../constants/styles";
import { ROOM_TYPES } from "../constants/roomTypes";
import { PLANS, TRIAL_LIMIT } from "../constants/plans";
import { FEATURES } from "../constants/features";
import {
  GENERATION_TUNING_DEFAULTS,
  GENERATION_TUNING_PRESETS,
} from "../constants/generationTuning";

async function parseResponse(response) {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Requête échouée.");
  }
  return data;
}

const FALLBACK = {
  styles: {
    items: [...INTERIOR_STYLES, ...OUTDOOR_STYLES],
  },
  roomTypes: {
    items: ROOM_TYPES,
  },
  plans: {
    items: PLANS,
    trialLimit: TRIAL_LIMIT,
  },
  features: {
    features: FEATURES,
  },
  generationTuning: {
    defaults: GENERATION_TUNING_DEFAULTS,
    presets: GENERATION_TUNING_PRESETS,
  },
};

export async function fetchCatalogSection(section) {
  const paths = {
    styles: "/api/config/styles",
    roomTypes: "/api/config/room-types",
    plans: "/api/config/plans",
    features: "/api/config/features",
    generationTuning: "/api/config/generation-tuning",
  };
  const path = paths[section];
  if (!path) throw new Error(`Section catalogue inconnue: ${section}`);

  try {
    const response = await fetch(path);
    const data = await parseResponse(response);
    return data[section] ?? FALLBACK[section];
  } catch {
    return FALLBACK[section];
  }
}

export async function fetchAllCatalog() {
  const sections = Object.keys(FALLBACK);
  const entries = await Promise.all(
    sections.map(async (section) => [
      section,
      await fetchCatalogSection(section),
    ]),
  );
  return Object.fromEntries(entries);
}
