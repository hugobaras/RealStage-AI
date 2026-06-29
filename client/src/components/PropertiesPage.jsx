import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Building2, Plus } from "lucide-react";
import MainLayout from "./MainLayout";
import AppShell from "./AppShell";
import SecondaryPageLayout from "./SecondaryPageLayout";
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
        <SecondaryPageLayout title="Projets par bien">
          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
            <Building2 className="mb-4 h-12 w-12 text-fg-subtle" />
            <p className="mt-2 max-w-md text-sm text-fg-muted">
              Un dossier par adresse avec pièces, historique et export groupé —
              forfait Agence.
            </p>
            <Link to="/pricing" className="btn-primary mt-6">
              Voir les forfaits
            </Link>
          </div>
        </SecondaryPageLayout>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <SecondaryPageLayout
        title="Mes biens"
        headerAction={
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="btn-primary flex shrink-0 items-center gap-2 text-sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nouveau bien</span>
            <span className="sm:hidden">Nouveau</span>
          </button>
        }
      >
        <div className="mx-auto w-full max-w-3xl p-4 lg:p-8">
          {loading ? (
            <p className="text-sm text-fg-muted">Chargement…</p>
          ) : properties.length === 0 ? (
            <div className="surface-card rounded-2xl border-dashed px-6 py-10 text-center">
              <Building2 className="mx-auto mb-3 h-10 w-10 text-fg-subtle" />
              <p className="text-sm text-fg-muted">
                Aucun bien pour le moment.
              </p>
              <p className="mt-1 text-xs text-fg-subtle">
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
                    className="surface-card flex w-full items-center justify-between px-4 py-3 text-left transition hover:border-accent/40"
                  >
                    <div>
                      <p className="font-medium text-fg">{p.label}</p>
                      <p className="text-sm text-fg-muted">{p.address}</p>
                    </div>
                    <span className="text-xs text-fg-muted">
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
      </SecondaryPageLayout>

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
