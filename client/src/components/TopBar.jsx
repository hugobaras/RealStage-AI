import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { LogOut, Menu, User } from "lucide-react";
import { MODES } from "../constants/modes";
import { useAuth } from "../contexts/AuthContext";
import { NAV_ITEMS } from "./Sidebar";
import { PropertySelector } from "./PropertyCreateModal";
import ThemeToggle from "./ThemeToggle";
import { getModeTheme } from "../utils/modeTheme";

function UserMenu({ displayName, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-line/80 bg-panel/30 text-fg transition hover:bg-elevated/60 md:hidden"
        aria-label="Menu compte"
        aria-expanded={open}
      >
        <User className="h-4 w-4" strokeWidth={1.5} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-40 mt-1 min-w-[10rem] rounded-xl border border-line/80 bg-panel py-1 shadow-xl">
          <p className="truncate px-3 py-2 text-xs font-medium text-fg-muted">
            {displayName}
          </p>
          <Link
            to="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-fg hover:bg-elevated/60"
          >
            <User className="h-4 w-4" />
            Mon compte
          </Link>
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs text-fg-muted">Thème</span>
            <ThemeToggle iconOnly />
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-fg-muted hover:bg-elevated/60 hover:text-fg"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}

export default function TopBar({
  mode,
  properties = [],
  activePropertyId,
  activeProperty,
  onPropertySelect,
  onPropertyCreateClick,
  hasFeature,
  onMenuOpen,
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
      className={`relative flex shrink-0 items-center justify-between gap-2 border-b bg-gradient-to-r ${theme.bar} px-3 py-2 backdrop-blur-sm md:px-4 md:py-2.5 lg:px-5 lg:py-3 ${modeTheme.headerBorder}`}
      style={{ minHeight: "var(--layout-topbar-height)" }}
    >
      <div
        className={`absolute inset-y-0 left-0 w-1 ${modeTheme.headerAccent}`}
      />

      <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-3">
        <button
          type="button"
          onClick={onMenuOpen}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line/80 bg-panel/50 text-fg transition hover:bg-elevated/60 md:hidden"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {ModeIcon && (
          <div
            className={`hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-lg md:flex ${modeTheme.headerIcon}`}
          >
            <ModeIcon className="h-4 w-4" strokeWidth={2} />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-sm font-semibold text-fg sm:text-base lg:text-lg">
            {activeProperty?.label ?? config.title}
          </h1>
          <p className="mt-0.5 hidden truncate text-xs text-fg-muted md:block lg:text-sm">
            {activeProperty?.address ?? config.subtitle}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
        <PropertySelector
          mode={mode}
          properties={properties}
          activePropertyId={activePropertyId}
          onSelect={onPropertySelect}
          onCreateClick={onPropertyCreateClick}
          hasFeature={hasFeature?.("multiProjects")}
          compact
        />

        <UserMenu displayName={displayName} onLogout={logout} />

        <div className="hidden h-10 items-stretch overflow-hidden rounded-xl border border-line/80 bg-panel/30 md:flex">
          <Link
            to="/settings"
            className="flex items-center gap-2 px-3 text-sm font-medium text-fg transition hover:bg-elevated/60"
            title="Mon compte"
          >
            <User
              className="h-4 w-4 shrink-0 text-fg-muted"
              strokeWidth={1.5}
            />
            <span className="max-w-[8rem] truncate lg:max-w-[10rem]">
              {displayName}
            </span>
          </Link>
          <span
            className="w-px self-center bg-elevated/80"
            aria-hidden="true"
          />
          <button
            type="button"
            onClick={() => logout()}
            className="flex items-center justify-center px-3 text-fg-muted transition hover:bg-elevated/60 hover:text-fg"
            title="Se déconnecter"
            aria-label="Se déconnecter"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="hidden lg:flex lg:items-center">
          <ThemeToggle iconOnly />
        </div>
      </div>
    </header>
  );
}
