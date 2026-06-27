import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import {
  fetchAdminUser,
  grantAdminUser,
  patchAdminUser,
} from "../../api/admin";

const PLANS = ["starter", "pro", "agence"];

export default function AdminUserDetailPage() {
  const { uid } = useParams();
  const { getIdToken } = useAuth();
  const [user, setUser] = useState(null);
  const [planId, setPlanId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const idToken = await getIdToken();
      const data = await fetchAdminUser(idToken, uid);
      setUser(data.user);
      setPlanId(data.user.subscription?.planId ?? "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getIdToken, uid]);

  useEffect(() => {
    load();
  }, [load]);

  const runPatch = async (body) => {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const idToken = await getIdToken();
      const data = await patchAdminUser(idToken, uid, body);
      setUser(data.user);
      setPlanId(data.user.subscription?.planId ?? "");
      setMessage("Modifications enregistrées.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleAdmin = async () => {
    setSaving(true);
    setError(null);
    try {
      const idToken = await getIdToken();
      const data = await grantAdminUser(idToken, uid, !user.admin);
      setUser(data.user);
      setMessage(
        user.admin ? "Droits admin retirés." : "Droits admin accordés.",
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-accent" />
      </div>
    );
  }

  if (!user) {
    return <p className="text-fg-muted">Utilisateur introuvable.</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        to="/admin/users"
        className="inline-flex items-center gap-1 text-sm text-fg-muted hover:text-fg"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la liste
      </Link>

      <div>
        <h2 className="text-2xl font-bold text-fg">{user.email ?? user.uid}</h2>
        <p className="mt-1 text-sm text-fg-muted">{user.name ?? "—"}</p>
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

      <section className="surface-card space-y-4 rounded-2xl p-5">
        <h3 className="font-semibold text-fg">Abonnement</h3>
        <div className="flex flex-wrap gap-3">
          <select
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
            className="rounded-xl border border-line bg-elevated px-3 py-2 text-sm text-fg"
          >
            <option value="">Aucun forfait</option>
            {PLANS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={saving}
            onClick={() =>
              runPatch({
                planId: planId || null,
                status: planId ? "active" : "canceled",
              })
            }
            className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Appliquer le forfait
          </button>
        </div>
        <p className="text-xs text-fg-subtle">
          Statut : {user.subscription?.status ?? "none"} — Essais utilisés :{" "}
          {user.trialUsed ?? 0} — Crédits : {user.creditsUsed ?? 0}
        </p>
      </section>

      <section className="surface-card space-y-3 rounded-2xl p-5">
        <h3 className="font-semibold text-fg">Actions rapides</h3>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => runPatch({ resetMonthlyUsage: true })}
            className="rounded-xl bg-elevated px-3 py-2 text-sm text-fg hover:bg-elevated/80 disabled:opacity-50"
          >
            Reset quota mensuel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => runPatch({ resetTrial: true })}
            className="rounded-xl bg-elevated px-3 py-2 text-sm text-fg hover:bg-elevated/80 disabled:opacity-50"
          >
            Reset essai gratuit
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => runPatch({ resetCredits: true })}
            className="rounded-xl bg-elevated px-3 py-2 text-sm text-fg hover:bg-elevated/80 disabled:opacity-50"
          >
            Reset crédits
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => runPatch({ disabled: !user.disabled })}
            className="rounded-xl bg-red-500/15 px-3 py-2 text-sm text-red-300 hover:bg-red-500/25 disabled:opacity-50"
          >
            {user.disabled ? "Réactiver le compte" : "Désactiver le compte"}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={toggleAdmin}
            className="rounded-xl bg-elevated px-3 py-2 text-sm text-fg hover:bg-elevated/80 disabled:opacity-50"
          >
            {user.admin ? "Retirer admin" : "Accorder admin"}
          </button>
        </div>
      </section>

      <section className="surface-card rounded-2xl p-5 text-sm text-fg-muted">
        <p>Générations : {user.generationCount ?? 0}</p>
        <p>Biens : {user.propertyCount ?? 0}</p>
        <p>
          Usage ce mois : {user.usage?.count ?? 0} gén. /{" "}
          {user.usage?.deepThinkingCount ?? 0} deep
        </p>
        <p className="mt-2 text-xs text-fg-subtle">UID : {user.uid}</p>
      </section>
    </div>
  );
}
