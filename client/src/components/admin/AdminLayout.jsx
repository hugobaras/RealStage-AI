import { useState } from "react";
import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Flag,
  Images,
  Settings2,
  ArrowLeft,
  ScrollText,
  CreditCard,
  Search,
  Shield,
  Building2,
  Sliders,
  Megaphone,
  Bell,
  FlaskConical,
  Menu,
} from "lucide-react";
import Drawer from "../ui/Drawer";

const NAV = [
  { to: "/admin", end: true, icon: LayoutDashboard, label: "Tableau de bord" },
  { to: "/admin/users", icon: Users, label: "Utilisateurs" },
  { to: "/admin/agencies", icon: Building2, label: "Agences" },
  { to: "/admin/stripe", icon: CreditCard, label: "Stripe" },
  { to: "/admin/audit", icon: ScrollText, label: "Journal d'audit" },
  { to: "/admin/reports", icon: Flag, label: "Signalements" },
  { to: "/admin/generations", icon: Images, label: "Générations" },
  { to: "/admin/blacklist", icon: Shield, label: "Liste noire" },
  { to: "/admin/catalog", icon: Settings2, label: "Catalogues" },
  { to: "/admin/platform", icon: Sliders, label: "Plateforme" },
  { to: "/admin/tuning-lab", icon: FlaskConical, label: "Tuning lab" },
  { to: "/admin/marketing", icon: Megaphone, label: "Marketing" },
  { to: "/admin/announcements", icon: Megaphone, label: "Annonces" },
  { to: "/admin/admins", icon: Shield, label: "Admins" },
  { to: "/admin/notifications", icon: Bell, label: "Notifications" },
];

function AdminNav({ onNavigate }) {
  return (
    <>
      <div className="mb-6 px-4 pt-4 md:px-0 md:pt-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">
          Administration
        </p>
        <h1 className="mt-1 text-lg font-bold text-fg">RealStage AI</h1>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-2 md:px-0">
        {NAV.map(({ to, end, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-accent/15 text-accent-light ring-1 ring-accent/30"
                  : "text-fg-muted hover:bg-elevated/80 hover:text-fg"
              }`
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <Link
        to="/"
        onClick={onNavigate}
        className="mx-2 mt-4 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-fg-muted transition hover:bg-elevated/80 hover:text-fg md:mx-0"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à l&apos;app
      </Link>
    </>
  );
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      navigate(`/admin/search?q=${encodeURIComponent(q)}`);
      setSearchExpanded(false);
    }
  };

  return (
    <div className="layout-shell app-themed bg-deep">
      <aside className="hidden w-56 shrink-0 flex-col overflow-y-auto border-r border-line/80 bg-panel p-4 lg:flex">
        <AdminNav />
      </aside>

      <Drawer
        open={navOpen}
        onClose={() => setNavOpen(false)}
        title="Administration"
        side="left"
        widthClass="w-72 max-w-[90vw]"
      >
        <div className="flex h-full flex-col pb-4">
          <AdminNav onNavigate={() => setNavOpen(false)} />
        </div>
      </Drawer>

      <div className="layout-main">
        <header className="flex shrink-0 items-center gap-2 border-b border-line/80 bg-panel/50 px-3 py-2.5 md:px-6 md:py-3 lg:px-8">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line/80 text-fg transition hover:bg-elevated/60 lg:hidden"
            aria-label="Ouvrir la navigation admin"
          >
            <Menu className="h-5 w-5" />
          </button>

          {!searchExpanded && (
            <button
              type="button"
              onClick={() => setSearchExpanded(true)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line/80 text-fg transition hover:bg-elevated/60 md:hidden"
              aria-label="Rechercher"
            >
              <Search className="h-4 w-4" />
            </button>
          )}

          <form
            onSubmit={handleSearch}
            className={`relative ${searchExpanded ? "flex-1" : "hidden max-w-xl flex-1 md:block"}`}
          >
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Recherche globale…"
              className="w-full rounded-xl border border-line bg-elevated py-2 pl-10 pr-4 text-sm text-fg outline-none ring-accent/40 focus:ring-2"
            />
          </form>

          {searchExpanded && (
            <button
              type="button"
              onClick={() => setSearchExpanded(false)}
              className="shrink-0 text-xs text-fg-muted md:hidden"
            >
              Annuler
            </button>
          )}
        </header>

        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
