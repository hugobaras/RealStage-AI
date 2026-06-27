import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Sofa,
  Trash2,
  Building2,
  Store,
  CreditCard,
  ArrowLeftRight,
  Shield,
} from "lucide-react";
import { MODES } from "../constants/modes";
import { useSubscription } from "../contexts/SubscriptionContext";
import { useAdmin } from "../contexts/AdminContext";
import {
  getModeTabTheme,
  getModeTheme,
  getSecondaryTabTheme,
} from "../utils/modeTheme";
import ThemeToggle from "./ThemeToggle";

export const NAV_ITEMS = [
  { id: "meubler", icon: Sofa },
  { id: "remplacer", icon: ArrowLeftRight },
  { id: "desencombrer", icon: Trash2 },
];

const SECONDARY_NAV = [
  { id: "plan", to: "/pricing", icon: CreditCard, label: "Plan" },
  {
    id: "properties",
    to: "/properties",
    icon: Building2,
    label: "Biens",
    feature: "multiProjects",
  },
  {
    id: "agency",
    to: "/settings/agency",
    icon: Store,
    label: "Agence",
    feature: "agencyPresets",
  },
];

const SIDEBAR_WIDTH = "w-24";

function secondaryIsActive(pathname, to) {
  if (to === "/pricing") return pathname === "/pricing";
  if (to === "/properties") return pathname.startsWith("/properties");
  if (to === "/settings") return pathname === "/settings";
  return pathname === to;
}

function ModeNavButton({ id, icon: Icon, active, onClick }) {
  const config = MODES[id];
  const tabTheme = getModeTabTheme(id);
  const navLabel = config.navLabel ?? config.label;

  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className={`group relative flex flex-col items-center gap-1 rounded-xl px-1.5 py-2.5 transition-all ${
        active
          ? `${tabTheme.bgSubtle} ${tabTheme.text} ring-1 ${tabTheme.border} ${tabTheme.shadow}`
          : "text-fg-subtle hover:bg-elevated/80 hover:text-fg"
      }`}
      title={config.label}
      aria-label={config.label}
      aria-current={active ? "page" : undefined}
    >
      {active && (
        <span
          className={`absolute -left-2 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full ${tabTheme.navIndicator}`}
        />
      )}
      <Icon
        className={`h-5 w-5 ${active ? "" : "opacity-70 group-hover:opacity-100"}`}
        strokeWidth={active ? 2.25 : 1.5}
      />
      <span className="max-w-full text-center text-[10px] font-semibold leading-tight">
        {navLabel}
      </span>
    </button>
  );
}

export default function Sidebar({ activeMode, onModeChange }) {
  const activeTheme = getModeTheme(activeMode);
  const { hasFeature } = useSubscription();
  const { isAdmin } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();
  const isEditor =
    location.pathname === "/" ||
    /^\/properties\/[^/]+$/.test(location.pathname);

  const handleModeClick = (id) => {
    onModeChange?.(id);
    if (!isEditor) navigate("/");
  };

  return (
    <aside
      className={`relative hidden h-full ${SIDEBAR_WIDTH} shrink-0 flex-col items-center border-r border-line/80 bg-panel py-5 lg:flex`}
    >
      <Link
        to="/"
        className={`mb-6 flex h-11 w-11 items-center justify-center rounded-2xl ${
          isEditor && activeTheme.logoActive
            ? activeTheme.logoActive
            : "bg-gradient-to-br from-accent/30 to-accent-light/10 shadow-lg shadow-accent/20 ring-1 ring-accent/30"
        }`}
        title="Accueil"
      >
        <img
          src="/realstage-logo.png"
          alt="RealStage AI"
          className="h-8 w-8 object-contain"
        />
      </Link>

      <nav
        aria-label="Mode"
        className="flex w-full flex-col items-stretch px-2"
      >
        <div className="flex flex-col gap-1 rounded-2xl border border-line/80 bg-elevated/40 p-1">
          {NAV_ITEMS.map(({ id, icon }) => (
            <ModeNavButton
              key={id}
              id={id}
              icon={icon}
              active={isEditor && activeMode === id}
              onClick={handleModeClick}
            />
          ))}
        </div>
      </nav>

      <div className="mt-auto flex w-full flex-col gap-2 px-2 pb-2">
        <div className="my-2 border-t border-line/60" aria-hidden="true" />
        <ThemeToggle compact />
        {SECONDARY_NAV.filter(
          (item) => !item.feature || hasFeature(item.feature),
        ).map(({ id, to, icon: Icon, label }) => {
          const active = secondaryIsActive(location.pathname, to);
          const tabTheme = getSecondaryTabTheme(id);

          return (
            <NavLink
              key={id}
              to={to}
              className={`relative flex flex-col items-center gap-1.5 rounded-2xl px-2 py-3 transition ${
                active
                  ? `${tabTheme.bgSubtle} ${tabTheme.text} ring-1 ${tabTheme.border}`
                  : "text-fg-subtle hover:bg-elevated/80 hover:text-fg"
              }`}
              title={label}
            >
              {active && (
                <span
                  className={`absolute -left-2 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full ${tabTheme.navIndicator}`}
                />
              )}
              <Icon className="h-5 w-5" />
              <span className="max-w-full truncate text-center text-[10px] font-semibold leading-tight">
                {label}
              </span>
            </NavLink>
          );
        })}
        {isAdmin && (
          <NavLink
            to="/admin"
            className={`relative flex flex-col items-center gap-1.5 rounded-2xl px-2 py-3 transition ${
              location.pathname.startsWith("/admin")
                ? "bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/30"
                : "text-fg-subtle hover:bg-elevated/80 hover:text-fg"
            }`}
            title="Administration"
          >
            <Shield className="h-5 w-5" />
            <span className="max-w-full truncate text-center text-[10px] font-semibold leading-tight">
              Admin
            </span>
          </NavLink>
        )}
      </div>
    </aside>
  );
}
