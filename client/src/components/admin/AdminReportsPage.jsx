import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  batchAdminReports,
  banReportAuthor,
  fetchAdminReports,
  patchAdminReport,
} from "../../api/admin";

const REASON_LABELS = {
  non_conforme: "Résultat non conforme",
  quality: "Qualité insuffisante",
  architecture: "Architecture / proportions incorrectes",
  furniture: "Meubles irréalistes ou mal placés",
  style: "Style incorrect",
  artifacts: "Artefacts visuels",
  other: "Autre",
};

const STATUS_LABELS = {
  open: "Ouvert",
  resolved: "Traité",
  rejected: "Rejeté",
  escalated: "Escaladé",
};

export default function AdminReportsPage() {
  const { getIdToken } = useAuth();
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("open");
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const idToken = await getIdToken();
      const data = await fetchAdminReports(idToken, {
        status: filter || undefined,
      });
      setReports(data.reports);
      setSelected(new Set());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getIdToken, filter]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const runBatch = async (action) => {
    if (!selected.size) return;
    try {
      const idToken = await getIdToken();
      await batchAdminReports(idToken, {
        ids: [...selected],
        action,
      });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const resolveOne = async (id, status) => {
    try {
      const idToken = await getIdToken();
      await patchAdminReport(idToken, id, { status });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const banAuthor = async (id) => {
    if (!window.confirm("Suspendre l'auteur de cette génération ?")) return;
    try {
      const idToken = await getIdToken();
      await banReportAuthor(idToken, id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-fg">Signalements</h2>
          <p className="mt-1 text-sm text-fg-muted">File de modération</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-xl border border-line bg-elevated px-3 py-2 text-sm text-fg"
          >
            <option value="open">Ouverts</option>
            <option value="resolved">Traités</option>
            <option value="rejected">Rejetés</option>
            <option value="">Tous</option>
          </select>
          {selected.size > 0 && (
            <>
              <button
                type="button"
                onClick={() => runBatch("resolve")}
                className="rounded-xl bg-accent px-3 py-2 text-sm text-white"
              >
                Traiter ({selected.size})
              </button>
              <button
                type="button"
                onClick={() => runBatch("reject")}
                className="rounded-xl bg-elevated px-3 py-2 text-sm text-fg"
              >
                Rejeter ({selected.size})
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {reports.map((report) => (
          <article key={report.id} className="surface-card rounded-2xl p-5">
            <div className="flex flex-wrap gap-4">
              <input
                type="checkbox"
                checked={selected.has(report.id)}
                onChange={() => toggleSelect(report.id)}
                className="mt-1"
              />
              {report.generation?.imageUrl && (
                <img
                  src={report.generation.imageUrl}
                  alt="Génération signalée"
                  className="h-24 w-32 rounded-lg object-cover"
                />
              )}
              {report.generation?.baseImageUrl && (
                <img
                  src={report.generation.baseImageUrl}
                  alt="Image source"
                  className="h-24 w-32 rounded-lg object-cover opacity-80"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-fg">
                  {REASON_LABELS[report.reason] ?? report.reason}
                </p>
                <p className="mt-1 text-sm text-fg-muted">
                  Signalé par : {report.userEmail ?? report.userId}
                </p>
                <p className="text-xs text-fg-subtle">
                  Génération : {report.generationId}
                  {report.generationOwnerUid && (
                    <>
                      {" "}
                      —{" "}
                      <Link
                        to={`/admin/users/${report.generationOwnerUid}`}
                        className="text-accent-light hover:underline"
                      >
                        Voir auteur
                      </Link>
                    </>
                  )}
                </p>
                {report.comment && (
                  <p className="mt-2 text-sm text-fg-subtle">
                    {report.comment}
                  </p>
                )}
                <span className="mt-2 inline-block rounded-full bg-elevated px-2 py-0.5 text-xs text-fg-muted">
                  {STATUS_LABELS[report.status] ?? report.status}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {report.status === "open" && (
                  <>
                    <button
                      type="button"
                      onClick={() => resolveOne(report.id, "resolved")}
                      className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white"
                    >
                      Traiter
                    </button>
                    <button
                      type="button"
                      onClick={() => resolveOne(report.id, "rejected")}
                      className="rounded-lg bg-elevated px-3 py-1.5 text-xs text-fg"
                    >
                      Rejeter
                    </button>
                    <button
                      type="button"
                      onClick={() => banAuthor(report.id)}
                      className="rounded-lg bg-red-500/15 px-3 py-1.5 text-xs text-red-300"
                    >
                      Bannir auteur
                    </button>
                  </>
                )}
              </div>
            </div>
          </article>
        ))}

        {loading && (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-accent" />
          </div>
        )}

        {!loading && reports.length === 0 && (
          <p className="py-12 text-center text-sm text-fg-muted">
            Aucun signalement.
          </p>
        )}
      </div>
    </div>
  );
}
