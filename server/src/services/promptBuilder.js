import {
  getOutdoorOnlyStylePrompts,
  getOutdoorRoomTypes,
  getRoomPrompts,
  getStylePrompts,
} from "./promptCatalog.js";

function buildInteriorAtmosphere({
  character,
  palette,
  materials,
  interiorFinish,
}) {
  return `${character}. Color palette of ${palette}. ${materials}. ${interiorFinish}`;
}

function buildOutdoorAtmosphere({
  label,
  character,
  palette,
  materials,
  outdoorFurniture,
  outdoorFinish,
}) {
  return (
    `Exact same ${label} style as the matching interior — identical palette of ${palette}, same ${materials}. ` +
    `${outdoorFurniture}. ${character}. ${outdoorFinish}`
  );
}

function compileStylePrompts(definitions) {
  return Object.fromEntries(
    Object.entries(definitions).map(([key, def]) => [
      key,
      {
        label: def.label,
        palette: def.palette,
        atmosphere: buildInteriorAtmosphere(def),
        outdoorAtmosphere: buildOutdoorAtmosphere(def),
      },
    ]),
  );
}

const STYLE_DEFINITIONS = {
  moderne: {
    label: "luxury ultra-modern",
    palette: "charcoal, matte black, cream, and soft taupe",
    materials:
      "clean architectural lines, premium polished concrete, brushed metal accents, tinted glass, and seamless matte surfaces",
    character:
      "sleek high-end minimalist design with sophisticated neutral tones",
    interiorFinish:
      "contemporary elegance, architectural digest interior, curated luxury staging, and flawless sophisticated finish",
    outdoorFurniture:
      "powder-coated aluminum outdoor frames, premium teak or composite tabletops, and weatherproof cushions in charcoal, cream, and taupe",
    outdoorFinish:
      "architectural digest outdoor terrace, curated luxury outdoor staging, and flawless sophisticated finish matching the interior",
  },
  scandinave: {
    label: "Nordic Scandinavian",
    palette:
      "crisp whites, soft muted greys, pale oak, and subtle pastel accents",
    materials:
      "natural textures, light blonde wood, woven wool textiles, soft linen, and ceramic accents",
    character: "authentic cozy hygge atmosphere with organic aesthetic",
    interiorFinish:
      "bright warm natural sunlight feel, airy spacious layout, clean functional design, and warm inviting residential ambiance",
    outdoorFurniture:
      "pale wood slat outdoor furniture, light grey weatherproof textiles, natural linen cushion covers, and simple ceramic planters",
    outdoorFinish:
      "bright airy terrace bathed in soft natural sunlight, clean functional outdoor design, and warm inviting ambiance matching the interior",
  },
  mid_century: {
    label: "authentic mid-century modern",
    palette: "mustard yellow, burnt orange, olive green, and warm neutrals",
    materials:
      "rich walnut and oiled teak wood, iconic organic shapes, tapered legs, premium boucle fabrics, matte leather, brass and matte black hardware",
    character: "retro-chic charm and curated vintage ambiance",
    interiorFinish:
      "iconic designer furniture statements and sophisticated mid-century residential staging",
    outdoorFurniture:
      "tapered-leg teak outdoor chairs, woven rope accents, and weatherproof cushions in mustard, olive, and warm neutral tones",
    outdoorFinish:
      "curated 1960s patio character with warm walnut tones matching the interior mid-century mood",
  },
  industriel: {
    label: "urban industrial loft",
    palette: "charcoal, rust, concrete grey, and warm cognac brown",
    materials:
      "exposed brick tones, black steel frames, distressed leather, reclaimed wood surfaces, and matte metal accents",
    character: "raw loft aesthetic with factory-inspired character",
    interiorFinish:
      "Edison-era character, bold masculine urban sophistication, and industrial residential staging",
    outdoorFurniture:
      "black metal outdoor bistro sets, reclaimed wood tabletops, distressed leather outdoor cushions, and corten steel planters",
    outdoorFinish:
      "bold metropolitan rooftop or courtyard ambiance matching the interior industrial loft character",
  },
  boheme: {
    label: "eclectic bohemian",
    palette: "rich jewel tones, terracotta, deep emerald, and warm ochre",
    materials:
      "natural rattan, macramé textures, woven jute, vintage-inspired patterns, and globally inspired artisanal finishes",
    character: "layered free-spirited bohemian ambiance",
    interiorFinish:
      "relaxed artistic residential mood, collected-over-time feel, and warm inviting creative energy",
    outdoorFurniture:
      "rattan outdoor lounge chairs, macramé hanging planters, terracotta pots, and layered patterned weatherproof cushions in jewel tones and ochre",
    outdoorFinish:
      "free-spirited courtyard styling with warm creative energy matching the interior bohemian mood",
  },
  coastal: {
    label: "coastal beach house",
    palette:
      "sun-bleached whites, sandy beige, soft sky blue, and driftwood tones",
    materials:
      "light natural fibers, whitewashed wood, linen upholstery, and subtle nautical elegance without cliché decor",
    character: "breezy seaside retreat atmosphere",
    interiorFinish:
      "airy luminous ambiance, relaxed luxury, and fresh open coastal living",
    outdoorFurniture:
      "whitewashed teak outdoor furniture, rope-wrapped accents, sandy beige weatherproof cushions, and driftwood-toned dining sets",
    outdoorFinish:
      "light airy oceanfront terrace feel with relaxed luxury matching the interior coastal ambiance",
  },
  campagne: {
    label: "modern farmhouse",
    palette: "warm oak, cream, and soft sage green",
    materials:
      "shiplap-inspired textures, rustic wood with clean contemporary lines, and matte black hardware",
    character: "refined countryside warmth with understated pastoral charm",
    interiorFinish:
      "cozy welcoming family home feel, honest materials, and timeless rural elegance",
    outdoorFurniture:
      "solid oak outdoor dining sets, cream and sage weatherproof cushions, and rustic wrought-iron accents",
    outdoorFinish:
      "warm pastoral courtyard charm with honest materials matching the interior farmhouse mood",
  },
  art_deco: {
    label: "glamorous Art Deco",
    palette: "deep navy, emerald, champagne gold, black marble, and ivory",
    materials:
      "geometric symmetry, lacquered surfaces, bold contrast, velvet upholstery, brass inlays, and sunburst motifs",
    character: "1920s-inspired glamour with Gatsby-era sophistication",
    interiorFinish: "sophisticated Art Deco luxury staging",
    outdoorFurniture:
      "geometric black-and-white outdoor patio furniture, brass accent tables, and champagne-toned weatherproof upholstery in navy and emerald accents",
    outdoorFinish:
      "symmetrical terrace entertaining with lacquered surfaces matching the interior Art Deco glamour",
  },
  japandi: {
    label: "Japandi fusion",
    palette: "muted earth tones, warm greige, clay, and natural wood",
    materials:
      "low-profile forms, clean negative space, handcrafted ceramics, and tactile natural materials",
    character:
      "harmonious blend of Japanese minimalism and Scandinavian warmth",
    interiorFinish:
      "serene understated elegance, mindful residential tranquility, and calm zen-like balance",
    outdoorFurniture:
      "low-profile teak outdoor benches, stone side tables, and carefully placed bonsai or bamboo planters with earth-tone cushions",
    outdoorFinish:
      "calm harmonious garden balance with serene understated elegance matching the interior Japandi mood",
  },
  minimaliste: {
    label: "pure minimalist",
    palette: "monochromatic whites, soft greys, and a single accent tone",
    materials:
      "hidden storage forms, flush surfaces, thin-profile furniture, and immaculate visual calm",
    character: "ultra-edited less-is-more design with architectural purity",
    interiorFinish:
      "gallery-like spatial clarity and premium restrained sophistication",
    outdoorFurniture:
      "slim-profile aluminum outdoor furniture, monochromatic grey weatherproof cushions, and a single sculptural planter accent",
    outdoorFinish:
      "gallery-like terrace clarity with premium restrained sophistication matching the interior minimalist mood",
  },
  rustique: {
    label: "refined rustic",
    palette: "chestnut, moss green, burnt umber, and cream",
    materials:
      "heavy timber, stone textures, aged wood, and cream wool textiles",
    character: "elevated cabin-inspired warmth with handcrafted character",
    interiorFinish:
      "fireplace-adjacent coziness and authentic mountain lodge residential charm",
    outdoorFurniture:
      "heavy timber outdoor benches, stone-topped tables, chunky wooden dining sets, and moss-toned weatherproof cushions",
    outdoorFinish:
      "authentic countryside lodge outdoor warmth matching the interior rustic character",
  },
  luxe: {
    label: "high-end luxury",
    palette: "champagne, taupe, onyx, and soft gold highlights",
    materials:
      "marble accents, brushed brass, velvet, silk touches, and couture-level finishing",
    character: "opulent five-star hotel residential elegance",
    interiorFinish:
      "tailored bespoke furniture and prestigious magazine-cover staging",
    outdoorFurniture:
      "premium woven resin outdoor furniture, champagne and taupe Sunbrella cushions, and polished stone accent tables with soft gold hardware",
    outdoorFinish:
      "opulent poolside or garden terrace staging with prestigious magazine-cover elegance matching the interior luxury mood",
  },
  tropical: {
    label: "tropical modern",
    palette: "palm green, coral, sandy neutrals, and ocean blue touches",
    materials: "bamboo, rattan, and tropical hardwood accents",
    character: "lush resort-inspired design with relaxed island luxury",
    interiorFinish:
      "indoor-outdoor flow feeling and fresh exotic vacation-home ambiance",
    outdoorFurniture:
      "bamboo and teak outdoor loungers, rattan dining sets, and weatherproof cushions in palm green and coral accents",
    outdoorFinish:
      "fresh exotic vacation-home garden feel matching the interior tropical resort ambiance",
  },
  mediterraneen: {
    label: "Mediterranean",
    palette: "terracotta, ochre, cobalt blue, and whitewashed plaster tones",
    materials:
      "arched forms, wrought iron details, hand-painted ceramics, and rustic olive-wood finishes",
    character: "sun-drenched Southern European villa aesthetic",
    interiorFinish:
      "warm convivial atmosphere, timeless Old World charm, and breezy coastal Mediterranean living",
    outdoorFurniture:
      "wrought-iron outdoor bistro sets, terracotta planters, whitewashed wood benches, and cobalt-blue weatherproof cushion accents",
    outdoorFinish:
      "olive trees in large pots, ochre hardscape harmony, and breezy villa courtyard charm matching the interior Mediterranean mood",
  },
  classique: {
    label: "classic traditional",
    palette: "ivory, navy, burgundy, and antique gold accents",
    materials:
      "symmetrical layout, crown molding presence, refined upholstery, tufted fabrics, and dark wood casegoods",
    character: "timeless formal elegance with stately heritage character",
    interiorFinish:
      "crystal-adjacent sparkle and established traditional residential gravitas",
    outdoorFurniture:
      "elegant cast-aluminum outdoor dining sets, ivory and navy striped weatherproof cushions, and symmetrical planter urns",
    outdoorFinish:
      "stately heritage outdoor entertaining with refined symmetrical layout matching the interior classic elegance",
  },
  contemporain: {
    label: "soft contemporary",
    palette: "warm neutrals with subtle contrast",
    materials:
      "approachable modern curves, soft textiles, light wood, matte stone, and sculptural accent forms",
    character: "current residential design with balanced proportions",
    interiorFinish:
      "livable upscale everyday elegance and fresh move-in-ready staging",
    outdoorFurniture:
      "curved outdoor sofas, warm neutral weatherproof cushions, and mixed-material dining sets in light wood and matte stone",
    outdoorFinish:
      "livable upscale outdoor elegance and fresh move-in-ready garden staging matching the interior contemporary mood",
  },
  wabi_sabi: {
    label: "wabi-sabi",
    palette: "stone grey, clay, parchment, and soft moss",
    materials:
      "raw linen, handmade pottery, weathered natural wood, and organic asymmetry",
    character: "Japanese-inspired beauty in imperfection",
    interiorFinish:
      "quiet contemplative mood and soulful understated artisanal interior",
    outdoorFurniture:
      "weathered teak outdoor stools, handmade ceramic planters, raw linen weatherproof cushions, and aged stone surfaces",
    outdoorFinish:
      "quiet organic asymmetry with soulful artisanal outdoor character matching the interior wabi-sabi mood",
  },
  hollywood: {
    label: "Hollywood Regency",
    palette: "emerald, fuchsia, black, white, and metallic gold",
    materials:
      "lacquer, mirror accents, bold jewel tones, high-contrast patterns, plush velvet, and chinoiserie hints",
    character: "dramatic Old Hollywood glamour",
    interiorFinish: "theatrical sophisticated luxury staging",
    outdoorFurniture:
      "lacquered bold-colored outdoor lounge furniture, mirrored accent side tables, and jewel-toned weatherproof cushions",
    outdoorFinish:
      "theatrical poolside glamour with high-contrast patterns matching the interior Hollywood Regency drama",
  },
  provencal: {
    label: "French Provençal",
    palette: "lavender, sunflower yellow, and soft blue accents on cream bases",
    materials:
      "distressed painted wood, toile and floral textiles, wrought iron details, and rustic stone textures",
    character: "charming South of France countryside warmth",
    interiorFinish:
      "romantic pastoral warmth, casual refined French country living, and sun-washed provincial elegance",
    outdoorFurniture:
      "distressed painted wrought-iron outdoor furniture, lavender and sunflower-toned weatherproof cushions, and rustic stone dining tables",
    outdoorFinish:
      "romantic French countryside patio with olive planters and sun-washed provincial elegance matching the interior Provençal charm",
  },
  eclectique: {
    label: "curated eclectic",
    palette: "confident color blocking with gallery-worthy statement tones",
    materials:
      "intentionally mixed design eras, vintage finds, modern silhouettes, and global art influences",
    character: "personality-driven sophisticated design",
    interiorFinish:
      "visually rich yet composed, designer-collected residential feel",
    outdoorFurniture:
      "mixed-era outdoor pieces, bold color-blocked weatherproof cushions, and gallery-worthy statement planter combinations",
    outdoorFinish:
      "personality-driven sophisticated courtyard matching the interior eclectic composition",
  },
  transitionnel: {
    label: "transitional",
    palette: "soft greige, cream, navy accents, and warm wood tones",
    materials:
      "seamless bridge between classic and contemporary with neutral foundation and timeless silhouettes",
    character: "comfortable upscale family home aesthetic",
    interiorFinish:
      "broadly appealing staging and enduring market-friendly elegance",
    outdoorFurniture:
      "classic teak outdoor dining sets paired with contemporary lounge seating in neutral greige weatherproof cushions",
    outdoorFinish:
      "broadly appealing garden staging with timeless silhouettes matching the interior transitional elegance",
  },
  zen: {
    label: "zen sanctuary",
    palette: "soft sand, river grey, pale green, and untreated wood",
    materials:
      "low furniture forms, natural stone, bamboo, and water-inspired serenity",
    character: "meditative calm with harmonious balance",
    interiorFinish:
      "uncluttered spa-like tranquility and restorative peaceful residential retreat",
    outdoorFurniture:
      "low stone benches, bamboo accent outdoor furniture, river-rock harmony, and sand-toned weatherproof cushions",
    outdoorFinish:
      "uncluttered spa-like outdoor tranquility matching the interior zen sanctuary mood",
  },
  loft: {
    label: "open-plan urban loft",
    palette: "gallery-white, concrete grey, and warm wood accents",
    materials:
      "open sightlines, statement modular seating, polished concrete or wide-plank floors, and curated modern art presence",
    character: "spacious downtown loft with cosmopolitan creative lifestyle",
    interiorFinish: "airy volume and sophisticated city-dweller ambiance",
    outdoorFurniture:
      "modular outdoor sectionals, polished concrete-appropriate furniture, and gallery-style planter accents",
    outdoorFinish:
      "airy urban rooftop volume with sophisticated city-dweller ambiance matching the interior loft character",
  },
  vintage: {
    label: "vintage revival",
    palette: "dusty rose, sage, mustard, and aged cream",
    materials:
      "carefully restored period furniture forms and patina-rich materials",
    character: "nostalgic charm with romantic timeworn character",
    interiorFinish:
      "flea-market curator aesthetic and warm sentimental residential storytelling",
    outdoorFurniture:
      "restored wrought-iron outdoor bistro sets, patina-rich wooden benches, and muted retro weatherproof cushions in dusty rose and sage",
    outdoorFinish:
      "romantic timeworn courtyard character matching the interior vintage storytelling",
  },
  maximaliste: {
    label: "bold maximalist",
    palette: "saturated color, bold patterns, and jewel tones",
    materials:
      "richly layered surfaces, graphic wallpaper energy, mixed metals, and oversized art presence",
    character: "confident visually dense design with editorial drama",
    interiorFinish:
      "fearless personality-driven staging and luxurious more-is-more impact",
    outdoorFurniture:
      "saturated-color weatherproof cushions, mixed-pattern outdoor textiles, and dramatic oversized planter groupings",
    outdoorFinish:
      "fearless personality-driven outdoor design with luxurious more-is-more impact matching the interior maximalist drama",
  },
  cottagecore: {
    label: "cottagecore",
    palette: "buttercream, rose, sage, and warm honey wood",
    materials:
      "floral prints, soft pastels, handmade charm, and quaint romantic domesticity",
    character: "storybook English cottage warmth",
    interiorFinish:
      "cozy hearth-side feeling and gentle countryside fairytale ambiance",
    outdoorFurniture:
      "floral-print weatherproof cushions, wrought-iron outdoor bistro sets, and romantic garden seating",
    outdoorFinish:
      "cozy fairytale countryside outdoor charm with buttercream and rose tones matching the interior cottagecore mood",
  },
  art_nouveau: {
    label: "Art Nouveau inspired",
    palette: "moss green, peacock blue, amber, and cream",
    materials:
      "organic flowing lines, whiplash curves, botanical motifs, and stained wood accents",
    character: "elegant Belle Époque character with artisan-crafted details",
    interiorFinish: "poetic decorative sophistication",
    outdoorFurniture:
      "botanical-motif cast iron outdoor furniture, curved bench silhouettes, and moss-green and peacock-blue weatherproof cushion accents",
    outdoorFinish:
      "Belle Époque garden elegance with poetic decorative sophistication matching the interior Art Nouveau character",
  },
  bauhaus: {
    label: "Bauhaus modernist",
    palette: "white, black, red, yellow, and blue",
    materials:
      "functional modernist design, disciplined geometric forms, tubular steel, and flat-plane wood",
    character: "rationalist clarity with design-school pedigree",
    interiorFinish: "iconic twentieth-century architectural interior character",
    outdoorFurniture:
      "tubular steel outdoor chairs, primary-color weatherproof cushion accents, and disciplined geometric patio layout",
    outdoorFinish:
      "rationalist outdoor clarity with iconic twentieth-century design character matching the interior Bauhaus mood",
  },
  colonial: {
    label: "colonial revival",
    palette: "deep green, burgundy, brass, and cream",
    materials:
      "mahogany furniture, paneling presence, formal symmetry, and oriental rug character",
    character: "stately American colonial elegance with heritage prestige",
    interiorFinish:
      "gracious traditional living and established upscale residential gravitas",
    outdoorFurniture:
      "mahogany outdoor dining sets, classic white weatherproof cushion upholstery, and formal symmetrical planter arrangements",
    outdoorFinish:
      "gracious heritage outdoor entertaining with established gravitas matching the interior colonial elegance",
  },
  desert_modern: {
    label: "desert modern",
    palette: "adobe tones, terracotta, sand, and cactus green accents",
    materials:
      "clean desert architecture lines, woven textiles, tooled leather, and sun-baked natural materials",
    character:
      "Southwestern desert contemporary with warm arid landscape inspiration",
    interiorFinish: "relaxed southwestern luxury and open sky residential calm",
    outdoorFurniture:
      "clean-lined adobe-toned outdoor furniture, terracotta planters with cacti and succulents, and sand-colored weatherproof cushions",
    outdoorFinish:
      "warm arid landscape harmony with open-sky calm matching the interior desert modern mood",
  },
};

const STYLE_PROMPTS = compileStylePrompts(STYLE_DEFINITIONS);

/** Styles dédiés exclusivement aux espaces extérieurs (IDs distincts de l'intérieur). */
const OUTDOOR_ONLY_STYLE_PROMPTS = {
  terrasse_moderne: {
    label: "luxury modern terrace",
    atmosphere:
      "sleek high-end minimalist outdoor terrace with powder-coated aluminum frames, premium teak tabletops, and charcoal, cream, and taupe weatherproof cushions. " +
      "Clean architectural lines, brushed metal accents, and curated luxury outdoor staging with flawless sophisticated finish",
  },
  patio_minimaliste: {
    label: "pure minimalist patio",
    atmosphere:
      "ultra-edited minimalist patio with slim-profile aluminum outdoor furniture, monochromatic white and grey weatherproof cushions, and a single sculptural planter accent. " +
      "Gallery-like terrace clarity, immaculate hardscape, and premium restrained outdoor sophistication",
  },
  patio_contemporain: {
    label: "soft contemporary patio",
    atmosphere:
      "approachable modern patio with curved outdoor sofas, warm neutral weatherproof cushions, and mixed-material dining sets in light wood and matte stone. " +
      "Livable upscale outdoor elegance, balanced proportions, and fresh move-in-ready terrace staging",
  },
  villa_mediterraneen: {
    label: "Mediterranean villa garden",
    atmosphere:
      "sun-drenched Southern European villa terrace with wrought-iron outdoor bistro sets, terracotta planters, whitewashed wood benches, and cobalt-blue cushion accents. " +
      "Olive trees in large pots, ochre hardscape harmony, and breezy coastal Mediterranean courtyard charm",
  },
  provencal_jardin: {
    label: "French Provençal garden",
    atmosphere:
      "charming Provençal garden patio with distressed painted wrought-iron furniture, lavender and sunflower-toned weatherproof cushions, and rustic stone dining tables. " +
      "Romantic French countryside outdoor living with olive planters and sun-washed provincial elegance",
  },
  resort_tropical: {
    label: "tropical resort patio",
    atmosphere:
      "lush tropical resort patio with bamboo and teak loungers, rattan dining sets, and vibrant palm-green cushions with coral accents. " +
      "Island-luxury outdoor ambiance with tropical hardwood furniture and fresh exotic vacation-home garden feel",
  },
  bord_de_mer: {
    label: "coastal seaside deck",
    atmosphere:
      "breezy seaside deck with whitewashed teak outdoor furniture, rope-wrapped accents, sandy beige weatherproof cushions, and driftwood-toned dining sets. " +
      "Light airy oceanfront terrace feel with subtle nautical elegance and sun-bleached natural materials",
  },
  luxe_piscine: {
    label: "luxury poolside lounge",
    atmosphere:
      "opulent five-star poolside staging with premium woven resin loungers, champagne and taupe Sunbrella cushions, and polished stone accent tables with soft gold hardware. " +
      "Prestigious resort pool terrace with couture-level outdoor finishing and magazine-cover elegance",
  },
  jardin_scandinave: {
    label: "Nordic garden terrace",
    atmosphere:
      "Nordic outdoor hygge terrace with pale wood slat furniture, light grey weatherproof textiles, natural linen cushion covers, and simple ceramic planters. " +
      "Bright airy garden bathed in soft natural sunlight with clean functional outdoor design and warm inviting ambiance",
  },
  jardin_zen: {
    label: "zen garden patio",
    atmosphere:
      "meditative zen garden retreat with low stone benches, bamboo accent outdoor furniture, river-rock harmony, and sand-toned weatherproof cushions. " +
      "Uncluttered spa-like outdoor tranquility with water-feature-adjacent serenity and harmonious natural balance",
  },
  campagne_verger: {
    label: "modern farmhouse garden",
    atmosphere:
      "refined countryside garden with solid oak outdoor dining sets, cream and sage weatherproof cushions, and rustic wrought-iron accents. " +
      "Warm pastoral courtyard charm with honest materials and welcoming country outdoor living",
  },
  cottage_anglais: {
    label: "English cottage garden",
    atmosphere:
      "storybook English garden patio with floral-print weatherproof cushions, wrought-iron bistro sets, and romantic garden seating among roses. " +
      "Cozy fairytale countryside outdoor charm with buttercream and rose tones",
  },
  rooftop_urbain: {
    label: "urban rooftop terrace",
    atmosphere:
      "cosmopolitan rooftop terrace with modular outdoor sectionals, polished concrete-appropriate furniture, and gallery-style planter accents. " +
      "Airy urban outdoor volume with sophisticated city-dweller skyline terrace ambiance",
  },
  boheme_patio: {
    label: "eclectic bohemian patio",
    atmosphere:
      "eclectic bohemian garden lounge with rattan outdoor chairs, macramé hanging planters, terracotta pots, and layered patterned weatherproof cushions in jewel tones and ochre. " +
      "Free-spirited courtyard styling with warm creative energy and globally inspired artisanal outdoor character",
  },
  desert_spa: {
    label: "desert spa patio",
    atmosphere:
      "Southwestern desert patio with clean-lined adobe-toned outdoor furniture, terracotta planters with cacti and succulents, and sand-colored weatherproof cushions. " +
      "Warm arid landscape harmony with sun-baked natural materials and open-sky desert outdoor calm",
  },
  industriel_cour: {
    label: "urban industrial courtyard",
    atmosphere:
      "urban industrial courtyard with black metal outdoor bistro sets, reclaimed wood tabletops, distressed leather outdoor cushions, and corten steel planters. " +
      "Bold metropolitan outdoor loft ambiance with raw concrete and factory-inspired patio character",
  },
};

const OUTDOOR_ROOM_TYPES = new Set([
  "terrasse",
  "balcon",
  "veranda",
  "loggia",
  "serre",
  "pool_house",
  "exterieur",
]);

function resolvedStylePrompts() {
  return getStylePrompts() ?? STYLE_PROMPTS;
}

function resolvedOutdoorOnlyStylePrompts() {
  return getOutdoorOnlyStylePrompts() ?? OUTDOOR_ONLY_STYLE_PROMPTS;
}

function resolvedRoomPrompts() {
  return getRoomPrompts() ?? ROOM_PROMPTS;
}

function resolvedOutdoorRoomTypes() {
  return getOutdoorRoomTypes() ?? OUTDOOR_ROOM_TYPES;
}

function getStyleConfig(style, roomType) {
  const outdoorTypes = resolvedOutdoorRoomTypes();
  if (outdoorTypes.has(roomType)) {
    const prompts = resolvedOutdoorOnlyStylePrompts();
    const config = prompts[style];
    if (!config) throw new Error(`Unknown outdoor style: ${style}`);
    return config;
  }
  const prompts = resolvedStylePrompts();
  const config = prompts[style];
  if (!config) throw new Error(`Unknown interior style: ${style}`);
  return config;
}

// ÉPURÉ : Uniquement les meubles principaux, pas de petits bibelots ou d'accumulation
const ROOM_PROMPTS = {
  salon: {
    label: "living room",
    furniture:
      "one sofa, one armchair, one central coffee table, a sleek TV unit, and a flat-screen television",
  },
  chambre: {
    label: "bedroom",
    furniture:
      "one double bed with simple bedding and two minimalist nightstands",
  },
  cuisine: {
    label: "kitchen",
    furniture:
      "a clean dining nook or island with exactly two or three simple bar stools",
  },
  salle_a_manger: {
    label: "dining room",
    furniture: "one dining table and four matching dining chairs",
  },
  bureau: {
    label: "home office",
    furniture:
      "one minimalist desk, one single office chair, and one simple floor lamp",
  },
  salle_de_bain: {
    label: "bathroom",
    furniture:
      "folded towels on existing counters and a small green potted plant",
  },
  entree: {
    label: "entryway foyer",
    furniture:
      "one slim console table, one simple mirror above it, and one small upholstered bench",
  },
  couloir: {
    label: "hallway corridor",
    furniture: "one narrow console table and one framed wall mirror only",
  },
  chambre_enfant: {
    label: "children's bedroom",
    furniture:
      "one single bed with playful bedding, one small desk, and one compact bookshelf",
  },
  chambre_bebe: {
    label: "nursery",
    furniture: "one crib, one changing dresser, and one soft rocking chair",
  },
  dressing: {
    label: "walk-in dressing room",
    furniture: "one central ottoman bench and one full-length standing mirror",
  },
  suite_parentale: {
    label: "master bedroom suite",
    furniture:
      "one king bed with premium bedding, two matching nightstands, and one upholstered bench at the foot of the bed",
  },
  bibliotheque: {
    label: "home library",
    furniture:
      "one leather reading armchair, one small side table, and one simple floor lamp",
  },
  buanderie: {
    label: "laundry room",
    furniture:
      "folded laundry baskets on existing surfaces and one small green potted plant",
  },
  garage: {
    label: "residential garage",
    furniture:
      "one simple workbench with two stools and one wall-mounted bicycle rack",
  },
  terrasse: {
    label: "outdoor terrace patio",
    furniture:
      "one weather-resistant outdoor dining table with four matching chairs on the terrace hardscape, and one compact two-seat outdoor sofa with one low side table",
    outdoorScene:
      "intimate paved or decked terrace adjoining the property, with furniture grouped naturally for alfresco dining and lounging",
  },
  balcon: {
    label: "balcony",
    furniture:
      "one slim foldable bistro table and two stackable compact outdoor chairs, scaled to fit the narrow balcony footprint",
    outdoorScene:
      "elevated urban or suburban balcony with furniture kept tight to the railing side, leaving clear walkway space",
  },
  veranda: {
    label: "covered sunroom veranda",
    furniture:
      "one wicker or rattan lounge chair, one slim side table, and one medium potted floor plant placed on the veranda floor",
    outdoorScene:
      "sheltered transitional indoor-outdoor veranda with relaxed seating oriented toward the view",
  },
  salle_sport: {
    label: "home gym",
    furniture: "one yoga mat, one exercise bench, and one wall mirror panel",
  },
  cinema: {
    label: "home theater",
    furniture:
      "one large sectional sofa, one media console, and one flat-screen television",
  },
  salle_jeux: {
    label: "game room",
    furniture:
      "one pool table or one foosball table, and two bar stools at a simple counter",
  },
  studio: {
    label: "studio apartment",
    furniture:
      "one sofa bed, one dining table with two chairs, and one compact desk",
  },
  cuisine_ouverte: {
    label: "open-plan kitchen living area",
    furniture:
      "one kitchen island with three bar stools, one sofa, and one coffee table",
  },
  chambre_invites: {
    label: "guest bedroom",
    furniture:
      "one queen bed with fresh neutral bedding and two simple nightstands",
  },
  salon_tv: {
    label: "TV lounge den",
    furniture:
      "one comfortable sectional sofa, one TV unit, and one flat-screen television",
  },
  cave: {
    label: "wine cellar",
    furniture:
      "one tasting table with four stools and one wine rack display unit",
  },
  sous_sol: {
    label: "finished basement",
    furniture: "one sectional sofa, one coffee table, and one media console",
  },
  grenier_amenage: {
    label: "finished attic room",
    furniture:
      "one daybed with cushions, one small desk, and one compact bookshelf",
  },
  spa: {
    label: "home spa wellness room",
    furniture:
      "one lounge chaise, one small side table with rolled towels, and one potted plant",
  },
  palier: {
    label: "staircase landing",
    furniture: "one narrow console table and one simple wall mirror",
  },
  salle_detente: {
    label: "relaxation lounge",
    furniture:
      "two lounge armchairs, one small round coffee table, and one floor plant",
  },
  atelier: {
    label: "creative workshop studio",
    furniture: "one large work table, two stools, and one simple shelving unit",
  },
  serre: {
    label: "greenhouse sunroom",
    furniture:
      "one wrought-iron bistro table with two chairs on the existing floor, and two medium potted plants on available bench or floor surfaces only",
    outdoorScene:
      "glass-enclosed greenhouse or winter garden where furniture stays minimal to showcase plants and natural light",
  },
  pool_house: {
    label: "poolside pool house area",
    furniture:
      "one outdoor two-seat sofa, one low weatherproof coffee table, and two adjustable sun loungers placed on poolside decking or paving only",
    outdoorScene:
      "resort-style poolside relaxation zone with loungers parallel to the pool edge and seating oriented toward the water",
  },
  exterieur: {
    label: "private garden and outdoor living area",
    furniture:
      "one L-shaped weather-resistant outdoor lounge sectional on the main terrace or deck hardscape, one low fire pit table or outdoor coffee table as central focal point, one rectangular outdoor dining table with four matching dining chairs on paved or decked dining zone only, and two large floor planters with lush greenery flanking the seating area",
    outdoorScene:
      "spacious residential garden staging with distinct lounge and dining zones on existing hardscape, open lawn and planting beds left untouched, furniture creating an aspirational outdoor living room and alfresco dining experience",
  },
  chambre_ado: {
    label: "teen bedroom",
    furniture: "one bed, one study desk with chair, and one simple bookshelf",
  },
  salle_eau: {
    label: "powder room",
    furniture:
      "folded hand towels on the counter and one small decorative plant",
  },
  loggia: {
    label: "covered loggia",
    furniture:
      "one outdoor lounge chair, one slim side table, and one potted olive tree in a terracotta planter on the loggia floor",
    outdoorScene:
      "Mediterranean-style covered loggia with a single refined seating vignette and architectural planter accent",
  },
  mezzanine: {
    label: "mezzanine level",
    furniture: "one armchair, one small reading table, and one floor lamp",
  },
  open_space: {
    label: "open-plan loft space",
    furniture:
      "one sofa, one dining table with four chairs, and one kitchen island with two stools",
  },
};

const OUTDOOR_SURFACE_PRESERVATION =
  "ABSOLUTE GROUND SURFACE PRESERVATION — HIGHEST PRIORITY: Every ground surface must remain 100% identical to the source photo. " +
  "Preserve exactly the same lawn grass texture and color, paving stones, deck boards, gravel, soil, mulch, pool coping, tile patterns, grout lines, joints, stains, wear marks, and natural imperfections. " +
  "Do NOT repaint, resurface, reseed, replace, recolor, blur, smooth, or regenerate any ground surface. " +
  "Do NOT add new pathways, patios, decks, gravel beds, mulch zones, or hardscape areas that do not exist in the source. " +
  "All furniture legs and planter bases must sit ON the existing surfaces with realistic contact shadows only — never alter the ground pixels underneath or around them.";

const OUTDOOR_SCENE_PRESERVATION =
  "ABSOLUTE OUTDOOR SCENE PRESERVATION: The entire outdoor environment must remain pixel-perfect to the source photo. " +
  "Preserve exactly: building facades, walls, fences, gates, railings, pergolas, awnings, roofs, chimneys, windows, doors, retaining walls, steps, pool water and edges, fountains, fixed landscaping, trees, shrubs, hedges, flower beds, lawn boundaries, horizon line, sky, clouds, and background buildings. " +
  "Do NOT add, remove, trim, relocate, or modify any vegetation, architecture, or fixed landscape elements. " +
  "Do NOT change the season, weather, sky color, or time of day.";

const FLOOR_PRESERVATION =
  "ABSOLUTE FLOOR PRESERVATION — HIGHEST PRIORITY: The entire floor surface must remain 100% identical to the source photo. " +
  "Keep the exact same flooring material, color, tone, texture, grain direction, tile or parquet pattern, grout lines, joints, stains, wear marks, and specular reflections. " +
  "Do NOT repaint, refinish, polish, replace, recolor, blur, smooth, or regenerate the floor in any way. " +
  "Do NOT add area rugs, carpets, runners, or any floor covering unless explicitly listed in the furniture list. " +
  "Furniture legs must sit ON the existing floor with realistic contact shadows only — never alter the floor pixels underneath or around them.";

const ARCHITECTURAL_PRESERVATION =
  "ABSOLUTE ARCHITECTURAL PRESERVATION: The underlying room structure, wall geometry, corners, windows, doors, ceiling, and exterior view must remain 100% identical and pixel-perfect to the source photo.";

/** Prompt court et précis pour fal-ai/flux-2/edit (édition contextuelle en une passe). */
export function buildDeclutterPrompt(roomType) {
  const rooms = resolvedRoomPrompts();
  if (!rooms[roomType]) {
    throw new Error(`Unknown room type: ${roomType}`);
  }

  if (resolvedOutdoorRoomTypes().has(roomType)) {
    return (
      "Remove all outdoor furniture, patio sets, sun loungers, umbrellas, movable planters, fire pits, BBQ grills, garden decorations, and any movable objects from this outdoor space. " +
      "Leave all hardscape and landscaped areas completely empty of movable items. " +
      "Do NOT remove, trim, alter, or relocate any trees, shrubs, hedges, lawn, fixed planters, fencing, walls, pool, water features, or building structure. " +
      "Keep all paving, decking, grass, soil, sky, and architecture exactly unchanged."
    );
  }

  return (
    "Remove all furniture, rugs, carpets, lamps, plants, wall art and decorations from this room. " +
    "Leave the room completely empty with bare visible floor. " +
    "Do not add or replace any furniture. " +
    "Keep walls, windows, doors, ceiling and flooring exactly unchanged."
  );
}

/** Remplacement strict du mobilier existant — même agencement, nouveau style, zéro décoration ajoutée. */
export function buildReplacePrompt(style, roomType) {
  const roomConfig = resolvedRoomPrompts()[roomType];

  if (!roomConfig) {
    throw new Error(`Unknown room type: ${roomType}`);
  }

  let styleConfig;
  try {
    styleConfig = getStyleConfig(style, roomType);
  } catch {
    throw new Error(`Unknown style: ${style}`);
  }

  if (resolvedOutdoorRoomTypes().has(roomType)) {
    const sceneClause = roomConfig.outdoorScene
      ? `${roomConfig.outdoorScene}. `
      : "";

    return (
      `Strict outdoor furniture replacement task on this ${roomConfig.label}. ` +
      `Replace ONLY the existing visible outdoor furniture with ${styleConfig.label} equivalents using ${styleConfig.atmosphere} ` +
      "but change ONLY furniture frames, cushion fabrics, wood finishes, and metal hardware — no new objects. " +
      sceneClause +
      "CRITICAL LAYOUT LOCK: Every replaced item must keep the exact same position, footprint, scale, orientation, and count as in the source photo. " +
      "Do NOT add, remove, or relocate any furniture. " +
      "Do NOT add umbrellas, string lights, lanterns, extra planters, cushions beyond existing count, or any decorative objects. " +
      "NO ADDED OUTDOOR LIGHTING: Do NOT add landscape lighting, path lights, string lights, lanterns, or any new light sources. " +
      "Preserve the original natural sunlight, shadow direction, and sky conditions exactly as in the source photo. " +
      `${OUTDOOR_SURFACE_PRESERVATION} ` +
      `${OUTDOOR_SCENE_PRESERVATION} ` +
      "Photorealistic real estate exterior photograph, no stylistic embellishments beyond the outdoor furniture material and color swap."
    );
  }

  return (
    `Strict furniture replacement task on this furnished ${roomConfig.label}. ` +
    `Replace ONLY the existing visible furniture with ${styleConfig.label} equivalents using ${styleConfig.atmosphere} ` +
    "but change ONLY furniture surfaces, upholstery, wood finishes, and metal hardware — no new objects. " +
    "CRITICAL LAYOUT LOCK: Every replaced item must keep the exact same position, footprint, scale, orientation, and count as in the source photo. " +
    "Do NOT add, remove, or relocate any furniture. " +
    "Do NOT add rugs, carpets, plants, lamps, wall art, cushions, throws, vases, books, tableware, or any decorative objects. " +
    "NO ADDED LIGHTING FIXTURES: Do NOT add, install, or modify any lighting. Keep the original ceiling and wall surfaces exactly as in the source photo. " +
    `${FLOOR_PRESERVATION} ` +
    `${ARCHITECTURAL_PRESERVATION} ` +
    "Photorealistic real estate photograph, no stylistic embellishments beyond the furniture material and color swap."
  );
}

export function buildPrompt(style, roomType, roomSqm = null) {
  const roomConfig = resolvedRoomPrompts()[roomType];

  if (!roomConfig) {
    throw new Error(`Unknown room type: ${roomType}`);
  }

  if (resolvedOutdoorRoomTypes().has(roomType)) {
    return buildOutdoorPrompt(style, roomType, roomSqm);
  }

  const styleConfig = resolvedStylePrompts()[style];
  if (!styleConfig) {
    throw new Error(`Unknown style: ${style}`);
  }

  const scaleClause = buildRoomScaleClause(roomSqm);

  return (
    `A photorealistic, highly detailed professional real estate photograph of a ${roomConfig.label} in ${styleConfig.label} style. ` +
    `Virtual staging task (furnish mode only): seamlessly add ONLY the following items: ${roomConfig.furniture}. ` +
    `${styleConfig.atmosphere}. ` +
    scaleClause +
    "CRITICAL COMPOSITION RULE — MINIMALIST AND UNCLUTTERED: Maintain an airy, spacious layout. Do NOT add extra clutter, multiple rugs, side tables, or random decorations. Less is more. " +
    "NO ADDED LIGHTING FIXTURES: Do NOT add, install, or modify any lighting. Strictly forbidden: LED strips, recessed ceiling LEDs, cove lighting, wall-mounted LED accents, spotlights, or any new light sources on ceilings or walls. Keep the original ceiling and wall surfaces exactly as in the source photo. " +
    `${FLOOR_PRESERVATION} ` +
    `${ARCHITECTURAL_PRESERVATION} ` +
    "Only place the specified movable furniture onto the empty floor space without modifying the floor surface. " +
    "8k resolution, architecture magazine quality."
  );
}

function buildOutdoorPrompt(style, roomType, roomSqm = null) {
  const styleConfig = getStyleConfig(style, roomType);
  const roomConfig = resolvedRoomPrompts()[roomType];
  const scaleClause = buildOutdoorScaleClause(roomSqm, roomType);
  const sceneClause = roomConfig.outdoorScene
    ? `${roomConfig.outdoorScene}. `
    : "";

  return (
    `A photorealistic, highly detailed professional real estate exterior photograph of a ${roomConfig.label} in ${styleConfig.label} style. ` +
    `Virtual outdoor staging task (furnish mode only): seamlessly add ONLY the following items: ${roomConfig.furniture}. ` +
    `${styleConfig.atmosphere}. ` +
    sceneClause +
    scaleClause +
    "CRITICAL OUTDOOR PLACEMENT RULE: Place all furniture exclusively on existing visible hardscape surfaces (patio, terrace, deck, paved area). " +
    "Never place furniture on lawn, flower beds, planting soil, gravel paths, pool water, or garden beds unless those surfaces already support furniture in the source photo. " +
    "Maintain generous spacing between pieces with clear sightlines to landscaping and architecture. Do NOT overcrowd the space. " +
    "NO ADDED OUTDOOR LIGHTING: Do NOT add string lights, lanterns, path lights, landscape spotlights, bollard lights, or any artificial light sources. " +
    "Preserve the original natural sunlight direction, shadow angles, sky, clouds, and time-of-day lighting exactly as in the source photo. " +
    `${OUTDOOR_SURFACE_PRESERVATION} ` +
    `${OUTDOOR_SCENE_PRESERVATION} ` +
    "Only place the specified movable outdoor furniture and planters onto existing appropriate surfaces without modifying any ground, vegetation, or architecture. " +
    "8k resolution, luxury real estate exterior magazine quality, natural daylight matching the source photo."
  );
}

export function isValidStyle(style) {
  const interior = resolvedStylePrompts();
  const outdoor = resolvedOutdoorOnlyStylePrompts();
  return style in interior || style in outdoor;
}

export function isValidStyleForRoom(style, roomType) {
  if (!isValidStyle(style)) return false;
  if (resolvedOutdoorRoomTypes().has(roomType)) {
    return style in resolvedOutdoorOnlyStylePrompts();
  }
  return style in resolvedStylePrompts();
}

export function isOutdoorRoomType(roomType) {
  return resolvedOutdoorRoomTypes().has(roomType);
}

export function isValidRoomType(roomType) {
  return roomType in resolvedRoomPrompts();
}

export function isValidRoomSqm(value) {
  if (value == null || value === "") return true;
  const n = Number(value);
  return Number.isFinite(n) && n >= 5 && n <= 200;
}

/** Instructions de mise à l'échelle du mobilier selon la surface (m²). */
export function buildRoomScaleClause(roomSqm) {
  if (roomSqm == null || roomSqm === "") return "";
  const n = Math.round(Number(roomSqm));
  if (!Number.isFinite(n) || n < 5) return "";

  if (n < 12) {
    return (
      `ROOM DIMENSIONS: Approximately ${n} square meters — a very small space. ` +
      `All furniture MUST be compact with slim profiles, scaled down roughly 30% versus standard sizes. ` +
      `Use the minimum number of pieces from the list. Leave clear walkways and visible floor. ` +
      `Never place oversized furniture that would dominate the room. `
    );
  }
  if (n < 18) {
    return (
      `ROOM DIMENSIONS: Approximately ${n} square meters — a small room. ` +
      `Use compact, space-saving furniture proportioned to this floor area. ` +
      `Avoid bulky or oversized pieces. Maintain realistic clearances between furniture and walls. `
    );
  }
  if (n <= 28) {
    return (
      `ROOM DIMENSIONS: Approximately ${n} square meters — a medium-sized room. ` +
      `Use standard residential furniture proportions appropriate for this surface area. ` +
      `Balance furniture size with visible floor space. `
    );
  }
  if (n <= 45) {
    return (
      `ROOM DIMENSIONS: Approximately ${n} square meters — a spacious room. ` +
      `Furniture can be full-size with comfortable spacing between pieces. ` +
      `Scale pieces to fill the volume naturally without crowding. `
    );
  }
  return (
    `ROOM DIMENSIONS: Approximately ${n} square meters — a large open room. ` +
    `Use appropriately larger furniture with generous spacing. ` +
    `Distribute pieces across the floor plan so the room feels furnished but not empty. `
  );
}

/** Instructions de mise à l'échelle du mobilier extérieur selon la surface (m²). */
export function buildOutdoorScaleClause(roomSqm, roomType = "exterieur") {
  if (roomSqm == null || roomSqm === "") return "";
  const n = Math.round(Number(roomSqm));
  if (!Number.isFinite(n) || n < 5) return "";

  const isCompact =
    roomType === "balcon" || roomType === "loggia" || roomType === "veranda";

  if (isCompact || n < 12) {
    return (
      `OUTDOOR AREA: Approximately ${n} square meters — a compact outdoor space. ` +
      `All furniture MUST be slim and space-saving with foldable or stackable profiles where possible. ` +
      `Use the minimum number of pieces from the list. Leave clear walkways and visible ground surfaces. ` +
      `Never place oversized furniture that would dominate the terrace or balcony. `
    );
  }
  if (n < 25) {
    return (
      `OUTDOOR AREA: Approximately ${n} square meters — a modest garden or terrace. ` +
      `Use compact outdoor furniture proportioned to the available hardscape area. ` +
      `Group lounge and dining zones efficiently without encroaching on lawn or planting beds. `
    );
  }
  if (n <= 50) {
    return (
      `OUTDOOR AREA: Approximately ${n} square meters — a medium-sized garden or patio. ` +
      `Use standard full-size outdoor furniture with comfortable spacing between lounge and dining zones. ` +
      `Distribute pieces naturally across the visible hardscape without crowding landscaping. `
    );
  }
  if (n <= 100) {
    return (
      `OUTDOOR AREA: Approximately ${n} square meters — a spacious garden. ` +
      `Furniture can be full-size with generous spacing between distinct outdoor living zones. ` +
      `Create an aspirational but realistic layout that fills the main terrace area without sprawling across the entire lawn. `
    );
  }
  return (
    `OUTDOOR AREA: Approximately ${n} square meters — a large estate garden. ` +
    `Use premium full-size outdoor furniture with luxurious spacing on the primary terrace or deck zone. ` +
    `Keep furniture concentrated on the main hardscape entertaining area, leaving open lawn and garden beds untouched. `
  );
}

export {
  STYLE_PROMPTS,
  STYLE_DEFINITIONS,
  OUTDOOR_ONLY_STYLE_PROMPTS,
  ROOM_PROMPTS,
  OUTDOOR_ROOM_TYPES,
};
