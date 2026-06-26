export const MODES = {
  meubler: {
    id: "meubler",
    label: "Meubler",
    navLabel: "Meubler",
    title: "Aménagement",
    subtitle:
      "Meublez une pièce vide selon le style et le type de pièce choisis.",
    generateLabel: "Générer",
    loadingLabel: "Aménagement IA en cours…",
    theme: {
      accent: "accent",
      bar: "from-accent/20 via-accent/5 to-transparent",
      border: "border-accent/50",
      glow: "shadow-accent/25",
      pill: "bg-accent",
    },
  },
  remplacer: {
    id: "remplacer",
    label: "Remplacer",
    navLabel: "Remplacer",
    title: "Remplacement",
    subtitle:
      "Remplacez le mobilier existant au même emplacement, sans ajout de décoration.",
    generateLabel: "Remplacer",
    loadingLabel: "Remplacement IA en cours…",
    theme: {
      accent: "estate-blue",
      bar: "from-estate-blue/20 via-estate-blue/5 to-transparent",
      border: "border-estate-blue/50",
      glow: "shadow-estate-blue/25",
      pill: "bg-estate-blue",
    },
  },
  desencombrer: {
    id: "desencombrer",
    label: "Vider",
    navLabel: "Vider",
    title: "Vider",
    subtitle:
      "Retirez le mobilier tout en préservant murs, fenêtres et portes.",
    generateLabel: "Vider",
    loadingLabel: "Vider IA en cours…",
    theme: {
      accent: "estate-stone",
      bar: "from-estate-stone/20 via-estate-stone/5 to-transparent",
      border: "border-estate-stone/50",
      glow: "shadow-estate-stone/25",
      pill: "bg-estate-stone",
    },
  },
};

export const MODE_IDS = Object.keys(MODES);

/** Modes nécessitant un style et supportant les variantes A/B/C. */
export const STYLE_MODES = ["meubler", "remplacer"];

export function isStyleMode(mode) {
  return STYLE_MODES.includes(mode);
}
