import { Link } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { MODES } from "../constants/modes";
import { useAuth } from "../contexts/AuthContext";
import { NAV_ITEMS } from "./Sidebar";
import { PropertySelector } from "./PropertyCreateModal";
import ThemeToggle from "./ThemeToggle";
import { getModeTheme } from "../utils/modeTheme";

export default function TopBar({
  mode,
  properties = [],
  activePropertyId,
  activeProperty,
  onPropertySelect,
  onPropertyCreateClick,
  hasFeature,
}) {
  const config = MODES[mode] ?? MODES.meubler;
  const theme = config.theme ?? MODES.meubler.theme;
  const modeTheme = getModeTheme(mode);
  const { user, logout } = useAuth();
  const ModeIcon = NAV_ITEMS.find((item) => item.id === mode)?.icon;

  const displayName =
    user?.displayName || user?.email?.split("@")[0] || "Utilisateur";

  return (
    <header
      className={`relative flex shrink-0 flex-wrap items-center justify-between gap-2 border-b bg-gradient-to-r ${theme.bar} px-4 py-2.5 backdrop-blur-sm lg:px-5 lg:py-3 ${modeTheme.headerBorder}`}
    >
      <div
        className={`absolute inset-y-0 left-0 w-1 ${modeTheme.headerAccent}`}
      />

      <div className="flex min-w-0 flex-1 items-center gap-2 lg:gap-3">
        {ModeIcon && (
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-lg ${modeTheme.headerIcon}`}
          >
            <ModeIcon className="h-4 w-4" strokeWidth={2} />
          </div>
        )}

        <div className="min-w-0">
          <h1 className="truncate text-sm font-bold text-white sm:text-base lg:text-lg">
            {activeProperty?.label ?? config.title}
          </h1>
          <p className="mt-0.5 hidden truncate text-xs text-zinc-400 sm:block lg:text-sm">
            {activeProperty?.address ?? config.subtitle}
          </p>
        </div>
      </div>

      <div className="flex min-w-0 shrink-0 flex-wrap items-center justify-end gap-2">
        <div className="lg:hidden">
          <ThemeToggle iconOnly />
        </div>
        <PropertySelector
          mode={mode}
          properties={properties}
          activePropertyId={activePropertyId}
          onSelect={onPropertySelect}
          onCreateClick={onPropertyCreateClick}
          hasFeature={hasFeature?.("multiProjects")}
        />
        <div className="flex h-10 items-stretch overflow-hidden rounded-xl border border-zinc-700/80 bg-zinc-900/30">
          <Link
            to="/settings"
            className="flex items-center gap-2 px-3 text-sm font-medium text-white transition hover:bg-zinc-800/60"
            title="Mon compte"
          >
            <User
              className="h-4 w-4 shrink-0 text-zinc-400"
              strokeWidth={1.5}
            />
            <span className="max-w-[100px] truncate sm:max-w-[140px]">
              {displayName}
            </span>
          </Link>
          <span
            className="w-px self-center bg-zinc-700/80"
            aria-hidden="true"
          />
          <button
            type="button"
            onClick={() => logout()}
            className="flex items-center justify-center px-3 text-zinc-400 transition hover:bg-zinc-800/60 hover:text-white"
            title="Se déconnecter"
            aria-label="Se déconnecter"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </header>
  );
}
