import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Copy, ExternalLink } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import {
  fetchAdminUser,
  forceLogoutAdminUser,
  grantAdminUser,
  patchAdminUser,
  syncAdminUserStripe,
} from "../../api/admin";

const PLANS = ["starter", "pro", "agence"];

const TABS = [
  { id: "overview", label: "Vue d'ensemble" },
  { id: "generations", label: "Générations" },
  { id: "properties", label: "Biens" },
  { id: "agency", label: "Agence" },
];

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("fr-FR");
}

function CopyableId({ label, value }) {
  if (!value) return null;

  const copy = () => navigator.clipboard.writeText(value);

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-fg-subtle">{label} :</span>
      <code className="rounded bg-elevated px-1.5 py-0.5 text-fg-muted">
        {value}
      </code>
      <button
        type="button"
        onClick={copy}
        className="text-fg-subtle hover:text-fg"
        title="Copier"
      >
        <Copy className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function stripeCustomerUrl(customerId, serverUrl) {
  if (serverUrl) return serverUrl;
  if (!customerId) return null;
  return `https://dashboard.stripe.com/customers/${customerId}`;
}

export default function AdminUserDetailPage() {
  const { uid } = useParams();
  const { getIdToken } = useAuth();
  const [user, setUser] = useState(null);
  const [planId, setPlanId] = useState("");
  const [tab, setTab] = useState("overview");
  const [creditGen, setCreditGen] = useState("");
  const [creditDeep, setCreditDeep] = useState("");
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

  const syncStripe = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const idToken = await getIdToken();
      const data = await syncAdminUserStripe(idToken, uid);
      setUser(data.user);
      setPlanId(data.user.subscription?.planId ?? "");
      setMessage("Abonnement synchronisé depuis Stripe.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const forceLogout = async () => {
    if (!window.confirm("Forcer la déconnexion de cet utilisateur ?")) return;
    setSaving(true);
    setError(null);
    try {
      const idToken = await getIdToken();
      await forceLogoutAdminUser(idToken, uid);
      setMessage("Sessions révoquées — l'utilisateur devra se reconnecter.");
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

  const sub = user.subscription ?? {};
  const agency = user.agencySettings;
  const customerUrl = stripeCustomerUrl(
    sub.stripeCustomerId,
    user.stripeCustomerUrl,
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        to="/admin/users"
        className="inline-flex items-center gap-1 text-sm text-fg-muted hover:text-fg"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la liste
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-bold text-fg">
              {user.email ?? user.uid}
            </h2>
            {user.admin && (
              <span className="rounded bg-accent/20 px-2 py-0.5 text-xs text-accent-light">
                admin
              </span>
            )}
            {user.disabled && (
              <span className="rounded bg-red-500/20 px-2 py-0.5 text-xs text-red-300">
                suspendu
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-fg-muted">{user.name ?? "—"}</p>
          <p className="mt-1 text-xs text-fg-subtle">
            Créé le {formatDate(user.createdAt)} — Dernière connexion{" "}
            {formatDate(user.lastSignIn)}
          </p>
        </div>
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

      <div className="flex flex-wrap gap-1 border-b border-line/80">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-t-lg px-4 py-2 text-sm font-medium transition ${
              tab === t.id
                ? "bg-elevated text-fg"
                : "text-fg-muted hover:text-fg"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-6">
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
            <div className="space-y-1 text-sm text-fg-muted">
              <p>
                Statut :{" "}
                <span className="capitalize">{sub.status ?? "none"}</span>
                {sub.currentPeriodEnd &&
                  ` — fin de période ${formatDate(sub.currentPeriodEnd)}`}
              </p>
              <p>
                Essais utilisés : {user.trialUsed ?? 0} — Crédits globaux :{" "}
                {user.creditsUsed ?? 0}
              </p>
              <p>
                Usage ce mois : {user.usage?.count ?? 0} gén. /{" "}
                {user.usage?.deepThinkingCount ?? 0} deep thinking
              </p>
            </div>
            <div className="space-y-1 border-t border-line/60 pt-3">
              <CopyableId label="UID" value={user.uid} />
              <CopyableId
                label="Stripe Customer"
                value={sub.stripeCustomerId}
              />
              <CopyableId
                label="Stripe Subscription"
                value={sub.stripeSubscriptionId}
              />
              {customerUrl && (
                <a
                  href={customerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-accent-light hover:underline"
                >
                  Voir dans Stripe
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            <button
              type="button"
              disabled={saving || !sub.stripeCustomerId}
              onClick={syncStripe}
              className="rounded-xl bg-elevated px-4 py-2 text-sm text-fg hover:bg-elevated/80 disabled:opacity-50"
            >
              Synchroniser Stripe
            </button>
          </section>

          <section className="surface-card space-y-3 rounded-2xl p-5">
            <h3 className="font-semibold text-fg">Actions support</h3>
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
                Réinitialiser essai
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
                {user.disabled ? "Réactiver le compte" : "Suspendre le compte"}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={forceLogout}
                className="rounded-xl bg-elevated px-3 py-2 text-sm text-fg hover:bg-elevated/80 disabled:opacity-50"
              >
                Forcer déconnexion
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

            <div className="flex flex-wrap items-end gap-3 border-t border-line/60 pt-4">
              <div>
                <label className="mb-1 block text-xs text-fg-subtle">
                  Créditer générations (mois)
                </label>
                <input
                  type="number"
                  min="1"
                  value={creditGen}
                  onChange={(e) => setCreditGen(e.target.value)}
                  className="w-24 rounded-xl border border-line bg-elevated px-3 py-2 text-sm text-fg"
                />
              </div>
              <button
                type="button"
                disabled={saving || !creditGen}
                onClick={() => {
                  runPatch({ creditGenerations: Number(creditGen) });
                  setCreditGen("");
                }}
                className="rounded-xl bg-elevated px-3 py-2 text-sm text-fg hover:bg-elevated/80 disabled:opacity-50"
              >
                Créditer
              </button>
              <div>
                <label className="mb-1 block text-xs text-fg-subtle">
                  Créditer deep thinking (mois)
                </label>
                <input
                  type="number"
                  min="1"
                  value={creditDeep}
                  onChange={(e) => setCreditDeep(e.target.value)}
                  className="w-24 rounded-xl border border-line bg-elevated px-3 py-2 text-sm text-fg"
                />
              </div>
              <button
                type="button"
                disabled={saving || !creditDeep}
                onClick={() => {
                  runPatch({ creditDeepThinking: Number(creditDeep) });
                  setCreditDeep("");
                }}
                className="rounded-xl bg-elevated px-3 py-2 text-sm text-fg hover:bg-elevated/80 disabled:opacity-50"
              >
                Créditer
              </button>
            </div>
          </section>

          <section className="surface-card rounded-2xl p-5 text-sm text-fg-muted">
            <p>Générations totales : {user.generationCount ?? 0}</p>
            <p>Biens immobiliers : {user.propertyCount ?? 0}</p>
          </section>
        </div>
      )}

      {tab === "generations" && (
        <section className="surface-card overflow-x-auto rounded-2xl">
          <div className="flex items-center justify-between border-b border-line/80 px-4 py-3">
            <h3 className="font-semibold text-fg">
              Dernières générations ({user.generations?.length ?? 0})
            </h3>
            <Link
              to={`/admin/generations?uid=${uid}`}
              className="text-xs text-accent-light hover:underline"
            >
              Voir tout
            </Link>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line/80 bg-elevated/40 text-fg-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Mode</th>
                <th className="px-4 py-3 font-medium">Pièce</th>
                <th className="px-4 py-3 font-medium">Style</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">ID</th>
              </tr>
            </thead>
            <tbody>
              {(user.generations ?? []).map((gen) => (
                <tr
                  key={gen.id}
                  className="border-b border-line/40 hover:bg-elevated/30"
                >
                  <td className="px-4 py-3 capitalize text-fg">{gen.mode}</td>
                  <td className="px-4 py-3 text-fg-muted">{gen.roomType}</td>
                  <td className="px-4 py-3 text-fg-muted">
                    {gen.style ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-fg-muted">
                    {formatDate(gen.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs text-fg-subtle">{gen.id}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!user.generations || user.generations.length === 0) && (
            <p className="py-8 text-center text-sm text-fg-muted">
              Aucune génération.
            </p>
          )}
        </section>
      )}

      {tab === "properties" && (
        <section className="surface-card overflow-x-auto rounded-2xl">
          <h3 className="border-b border-line/80 px-4 py-3 font-semibold text-fg">
            Biens immobiliers ({user.properties?.length ?? 0})
          </h3>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line/80 bg-elevated/40 text-fg-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Libellé</th>
                <th className="px-4 py-3 font-medium">Adresse</th>
                <th className="px-4 py-3 font-medium">Générations</th>
              </tr>
            </thead>
            <tbody>
              {(user.properties ?? []).map((prop) => (
                <tr
                  key={prop.id}
                  className="border-b border-line/40 hover:bg-elevated/30"
                >
                  <td className="px-4 py-3 text-fg">{prop.label}</td>
                  <td className="px-4 py-3 text-fg-muted">{prop.address}</td>
                  <td className="px-4 py-3 text-fg-muted">
                    {prop.generationCount ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!user.properties || user.properties.length === 0) && (
            <p className="py-8 text-center text-sm text-fg-muted">
              Aucun bien immobilier.
            </p>
          )}
        </section>
      )}

      {tab === "agency" && (
        <section className="surface-card space-y-4 rounded-2xl p-5">
          <h3 className="font-semibold text-fg">Paramètres agence</h3>
          {!agency ? (
            <p className="text-sm text-fg-muted">Non configurés.</p>
          ) : (
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-fg-subtle">Style par défaut</dt>
                <dd className="text-fg">{agency.defaultStyle ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-fg-subtle">Position filigrane</dt>
                <dd className="text-fg">{agency.watermarkPosition ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-fg-subtle">Opacité logo</dt>
                <dd className="text-fg">{agency.logoOpacity ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-fg-subtle">Signature photo</dt>
                <dd className="text-fg">{agency.photoSignature ?? "—"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-fg-subtle">Mentions légales</dt>
                <dd className="text-fg">{agency.legalMentions ?? "—"}</dd>
              </div>
              {agency.logoDataUrl && (
                <div className="sm:col-span-2">
                  <dt className="mb-2 text-fg-subtle">Logo</dt>
                  <dd>
                    <img
                      src={agency.logoDataUrl}
                      alt="Logo agence"
                      className="max-h-16 rounded border border-line"
                    />
                  </dd>
                </div>
              )}
            </dl>
          )}
        </section>
      )}
    </div>
  );
}
