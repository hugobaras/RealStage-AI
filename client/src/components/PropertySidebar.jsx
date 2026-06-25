import { Link, useNavigate } from "react-router-dom";
import { Building2, ChevronRight, Plus, Settings } from "lucide-react";
import { useSubscription } from "../contexts/SubscriptionContext";

export default function PropertySidebar({
  properties,
  activePropertyId,
  onSelect,
  onCreateClick,
}) {
  const { hasFeature } = useSubscription();
  const navigate = useNavigate();

  if (!hasFeature("multiProjects")) {
    return (
      <div className="hidden border-b border-zinc-800/80 bg-panel/50 px-4 py-3 lg:block">
        <p className="text-xs text-zinc-500">
          <Link to="/pricing" className="text-accent-light hover:underline">
            Forfait Agence
          </Link>{" "}
          — dossiers par adresse, historique et export groupé.
        </p>
      </div>
    );
  }

  return (
    <div className="hidden shrink-0 border-b border-zinc-800/80 bg-panel/50 lg:block">
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Mes biens
        </span>
        <div className="flex gap-1">
          <Link
            to="/settings/agency"
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-white"
            title="Paramètres agence"
          >
            <Settings className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={onCreateClick}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-white"
            title="Nouveau bien"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="max-h-36 overflow-y-auto px-2 pb-2 scrollbar-thin">
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={`mb-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition ${
            !activePropertyId
              ? "bg-accent/15 text-accent-light ring-1 ring-accent/30"
              : "text-zinc-400 hover:bg-zinc-800/80 hover:text-white"
          }`}
        >
          <Building2 className="h-4 w-4 shrink-0 opacity-60" />
          <span className="truncate">Tous / Sans bien</span>
        </button>
        {properties.map((property) => (
          <button
            key={property.id}
            type="button"
            onClick={() => {
              onSelect(property.id);
              navigate(`/properties/${property.id}`);
            }}
            className={`mb-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition ${
              activePropertyId === property.id
                ? "bg-accent/15 text-accent-light ring-1 ring-accent/30"
                : "text-zinc-400 hover:bg-zinc-800/80 hover:text-white"
            }`}
          >
            <Building2 className="h-4 w-4 shrink-0 opacity-60" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{property.label}</p>
              {property.address && property.address !== property.label && (
                <p className="truncate text-xs opacity-70">
                  {property.address}
                </p>
              )}
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 opacity-40" />
          </button>
        ))}
      </div>
    </div>
  );
}
