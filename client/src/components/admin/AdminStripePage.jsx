import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { fetchAdminStripe } from "../../api/admin";

function StatCard({ label, value, sub }) {
  return (
    <div className="surface-card rounded-2xl p-5">
      <p className="text-sm text-fg-muted">{label}</p>
      <p className="mt-2 text-3xl font-bold text-fg">{value}</p>
      {sub && <p className="mt-1 text-xs text-fg-subtle">{sub}</p>}
    </div>
  );
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("fr-FR");
}

export default function AdminStripePage() {
  const { getIdToken } = useAuth();
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const idToken = await getIdToken();
        const data = await fetchAdminStripe(idToken);
        if (!cancelled) setOverview(data.overview);
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getIdToken]);

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
        {error}
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-accent" />
      </div>
    );
  }

  const counts = overview.subscriptionCounts ?? {};

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-fg">Stripe</h2>
          <p className="mt-1 text-sm text-fg-muted">Abonnements et webhooks</p>
        </div>
        {overview.dashboardUrl && (
          <a
            href={overview.dashboardUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white"
          >
            Ouvrir Stripe Dashboard
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>

      {!overview.stripeConfigured && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
          Stripe n&apos;est pas configuré sur ce serveur.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="MRR estimé"
          value={`${overview.estimatedMrr ?? 0} €`}
          sub="Basé sur forfaits actifs Firestore"
        />
        <StatCard label="Actifs" value={counts.active ?? 0} />
        <StatCard label="Past due" value={counts.past_due ?? 0} />
        <StatCard label="Annulés" value={counts.canceled ?? 0} />
        <StatCard label="Sans abonnement" value={counts.none ?? 0} />
      </div>

      {(overview.pastDueUsers ?? []).length > 0 && (
        <section className="surface-card overflow-x-auto rounded-2xl">
          <h3 className="border-b border-line/80 px-4 py-3 font-semibold text-fg">
            Abonnements past_due
          </h3>
          <table className="w-full text-left text-sm">
            <tbody>
              {overview.pastDueUsers.map((u) => (
                <tr key={u.uid} className="border-b border-line/40">
                  <td className="px-4 py-3">
                    <Link
                      to={`/admin/users/${u.uid}`}
                      className="text-accent-light hover:underline"
                    >
                      {u.email ?? u.uid}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-fg-muted">{u.planId ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section className="surface-card overflow-x-auto rounded-2xl">
        <h3 className="border-b border-line/80 px-4 py-3 font-semibold text-fg">
          Derniers webhooks reçus
        </h3>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line/80 bg-elevated/40 text-fg-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">UID</th>
              <th className="px-4 py-3 font-medium">Erreur</th>
            </tr>
          </thead>
          <tbody>
            {(overview.webhooks ?? []).map((wh) => (
              <tr
                key={wh.id}
                className="border-b border-line/40 hover:bg-elevated/30"
              >
                <td className="px-4 py-3 text-fg-muted">
                  {formatDate(wh.createdAt)}
                </td>
                <td className="px-4 py-3 text-fg">{wh.type}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${
                      wh.status === "success"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-red-500/20 text-red-300"
                    }`}
                  >
                    {wh.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {wh.uid ? (
                    <Link
                      to={`/admin/users/${wh.uid}`}
                      className="text-accent-light hover:underline"
                    >
                      {wh.uid.slice(0, 8)}…
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-red-300">
                  {wh.error ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!overview.webhooks || overview.webhooks.length === 0) && (
          <p className="py-8 text-center text-sm text-fg-muted">
            Aucun webhook journalisé pour l&apos;instant.
          </p>
        )}
      </section>
    </div>
  );
}
