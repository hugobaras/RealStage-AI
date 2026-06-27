import { getStyleById } from "../constants/styles";
import { getModeTheme } from "../utils/modeTheme";

function getStyleLabel(styleId) {
  return getStyleById(styleId)?.label ?? styleId;
}

export default function VariantSwitcher({
  mode,
  variants,
  selectedIndex,
  onSelect,
}) {
  const theme = getModeTheme(mode);

  if (!variants?.length || variants.length < 2) return null;

  return (
    <div className="absolute left-1/2 top-3 z-10 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-zinc-700/80 bg-panel/95 p-1 shadow-xl backdrop-blur-md">
      {variants.map((variant, index) => {
        const letter = String.fromCharCode(65 + index);
        const active = index === selectedIndex;
        return (
          <button
            key={variant.id ?? `${variant.style}-${index}`}
            type="button"
            onClick={() => onSelect(index)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              active
                ? `${theme.bg} text-white`
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }`}
            title={getStyleLabel(variant.style)}
          >
            {letter}
            <span className="ml-1 hidden font-normal opacity-80 sm:inline">
              {getStyleLabel(variant.style)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
