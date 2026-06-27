import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  fetchAdminStats,
  fetchHealth,
  fetchAiLabelCompliance,
} from "../../api/admin";

function StatCard({ label, value, sub }) {
  return (
    <div className="surface-card rounded-2xl p-5">
      <p className="text-sm text-fg-muted">{label}</p>
      <p className="mt-2 text-3xl font-bold text-fg">{value}</p>
      {sub && <p className="mt-1 text-xs text-fg-subtle">{sub}</p>}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { getIdToken } = useAuth();
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [compliance, setCompliance] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const idToken = await getIdToken();
        const [statsData, healthData, complianceData] = await Promise.all([
          fetchAdminStats(idToken),
          fetchHealth(),
          fetchAiLabelCompliance(idToken),
        ]);
        if (!cancelled) {
          setStats(statsData.stats);
          setHealth(healthData);
          setCompliance(complianceData.stats);
        }
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

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-accent" />
      </div>
    );
  }

  const maxGen = Math.max(...stats.generationsLast7Days.map((d) => d.count), 1);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-fg">Tableau de bord</h2>
        <p className="mt-1 text-sm text-fg-muted">
          Vue d&apos;ensemble de la plateforme — {stats.monthKey}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Utilisateurs" value={stats.totalUsers} />
        <StatCard
          label="Actifs ce mois"
          value={stats.activeUsersThisMonth}
          sub="Au moins 1 génération"
        />
        <StatCard
          label="Générations ce mois"
          value={stats.generationsThisMonth}
        />
        <StatCard label="Signalements ouverts" value={stats.openReports} />
        {compliance && (
          <StatCard
            label="Mention IA activée"
            value={`${compliance.percentEnabled}%`}
            sub={`${compliance.labelEnabledCount} / ${compliance.totalUsers} utilisateurs`}
          />
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="surface-card rounded-2xl p-5">
          <h3 className="mb-4 text-sm font-semibold text-fg">
            Générations — 7 derniers jours
          </h3>
          <div className="flex h-40 items-end gap-2">
            {stats.generationsLast7Days.map((day) => (
              <div
                key={day.date}
                className="flex flex-1 flex-col items-center gap-1"
              >
                <div
                  className="w-full rounded-t bg-accent/70"
                  style={{
                    height: `${Math.max(4, (day.count / maxGen) * 100)}%`,
                  }}
                  title={`${day.count} générations`}
                />
                <span className="text-[10px] text-fg-subtle">
                  {day.date.slice(5)}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="surface-card rounded-2xl p-5">
          <h3 className="mb-4 text-sm font-semibold text-fg">
            Répartition des forfaits
          </h3>
          <ul className="space-y-2 text-sm">
            {Object.entries(stats.planDistribution).map(([plan, count]) => (
              <li
                key={plan}
                className="flex items-center justify-between rounded-lg bg-elevated/50 px-3 py-2"
              >
                <span className="capitalize text-fg-muted">{plan}</span>
                <span className="font-semibold text-fg">{count}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {health && (
        <section className="surface-card rounded-2xl p-5">
          <h3 className="mb-4 text-sm font-semibold text-fg">Santé API</h3>
          <div className="grid gap-3 sm:grid-cols-3 text-sm">
            <div className="rounded-lg bg-elevated/50 px-3 py-2">
              <span className="text-fg-muted">Fal.ai</span>
              <p className="font-medium text-fg">
                {health.fal?.configured ? "Configuré" : "Non configuré"}
              </p>
            </div>
            <div className="rounded-lg bg-elevated/50 px-3 py-2">
              <span className="text-fg-muted">Firebase</span>
              <p className="font-medium text-fg">
                {health.firebase?.configured ? "Configuré" : "Non configuré"}
              </p>
            </div>
            <div className="rounded-lg bg-elevated/50 px-3 py-2">
              <span className="text-fg-muted">Stripe</span>
              <p className="font-medium text-fg">
                {health.stripe?.configured ? "Configuré" : "Non configuré"}
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
