import { useRef } from "react";
import {
  Download,
  Flag,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Star,
} from "lucide-react";
import { MODES } from "../constants/modes";
import { getModeTheme } from "../utils/modeTheme";
import ImageCompareSlider from "./ImageCompareSlider";
import PhotoActionBar from "./PhotoActionBar";
import VariantComparePanel from "./VariantComparePanel";

export default function ImageCanvas({
  mode,
  beforeImage,
  afterImage,
  loading,
  adjusting,
  loadingLabel,
  hasResult,
  queueCount,
  activeVariants,
  selectedVariantIndex,
  onVariantSelect,
  variantCompareEnabled = false,
  onImageLoaded,
  onImagesQueued,
  onUseAsBase,
  onNextPhoto,
  onDownload,
  onExportPack,
  onChainDeclutterToFurnish,
  generationId,
  onReport,
  isFavorite = false,
  onToggleFavorite,
}) {
  const theme = getModeTheme(mode);
  const overlayBtnClass =
    "flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800/80 hover:text-white";
  const inputRef = useRef(null);
  const showCompare =
    Boolean(beforeImage) && Boolean(afterImage) && beforeImage !== afterImage;

  const processFiles = (files) => {
    if (!files?.length || loading) return;
    const fileList = Array.from(files).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (!fileList.length) return;

    if (fileList.length === 1) {
      const reader = new FileReader();
      reader.onload = () => onImageLoaded(reader.result);
      reader.readAsDataURL(fileList[0]);
    } else {
      onImagesQueued?.(fileList);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    processFiles(e.dataTransfer.files);
  };

  const openFilePicker = () => {
    if (!loading) inputRef.current?.click();
  };

  return (
    <section className="relative flex min-h-0 flex-1 flex-col gap-2 p-2 lg:h-full lg:min-h-0 lg:gap-3 lg:p-5">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={`relative min-h-0 flex-1 ${theme.canvasFrame}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          disabled={loading}
          onChange={(e) => {
            processFiles(e.target.files);
            e.target.value = "";
          }}
        />

        {showCompare ? (
          variantCompareEnabled && activeVariants?.length >= 2 ? (
            <VariantComparePanel
              mode={mode}
              beforeImage={beforeImage}
              afterImage={afterImage}
              activeVariants={activeVariants}
              selectedVariantIndex={selectedVariantIndex}
              onVariantSelect={onVariantSelect}
            />
          ) : (
            <ImageCompareSlider
              beforeSrc={beforeImage}
              afterSrc={afterImage}
              mode={mode}
            />
          )
        ) : afterImage ? (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <img
              src={afterImage}
              alt="Aperçu de la pièce"
              className="max-h-full max-w-full object-contain object-center"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={openFilePicker}
            disabled={loading}
            className="absolute inset-4 flex w-[calc(100%-2rem)] flex-col items-center justify-center gap-4 rounded-2xl text-center transition disabled:cursor-not-allowed sm:inset-8"
          >
            <div
              className={`${theme.dropZone} flex flex-col items-center gap-4 px-8 py-12 sm:px-16 sm:py-14`}
            >
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-3xl ring-2 ${theme.dropZoneIcon}`}
              >
                <ImageIcon className="h-10 w-10" strokeWidth={1.25} />
              </div>
              <div>
                <p className="text-xl font-bold text-white sm:text-2xl">
                  Glissez vos photos ici
                </p>
                <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
                  Une photo ou plusieurs d&apos;un coup — idéal pour enchaîner
                  pièce par pièce.
                </p>
              </div>
              <span
                className={`rounded-full px-5 py-2 text-sm font-semibold text-white shadow-lg ${theme.dropZoneCta}`}
              >
                Cliquer pour importer
              </span>
              <p className="text-xs text-zinc-500">JPG, PNG, WebP</p>
            </div>
          </button>
        )}

        {hasResult && !loading && (
          <div className="absolute right-3 top-3 z-10 flex items-center gap-0.5 rounded-xl border border-zinc-700/80 bg-panel/90 p-1 shadow-lg backdrop-blur-md">
            {generationId && onToggleFavorite && (
              <button
                type="button"
                onClick={onToggleFavorite}
                className={`${overlayBtnClass} ${
                  isFavorite ? "text-amber-400 hover:text-amber-300" : ""
                }`}
                title={
                  isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"
                }
              >
                <Star
                  className={`h-3.5 w-3.5 ${isFavorite ? "fill-current" : ""}`}
                />
                <span className="hidden sm:inline">Favori</span>
              </button>
            )}
            <button
              type="button"
              onClick={onUseAsBase}
              className={overlayBtnClass}
              title="Utiliser comme base"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Utiliser comme base</span>
            </button>
            <button
              type="button"
              onClick={onDownload}
              className={overlayBtnClass}
              title="Télécharger"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Télécharger</span>
            </button>
            {generationId && onReport && (
              <button
                type="button"
                onClick={onReport}
                className={overlayBtnClass}
                title="Signaler un problème avec ce résultat"
              >
                <Flag className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Signaler</span>
              </button>
            )}
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-black/70 backdrop-blur-sm">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ${theme.dropZoneIcon}`}
            >
              <Loader2 className={`h-8 w-8 animate-spin ${theme.text}`} />
            </div>
            <p className="text-sm font-medium text-zinc-200">
              {loadingLabel ?? MODES.meubler.loadingLabel}
            </p>
          </div>
        )}

        {!loading && adjusting && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center pt-6">
            <span className="rounded-md border border-zinc-700/80 bg-panel/90 px-3 py-1.5 text-xs text-zinc-300 backdrop-blur-sm">
              Ajustement en cours…
            </span>
          </div>
        )}
      </div>

      <PhotoActionBar
        mode={mode}
        hasResult={hasResult}
        queueCount={queueCount}
        loading={loading}
        onNextPhoto={onNextPhoto}
        onExportPack={onExportPack}
        onChainDeclutterToFurnish={onChainDeclutterToFurnish}
      />
    </section>
  );
}
