import { Layers } from "lucide-react";
import { getModeTheme } from "../utils/modeTheme";

export default function PhotoQueueStrip({
  mode,
  queue,
  currentImage,
  onSelect,
}) {
  const theme = getModeTheme(mode);

  if (!queue?.length && !currentImage) return null;

  const items = currentImage
    ? [
        { src: currentImage, active: true },
        ...queue.map((src) => ({ src, active: false })),
      ]
    : queue.map((src) => ({ src, active: false }));

  if (items.length <= 1 && !queue?.length) return null;

  return (
    <div className="shrink-0 border-b border-zinc-800/80 bg-zinc-900/80 px-4 py-2.5 backdrop-blur-sm lg:px-5">
      <div className="flex items-center gap-3">
        <div
          className={`flex shrink-0 items-center gap-1.5 text-xs font-medium ${theme.text}`}
        >
          <Layers className="h-3.5 w-3.5" />
          File
        </div>
        <div className="flex flex-1 gap-2 overflow-x-auto pb-0.5 scrollbar-thin">
          {items.map((item, i) => (
            <button
              key={`${item.src.slice(0, 32)}-${i}`}
              type="button"
              onClick={() => onSelect?.(item.src, i)}
              className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                item.active
                  ? `${theme.border} ${theme.shadowLg} ring-2 ${theme.ring}`
                  : "border-zinc-700 opacity-70 hover:border-zinc-500 hover:opacity-100"
              }`}
            >
              <img
                src={item.src}
                alt=""
                className="h-full w-full object-cover"
              />
              {item.active && (
                <span
                  className={`absolute inset-x-0 bottom-0 py-0.5 text-[8px] font-bold text-white ${theme.bg}`}
                >
                  Actuelle
                </span>
              )}
            </button>
          ))}
        </div>
        <span className="shrink-0 text-xs tabular-nums text-muted">
          {items.length} photo{items.length > 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
