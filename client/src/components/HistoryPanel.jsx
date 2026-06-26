import { useState, useMemo } from "react";
import { ChevronDown, Download, Flag, RefreshCw, Star } from "lucide-react";
import { MODES } from "../constants/modes";
import { STYLES } from "../constants/styles";
import { ROOM_TYPES } from "../constants/roomTypes";
import { getModeTheme } from "../utils/modeTheme";

const PLACEHOLDER_COUNT = 6;

function formatRelativeTime(timestamp) {
  if (!timestamp) return "";
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days} j`;
}

function getModeLabel(mode) {
  return MODES[mode]?.label ?? mode;
}

function getStyleLabel(styleId) {
  return STYLES.find((s) => s.id === styleId)?.label ?? styleId;
}

function getRoomLabel(roomId) {
  return ROOM_TYPES.find((r) => r.id === roomId)?.label ?? roomId;
}

function sortHistory(history) {
  return [...history].sort((a, b) => {
    if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
    return (b.timestamp ?? 0) - (a.timestamp ?? 0);
  });
}

function HistoryCard({
  item,
  isSelected,
  theme,
  onSelect,
  onUseAsBase,
  onDownload,
  onToggleFavorite,
  onExportPack,
  onReport,
}) {
  const itemTheme = getModeTheme(item.mode);

  return (
    <div
      className={`group relative w-[112px] shrink-0 overflow-hidden rounded-xl border transition-all ${
        isSelected
          ? theme.selected
          : "border-line/80 hover:border-line hover:shadow-md"
      }`}
    >
      <button
        type="button"
        onClick={() => onSelect(item)}
        className="block w-full text-left"
      >
        <div className="relative h-[68px] overflow-hidden bg-panel/60">
          <img
            src={item.imageUrl}
            alt={`Génération ${item.mode ?? "IA"}`}
            className="h-full w-full object-cover"
          />
          {item.mode && (
            <span
              className={`absolute left-1 top-1 rounded px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white shadow-sm ${itemTheme.bg}`}
            >
              {getModeLabel(item.mode)}
            </span>
          )}
          {item.favorite && (
            <Star className="absolute bottom-1 left-1 h-3 w-3 fill-amber-400 text-amber-400" />
          )}
        </div>
        <div className="space-y-0.5 bg-surface/40 px-2 py-1.5">
          <p className="truncate text-[10px] font-medium text-fg">
            {item.roomType ? getRoomLabel(item.roomType) : "Pièce"}
            {item.style ? ` · ${getStyleLabel(item.style)}` : ""}
          </p>
          <p className="text-[9px] text-muted">
            {formatRelativeTime(item.timestamp)}
          </p>
        </div>
      </button>

      <div className="absolute right-1 top-1 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(item);
          }}
          className={`flex h-5 w-5 items-center justify-center rounded bg-black/70 transition-colors ${
            item.favorite ? "text-amber-400" : `text-white ${theme.hoverAction}`
          }`}
          title={item.favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <Star
            className={`h-2.5 w-2.5 ${item.favorite ? "fill-current" : ""}`}
          />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onUseAsBase(item);
          }}
          className={`flex h-5 w-5 items-center justify-center rounded bg-black/70 text-white transition-colors ${theme.hoverAction}`}
          title="Utiliser comme base"
        >
          <RefreshCw className="h-2.5 w-2.5" />
        </button>
        {onExportPack && item.baseImageUrl && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onExportPack(item);
            }}
            className={`flex h-5 w-5 items-center justify-center rounded bg-black/70 text-white transition-colors ${theme.hoverAction}`}
            title="Pack annonce"
          >
            <span className="text-[8px] font-bold">ZIP</span>
          </button>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDownload(item.imageUrl);
          }}
          className={`flex h-5 w-5 items-center justify-center rounded bg-black/70 text-white transition-colors ${theme.hoverAction}`}
          title="Télécharger"
        >
          <Download className="h-2.5 w-2.5" />
        </button>
        {onReport && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onReport(item);
            }}
            className={`flex h-5 w-5 items-center justify-center rounded bg-black/70 text-white transition-colors ${theme.hoverAction}`}
            title="Signaler"
          >
            <Flag className="h-2.5 w-2.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function HistoryPanel({
  mode,
  history,
  loading,
  selectedId,
  propertyLabel,
  onSelect,
  onUseAsBase,
  onDownload,
  onToggleFavorite,
  onExportPack,
  onReport,
  expanded = true,
  onExpandedChange,
}) {
  const theme = getModeTheme(mode);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const displayedHistory = useMemo(() => {
    const sorted = sortHistory(history);
    if (!favoritesOnly) return sorted;
    return sorted.filter((item) => item.favorite);
  }, [history, favoritesOnly]);

  const favoriteCount = history.filter((item) => item.favorite).length;
  const isEmpty = history.length === 0;
  const countLabel = favoritesOnly
    ? `${displayedHistory.length} favori(s)`
    : `${history.length} génération(s)`;

  const toggleExpanded = () => onExpandedChange?.(!expanded);

  if (!expanded) {
    return (
      <div className="flex shrink-0 items-center justify-between gap-2 border-t border-line/80 bg-panel/80 px-3 py-1.5 backdrop-blur-sm">
        <button
          type="button"
          onClick={toggleExpanded}
          className="flex items-center gap-2 text-xs font-medium text-fg-subtle transition hover:text-fg"
        >
          <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
          Historique
          {!loading && !isEmpty && (
            <span className="text-muted">({countLabel})</span>
          )}
        </button>
        {favoriteCount > 0 && (
          <button
            type="button"
            onClick={() => {
              onExpandedChange?.(true);
              setFavoritesOnly(true);
            }}
            className="flex items-center gap-1 text-[10px] text-muted transition hover:text-fg-subtle"
          >
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {favoriteCount}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex shrink-0 flex-col border-t border-line/80 bg-panel/80 backdrop-blur-sm">
      <div className="flex shrink-0 items-center justify-between gap-2 px-3 py-2">
        <button
          type="button"
          onClick={toggleExpanded}
          className="flex min-w-0 items-center gap-1.5 text-left"
        >
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-fg-muted" />
          <h2 className="truncate text-sm font-semibold text-fg">
            {propertyLabel ? `Historique — ${propertyLabel}` : "Historique"}
          </h2>
        </button>
        <div className="flex shrink-0 items-center gap-2">
          {!loading && !isEmpty && (
            <p className="text-[11px] text-muted">{countLabel}</p>
          )}
          {favoriteCount > 0 && (
            <button
              type="button"
              onClick={() => setFavoritesOnly((v) => !v)}
              className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium transition ${
                favoritesOnly
                  ? `${theme.bg} text-white`
                  : "text-muted hover:text-fg-subtle"
              }`}
              title="Afficher uniquement les favoris"
            >
              <Star
                className={`h-3 w-3 ${favoritesOnly ? "fill-current" : ""}`}
              />
              {favoriteCount}
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto px-3 pb-3 scrollbar-thin">
        {loading &&
          Array.from({ length: PLACEHOLDER_COUNT }).map((_, i) => (
            <div
              key={`loading-${i}`}
              className="h-[96px] w-[112px] shrink-0 animate-pulse rounded-xl bg-elevated/60"
            />
          ))}

        {!loading && isEmpty && (
          <p className="py-2 text-xs text-muted">
            Vos générations apparaîtront ici.
          </p>
        )}

        {!loading &&
          !isEmpty &&
          favoritesOnly &&
          displayedHistory.length === 0 && (
            <p className="py-2 text-xs text-muted">
              Aucun favori pour le moment.
            </p>
          )}

        {!loading &&
          displayedHistory.map((item) => (
            <HistoryCard
              key={item.id}
              item={item}
              isSelected={item.id === selectedId}
              theme={theme}
              onSelect={onSelect}
              onUseAsBase={onUseAsBase}
              onDownload={onDownload}
              onToggleFavorite={onToggleFavorite}
              onExportPack={onExportPack}
              onReport={onReport}
            />
          ))}
      </div>
    </div>
  );
}
