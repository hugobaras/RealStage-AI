import { useRef, useState } from "react";
import {
  Zap,
  ChevronDown,
  Sun,
  Thermometer,
  Download,
  RotateCcw,
  Upload,
  ImagePlus,
  Package,
  Layers,
  X,
} from "lucide-react";
import { STYLES } from "../constants/styles";
import { ROOM_TYPES } from "../constants/roomTypes";
import { getTypicalSqm, SQM_PRESETS } from "../constants/roomTypicalSqm";
import SearchableSelect from "./SearchableSelect";
import VariantPicker from "./VariantPicker";
import { getModeTheme } from "../utils/modeTheme";
import { isStyleMode } from "../constants/modes";

function CollapsibleSection({
  title,
  hint,
  defaultOpen = false,
  children,
  theme,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800/80 bg-surface/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left transition hover:bg-zinc-800/40"
      >
        <div className="min-w-0">
          <p className="text-sm font-medium text-white">{title}</p>
          {hint && !open && (
            <p className="mt-0.5 truncate text-[11px] text-muted">{hint}</p>
          )}
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-zinc-500 transition ${open ? "rotate-180" : ""} ${theme.text}`}
        />
      </button>
      {open && (
        <div className="space-y-3 border-t border-zinc-800/80 px-3 py-3">
          {children}
        </div>
      )}
    </div>
  );
}

function ImageThumbnail({
  imageUrl,
  onImageLoaded,
  onNextPhoto,
  queueCount,
  disabled,
  theme,
}) {
  const inputRef = useRef(null);

  const handleFiles = (files) => {
    if (!files?.length || disabled) return;
    const fileList = Array.from(files).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (!fileList.length) return;
    if (fileList.length === 1) {
      onImageLoaded(fileList[0]);
    } else {
      onImageLoaded(fileList, true);
    }
  };

  if (imageUrl) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-800/80 bg-surface/40 px-3 py-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          disabled={disabled}
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => !disabled && inputRef.current?.click()}
          disabled={disabled}
          className={`text-xs font-medium ${theme.text} transition hover:text-white disabled:opacity-40`}
        >
          Changer la photo
        </button>
        <button
          type="button"
          onClick={onNextPhoto}
          disabled={disabled}
          className="btn-secondary flex items-center gap-1 px-2.5 py-1.5 text-[11px]"
          title="Photo suivante"
        >
          <ImagePlus className="h-3.5 w-3.5" />
          Suivante
          {queueCount > 0 && (
            <span
              className={`rounded-full px-1 text-[10px] text-white ${theme.bg}`}
            >
              {queueCount}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="surface-card flex items-center gap-3 p-2.5">
      <div
        role="button"
        tabIndex={0}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        className={`flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-zinc-700/80 bg-deep ring-1 ring-white/5 transition ${theme.hoverBorder}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          disabled={disabled}
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <Upload className="h-5 w-5 text-zinc-500" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-white">Aucune photo</p>
        <p className="text-[11px] text-muted">Import unique ou multiple</p>
      </div>
    </div>
  );
}

function RoomSqmField({ value, roomType, onChange, disabled, theme }) {
  const typical = getTypicalSqm(roomType);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <label className="section-label">
          Surface de la pièce{" "}
          <span className="font-normal normal-case text-zinc-600">
            (optionnel)
          </span>
        </label>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(typical)}
          className={`text-[11px] ${theme.text} transition hover:text-white disabled:opacity-40`}
        >
          Type : {typical} m²
        </button>
      </div>
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          placeholder="Ex. 25"
          value={value == null ? "" : String(value)}
          disabled={disabled}
          onChange={(e) => {
            const raw = e.target.value.trim();
            if (raw === "") {
              onChange(null);
              return;
            }
            const n = Number(raw);
            if (Number.isFinite(n)) onChange(n);
          }}
          className="input-field pr-10 tabular-nums"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">
          m²
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {SQM_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            disabled={disabled}
            onClick={() => onChange(preset)}
            className={`rounded-lg px-2 py-1 text-[11px] font-medium transition ${
              value === preset
                ? `${theme.bg} text-white`
                : "bg-zinc-800 text-zinc-400 hover:text-white"
            } disabled:opacity-40`}
          >
            {preset}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-muted">
        Aide l&apos;IA à proportionner le mobilier.
      </p>
    </div>
  );
}

function StyleSelect({ value, onChange, disabled }) {
  const selected = STYLES.find((s) => s.id === value) ?? STYLES[0];

  return (
    <div>
      <label className="section-label mb-2 block">Nouveau style</label>
      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
          <img
            src={selected.previewImage}
            alt=""
            className="h-8 w-10 rounded-lg object-cover ring-1 ring-white/10"
          />
        </div>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="input-field appearance-none py-2.5 pl-16 pr-10 disabled:opacity-40"
        >
          {STYLES.map((style) => (
            <option key={style.id} value={style.id}>
              {style.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
      </div>
    </div>
  );
}

function AdjustmentSlider({
  label,
  icon: Icon,
  value,
  onChange,
  minLabel,
  maxLabel,
  disabled,
  theme,
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <Icon className={`h-3.5 w-3.5 ${theme.icon}`} strokeWidth={2} />
          {label}
        </label>
        <span className="text-xs tabular-nums text-muted">
          {value > 0 ? `+${value}` : value}
        </span>
      </div>
      <input
        type="range"
        min={-100}
        max={100}
        step={1}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`h-1.5 w-full cursor-pointer appearance-none rounded-full bg-zinc-700 ${theme.slider} disabled:cursor-not-allowed disabled:opacity-40`}
      />
      <div className="mt-1 flex justify-between text-[10px] text-zinc-500">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}

export default function ControlPanel({
  mode,
  style,
  roomType,
  roomSqm,
  baseImage,
  deepThinking,
  loading,
  exportingPack,
  generateLabel,
  onGenerateClick,
  onBatchGenerateClick,
  onVariantsGenerateClick,
  error,
  brightness,
  temperature,
  adjusting,
  hasAdjustableImage,
  hasAdjustments,
  hasResult,
  queueCount,
  totalQueuePhotos,
  variantStyles,
  batchResultsCount,
  onStyleChange,
  onRoomTypeChange,
  onRoomSqmChange,
  onImageLoaded,
  onNextPhoto,
  onDeepThinkingChange,
  onBrightnessChange,
  onTemperatureChange,
  onResetAdjustments,
  onDownload,
  onExportPack,
  onExportBatchPack,
  onVariantStylesChange,
  onUseAsBase,
  onChainDeclutterToFurnish,
  onClose,
  deepThinkingLimit,
  deepThinkingRemaining,
  canUseDeepThinking,
}) {
  const isDeclutter = mode === "desencombrer";
  const showStyleOptions = isStyleMode(mode);
  const theme = getModeTheme(mode);

  const handleGenerateClick = () => {
    if (!baseImage || loading) return;
    onGenerateClick();
  };

  const deepThinkingHint = (() => {
    if (deepThinkingLimit == null) {
      return "Résultat plus cohérent · Illimité";
    }
    if (deepThinkingLimit === 0) {
      return "Disponible avec un abonnement";
    }
    return `Résultat plus cohérent · ${deepThinkingRemaining ?? 0}/${deepThinkingLimit} ce mois`;
  })();

  const deepThinkingDisabled =
    loading || (!canUseDeepThinking && !deepThinking);

  const adjustmentsBlock = (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-white">Ajustements photo</h3>
        {hasAdjustments && (
          <button
            type="button"
            onClick={onResetAdjustments}
            className="flex items-center gap-1 text-[11px] text-zinc-400 transition-colors hover:text-white"
          >
            <RotateCcw className="h-3 w-3" />
            Réinitialiser
          </button>
        )}
      </div>
      <AdjustmentSlider
        label="Luminosité"
        icon={Sun}
        value={brightness}
        onChange={onBrightnessChange}
        minLabel="Sombre"
        maxLabel="Clair"
        disabled={!hasAdjustableImage || loading}
        theme={theme}
      />
      <AdjustmentSlider
        label="Température"
        icon={Thermometer}
        value={temperature}
        onChange={onTemperatureChange}
        minLabel="Froid"
        maxLabel="Chaud"
        disabled={!hasAdjustableImage || loading}
        theme={theme}
      />
      <button
        type="button"
        onClick={onDownload}
        disabled={!hasAdjustableImage || loading || adjusting}
        className="btn-secondary flex w-full items-center justify-center gap-2 disabled:opacity-40"
        title="Raccourci : ⌘ + S"
      >
        <Download className="h-4 w-4" strokeWidth={2} />
        Télécharger
      </button>
      {hasResult && onExportPack && (
        <button
          type="button"
          onClick={onExportPack}
          disabled={loading || adjusting || exportingPack}
          className="btn-secondary flex w-full items-center justify-center gap-2 disabled:opacity-40"
        >
          <Package className="h-4 w-4" strokeWidth={2} />
          {exportingPack ? "Création du pack…" : "Pack annonce (ZIP)"}
        </button>
      )}
    </div>
  );

  return (
    <aside className="flex h-full flex-col overflow-y-auto bg-panel/95 backdrop-blur-sm scrollbar-thin lg:bg-panel/90">
      <div className="flex flex-1 flex-col gap-3.5 p-3.5 lg:p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-white">Paramètres</h2>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-800/60 hover:text-white lg:flex"
              title="Masquer les paramètres"
              aria-label="Masquer les paramètres"
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
            </button>
          )}
        </div>
        <ImageThumbnail
          imageUrl={baseImage}
          onImageLoaded={onImageLoaded}
          onNextPhoto={onNextPhoto}
          queueCount={queueCount}
          disabled={loading}
          theme={theme}
        />

        {!isDeclutter && showStyleOptions && (
          <StyleSelect
            value={style}
            onChange={onStyleChange}
            disabled={loading}
          />
        )}

        <SearchableSelect
          label="De quelle pièce s'agit-il ?"
          value={roomType}
          options={ROOM_TYPES}
          onChange={onRoomTypeChange}
          disabled={loading}
          theme={theme}
        />

        {showStyleOptions && (
          <CollapsibleSection
            title="Variantes A / B / C"
            hint="Comparer 2 ou 3 styles sur la même photo"
            theme={theme}
          >
            <VariantPicker
              mode={mode}
              currentStyle={style}
              selectedStyles={variantStyles}
              onChange={onVariantStylesChange}
              disabled={loading}
              embedded
            />
          </CollapsibleSection>
        )}

        <CollapsibleSection
          title={isDeclutter ? "Ajustements & export" : "Surface & ajustements"}
          hint={
            isDeclutter
              ? "Luminosité, température, export"
              : "m², luminosité, export"
          }
          theme={theme}
        >
          {!isDeclutter && mode === "meubler" && (
            <RoomSqmField
              value={roomSqm}
              roomType={roomType}
              onChange={onRoomSqmChange}
              disabled={loading}
              theme={theme}
            />
          )}
          <div
            className={
              isDeclutter ? "" : "space-y-4 border-t border-zinc-800/80 pt-3"
            }
          >
            {adjustmentsBlock}
          </div>
        </CollapsibleSection>

        <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800/80 px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <Zap className={`h-4 w-4 shrink-0 ${theme.icon}`} />
            <div className="min-w-0">
              <p className="text-sm font-medium text-white">
                Réflexion approfondie
              </p>
              <p className="text-[11px] text-muted">{deepThinkingHint}</p>
            </div>
          </div>
          <label
            className={`relative inline-flex shrink-0 items-center ${deepThinkingDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
          >
            <input
              type="checkbox"
              className="peer sr-only"
              checked={deepThinking}
              onChange={(e) => onDeepThinkingChange(e.target.checked)}
              disabled={deepThinkingDisabled}
            />
            <div
              className={`h-5 w-9 rounded-full bg-zinc-700 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all ${theme.peerChecked} peer-focus:outline-none`}
            />
          </label>
        </div>
      </div>

      {error && (
        <p
          className="mx-4 mb-3 rounded-xl border border-red-900/50 bg-red-950/40 px-3 py-2.5 text-sm text-red-300"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="panel-sticky-footer mt-auto space-y-2">
        {batchResultsCount > 0 && onExportBatchPack && (
          <button
            type="button"
            onClick={onExportBatchPack}
            disabled={loading || exportingPack}
            className={`w-full rounded-xl border py-2.5 text-sm font-semibold transition disabled:opacity-40 ${theme.chainBtn}`}
          >
            <span className="inline-flex items-center justify-center gap-1.5">
              <Layers className="h-4 w-4" />
              Exporter le lot ({batchResultsCount})
            </span>
          </button>
        )}
        {queueCount > 0 && onBatchGenerateClick && (
          <button
            type="button"
            onClick={onBatchGenerateClick}
            disabled={!baseImage || loading}
            className="btn-secondary w-full py-3 text-sm font-semibold disabled:opacity-40"
          >
            Générer tout ({totalQueuePhotos ?? queueCount + 1})
          </button>
        )}
        {showStyleOptions &&
          variantStyles?.length >= 2 &&
          onVariantsGenerateClick && (
            <button
              type="button"
              onClick={onVariantsGenerateClick}
              disabled={!baseImage || loading}
              className={`w-full rounded-xl border py-3 text-sm font-semibold transition disabled:opacity-40 ${theme.chainBtn}`}
            >
              Générer {variantStyles.length} variantes
            </button>
          )}
        <button
          type="button"
          onClick={handleGenerateClick}
          disabled={!baseImage || loading}
          className={`w-full py-4 text-base font-bold text-white shadow-xl disabled:opacity-40 ${theme.btnPrimaryLg}`}
          title="Raccourci : ⌘ + Entrée"
        >
          {loading ? "Génération en cours…" : generateLabel}
        </button>
        {!baseImage && (
          <p className="mt-2 text-center text-[11px] text-zinc-500">
            Importez une photo pour activer la génération
          </p>
        )}
      </div>
    </aside>
  );
}
