import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { buildStaticKnowledgeChunks } from "./ragStaticKnowledge.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function resolveClientConstantsDir() {
  const candidates = [
    path.resolve(__dirname, "../../../client/src/constants"),
    path.resolve(__dirname, "../../client/src/constants"),
    "/app/client/src/constants",
  ];
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, "plans.js"))) return dir;
  }
  throw new Error("Répertoire client/src/constants introuvable pour le RAG.");
}

function resolveClientComponentsDir() {
  const base = path.dirname(resolveClientConstantsDir());
  return path.join(base, "components");
}

async function importConstants(name) {
  const filePath = path.join(resolveClientConstantsDir(), `${name}.js`);
  return import(pathToFileURL(filePath).href);
}

function chunk(id, topic, source, text) {
  return { id, topic, source, text: text.trim() };
}

function groupByCategory(items, labelKey = "label") {
  const map = new Map();
  for (const item of items) {
    const cat = item.category ?? "Autre";
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat).push(item[labelKey] ?? item.id);
  }
  return map;
}

export async function collectKnowledgeChunks() {
  const componentsDir = resolveClientComponentsDir();

  const [
    landingModule,
    plansModule,
    featuresModule,
    modesModule,
    stylesModule,
    roomTypesModule,
    tuningModule,
    reportReasonsModule,
    listingModule,
    roomTypicalSqmModule,
    exportLabelModule,
  ] = await Promise.all([
    import(
      pathToFileURL(path.join(componentsDir, "landing/landingData.js")).href
    ).catch(() => ({ FAQ_ITEMS: [], FEATURES: [], STEPS: [], STATS: [] })),
    importConstants("plans"),
    importConstants("features"),
    importConstants("modes"),
    importConstants("styles"),
    importConstants("roomTypes"),
    importConstants("generationTuning"),
    importConstants("reportReasons"),
    importConstants("listingWorkflow"),
    importConstants("roomTypicalSqm"),
    importConstants("exportLabel"),
  ]);

  const chunks = [...buildStaticKnowledgeChunks()];

  // —— Landing marketing ——
  for (const item of landingModule.FAQ_ITEMS ?? []) {
    chunks.push(
      chunk(
        `faq-${item.q.slice(0, 40)}`,
        "faq",
        "landingData",
        `Question : ${item.q}\nRéponse : ${item.a}`,
      ),
    );
  }

  for (const feature of landingModule.FEATURES ?? []) {
    chunks.push(
      chunk(
        `feature-${feature.title}`,
        "feature",
        "landingData",
        `${feature.title} : ${feature.description}`,
      ),
    );
  }

  for (const step of landingModule.STEPS ?? []) {
    chunks.push(
      chunk(
        `step-${step.step}`,
        "workflow",
        "landingData",
        `Étape ${step.step} — ${step.title} : ${step.description}`,
      ),
    );
  }

  for (const stat of landingModule.STATS ?? []) {
    chunks.push(
      chunk(
        `stat-${stat.label}`,
        "product",
        "landingData",
        `${stat.label} : ${stat.value}`,
      ),
    );
  }

  for (const item of landingModule.SHOWCASE_ITEMS ?? []) {
    chunks.push(
      chunk(
        `showcase-${item.id}`,
        "mode",
        "landingData",
        `Démonstration mode ${item.title} : exemple avant/après sur le site.`,
      ),
    );
  }

  // —— Plans ——
  const { PLANS, TRIAL_LIMIT } = plansModule;
  chunks.push(
    chunk(
      "trial-limit",
      "subscription",
      "plans",
      `Essai à l'inscription uniquement : ${TRIAL_LIMIT} générations gratuites sans carte bancaire. Pas d'essai gratuit d'un mois sur les abonnements payants.`,
    ),
  );

  for (const plan of PLANS ?? []) {
    const gens =
      plan.generationsPerMonth == null
        ? "générations illimitées"
        : `${plan.generationsPerMonth} générations / mois`;
    const deep =
      plan.deepThinkingPerMonth == null
        ? "réflexion approfondie illimitée"
        : `${plan.deepThinkingPerMonth} réflexions approfondies / mois`;
    chunks.push(
      chunk(
        `plan-${plan.id}`,
        "plan",
        "plans",
        `Forfait ${plan.label} — ${plan.priceMonthly} €/mois (facturé dès souscription). ${gens}, ${deep}. Fonctionnalités incluses : ${plan.features.join(", ")}.`,
      ),
    );
  }

  // —— Feature gating ——
  const { FEATURES } = featuresModule;
  const featureDescriptions = {
    multiProjects:
      "Dossiers multi-projets (un bien par adresse, historique et exports groupés)",
    agencyPresets:
      "Branding agence sur les exports (logo, signature, mentions légales)",
    listingWorkflow:
      "Mode annonce avec checklist pièces essentielles et workflow guidé",
    variantCompare:
      "Génération et comparaison de variantes A/B/C (2 ou 3 styles)",
    generationTuning:
      "Réglages IA avancés : curseurs créativité, précision prompt, niveau de détail + presets",
  };
  for (const [key, meta] of Object.entries(FEATURES ?? {})) {
    chunks.push(
      chunk(
        `gating-${key}`,
        "feature",
        "features",
        `${featureDescriptions[key] ?? key} : forfait minimum « ${meta.minPlan} »${meta.exact ? " (exclusivement)" : " ou supérieur"}.`,
      ),
    );
  }

  // —— Modes ——
  const { STYLE_MODES, MODE_IDS } = modesModule;
  for (const mode of Object.values(modesModule.MODES ?? {})) {
    const needsStyle = STYLE_MODES?.includes(mode.id);
    chunks.push(
      chunk(
        `mode-${mode.id}`,
        "mode",
        "modes",
        `Mode ${mode.label} (${mode.title}) : ${mode.subtitle}. Bouton génération : « ${mode.generateLabel} ». ${needsStyle ? "Nécessite un style et un type de pièce." : "Ne nécessite pas de style."}`,
      ),
    );
  }
  chunks.push(
    chunk(
      "modes-list",
      "mode",
      "modes",
      `Modes disponibles : ${(MODE_IDS ?? []).join(", ")}.`,
    ),
  );

  // —— Styles (catalogue + résumés par catégorie) ——
  const allStyles = [
    ...(stylesModule.INTERIOR_STYLES ?? []),
    ...(stylesModule.OUTDOOR_STYLES ?? []),
  ];

  for (const style of allStyles) {
    chunks.push(
      chunk(
        `style-${style.id}`,
        "style",
        "styles",
        `Style « ${style.label} » (id: ${style.id}, ${style.category}, ${style.scope}) : ${style.description}`,
      ),
    );
  }

  const interiorByCat = groupByCategory(
    stylesModule.INTERIOR_STYLES ?? [],
    "label",
  );
  for (const [category, labels] of interiorByCat) {
    chunks.push(
      chunk(
        `styles-cat-int-${category}`,
        "style",
        "styles",
        `Styles intérieur — catégorie « ${category} » : ${labels.join(", ")}.`,
      ),
    );
  }

  const outdoorByCat = groupByCategory(
    stylesModule.OUTDOOR_STYLES ?? [],
    "label",
  );
  for (const [category, labels] of outdoorByCat) {
    chunks.push(
      chunk(
        `styles-cat-out-${category}`,
        "style",
        "styles",
        `Styles extérieur — catégorie « ${category} » : ${labels.join(", ")}.`,
      ),
    );
  }

  if (stylesModule.INTERIOR_CATEGORY_ORDER) {
    chunks.push(
      chunk(
        "styles-interior-order",
        "style",
        "styles",
        `Ordre des catégories styles intérieur : ${stylesModule.INTERIOR_CATEGORY_ORDER.join(" · ")}.`,
      ),
    );
  }

  // —— Types de pièces ——
  for (const room of roomTypesModule.ROOM_TYPES ?? []) {
    chunks.push(
      chunk(
        `room-${room.id}`,
        "room",
        "roomTypes",
        `Pièce « ${room.displayLabel ?? room.label} » (id: ${room.id}, ${room.category}) : ${room.description}.`,
      ),
    );
  }

  const roomsByCat = groupByCategory(roomTypesModule.ROOM_TYPES ?? [], "label");
  for (const [category, labels] of roomsByCat) {
    chunks.push(
      chunk(
        `rooms-cat-${category}`,
        "room",
        "roomTypes",
        `Types de pièces — « ${category} » : ${labels.join(", ")}.`,
      ),
    );
  }

  if (roomTypesModule.OUTDOOR_ROOM_IDS) {
    chunks.push(
      chunk(
        "rooms-outdoor-ids",
        "room",
        "roomTypes",
        `Pièces extérieures (styles outdoor uniquement) : ${[...roomTypesModule.OUTDOOR_ROOM_IDS].join(", ")}.`,
      ),
    );
  }

  if (roomTypesModule.ROOM_CATEGORY_ORDER) {
    chunks.push(
      chunk(
        "rooms-category-order",
        "room",
        "roomTypes",
        `Catégories de pièces : ${roomTypesModule.ROOM_CATEGORY_ORDER.join(" · ")}.`,
      ),
    );
  }

  // —— Workflow annonce ——
  chunks.push(
    chunk(
      "listing-steps",
      "workflow",
      "listingWorkflow",
      `Étapes workflow annonce : ${(listingModule.LISTING_STEPS ?? []).map((s) => s.label).join(" → ")}.`,
    ),
  );
  chunks.push(
    chunk(
      "listing-essential-rooms",
      "workflow",
      "listingWorkflow",
      `Pièces essentielles checklist annonce (ids) : ${(listingModule.ESSENTIAL_ROOMS ?? []).join(", ")}. Le workflow suggère la prochaine pièce manquante tant que la checklist n'est pas complète.`,
    ),
  );

  // —— Surfaces types (m²) ——
  for (const [roomId, sqm] of Object.entries(
    roomTypicalSqmModule.ROOM_TYPICAL_SQM ?? {},
  )) {
    chunks.push(
      chunk(
        `sqm-${roomId}`,
        "editor",
        "roomTypicalSqm",
        `Surface indicative pour la pièce « ${roomId} » : ${sqm} m² (bouton « Type : X m² » dans l'éditeur).`,
      ),
    );
  }
  if (roomTypicalSqmModule.SQM_PRESETS) {
    chunks.push(
      chunk(
        "sqm-presets",
        "editor",
        "roomTypicalSqm",
        `Raccourcis surface en m² : ${roomTypicalSqmModule.SQM_PRESETS.join(", ")}. Champ optionnel, bornes acceptées 5–200 m².`,
      ),
    );
  }

  // —— Tuning presets ——
  for (const preset of tuningModule.GENERATION_TUNING_PRESETS ?? []) {
    chunks.push(
      chunk(
        `tuning-${preset.id}`,
        "tuning",
        "generationTuning",
        `Preset « ${preset.label} » : ${preset.description}. Valeurs : créativité ${preset.values.creativity}, précision prompt ${preset.values.promptPrecision}, détail ${preset.values.detailLevel}. Réservé Pro/Agence.`,
      ),
    );
  }

  // —— Signalements ——
  for (const reason of reportReasonsModule.REPORT_REASONS ?? []) {
    chunks.push(
      chunk(
        `report-${reason.id}`,
        "support",
        "reportReasons",
        `Motif de signalement « ${reason.label} »${reason.id === "other" ? " — commentaire obligatoire" : ""}.`,
      ),
    );
  }

  // —— Export label ——
  const labelText =
    exportLabelModule.DEFAULT_AI_LABEL_TEXT ?? "Image générée par IA";
  chunks.push(
    chunk(
      "export-label-default",
      "export",
      "exportLabel",
      `Texte par défaut mention IA sur exports : « ${labelText} ».`,
    ),
  );

  return chunks;
}
