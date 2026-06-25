const STYLE_PROMPTS = {
  moderne: {
    label: "luxury ultra-modern",
    atmosphere:
      "sleek high-end minimalist design, sophisticated neutral color palette of charcoal, matte black, cream, and soft taupe. " +
      "Clean architectural lines, premium polished concrete, brushed metal accents, tinted glass, and seamless matte surfaces. " +
      "Contemporary elegance, architectural digest interior, curated luxury staging, and flawless sophisticated finish",
  },
  scandinave: {
    label: "Nordic Scandinavian",
    atmosphere:
      "authentic cozy hygge atmosphere, organic aesthetic. Palette of crisp whites, soft muted greys, pale oak, and subtle pastel accents. " +
      "Natural textures, light blonde wood furniture, woven wool areas rugs, soft linen textiles, and ceramic decor. " +
      "Bathed in bright, warm natural sunlight, airy and spacious feel, clean functional design with a warm inviting residential ambiance",
  },
  mid_century: {
    label: "authentic mid-century modern",
    atmosphere:
      "retro-chic charm and curated vintage ambiance. Rich walnut and oiled teak wood finishes, iconic organic shapes, and tapered legs. " +
      "Sophisticated color palette of mustard yellow, burnt orange, and olive green balanced with warm neutrals. " +
      "Premium boucle fabrics, matte leather, brass and matte black hardware, and iconic designer furniture statements",
  },
  industriel: {
    label: "urban industrial loft",
    atmosphere:
      "raw loft aesthetic with exposed brick, black steel frames, distressed leather, and reclaimed wood surfaces. " +
      "Moody palette of charcoal, rust, concrete grey, and warm cognac brown. " +
      "Factory-inspired furniture, matte metal accents, Edison-era character, and bold masculine urban sophistication",
  },
  boheme: {
    label: "eclectic bohemian",
    atmosphere:
      "layered free-spirited bohemian ambiance with rich jewel tones, terracotta, deep emerald, and warm ochre. " +
      "Natural rattan, macramé textures, woven jute rugs, vintage-inspired patterns, and globally inspired artisanal character. " +
      "Relaxed artistic residential mood, collected-over-time feel, and warm inviting creative energy",
  },
  coastal: {
    label: "coastal beach house",
    atmosphere:
      "breezy seaside retreat with sun-bleached whites, sandy beige, soft sky blue, and driftwood tones. " +
      "Light natural fibers, whitewashed wood, linen upholstery, and subtle nautical elegance without cliché decor. " +
      "Airy luminous atmosphere, relaxed luxury, and fresh open coastal living ambiance",
  },
  campagne: {
    label: "modern farmhouse",
    atmosphere:
      "refined countryside warmth with shiplap accents, warm oak, cream, and soft sage green palette. " +
      "Rustic wood furniture with clean contemporary lines, matte black hardware, and understated pastoral charm. " +
      "Cozy welcoming family home feel, honest materials, and timeless rural elegance",
  },
  art_deco: {
    label: "glamorous Art Deco",
    atmosphere:
      "1920s-inspired glamour with geometric symmetry, lacquered surfaces, and bold contrast. " +
      "Palette of deep navy, emerald, champagne gold, black marble, and ivory. " +
      "Velvet upholstery, brass inlays, sunburst motifs, and sophisticated Gatsby-era luxury staging",
  },
  japandi: {
    label: "Japandi fusion",
    atmosphere:
      "harmonious blend of Japanese minimalism and Scandinavian warmth. Muted earth tones, warm greige, clay, and natural wood. " +
      "Low-profile furniture, clean negative space, handcrafted ceramics, and calm zen-like balance. " +
      "Serene understated elegance, tactile natural materials, and mindful residential tranquility",
  },
  minimaliste: {
    label: "pure minimalist",
    atmosphere:
      "ultra-edited less-is-more interior with monochromatic whites, soft greys, and a single accent tone. " +
      "Hidden storage, flush surfaces, thin-profile furniture, and immaculate visual calm. " +
      "Gallery-like spatial clarity, architectural purity, and premium restrained sophistication",
  },
  rustique: {
    label: "refined rustic",
    atmosphere:
      "elevated cabin-inspired warmth with heavy timber beams, stone textures, and aged wood furniture. " +
      "Earthy palette of chestnut, moss green, burnt umber, and cream wool textiles. " +
      "Handcrafted character, fireplace-adjacent coziness, and authentic mountain lodge residential charm",
  },
  luxe: {
    label: "high-end luxury",
    atmosphere:
      "opulent five-star hotel residential staging with marble, brushed brass, velvet, and silk accents. " +
      "Rich palette of champagne, taupe, onyx, and soft gold highlights. " +
      "Tailored bespoke furniture, couture-level finishing, and prestigious magazine-cover elegance",
  },
  tropical: {
    label: "tropical modern",
    atmosphere:
      "lush resort-inspired interior with bamboo, rattan, and tropical hardwood accents. " +
      "Vibrant yet refined palette of palm green, coral, sandy neutrals, and ocean blue touches. " +
      "Indoor-outdoor flow feeling, relaxed island luxury, and fresh exotic vacation-home ambiance",
  },
  mediterraneen: {
    label: "Mediterranean",
    atmosphere:
      "sun-drenched Southern European villa aesthetic with terracotta, ochre, cobalt blue, and whitewashed plaster tones. " +
      "Arched forms, wrought iron details, hand-painted ceramics, and rustic olive-wood furniture. " +
      "Warm convivial atmosphere, timeless Old World charm, and breezy coastal Mediterranean living",
  },
  classique: {
    label: "classic traditional",
    atmosphere:
      "timeless formal elegance with symmetrical layout, crown molding presence, and refined upholstery. " +
      "Palette of ivory, navy, burgundy, and antique gold accents. " +
      "Tufted fabrics, dark wood casegoods, crystal-adjacent sparkle, and stately heritage interior character",
  },
  contemporain: {
    label: "soft contemporary",
    atmosphere:
      "current residential design with approachable modern curves, warm neutrals, and subtle contrast. " +
      "Mix of soft textiles, light wood, matte stone, and sculptural accent pieces. " +
      "Livable upscale everyday elegance, balanced proportions, and fresh move-in-ready staging",
  },
  wabi_sabi: {
    label: "wabi-sabi",
    atmosphere:
      "Japanese-inspired beauty in imperfection with raw linen, handmade pottery, and weathered natural wood. " +
      "Muted palette of stone grey, clay, parchment, and soft moss. " +
      "Quiet contemplative mood, organic asymmetry, and soulful understated artisanal interior",
  },
  hollywood: {
    label: "Hollywood Regency",
    atmosphere:
      "dramatic Old Hollywood glamour with lacquer, mirror accents, and bold jewel tones. " +
      "Palette of emerald, fuchsia, black, white, and metallic gold. " +
      "High-contrast patterns, plush velvet, chinoiserie hints, and theatrical sophisticated luxury",
  },
  provencal: {
    label: "French Provençal",
    atmosphere:
      "charming South of France countryside interior with lavender, sunflower yellow, and soft blue accents. " +
      "Distressed painted wood, toile and floral textiles, wrought iron details, and rustic stone textures. " +
      "Romantic pastoral warmth, casual refined French country living, and sun-washed provincial elegance",
  },
  eclectique: {
    label: "curated eclectic",
    atmosphere:
      "intentionally mixed design eras with confident color blocking and gallery-worthy statement pieces. " +
      "Balanced blend of vintage finds, modern silhouettes, and global art influences. " +
      "Personality-driven sophisticated interior, visually rich yet composed, and designer-collected residential feel",
  },
  transitionnel: {
    label: "transitional",
    atmosphere:
      "seamless bridge between classic and contemporary with neutral foundation and timeless silhouettes. " +
      "Soft greige, cream, navy accents, and warm wood tones in balanced proportion. " +
      "Comfortable upscale family home aesthetic, broadly appealing staging, and enduring market-friendly elegance",
  },
  zen: {
    label: "zen sanctuary",
    atmosphere:
      "meditative calm with low furniture, natural stone, bamboo, and water-inspired serenity. " +
      "Palette of soft sand, river grey, pale green, and untreated wood. " +
      "Uncluttered spa-like tranquility, harmonious balance, and restorative peaceful residential retreat",
  },
  loft: {
    label: "open-plan urban loft",
    atmosphere:
      "spacious downtown loft with high ceilings feeling, open sightlines, and gallery-white walls. " +
      "Statement modular seating, polished concrete or wide-plank floors, and curated modern art presence. " +
      "Cosmopolitan creative lifestyle interior, airy volume, and sophisticated city-dweller ambiance",
  },
  vintage: {
    label: "vintage revival",
    atmosphere:
      "nostalgic charm with carefully restored period furniture and patina-rich materials. " +
      "Muted retro palette of dusty rose, sage, mustard, and aged cream. " +
      "Romantic timeworn character, flea-market curator aesthetic, and warm sentimental residential storytelling",
  },
  maximaliste: {
    label: "bold maximalist",
    atmosphere:
      "confident richly layered interior with saturated color, bold patterns, and dramatic visual density. " +
      "Jewel tones, graphic wallpaper presence, mixed metals, and oversized art energy. " +
      "Fearless personality-driven design, editorial drama, and luxurious more-is-more staging impact",
  },
  cottagecore: {
    label: "cottagecore",
    atmosphere:
      "storybook English cottage warmth with floral prints, soft pastels, and handmade charm. " +
      "Palette of buttercream, rose, sage, and warm honey wood. " +
      "Cozy hearth-side feeling, quaint romantic domesticity, and gentle countryside fairytale ambiance",
  },
  art_nouveau: {
    label: "Art Nouveau inspired",
    atmosphere:
      "organic flowing lines inspired by nature with whiplash curves and botanical motifs. " +
      "Palette of moss green, peacock blue, amber, and cream with stained wood accents. " +
      "Elegant Belle Époque character, artisan-crafted details, and poetic decorative sophistication",
  },
  bauhaus: {
    label: "Bauhaus modernist",
    atmosphere:
      "functional modernist design with primary color accents on disciplined geometric forms. " +
      "Palette of white, black, red, yellow, and blue against tubular steel and flat-plane wood. " +
      "Rationalist clarity, design-school pedigree, and iconic twentieth-century architectural interior",
  },
  colonial: {
    label: "colonial revival",
    atmosphere:
      "stately American colonial elegance with mahogany furniture, paneling presence, and formal symmetry. " +
      "Palette of deep green, burgundy, brass, and cream with oriental rug character. " +
      "Heritage prestige, gracious traditional living, and established upscale residential gravitas",
  },
  desert_modern: {
    label: "desert modern",
    atmosphere:
      "Southwestern desert contemporary with adobe tones, terracotta, sand, and cactus green accents. " +
      "Clean desert architecture lines, woven textiles, tooled leather, and sun-baked natural materials. " +
      "Warm arid landscape inspiration, relaxed southwestern luxury, and open sky residential calm",
  },
};

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
      "one outdoor dining table, four outdoor chairs, and one compact outdoor sofa",
  },
  balcon: {
    label: "balcony",
    furniture: "one small bistro table and two compact outdoor chairs",
  },
  veranda: {
    label: "sunroom veranda",
    furniture:
      "one wicker lounge chair, one side table, and one potted floor plant",
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
      "one wrought-iron bistro set with two chairs and several potted plants on existing surfaces",
  },
  pool_house: {
    label: "pool house",
    furniture: "one outdoor sofa, one coffee table, and two sun loungers",
  },
  exterieur: {
    label: "outdoor living space",
    furniture:
      "one outdoor sectional, one fire pit table, and four outdoor dining chairs with one dining table",
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
      "one outdoor lounge chair, one side table, and one potted olive tree",
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
  if (!ROOM_PROMPTS[roomType]) {
    throw new Error(`Unknown room type: ${roomType}`);
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
  const styleConfig = STYLE_PROMPTS[style];
  const roomConfig = ROOM_PROMPTS[roomType];

  if (!styleConfig) {
    throw new Error(`Unknown style: ${style}`);
  }
  if (!roomConfig) {
    throw new Error(`Unknown room type: ${roomType}`);
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
  const styleConfig = STYLE_PROMPTS[style];
  const roomConfig = ROOM_PROMPTS[roomType];

  if (!styleConfig) {
    throw new Error(`Unknown style: ${style}`);
  }
  if (!roomConfig) {
    throw new Error(`Unknown room type: ${roomType}`);
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

export function isValidStyle(style) {
  return style in STYLE_PROMPTS;
}

export function isValidRoomType(roomType) {
  return roomType in ROOM_PROMPTS;
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

export { STYLE_PROMPTS, ROOM_PROMPTS };
