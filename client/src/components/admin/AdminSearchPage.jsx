import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { fetchAdminSearch } from "../../api/admin";

function planLabel(user) {
  const sub = user.subscription ?? {};
  if (sub.status === "active" && sub.planId) return sub.planId;
  if ((user.trialUsed ?? 0) < 3) return "essai";
  return sub.status ?? "aucun";
}

export default function AdminSearchPage() {
  const { getIdToken } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [results, setResults] = useState([]);
  const [searchedQuery, setSearchedQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runSearch = async (q) => {
    const trimmed = q.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setSearchedQuery(trimmed);
    setSearchParams({ q: trimmed });

    try {
      const idToken = await getIdToken();
      const data = await fetchAdminSearch(idToken, trimmed);
      setResults(data.results ?? []);
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
      runSearch(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    runSearch(query);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-fg">Recherche globale</h2>
        <p className="mt-1 text-sm text-fg-muted">
          Email, UID, Stripe Customer ID, ID génération
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Email, UID, cus_…, sub_…, ID génération…"
          className="w-full rounded-xl border border-line bg-elevated py-2.5 pl-10 pr-4 text-sm text-fg outline-none ring-accent/40 focus:ring-2"
        />
      </form>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-accent" />
        </div>
      )}

      {!loading && searchedQuery && results.length === 0 && (
        <p className="text-sm text-fg-muted">
          Aucun résultat pour « {searchedQuery} ».
        </p>
      )}

      <div className="space-y-4">
        {results.map((result, idx) => {
          if (result.type === "user") {
            const user = result.user;
            return (
              <div
                key={`user-${user.uid}-${idx}`}
                className="surface-card rounded-2xl p-4"
              >
                <p className="text-xs font-semibold uppercase text-fg-subtle">
                  Utilisateur
                </p>
                <Link
                  to={`/admin/users/${user.uid}`}
                  className="mt-1 block text-lg font-medium text-accent-light hover:underline"
                >
                  {user.email ?? user.uid}
                </Link>
                <p className="mt-1 text-sm text-fg-muted">
                  Forfait : {planLabel(user)} — UID : {user.uid}
                </p>
              </div>
            );
          }

          if (result.type === "users") {
            return (
              <div
                key={`users-${idx}`}
                className="surface-card overflow-x-auto rounded-2xl"
              >
                <p className="border-b border-line/80 px-4 py-3 text-xs font-semibold uppercase text-fg-subtle">
                  Utilisateurs ({result.users.length})
                </p>
                <table className="w-full text-left text-sm">
                  <tbody>
                    {result.users.map((user) => (
                      <tr
                        key={user.uid}
                        className="border-b border-line/40 hover:bg-elevated/30"
                      >
                        <td className="px-4 py-3">
                          <Link
                            to={`/admin/users/${user.uid}`}
                            className="font-medium text-accent-light hover:underline"
                          >
                            {user.email ?? user.uid}
                          </Link>
                        </td>
                        <td className="px-4 py-3 capitalize text-fg-muted">
                          {planLabel(user)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }

          if (result.type === "generation") {
            const gen = result.generation;
            return (
              <div
                key={`gen-${gen.id}`}
                className="surface-card rounded-2xl p-4"
              >
                <p className="text-xs font-semibold uppercase text-fg-subtle">
                  Génération
                </p>
                <p className="mt-1 font-mono text-sm text-fg">{gen.id}</p>
                <p className="mt-2 text-sm text-fg-muted">
                  Mode : {gen.mode} — Pièce : {gen.roomType}
                </p>
                <div className="mt-3 flex gap-3">
                  <Link
                    to={`/admin/users/${gen.uid}`}
                    className="text-sm text-accent-light hover:underline"
                  >
                    Voir l&apos;utilisateur
                  </Link>
                  <Link
                    to={`/admin/generations?uid=${gen.uid}`}
                    className="text-sm text-accent-light hover:underline"
                  >
                    Voir les générations
                  </Link>
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
