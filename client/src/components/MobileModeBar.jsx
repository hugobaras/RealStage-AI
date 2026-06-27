import { MODES } from "../constants/modes";
import { getModeTabTheme } from "../utils/modeTheme";
import { NAV_ITEMS } from "./Sidebar";

export default function MobileModeBar({ activeMode, onModeChange }) {
  return (
    <div className="shrink-0 border-b border-line/80 bg-panel px-4 py-2.5 lg:hidden">
      <div className="flex gap-2">
        {NAV_ITEMS.map(({ id, icon: Icon }) => {
          const active = activeMode === id;
          const label = MODES[id].label;
          const tabTheme = getModeTabTheme(id);

          return (
            <button
              key={id}
              type="button"
              onClick={() => onModeChange(id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition-all ${
                active
                  ? `${tabTheme.bg} text-white ${tabTheme.shadowLg}`
                  : "bg-elevated text-fg-subtle hover:text-fg"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-4 w-4" strokeWidth={active ? 2.25 : 1.5} />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
