import { getStylesForRoomType, resolveStyleForRoom } from "../constants/styles";
import { isOutdoorRoomType } from "../constants/roomTypes";
import { getModeTheme } from "../utils/modeTheme";
import { isStyleMode } from "../constants/modes";

const INTERIOR_POPULAR_IDS = [
  "moderne",
  "scandinave",
  "mid_century",
  "minimaliste",
  "contemporain",
  "japandi",
];

const OUTDOOR_POPULAR_IDS = [
  "terrasse_moderne",
  "villa_mediterraneen",
  "jardin_scandinave",
  "bord_de_mer",
  "luxe_piscine",
  "patio_contemporain",
];

export default function VariantPicker({
  mode,
  roomType,
  currentStyle,
  selectedStyles,
  onChange,
  disabled,
  embedded = false,
}) {
  const theme = getModeTheme(mode);
  const availableStyles = getStylesForRoomType(roomType);
  const popularIds = isOutdoorRoomType(roomType)
    ? OUTDOOR_POPULAR_IDS
    : INTERIOR_POPULAR_IDS;
  const popularStyles = availableStyles.filter((s) =>
    popularIds.includes(s.id),
  );

  if (!isStyleMode(mode)) return null;

  const toggleStyle = (styleId) => {
    if (disabled) return;
    if (selectedStyles.includes(styleId)) {
      if (selectedStyles.length <= 2) return;
      onChange(selectedStyles.filter((id) => id !== styleId));
      return;
    }
    if (selectedStyles.length >= 3) return;
    onChange([...selectedStyles, styleId]);
  };

  const content = (
    <>
      {!embedded && (
        <div>
          <p className="text-sm font-medium text-white">Variantes A / B / C</p>
          <p className="mt-0.5 text-[11px] text-muted">
            Choisissez 2 ou 3 styles pour comparer sur la même photo
          </p>
        </div>
      )}
      <div className="flex flex-wrap gap-1.5">
        {popularStyles.map((s) => {
          const selected = selectedStyles.includes(s.id);
          const atMax = selectedStyles.length >= 3 && !selected;
          return (
            <button
              key={s.id}
              type="button"
              disabled={disabled || atMax}
              onClick={() => toggleStyle(s.id)}
              className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
                selected
                  ? `${theme.border} ${theme.bgSubtle} ${theme.text}`
                  : "border-zinc-700/80 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
              }`}
            >
              {s.label}
              {s.id === currentStyle && (
                <span className="ml-1 text-[9px] opacity-70">(actuel)</span>
              )}
            </button>
          );
        })}
      </div>
      <p className="text-[10px] text-zinc-500">
        {selectedStyles.length}/3 sélectionné(s) — minimum 2
      </p>
    </>
  );

  if (embedded) return <div className="space-y-2.5">{content}</div>;

  return <div className="surface-card space-y-2.5 p-3.5">{content}</div>;
}

export function getDefaultVariantStyles(currentStyle, roomType = "salon") {
  const pool = getStylesForRoomType(roomType);
  const resolved = resolveStyleForRoom(currentStyle, roomType);
  const defaults = [resolved];
  for (const style of pool) {
    if (defaults.length >= 3) break;
    if (!defaults.includes(style.id)) defaults.push(style.id);
  }
  return defaults.slice(0, 3);
}
