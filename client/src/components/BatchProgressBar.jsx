import { X } from "lucide-react";
import { getModeTheme } from "../utils/modeTheme";

export default function BatchProgressBar({ mode, current, total, onCancel }) {
  const theme = getModeTheme(mode);
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="shrink-0 border-b border-zinc-800/80 bg-zinc-900/90 px-4 py-2 backdrop-blur-sm lg:px-5">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className={`font-medium ${theme.text}`}>
              Génération en lot — {current}/{total}
            </span>
            <span className="tabular-nums text-muted">{percent}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
            <div
              className={`h-full rounded-full transition-all duration-300 ${theme.bg}`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary flex shrink-0 items-center gap-1 px-2.5 py-1.5 text-xs"
          title="Annuler le lot"
        >
          <X className="h-3.5 w-3.5" />
          Annuler
        </button>
      </div>
    </div>
  );
}
