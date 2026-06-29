import { useRef, useState, useMemo } from "react";
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
import {
  STYLES,
  getStylesForRoomType,
  getStyleCategoryOrder,
  getStyleById,
} from "../constants/styles";
import { ROOM_TYPES, ROOM_CATEGORY_ORDER } from "../constants/roomTypes";
import { getTypicalSqm, SQM_PRESETS } from "../constants/roomTypicalSqm";
import SearchableSelect from "./SearchableSelect";
import VariantPicker from "./VariantPicker";
import GenerationTuningPanel from "./GenerationTuningPanel";
import { getModeTheme } from "../utils/modeTheme";
import { isStyleMode } from "../constants/modes";

export function GenerateActionButtons({
  mode,
  baseImage,
  loading,
  generateLabel,
  onGenerateClick,
  onBatchGenerateClick,
  onVariantsGenerateClick,
  variantStyles,
  queueCount,
  totalQueuePhotos,
  batchResultsCount = 0,
  onExportBatchPack,
  exportingPack = false,
  horizontal = false,
  hideEmptyHint = false,
}) {
  const showStyleOptions = isStyleMode(mode);
  const theme = getModeTheme(mode);

  const handleGenerateClick = () => {
    if (!baseImage || loading) return;
    onGenerateClick();
  };

  const btnBase = horizontal
    ? "min-w-0 flex-1 rounded-lg py-2 text-xs font-semibold sm:text-sm"
    : "w-full rounded-xl py-3 text-sm font-semibold";

  const primaryClass = horizontal
    ? `${btnBase} text-white ${theme.btnPrimaryLg}`
    : `w-full py-4 text-base font-bold text-white shadow-xl ${theme.btnPrimaryLg}`;

  const secondaryClass = horizontal
    ? `${btnBase} btn-secondary`
    : "btn-secondary w-full py-3 text-sm font-semibold";

  const chainClass = horizontal
    ? `${btnBase} border ${theme.chainBtn}`
    : `w-full rounded-xl border py-3 text-sm font-semibold ${theme.chainBtn}`;

  return (
    <div className={horizontal ? "space-y-2" : "space-y-2"}>
      <div
        className={
          horizontal ? "flex flex-wrap items-stretch gap-2" : "space-y-2"
        }
      >
        <button
          type="button"
          onClick={handleGenerateClick}
          disabled={!baseImage || loading}
          className={`${primaryClass} disabled:opacity-40`}
          title="Raccourci : ⌘ + Entrée"
        >
          {loading ? "En cours…" : generateLabel}
        </button>
        {showStyleOptions &&
          variantStyles?.length >= 2 &&
          onVariantsGenerateClick && (
            <button
              type="button"
              onClick={onVariantsGenerateClick}
              disabled={!baseImage || loading}
              className={`${chainClass} disabled:opacity-40`}
            >
              {horizontal
                ? `${variantStyles.length} var.`
                : `Générer ${variantStyles.length} variantes`}
            </button>
          )}
        {queueCount > 0 && onBatchGenerateClick && (
          <button
            type="button"
            onClick={onBatchGenerateClick}
            disabled={!baseImage || loading}
            className={`${secondaryClass} disabled:opacity-40`}
          >
            {horizontal
              ? `Lot (${totalQueuePhotos ?? queueCount + 1})`
              : `Générer tout (${totalQueuePhotos ?? queueCount + 1})`}
          </button>
        )}
      </div>

      {batchResultsCount > 0 && onExportBatchPack && (
        <button
          type="button"
          onClick={onExportBatchPack}
          disabled={loading || exportingPack}
          className={`${chainClass} w-full disabled:opacity-40`}
        >
          <span className="inline-flex items-center justify-center gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            Exporter le lot ({batchResultsCount})
          </span>
        </button>
      )}

      {!hideEmptyHint && !baseImage && (
        <p
          className={`text-center text-fg-muted ${
            horizontal ? "text-[10px]" : "text-[11px]"
          }`}
        >
          {horizontal
            ? "Ajoutez une photo ci-dessous"
            : "Importez une photo pour activer la génération"}
        </p>
      )}
    </div>
  );
}

function CollapsibleSection({
  title,
  hint,
  defaultOpen = false,
  children,
  theme,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-xl border border-line/80 bg-surface/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left transition hover:bg-elevated/40"
      >
        <div className="min-w-0">
          <p className="text-sm font-medium text-fg">{title}</p>
          {hint && !open && (
            <p className="mt-0.5 truncate text-[11px] text-muted">{hint}</p>
          )}
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-fg-muted transition ${open ? "rotate-180" : ""} ${theme.text}`}
        />
      </button>
      {open && (
        <div className="space-y-3 border-t border-line/80 px-3 py-3">
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
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line/80 bg-surface/40 px-3 py-2">
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
          className={`text-xs font-medium ${theme.text} transition hover:text-fg disabled:opacity-40`}
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
        className={`flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-line/80 bg-deep ring-1 ring-white/5 transition ${theme.hoverBorder}`}
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
        <Upload className="h-5 w-5 text-fg-muted" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-fg">Aucune photo</p>
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
          <span className="font-normal normal-case text-fg-subtle">
            (optionnel)
          </span>
        </label>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(typical)}
          className={`text-[11px] ${theme.text} transition hover:text-fg disabled:opacity-40`}
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
                : "bg-elevated text-fg-muted hover:text-fg"
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
        <label className="flex items-center gap-2 text-sm text-fg-subtle">
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
        className={`h-1.5 w-full cursor-pointer appearance-none rounded-full bg-elevated ${theme.slider} disabled:cursor-not-allowed disabled:opacity-40`}
      />
      <div className="mt-1 flex justify-between text-[10px] text-fg-muted">
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
  generationTuning,
  onGenerationTuningChange,
  canUseGenerationTuning,
  onUpgradeForTuning,
  aiLabelEnabled,
  onAiLabelEnabledChange,
  compactInline = false,
}) {
  const isDeclutter = mode === "desencombrer";
  const showStyleOptions = isStyleMode(mode);
  const theme = getModeTheme(mode);
  const styleOptions = useMemo(
    () => getStylesForRoomType(roomType),
    [roomType],
  );
  const styleCategoryOrder = useMemo(
    () => getStyleCategoryOrder(roomType),
    [roomType],
  );

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
        <h3 className="text-sm font-medium text-fg">Ajustements photo</h3>
        {hasAdjustments && (
          <button
            type="button"
            onClick={onResetAdjustments}
            className="flex items-center gap-1 text-[11px] text-fg-muted transition-colors hover:text-fg"
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
      <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-line/80 bg-surface/40 px-3 py-2.5">
        <input
          type="checkbox"
          checked={Boolean(aiLabelEnabled)}
          onChange={(e) => onAiLabelEnabledChange?.(e.target.checked)}
          className="mt-0.5 rounded border-line"
        />
        <span className="min-w-0">
          <span className="block text-sm font-medium text-fg">
            Mention IA sur les exports
          </span>
          <span className="mt-0.5 block text-[11px] leading-snug text-fg-muted">
            Ajoute « Image générée par IA » en bas des photos téléchargées et
            exportées.
          </span>
        </span>
      </label>
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

  const renderGenerateActions = (horizontal = false) => (
    <GenerateActionButtons
      mode={mode}
      baseImage={baseImage}
      loading={loading}
      generateLabel={generateLabel}
      onGenerateClick={onGenerateClick}
      onBatchGenerateClick={onBatchGenerateClick}
      onVariantsGenerateClick={onVariantsGenerateClick}
      variantStyles={variantStyles}
      queueCount={queueCount}
      totalQueuePhotos={totalQueuePhotos}
      batchResultsCount={batchResultsCount}
      onExportBatchPack={onExportBatchPack}
      exportingPack={exportingPack}
      horizontal={horizontal}
    />
  );

  const generateFooter = (
    <div className="panel-sticky-footer mt-auto space-y-2">
      {renderGenerateActions(false)}
    </div>
  );

  const settingsFields = (
    <>
      {!isDeclutter && showStyleOptions && (
        <SearchableSelect
          label="Nouveau style"
          value={style}
          options={styleOptions}
          categoryOrder={styleCategoryOrder}
          resolveOption={getStyleById}
          onChange={onStyleChange}
          disabled={loading}
          theme={theme}
        />
      )}

      <SearchableSelect
        label="De quelle pièce s'agit-il ?"
        value={roomType}
        options={ROOM_TYPES}
        categoryOrder={ROOM_CATEGORY_ORDER}
        onChange={onRoomTypeChange}
        disabled={loading}
        theme={theme}
      />

      {showStyleOptions && !compactInline && (
        <CollapsibleSection
          title="Variantes A / B / C"
          hint="Comparer 2 ou 3 styles sur la même photo"
          theme={theme}
        >
          <VariantPicker
            mode={mode}
            roomType={roomType}
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
            isDeclutter ? "" : "space-y-4 border-t border-line/80 pt-3"
          }
        >
          {adjustmentsBlock}
        </div>
      </CollapsibleSection>

      <div
        className={`flex items-center justify-between rounded-xl border border-line/80 ${
          compactInline ? "gap-2 px-2.5 py-2" : "gap-3 px-3 py-2.5"
        }`}
      >
        <div className="flex min-w-0 items-center gap-2">
          <Zap className={`h-3.5 w-3.5 shrink-0 ${theme.icon}`} />
          <div className="min-w-0">
            <p
              className={`font-medium text-fg ${compactInline ? "text-xs" : "text-sm"}`}
            >
              Réflexion approfondie
            </p>
            {!compactInline && (
              <p className="text-[11px] text-muted">{deepThinkingHint}</p>
            )}
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
            className={`h-5 w-9 rounded-full bg-elevated after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all ${theme.peerChecked} peer-focus:outline-none`}
          />
        </label>
      </div>

      {!compactInline && (
        <CollapsibleSection
          title="Réglages IA avancés"
          hint={
            canUseGenerationTuning
              ? "Fidélité, précision du prompt, niveau de détail"
              : "Réservé Pro & Agence"
          }
          theme={theme}
        >
          <GenerationTuningPanel
            value={generationTuning}
            onChange={onGenerationTuningChange}
            disabled={loading}
            theme={theme}
            locked={!canUseGenerationTuning}
            onUpgradeClick={onUpgradeForTuning}
          />
        </CollapsibleSection>
      )}
    </>
  );

  if (compactInline) {
    return (
      <aside className="px-3 pb-2 md:hidden">
        <div className="overflow-hidden rounded-xl border border-line/80 bg-surface/40">
          <div className="max-h-[42dvh] space-y-2 overflow-y-auto p-3 scrollbar-thin">
            <div
              className={`grid gap-2 ${!isDeclutter && showStyleOptions ? "grid-cols-2" : "grid-cols-1"}`}
            >
              {!isDeclutter && showStyleOptions && (
                <SearchableSelect
                  label="Style"
                  value={style}
                  options={styleOptions}
                  categoryOrder={styleCategoryOrder}
                  resolveOption={getStyleById}
                  onChange={onStyleChange}
                  disabled={loading}
                  theme={theme}
                />
              )}
              <SearchableSelect
                label="Pièce"
                value={roomType}
                options={ROOM_TYPES}
                categoryOrder={ROOM_CATEGORY_ORDER}
                onChange={onRoomTypeChange}
                disabled={loading}
                theme={theme}
              />
            </div>

            {!isDeclutter && mode === "meubler" && (
              <RoomSqmField
                value={roomSqm}
                roomType={roomType}
                onChange={onRoomSqmChange}
                disabled={loading}
                theme={theme}
              />
            )}

            {showStyleOptions && variantStyles?.length >= 2 && (
              <CollapsibleSection
                title="Variantes"
                hint={`${variantStyles.length} styles sélectionnés`}
                theme={theme}
              >
                <VariantPicker
                  mode={mode}
                  roomType={roomType}
                  currentStyle={style}
                  selectedStyles={variantStyles}
                  onChange={onVariantStylesChange}
                  disabled={loading}
                  embedded
                />
              </CollapsibleSection>
            )}

            <div className="flex items-center justify-between rounded-xl border border-line/80 px-2.5 py-2">
              <div className="flex min-w-0 items-center gap-2">
                <Zap className={`h-3.5 w-3.5 shrink-0 ${theme.icon}`} />
                <p className="text-xs font-medium text-fg">
                  Réflexion approfondie
                </p>
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
                  className={`h-5 w-9 rounded-full bg-elevated after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all ${theme.peerChecked} peer-focus:outline-none`}
                />
              </label>
            </div>

            {error && (
              <p
                className="rounded-lg border border-red-900/50 bg-red-950/40 px-2.5 py-1.5 text-xs text-red-300"
                role="alert"
              >
                {error}
              </p>
            )}

            {renderGenerateActions(true)}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex h-full flex-col overflow-y-auto bg-panel/95 backdrop-blur-sm scrollbar-thin lg:bg-panel/90">
      <div className="flex flex-1 flex-col gap-3.5 p-3.5 lg:p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-base font-semibold text-fg">
            Paramètres
          </h2>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-fg-muted transition hover:bg-elevated/60 hover:text-fg lg:flex"
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

        {settingsFields}
      </div>

      {error && (
        <p
          className="mx-4 mb-3 rounded-xl border border-red-900/50 bg-red-950/40 px-3 py-2.5 text-sm text-red-300"
          role="alert"
        >
          {error}
        </p>
      )}

      {generateFooter}
    </aside>
  );
}
