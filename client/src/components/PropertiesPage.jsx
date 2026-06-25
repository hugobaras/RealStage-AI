import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Building2, Plus } from "lucide-react";
import MainLayout from "./MainLayout";
import AppShell from "./AppShell";
import MobileAppNav from "./MobileAppNav";
import PropertyCreateModal from "./PropertyCreateModal";
import { createProperty, fetchProperties } from "../api/properties";
import { useAuth } from "../contexts/AuthContext";
import { useSubscription } from "../contexts/SubscriptionContext";

export function PropertiesListPage() {
  const { getIdToken } = useAuth();
  const { hasFeature } = useSubscription();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  const loadProperties = async () => {
    const idToken = await getIdToken();
    return fetchProperties(idToken);
  };

  useEffect(() => {
    if (!hasFeature("multiProjects")) return;
    let cancelled = false;
    (async () => {
      try {
        const list = await loadProperties();
        if (!cancelled) setProperties(list);
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getIdToken, hasFeature]);

  const handleCreate = async ({ label, address }) => {
    setCreating(true);
    setCreateError(null);
    try {
      const idToken = await getIdToken();
      const property = await createProperty(idToken, { label, address });
      setProperties((prev) => [property, ...prev]);
      setCreateOpen(false);
      navigate(`/properties/${property.id}`);
    } catch (err) {
      setCreateError(err.message || "Impossible de créer le bien.");
    } finally {
      setCreating(false);
    }
  };

  if (!hasFeature("multiProjects")) {
    return (
      <AppShell>
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto bg-deep p-6 text-center">
          <MobileAppNav />
          <Building2 className="mb-4 h-12 w-12 text-zinc-600" />
          <h1 className="text-xl font-bold text-white">Projets par bien</h1>
          <p className="mt-2 max-w-md text-sm text-zinc-400">
            Un dossier par adresse avec pièces, historique et export groupé —
            forfait Agence.
          </p>
          <Link to="/pricing" className="btn-primary mt-6">
            Voir les forfaits
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-deep">
        <MobileAppNav />
        <header className="flex items-center justify-between gap-4 border-b border-zinc-800 bg-panel px-4 py-4 lg:px-8">
          <h1 className="text-2xl font-bold text-white">Mes biens</h1>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus className="h-4 w-4" />
            Nouveau bien
          </button>
        </header>
        <div className="mx-auto w-full max-w-3xl p-4 lg:p-8">
          {loading ? (
            <p className="text-sm text-zinc-500">Chargement…</p>
          ) : properties.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-800 bg-panel/50 px-6 py-10 text-center">
              <Building2 className="mx-auto mb-3 h-10 w-10 text-zinc-600" />
              <p className="text-sm text-zinc-400">
                Aucun bien pour le moment.
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Créez un dossier par adresse pour regrouper pièces, historique
                et exports.
              </p>
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="btn-primary mt-5 inline-flex items-center gap-2 text-sm"
              >
                <Plus className="h-4 w-4" />
                Créer un bien
              </button>
            </div>
          ) : (
            <ul className="space-y-2">
              {properties.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => navigate(`/properties/${p.id}`)}
                    className="flex w-full items-center justify-between rounded-xl border border-zinc-800 bg-panel px-4 py-3 text-left transition hover:border-accent/40"
                  >
                    <div>
                      <p className="font-medium text-white">{p.label}</p>
                      <p className="text-sm text-zinc-500">{p.address}</p>
                    </div>
                    <span className="text-xs text-zinc-500">
                      {p.generationCount ?? 0} génération(s)
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {createError && (
            <p className="mt-4 text-sm text-red-400">{createError}</p>
          )}
        </div>
      </div>

      <PropertyCreateModal
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setCreateError(null);
        }}
        onCreate={handleCreate}
        loading={creating}
      />
    </AppShell>
  );
}

export default function PropertyWorkspacePage() {
  const { id } = useParams();
  const { hasFeature } = useSubscription();

  if (!hasFeature("multiProjects")) {
    return <PropertiesListPage />;
  }

  return <MainLayout propertyIdFromRoute={id} />;
}
