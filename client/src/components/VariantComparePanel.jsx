import { useState } from "react";
import { Columns2, SlidersHorizontal, ToggleLeft } from "lucide-react";
import { getStyleById } from "../constants/styles";
import { getModeTheme } from "../utils/modeTheme";
import ImageCompareSlider from "./ImageCompareSlider";
import VariantSwitcher from "./VariantSwitcher";

const VIEWS = [
  { id: "slider", label: "Slider", icon: SlidersHorizontal },
  { id: "grid", label: "Grille", icon: Columns2 },
  { id: "switch", label: "Basculer", icon: ToggleLeft },
];

function getStyleLabel(styleId) {
  return getStyleById(styleId)?.label ?? styleId;
}

function VariantGrid({ beforeImage, variants, mode }) {
  const cols = variants.length + 1;
  return (
    <div
      className="absolute inset-0 flex items-center justify-center overflow-auto p-4"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gap: "0.5rem",
        alignContent: "center",
      }}
    >
      <div className="flex flex-col items-center gap-1">
        <img
          src={beforeImage}
          alt="Avant"
          className="max-h-[50vh] w-full rounded-lg object-cover"
        />
        <span className="text-[10px] font-semibold uppercase text-zinc-400">
          Avant
        </span>
      </div>
      {variants.map((variant, index) => (
        <div
          key={variant.id ?? index}
          className="flex flex-col items-center gap-1"
        >
          <img
            src={variant.imageUrl}
            alt={getStyleLabel(variant.style)}
            className="max-h-[50vh] w-full rounded-lg object-cover"
          />
          <span className="text-[10px] font-semibold uppercase text-zinc-400">
            {String.fromCharCode(65 + index)} — {getStyleLabel(variant.style)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function VariantComparePanel({
  mode,
  beforeImage,
  afterImage,
  activeVariants,
  selectedVariantIndex,
  onVariantSelect,
}) {
  const theme = getModeTheme(mode);
  const [view, setView] = useState("slider");
  const hasVariants = activeVariants?.length >= 2;

  if (!hasVariants) {
    return (
      <ImageCompareSlider
        beforeSrc={beforeImage}
        afterSrc={afterImage}
        mode={mode}
      />
    );
  }

  return (
    <>
      <div className="absolute left-1/2 top-3 z-20 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-zinc-700/80 bg-panel/95 p-1 shadow-xl backdrop-blur-md">
        {VIEWS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setView(id)}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
              view === id
                ? `${theme.bg} text-white`
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {view === "slider" && (
        <ImageCompareSlider
          beforeSrc={beforeImage}
          afterSrc={afterImage}
          mode={mode}
        />
      )}

      {view === "grid" && (
        <VariantGrid
          beforeImage={beforeImage}
          variants={activeVariants}
          mode={mode}
        />
      )}

      {view === "switch" && (
        <>
          <VariantSwitcher
            mode={mode}
            variants={activeVariants}
            selectedIndex={selectedVariantIndex}
            onSelect={onVariantSelect}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <img
              src={afterImage}
              alt="Variante sélectionnée"
              className="max-h-full max-w-full object-contain"
            />
          </div>
        </>
      )}
    </>
  );
}
