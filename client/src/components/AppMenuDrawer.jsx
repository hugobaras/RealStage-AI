import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Building2,
  CreditCard,
  LogOut,
  Shield,
  Store,
  User,
} from "lucide-react";
import { MODES } from "../constants/modes";
import { useAuth } from "../contexts/AuthContext";
import { useSubscription } from "../contexts/SubscriptionContext";
import { useAdmin } from "../contexts/AdminContext";
import { getModeTabTheme, getSecondaryTabTheme } from "../utils/modeTheme";
import ThemeToggle from "./ThemeToggle";
import Drawer from "./ui/Drawer";
import { NAV_ITEMS } from "./Sidebar";

const SECONDARY_NAV = [
  { id: "account", to: "/settings", icon: User, label: "Mon compte" },
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

function secondaryIsActive(pathname, to) {
  if (to === "/pricing") return pathname === "/pricing";
  if (to === "/properties") return pathname.startsWith("/properties");
  if (to === "/settings") return pathname === "/settings";
  return pathname === to;
}

export default function AppMenuDrawer({
  open,
  onClose,
  activeMode,
  onModeChange,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { hasFeature } = useSubscription();
  const { isAdmin } = useAdmin();

  const isEditor =
    location.pathname === "/" ||
    /^\/properties\/[^/]+$/.test(location.pathname);

  const handleModeClick = (id) => {
    onModeChange?.(id);
    onClose?.();
    if (!isEditor) navigate("/");
  };

  const handleNavClick = () => onClose?.();

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Menu"
      side="left"
      widthClass="w-80 max-w-[90vw]"
    >
      <div className="flex flex-col gap-6 p-4">
        <section>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-fg-subtle">
            Mode
          </p>
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map(({ id, icon: Icon }) => {
              const active = isEditor && activeMode === id;
              const tabTheme = getModeTabTheme(id);
              const label = MODES[id].label;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleModeClick(id)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                    active
                      ? `${tabTheme.bgSubtle} ${tabTheme.text} ring-1 ${tabTheme.border}`
                      : "text-fg-muted hover:bg-elevated/80 hover:text-fg"
                  }`}
                >
                  <Icon
                    className="h-5 w-5 shrink-0"
                    strokeWidth={active ? 2.25 : 1.5}
                  />
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-fg-subtle">
            Navigation
          </p>
          <div className="flex flex-col gap-1">
            {SECONDARY_NAV.filter(
              (item) => !item.feature || hasFeature(item.feature),
            ).map(({ id, to, icon: Icon, label }) => {
              const active = secondaryIsActive(location.pathname, to);
              const tabTheme = getSecondaryTabTheme(id);

              return (
                <NavLink
                  key={id}
                  to={to}
                  onClick={handleNavClick}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                    active
                      ? `${tabTheme.bgSubtle} ${tabTheme.text} ring-1 ${tabTheme.border}`
                      : "text-fg-muted hover:bg-elevated/80 hover:text-fg"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {label}
                </NavLink>
              );
            })}
            {isAdmin && (
              <NavLink
                to="/admin"
                onClick={handleNavClick}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                  location.pathname.startsWith("/admin")
                    ? "bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/30"
                    : "text-fg-muted hover:bg-elevated/80 hover:text-fg"
                }`}
              >
                <Shield className="h-5 w-5 shrink-0" />
                Administration
              </NavLink>
            )}
          </div>
        </section>

        <section className="mt-auto border-t border-line/60 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">
              Apparence
            </span>
            <ThemeToggle compact className="w-auto shrink-0" />
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              onClose?.();
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-fg-muted transition hover:bg-elevated/80 hover:text-fg"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            Se déconnecter
          </button>
        </section>
      </div>
    </Drawer>
  );
}

export function AppMenuDrawerTrigger({ onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line/80 bg-panel/50 text-fg transition hover:bg-elevated/60 md:hidden ${className}`}
      aria-label="Ouvrir le menu"
    >
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>
  );
}
