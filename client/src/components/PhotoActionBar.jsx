import {
  ArrowRight,
  Download,
  ImagePlus,
  Layers,
  Package,
  RefreshCw,
} from "lucide-react";
import { MODES } from "../constants/modes";
import { getModeTheme } from "../utils/modeTheme";

export default function PhotoActionBar({
  mode,
  hasResult,
  queueCount,
  loading,
  onUseAsBase,
  onNextPhoto,
  onDownload,
  onExportPack,
  onChainDeclutterToFurnish,
}) {
  const theme = getModeTheme(mode);

  if (!hasResult || loading) return null;

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2 rounded-2xl border border-zinc-700/60 bg-panel/90 p-2 shadow-lg shadow-black/20 backdrop-blur-xl">
      <button
        type="button"
        onClick={onUseAsBase}
        className={`flex items-center gap-1.5 px-3.5 py-2 text-xs ${theme.btnPrimary}`}
        title="Itérer sur ce résultat"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Itérer
      </button>

      <button
        type="button"
        onClick={onNextPhoto}
        className="btn-secondary flex items-center gap-1.5 px-3.5 py-2 text-xs"
        title="Passer à la photo suivante"
      >
        <ImagePlus className="h-3.5 w-3.5" />
        Photo suivante
        {queueCount > 0 && (
          <span
            className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white ${theme.bg}`}
          >
            {queueCount}
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={onDownload}
        className="btn-secondary flex items-center gap-1.5 px-3.5 py-2 text-xs"
      >
        <Download className="h-3.5 w-3.5" />
        Télécharger
      </button>

      {onExportPack && (
        <button
          type="button"
          onClick={onExportPack}
          className="btn-secondary flex items-center gap-1.5 px-3.5 py-2 text-xs"
          title="Pack annonce ZIP"
        >
          <Package className="h-3.5 w-3.5" />
          Pack annonce
        </button>
      )}

      {mode === "desencombrer" && (
        <button
          type="button"
          onClick={onChainDeclutterToFurnish}
          className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${theme.chainBtn}`}
          title={`Enchaîner avec ${MODES.meubler.label}`}
        >
          <Layers className="h-3.5 w-3.5" />
          Puis {MODES.meubler.label}
          <ArrowRight className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
