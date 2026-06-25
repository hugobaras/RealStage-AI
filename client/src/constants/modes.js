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
      accent: "violet",
      bar: "from-violet-500/20 via-violet-500/5 to-transparent",
      border: "border-violet-500/50",
      glow: "shadow-violet-500/25",
      pill: "bg-violet-600",
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
      accent: "emerald",
      bar: "from-emerald-500/20 via-emerald-500/5 to-transparent",
      border: "border-emerald-500/50",
      glow: "shadow-emerald-500/25",
      pill: "bg-emerald-600",
    },
  },
};

export const MODE_IDS = Object.keys(MODES);

/** Modes nécessitant un style et supportant les variantes A/B/C. */
export const STYLE_MODES = ["meubler", "remplacer"];

export function isStyleMode(mode) {
  return STYLE_MODES.includes(mode);
}
