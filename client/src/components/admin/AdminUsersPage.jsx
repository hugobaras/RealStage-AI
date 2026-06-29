import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { fetchAdminUsers } from "../../api/admin";
import AdminDataTable from "./AdminDataTable";

function planLabel(user) {
  const sub = user.subscription ?? {};
  if (sub.status === "active" && sub.planId) return sub.planId;
  if ((user.trialUsed ?? 0) < 3) return "essai";
  return sub.status ?? "aucun";
}

export default function AdminUsersPage() {
  const { getIdToken } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(
    async (token = null, append = false) => {
      setLoading(true);
      setError(null);
      try {
        const idToken = await getIdToken();
        const data = await fetchAdminUsers(idToken, {
          search: search.trim() || undefined,
          pageToken: token,
        });
        setUsers((prev) => (append ? [...prev, ...data.users] : data.users));
        setNextPageToken(data.nextPageToken);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [getIdToken, search],
  );

  useEffect(() => {
    const timer = setTimeout(() => load(), 300);
    return () => clearTimeout(timer);
  }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-fg">Utilisateurs</h2>
        <p className="mt-1 text-sm text-fg-muted">
          Gestion des comptes et abonnements
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par e-mail, nom, UID… (recherche globale : Stripe ID, ID génération)"
          className="w-full rounded-xl border border-line bg-elevated py-2.5 pl-10 pr-4 text-sm text-fg outline-none ring-accent/40 focus:ring-2"
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <AdminDataTable
        loading={loading}
        rows={users}
        rowKey={(user) => user.uid}
        emptyMessage="Aucun utilisateur trouvé."
        columns={[
          {
            key: "email",
            label: "E-mail",
            render: (user) => (
              <>
                <Link
                  to={`/admin/users/${user.uid}`}
                  className="font-medium text-accent-light hover:underline"
                >
                  {user.email ?? user.uid}
                </Link>
                {user.disabled && (
                  <span className="ml-2 rounded bg-red-500/20 px-1.5 py-0.5 text-[10px] text-red-300">
                    désactivé
                  </span>
                )}
              </>
            ),
          },
          {
            key: "plan",
            label: "Forfait",
            render: (user) => (
              <span className="capitalize">{planLabel(user)}</span>
            ),
          },
          {
            key: "usage",
            label: "Usage mois",
            render: (user) => user.usage?.count ?? 0,
          },
          {
            key: "generations",
            label: "Générations",
            render: (user) => user.generationCount ?? 0,
          },
          {
            key: "admin",
            label: "Admin",
            render: (user) => (user.admin ? "oui" : "—"),
          },
        ]}
      />

      {nextPageToken && !search && (
        <button
          type="button"
          onClick={() => load(nextPageToken, true)}
          className="rounded-xl bg-elevated px-4 py-2 text-sm font-medium text-fg hover:bg-elevated/80"
        >
          Charger plus
        </button>
      )}
    </div>
  );
}
