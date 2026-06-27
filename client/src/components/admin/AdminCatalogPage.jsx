import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  fetchAdminConfig,
  seedAdminConfig,
  updateAdminConfig,
} from "../../api/admin";

const TABS = [
  { id: "styles", label: "Styles" },
  { id: "roomTypes", label: "Pièces" },
  { id: "plans", label: "Forfaits" },
  { id: "features", label: "Features" },
  { id: "generationTuning", label: "Tuning IA" },
];

export default function AdminCatalogPage() {
  const { getIdToken } = useAuth();
  const [tab, setTab] = useState("styles");
  const [jsonText, setJsonText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const idToken = await getIdToken();
      const data = await fetchAdminConfig(idToken, tab);
      setJsonText(JSON.stringify(data[tab], null, 2));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getIdToken, tab]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const parsed = JSON.parse(jsonText);
      const idToken = await getIdToken();
      await updateAdminConfig(idToken, tab, parsed);
      setMessage("Catalogue mis à jour.");
    } catch (err) {
      setError(err.message || "JSON invalide.");
    } finally {
      setSaving(false);
    }
  };

  const reseed = async () => {
    if (!window.confirm("Réinitialiser tous les catalogues depuis le code ?")) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const idToken = await getIdToken();
      await seedAdminConfig(idToken);
      setMessage("Catalogues réinitialisés depuis le code.");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-fg">Catalogues</h2>
          <p className="mt-1 text-sm text-fg-muted">
            Styles, pièces, forfaits et réglages — édition JSON
          </p>
        </div>
        <button
          type="button"
          onClick={reseed}
          disabled={saving}
          className="rounded-xl bg-elevated px-4 py-2 text-sm text-fg hover:bg-elevated/80 disabled:opacity-50"
        >
          Re-seed depuis le code
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              tab === t.id
                ? "bg-accent/15 text-accent-light ring-1 ring-accent/30"
                : "bg-elevated text-fg-muted hover:text-fg"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {message && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {tab === "styles" && (
        <p className="text-xs text-amber-300/90">
          Vérifiez que chaque style possède une entrée dans{" "}
          <code className="text-amber-200">definitions</code> avec les champs
          requis pour les prompts IA.
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-accent" />
        </div>
      ) : (
        <>
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            rows={24}
            spellCheck={false}
            className="w-full rounded-2xl border border-line bg-elevated p-4 font-mono text-xs text-fg outline-none ring-accent/40 focus:ring-2"
          />
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </>
      )}
    </div>
  );
}
