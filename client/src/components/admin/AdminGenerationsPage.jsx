import { useCallback, useEffect, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  deleteAdminGeneration,
  fetchAdminGenerations,
  moderateAdminGeneration,
} from "../../api/admin";

export default function AdminGenerationsPage() {
  const { getIdToken } = useAuth();
  const [searchParams] = useSearchParams();
  const [generations, setGenerations] = useState([]);
  const [uidFilter, setUidFilter] = useState(searchParams.get("uid") ?? "");
  const [modeFilter, setModeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const idToken = await getIdToken();
      const data = await fetchAdminGenerations(idToken, {
        uid: uidFilter.trim() || undefined,
        mode: modeFilter || undefined,
      });
      setGenerations(data.generations);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getIdToken, uidFilter, modeFilter]);

  useEffect(() => {
    const timer = setTimeout(() => load(), 300);
    return () => clearTimeout(timer);
  }, [load]);

  const moderate = async (uid, id, body) => {
    try {
      const idToken = await getIdToken();
      await moderateAdminGeneration(idToken, uid, id, body);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (uid, id) => {
    if (!window.confirm("Supprimer cette génération ?")) return;
    try {
      const idToken = await getIdToken();
      await deleteAdminGeneration(idToken, uid, id);
      setGenerations((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-fg">Générations</h2>
        <p className="mt-1 text-sm text-fg-muted">Recherche et modération</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[200px] flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" />
          <input
            type="search"
            value={uidFilter}
            onChange={(e) => setUidFilter(e.target.value)}
            placeholder="Filtrer par UID utilisateur…"
            className="w-full rounded-xl border border-line bg-elevated py-2.5 pl-10 pr-4 text-sm text-fg outline-none ring-accent/40 focus:ring-2"
          />
        </div>
        <select
          value={modeFilter}
          onChange={(e) => setModeFilter(e.target.value)}
          className="rounded-xl border border-line bg-elevated px-3 py-2 text-sm text-fg"
        >
          <option value="">Tous les modes</option>
          <option value="meubler">Meubler</option>
          <option value="remplacer">Remplacer</option>
          <option value="desencombrer">Désencombrer</option>
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {generations.map((gen) => (
          <article
            key={`${gen.uid}-${gen.id}`}
            className="surface-card overflow-hidden rounded-2xl"
          >
            {gen.imageUrl ? (
              <img
                src={gen.imageUrl}
                alt=""
                className="aspect-video w-full object-cover"
              />
            ) : (
              <div className="flex aspect-video items-center justify-center bg-elevated text-fg-subtle text-xs">
                Pas d&apos;aperçu
              </div>
            )}
            <div className="space-y-2 p-4 text-sm">
              <p className="font-medium text-fg">{gen.mode}</p>
              <p className="text-fg-muted">
                {gen.roomType}
                {gen.style ? ` · ${gen.style}` : ""}
              </p>
              <p className="truncate text-xs text-fg-subtle" title={gen.uid}>
                {gen.uid}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    moderate(gen.uid, gen.id, {
                      hidden: true,
                      notifyUser: true,
                    })
                  }
                  className="rounded-lg bg-elevated px-2 py-1 text-xs text-fg"
                >
                  Masquer
                </button>
                <button
                  type="button"
                  onClick={() =>
                    moderate(gen.uid, gen.id, {
                      sensitive: true,
                      reason: "Contenu sensible",
                    })
                  }
                  className="rounded-lg bg-elevated px-2 py-1 text-xs text-fg"
                >
                  Sensible
                </button>
                <button
                  type="button"
                  onClick={() => remove(gen.uid, gen.id)}
                  className="inline-flex items-center gap-1 rounded-lg bg-red-500/15 px-2 py-1 text-xs text-red-300 hover:bg-red-500/25"
                >
                  <Trash2 className="h-3 w-3" />
                  Supprimer
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-accent" />
        </div>
      )}

      {!loading && generations.length === 0 && (
        <p className="py-12 text-center text-sm text-fg-muted">
          Aucune génération trouvée.
        </p>
      )}
    </div>
  );
}
