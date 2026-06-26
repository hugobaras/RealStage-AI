import { Check, Circle, Clock } from "lucide-react";
import { ROOM_TYPES } from "../constants/roomTypes";
import { ESSENTIAL_ROOMS } from "../constants/listingWorkflow";
import { getModeTheme } from "../utils/modeTheme";

function getRoomLabel(roomId) {
  return ROOM_TYPES.find((r) => r.id === roomId)?.label ?? roomId;
}

function StatusIcon({ status }) {
  if (status === "done") {
    return <Check className="h-3.5 w-3.5 text-estate-stone-light" />;
  }
  if (status === "queued") {
    return <Clock className="h-3.5 w-3.5 text-amber-400" />;
  }
  return <Circle className="h-3.5 w-3.5 text-fg-subtle" />;
}

export default function RoomChecklist({
  mode,
  roomStatus,
  currentRoomType,
  onRoomSelect,
  essentialDone,
  essentialTotal,
}) {
  const theme = getModeTheme(mode);

  return (
    <div className="shrink-0 border-b border-line/80 bg-panel/40 px-4 py-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
          Checklist annonce
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${theme.bgSubtle} ${theme.text}`}
        >
          {essentialDone}/{essentialTotal} essentielles
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {ESSENTIAL_ROOMS.map((roomId) => {
          const status = roomStatus[roomId] ?? "missing";
          const active = currentRoomType === roomId;
          return (
            <button
              key={roomId}
              type="button"
              onClick={() => onRoomSelect(roomId)}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition ${
                active
                  ? `${theme.bg} text-white`
                  : status === "done"
                    ? "bg-estate-stone/15 text-estate-stone-light ring-1 ring-estate-stone/30"
                    : "bg-elevated/80 text-fg-muted hover:bg-elevated hover:text-fg"
              }`}
            >
              <StatusIcon status={status} />
              {getRoomLabel(roomId)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
