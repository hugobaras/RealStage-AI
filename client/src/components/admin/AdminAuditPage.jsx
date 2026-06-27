import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { fetchAdminAudit } from "../../api/admin";

const ACTION_LABELS = {
  patch_user: "Modification utilisateur",
  grant_admin: "Grant admin",
  revoke_admin: "Retrait admin",
  delete_generation: "Suppression génération",
  update_report: "Mise à jour signalement",
  update_config: "Modification catalogue",
  seed_config: "Réinitialisation catalogue",
  sync_stripe: "Sync Stripe",
  force_logout: "Déconnexion forcée",
  credit_usage: "Crédit usage",
};

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("fr-FR");
}

export default function AdminAuditPage() {
  const { getIdToken } = useAuth();
  const [entries, setEntries] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [adminUid, setAdminUid] = useState("");
  const [action, setAction] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(
    async (cursor = null, append = false) => {
      setLoading(true);
      setError(null);
      try {
        const idToken = await getIdToken();
        const data = await fetchAdminAudit(idToken, {
          adminUid: adminUid.trim() || undefined,
          action: action || undefined,
          from: from || undefined,
          to: to ? `${to}T23:59:59` : undefined,
          cursor: cursor || undefined,
        });
        setEntries((prev) =>
          append ? [...prev, ...data.entries] : data.entries,
        );
        setNextCursor(data.nextCursor);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [getIdToken, adminUid, action, from, to],
  );

  useEffect(() => {
    const timer = setTimeout(() => load(), 300);
    return () => clearTimeout(timer);
  }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-fg">Journal d&apos;audit</h2>
        <p className="mt-1 text-sm text-fg-muted">
          Historique des actions administrateur
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          value={adminUid}
          onChange={(e) => setAdminUid(e.target.value)}
          placeholder="UID admin"
          className="rounded-xl border border-line bg-elevated px-3 py-2 text-sm text-fg"
        />
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="rounded-xl border border-line bg-elevated px-3 py-2 text-sm text-fg"
        >
          <option value="">Toutes les actions</option>
          {Object.entries(ACTION_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="rounded-xl border border-line bg-elevated px-3 py-2 text-sm text-fg"
        />
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="rounded-xl border border-line bg-elevated px-3 py-2 text-sm text-fg"
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="surface-card overflow-hidden rounded-2xl">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line/80 bg-elevated/40 text-fg-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Admin</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Cible</th>
              <th className="px-4 py-3 font-medium">Détails</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={entry.id}
                className="border-b border-line/40 hover:bg-elevated/30"
              >
                <td className="px-4 py-3 text-fg-muted">
                  {formatDate(entry.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="text-fg">{entry.adminEmail ?? "—"}</div>
                  <div className="text-xs text-fg-subtle">{entry.adminUid}</div>
                </td>
                <td className="px-4 py-3 text-fg">
                  {ACTION_LABELS[entry.action] ?? entry.action}
                </td>
                <td className="px-4 py-3">
                  <code className="text-xs text-fg-muted">{entry.target}</code>
                </td>
                <td className="px-4 py-3">
                  {entry.details ? (
                    <button
                      type="button"
                      onClick={() =>
                        setExpanded(expanded === entry.id ? null : entry.id)
                      }
                      className="text-xs text-accent-light hover:underline"
                    >
                      {expanded === entry.id ? "Masquer" : "Voir"}
                    </button>
                  ) : (
                    "—"
                  )}
                  {expanded === entry.id && (
                    <pre className="mt-2 max-w-xs overflow-x-auto rounded bg-elevated p-2 text-xs text-fg-muted">
                      {JSON.stringify(entry.details, null, 2)}
                    </pre>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-accent" />
          </div>
        )}

        {!loading && entries.length === 0 && (
          <p className="py-8 text-center text-sm text-fg-muted">
            Aucune entrée d&apos;audit.
          </p>
        )}
      </div>

      {nextCursor && (
        <button
          type="button"
          onClick={() => load(nextCursor, true)}
          disabled={loading}
          className="rounded-xl bg-elevated px-4 py-2 text-sm font-medium text-fg hover:bg-elevated/80 disabled:opacity-50"
        >
          Charger plus
        </button>
      )}
    </div>
  );
}
