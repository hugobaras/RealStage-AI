import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { fetchAdminReports, patchAdminReport } from "../../api/admin";

const REASON_LABELS = {
  non_conforme: "Résultat non conforme",
  quality: "Qualité insuffisante",
  architecture: "Architecture / proportions incorrectes",
  furniture: "Meubles irréalistes ou mal placés",
  style: "Style incorrect",
  artifacts: "Artefacts visuels",
  other: "Autre",
};

export default function AdminReportsPage() {
  const { getIdToken } = useAuth();
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("open");
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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getIdToken, filter]);

  useEffect(() => {
    load();
  }, [load]);

  const resolve = async (id) => {
    try {
      const idToken = await getIdToken();
      await patchAdminReport(idToken, id, { status: "resolved" });
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
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-xl border border-line bg-elevated px-3 py-2 text-sm text-fg"
        >
          <option value="open">Ouverts</option>
          <option value="resolved">Résolus</option>
          <option value="">Tous</option>
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {reports.map((report) => (
          <article key={report.id} className="surface-card rounded-2xl p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium text-fg">
                  {REASON_LABELS[report.reason] ?? report.reason}
                </p>
                <p className="mt-1 text-sm text-fg-muted">
                  {report.userEmail ?? report.userId} — gén.{" "}
                  {report.generationId}
                </p>
                {report.comment && (
                  <p className="mt-2 text-sm text-fg-subtle">
                    {report.comment}
                  </p>
                )}
                {report.generationMeta && (
                  <p className="mt-1 text-xs text-fg-subtle">
                    {report.generationMeta.mode} /{" "}
                    {report.generationMeta.roomType}
                    {report.generationMeta.style
                      ? ` / ${report.generationMeta.style}`
                      : ""}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    report.status === "open"
                      ? "bg-amber-500/20 text-amber-300"
                      : "bg-emerald-500/20 text-emerald-300"
                  }`}
                >
                  {report.status}
                </span>
                {report.status === "open" && (
                  <button
                    type="button"
                    onClick={() => resolve(report.id)}
                    className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white"
                  >
                    Résoudre
                  </button>
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
