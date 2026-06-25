import { NavLink } from "react-router-dom";
import { Building2, Settings, CreditCard, User } from "lucide-react";
import { useSubscription } from "../contexts/SubscriptionContext";

const ITEMS = [
  { id: "account", to: "/settings", icon: User, label: "Compte" },
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
    icon: Settings,
    label: "Agence",
    feature: "agencyPresets",
  },
];

export default function MobileAppNav() {
  const { hasFeature } = useSubscription();

  return (
    <nav className="flex shrink-0 gap-1 border-b border-line/80 bg-panel/90 px-2 py-1.5 lg:hidden">
      {ITEMS.filter((item) => !item.feature || hasFeature(item.feature)).map(
        ({ id, to, icon: Icon, label }) => (
          <NavLink
            key={id}
            to={to}
            className={({ isActive }) =>
              `flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold transition ${
                isActive
                  ? "bg-accent/15 text-accent-light"
                  : "text-fg-subtle hover:text-fg"
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ),
      )}
    </nav>
  );
}
