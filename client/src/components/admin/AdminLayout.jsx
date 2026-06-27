import { NavLink, Outlet, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Flag,
  Images,
  Settings2,
  ArrowLeft,
} from "lucide-react";

const NAV = [
  { to: "/admin", end: true, icon: LayoutDashboard, label: "Tableau de bord" },
  { to: "/admin/users", icon: Users, label: "Utilisateurs" },
  { to: "/admin/reports", icon: Flag, label: "Signalements" },
  { to: "/admin/generations", icon: Images, label: "Générations" },
  { to: "/admin/catalog", icon: Settings2, label: "Catalogues" },
];

export default function AdminLayout() {
  return (
    <div className="app-themed flex min-h-0 flex-1 overflow-hidden bg-deep">
      <aside className="flex w-56 shrink-0 flex-col overflow-y-auto border-r border-line/80 bg-panel p-4">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">
            Administration
          </p>
          <h1 className="mt-1 text-lg font-bold text-fg">RealStage AI</h1>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map(({ to, end, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
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
          className="mt-4 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-fg-muted transition hover:bg-elevated/80 hover:text-fg"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l&apos;app
        </Link>
      </aside>

      <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
