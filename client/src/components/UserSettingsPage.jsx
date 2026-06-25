import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Building,
  CreditCard,
  LogOut,
  Megaphone,
  Palette,
  Shield,
  User,
} from "lucide-react";
import { formatGenerationsLimit, TRIAL_LIMIT } from "../constants/plans";
import { useAuth } from "../contexts/AuthContext";
import { useSubscription } from "../contexts/SubscriptionContext";
import { usePreferences } from "../hooks/usePreferences";
import AppShell from "./AppShell";
import MobileAppNav from "./MobileAppNav";
import ThemeToggle from "./ThemeToggle";

function SettingsSection({ icon: Icon, title, description, children }) {
  return (
    <section className="surface-card rounded-2xl p-5 lg:p-6">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent-light ring-1 ring-accent/30">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-fg">{title}</h2>
          {description && (
            <p className="mt-0.5 text-sm text-zinc-500">{description}</p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

function isEmailPasswordUser(user) {
  return (
    user?.providerData?.some(
      (provider) => provider.providerId === "password",
    ) ?? false
  );
}

function providerLabel(user) {
  const google = user?.providerData?.some(
    (provider) => provider.providerId === "google.com",
  );
  if (google && isEmailPasswordUser(user)) return "E-mail et Google";
  if (google) return "Google";
  if (isEmailPasswordUser(user)) return "E-mail";
  return "Compte";
}

export default function UserSettingsPage() {
  const { user, logout, updateDisplayName, changePassword } = useAuth();
  const { prefs, setPref } = usePreferences();
  const {
    plan,
    isSubscribed,
    trialRemaining,
    trialUsed,
    trialLimit,
    monthlyRemaining,
    monthlyLimit,
    loading: subLoading,
    canManageBilling,
    portalLoading,
    portalError,
    clearPortalError,
    openBillingPortal,
    openPaywall,
    hasFeature,
    demoMode,
    stripeConfigured,
  } = useSubscription();

  const listingMode = Boolean(prefs.listingMode);

  const [displayName, setDisplayName] = useState(() => user?.displayName ?? "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);
  const [profileError, setProfileError] = useState(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  const emailUser = isEmailPasswordUser(user);
  const initials =
    (user?.displayName || user?.email || "?").charAt(0).toUpperCase() || "?";

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage(null);
    setProfileError(null);
    try {
      await updateDisplayName(displayName);
      setProfileMessage("Profil mis à jour.");
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setPasswordMessage(null);
    setPasswordError(null);

    if (newPassword.length < 6) {
      setPasswordError(
        "Le nouveau mot de passe doit contenir au moins 6 caractères.",
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas.");
      return;
    }

    setPasswordSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage("Mot de passe modifié.");
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleBillingPortal = async () => {
    clearPortalError();
    try {
      await openBillingPortal();
    } catch {
      /* portalError géré dans le contexte */
    }
  };

  const handleListingModeToggle = () => {
    if (!hasFeature("listingWorkflow")) {
      openPaywall("pro_required");
      return;
    }
    setPref("listingMode", !listingMode);
  };

  let planBadgeLabel = "Sans abonnement";
  if (!subLoading) {
    if (isSubscribed && plan) {
      planBadgeLabel =
        monthlyLimit == null
          ? plan.label
          : `${plan.label} · ${monthlyRemaining}/${monthlyLimit}`;
    } else if (trialRemaining > 0) {
      planBadgeLabel = `Essai · ${trialRemaining} restant${trialRemaining > 1 ? "s" : ""}`;
    }
  }

  let usageLabel = "—";
  if (!subLoading) {
    if (isSubscribed && plan) {
      usageLabel =
        monthlyLimit == null
          ? `${plan.label} — illimité`
          : `${monthlyRemaining ?? 0} / ${monthlyLimit} générations ce mois`;
    } else if (trialRemaining > 0) {
      usageLabel = `Essai gratuit — ${trialRemaining} génération${trialRemaining > 1 ? "s" : ""} restante${trialRemaining > 1 ? "s" : ""}`;
    } else {
      usageLabel = `Essai épuisé (${trialUsed ?? 0} / ${trialLimit ?? TRIAL_LIMIT})`;
    }
  }

  return (
    <AppShell>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-deep app-themed">
        <MobileAppNav />
        <header className="border-b border-line bg-panel px-4 py-4 lg:px-8">
          <h1 className="text-2xl font-bold text-white">Mon compte</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Profil, sécurité et abonnement.
          </p>
        </header>

        <div className="mx-auto w-full max-w-2xl space-y-5 p-4 lg:p-8">
          <div className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-panel/80 px-5 py-4">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt=""
                className="h-14 w-14 rounded-full border border-zinc-700 object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 text-xl font-bold text-accent-light ring-1 ring-accent/30">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold text-white">
                {user?.displayName ||
                  user?.email?.split("@")[0] ||
                  "Utilisateur"}
              </p>
              <p className="truncate text-sm text-zinc-500">{user?.email}</p>
              <p className="mt-1 text-xs text-zinc-600">
                Connexion via {providerLabel(user)}
              </p>
            </div>
          </div>

          <SettingsSection
            icon={User}
            title="Profil"
            description="Votre nom affiché dans l'application."
          >
            <form onSubmit={handleProfileSave} className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-zinc-400">
                  Nom d&apos;affichage
                </span>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Jean Dupont"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-zinc-400">
                  Adresse e-mail
                </span>
                <input
                  type="email"
                  value={user?.email ?? ""}
                  readOnly
                  className="w-full cursor-not-allowed rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-500"
                />
              </label>
              {profileError && (
                <p className="text-sm text-red-400">{profileError}</p>
              )}
              {profileMessage && (
                <p className="text-sm text-emerald-400">{profileMessage}</p>
              )}
              <button
                type="submit"
                disabled={profileSaving}
                className="btn-primary text-sm disabled:opacity-50"
              >
                {profileSaving ? "Enregistrement…" : "Enregistrer le profil"}
              </button>
            </form>
          </SettingsSection>

          {emailUser && (
            <SettingsSection
              icon={Shield}
              title="Sécurité"
              description="Modifiez votre mot de passe."
            >
              <form onSubmit={handlePasswordSave} className="space-y-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-zinc-400">
                    Mot de passe actuel
                  </span>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-zinc-400">
                    Nouveau mot de passe
                  </span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    minLength={6}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-zinc-400">
                    Confirmer le mot de passe
                  </span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    minLength={6}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
                  />
                </label>
                {passwordError && (
                  <p className="text-sm text-red-400">{passwordError}</p>
                )}
                {passwordMessage && (
                  <p className="text-sm text-emerald-400">{passwordMessage}</p>
                )}
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="btn-secondary text-sm disabled:opacity-50"
                >
                  {passwordSaving ? "Mise à jour…" : "Changer le mot de passe"}
                </button>
              </form>
            </SettingsSection>
          )}

          <SettingsSection
            icon={Palette}
            title="Apparence"
            description="Thème de l'interface."
          >
            <ThemeToggle />
          </SettingsSection>

          <SettingsSection
            icon={Megaphone}
            title="Préférences éditeur"
            description="Options d'utilisation dans l'éditeur."
          >
            <button
              type="button"
              onClick={handleListingModeToggle}
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition ${
                listingMode
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                  : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-600"
              }`}
            >
              <span className="font-medium">Mode avant annonce</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  listingMode
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-zinc-800 text-zinc-500"
                }`}
              >
                {listingMode ? "Activé" : "Désactivé"}
              </span>
            </button>
            <p className="mt-2 text-xs text-zinc-500">
              Checklist des pièces essentielles et workflow guidé pour préparer
              une annonce immobilière.
            </p>
          </SettingsSection>

          <SettingsSection
            icon={CreditCard}
            title="Abonnement"
            description="Forfait actuel et utilisation."
          >
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full border px-3 py-1 text-sm font-medium ${
                    isSubscribed
                      ? "border-accent/40 bg-accent/15 text-accent-light"
                      : trialRemaining > 0
                        ? "border-zinc-700 bg-zinc-800 text-zinc-300"
                        : "border-red-900/40 bg-red-950/40 text-red-300"
                  }`}
                >
                  {subLoading ? "Chargement…" : planBadgeLabel}
                </span>
                {isSubscribed && canManageBilling && (
                  <button
                    type="button"
                    onClick={handleBillingPortal}
                    disabled={portalLoading}
                    className="rounded-lg border border-zinc-700 px-3 py-1 text-sm text-zinc-300 transition hover:border-zinc-600 hover:text-white disabled:opacity-50"
                  >
                    {portalLoading ? "…" : "Gérer"}
                  </button>
                )}
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Forfait
                </p>
                <p className="mt-1 text-lg font-semibold text-white">
                  {subLoading
                    ? "Chargement…"
                    : isSubscribed && plan
                      ? plan.label
                      : "Sans abonnement"}
                </p>
                {isSubscribed && plan && (
                  <p className="mt-0.5 text-sm text-zinc-400">
                    {formatGenerationsLimit(plan)}
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Utilisation
                </p>
                <p className="mt-1 text-sm text-zinc-300">{usageLabel}</p>
                {demoMode && !stripeConfigured && (
                  <p className="mt-2 text-xs text-amber-400/90">
                    Mode démo — toutes les fonctionnalités sont accessibles.
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Link to="/pricing" className="btn-primary text-sm">
                  {isSubscribed ? "Changer de forfait" : "Voir les forfaits"}
                </Link>
              </div>
              {portalError && (
                <p className="text-sm text-red-400">{portalError}</p>
              )}
            </div>
          </SettingsSection>

          {hasFeature("agencyPresets") && (
            <SettingsSection
              icon={Building}
              title="Paramètres agence"
              description="Logo, signature et exports brandés."
            >
              <Link
                to="/settings/agency"
                className="btn-secondary inline-flex items-center gap-2 text-sm"
              >
                <Building className="h-4 w-4" />
                Ouvrir les paramètres agence
              </Link>
            </SettingsSection>
          )}

          <div className="border-t border-zinc-800 pt-4">
            <button
              type="button"
              onClick={() => logout()}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-red-900/50 hover:bg-red-950/30 hover:text-red-300"
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
