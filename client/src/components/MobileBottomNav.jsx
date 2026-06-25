import { SlidersHorizontal, Image } from "lucide-react";
import { getModeTheme } from "../utils/modeTheme";

const TABS = [
  { id: "controls", label: "Paramètres", icon: SlidersHorizontal },
  { id: "canvas", label: "Aperçu", icon: Image },
];

export default function MobileBottomNav({ mode, activeTab, onTabChange }) {
  const theme = getModeTheme(mode);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-800/80 bg-panel/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
      aria-label="Navigation principale"
    >
      <div className="flex h-[3.25rem]">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors ${
                active ? theme.navActive : "text-zinc-500"
              }`}
              aria-current={active ? "page" : undefined}
            >
              {active && (
                <span
                  className={`absolute top-0 left-1/2 h-0.5 w-10 -translate-x-1/2 rounded-b-full ${theme.navIndicator}`}
                />
              )}
              <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 1.5} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
