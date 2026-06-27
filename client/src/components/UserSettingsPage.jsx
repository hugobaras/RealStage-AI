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
import { useAdmin } from "../contexts/AdminContext";
import { useSubscription } from "../contexts/SubscriptionContext";
import { usePreferences } from "../hooks/usePreferences";
import { patchMePreferences } from "../api/preferences";
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
            <p className="mt-0.5 text-sm text-fg-muted">{description}</p>
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
  const { user, logout, updateDisplayName, changePassword, getIdToken } =
    useAuth();
  const { isAdmin } = useAdmin();
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
          <h1 className="font-display text-2xl font-semibold text-fg">
            Mon compte
          </h1>
          <p className="mt-1 text-sm text-fg-muted">
            Profil, sécurité et abonnement.
          </p>
        </header>

        <div className="mx-auto w-full max-w-2xl space-y-5 p-4 lg:p-8">
          <div className="flex items-center gap-4 rounded-2xl border border-line bg-panel/80 px-5 py-4">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt=""
                className="h-14 w-14 rounded-full border border-line object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 text-xl font-bold text-accent-light ring-1 ring-accent/30">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold text-fg">
                {user?.displayName ||
                  user?.email?.split("@")[0] ||
                  "Utilisateur"}
              </p>
              <p className="truncate text-sm text-fg-muted">{user?.email}</p>
              <p className="mt-1 text-xs text-fg-subtle">
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
                <span className="mb-1 block text-xs font-medium text-fg-muted">
                  Nom d&apos;affichage
                </span>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Jean Dupont"
                  className="input-field"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-fg-muted">
                  Adresse e-mail
                </span>
                <input
                  type="email"
                  value={user?.email ?? ""}
                  readOnly
                  className="input-field cursor-not-allowed opacity-70"
                />
              </label>
              {profileError && (
                <p className="text-sm text-red-400">{profileError}</p>
              )}
              {profileMessage && (
                <p className="text-sm text-estate-stone-light">
                  {profileMessage}
                </p>
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
                  <span className="mb-1 block text-xs font-medium text-fg-muted">
                    Mot de passe actuel
                  </span>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className="input-field"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-fg-muted">
                    Nouveau mot de passe
                  </span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    minLength={6}
                    className="input-field"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-fg-muted">
                    Confirmer le mot de passe
                  </span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    minLength={6}
                    className="input-field"
                  />
                </label>
                {passwordError && (
                  <p className="text-sm text-red-400">{passwordError}</p>
                )}
                {passwordMessage && (
                  <p className="text-sm text-estate-stone-light">
                    {passwordMessage}
                  </p>
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
                  ? "border-accent/40 bg-accent/10 text-accent-light"
                  : "border-line bg-elevated text-fg-subtle hover:border-line"
              }`}
            >
              <span className="font-medium">Mode avant annonce</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  listingMode
                    ? "bg-accent/20 text-accent-light"
                    : "bg-elevated text-fg-muted"
                }`}
              >
                {listingMode ? "Activé" : "Désactivé"}
              </span>
            </button>
            <p className="mt-2 text-xs text-fg-muted">
              Checklist des pièces essentielles et workflow guidé pour préparer
              une annonce immobilière.
            </p>
            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-elevated/50 px-4 py-3">
              <input
                type="checkbox"
                checked={Boolean(prefs.aiLabelEnabled)}
                onChange={async (e) => {
                  const checked = e.target.checked;
                  setPref("aiLabelEnabled", checked);
                  try {
                    const idToken = await getIdToken();
                    await patchMePreferences(idToken, {
                      exportPrefs: { aiLabelEnabled: checked },
                    });
                  } catch {
                    // sync best-effort
                  }
                }}
                className="mt-0.5 rounded border-line"
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-fg">
                  Mention IA sur les exports
                </span>
                <span className="mt-1 block text-xs text-fg-muted">
                  Ajoute « Image générée par IA » en bas des photos téléchargées
                  et des packs ZIP.
                </span>
              </span>
            </label>
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
                        ? "border-line bg-elevated text-fg-subtle"
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
                    className="rounded-lg border border-line px-3 py-1 text-sm text-fg-subtle transition hover:border-line hover:text-fg disabled:opacity-50"
                  >
                    {portalLoading ? "…" : "Gérer"}
                  </button>
                )}
              </div>

              <div className="rounded-xl border border-line bg-elevated/50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">
                  Forfait
                </p>
                <p className="mt-1 text-lg font-semibold text-fg">
                  {subLoading
                    ? "Chargement…"
                    : isSubscribed && plan
                      ? plan.label
                      : "Sans abonnement"}
                </p>
                {isSubscribed && plan && (
                  <p className="mt-0.5 text-sm text-fg-muted">
                    {formatGenerationsLimit(plan)}
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-line bg-elevated/50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">
                  Utilisation
                </p>
                <p className="mt-1 text-sm text-fg-subtle">{usageLabel}</p>
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

          {isAdmin && (
            <SettingsSection
              icon={Shield}
              title="Administration"
              description="Gestion de la plateforme RealStage AI."
            >
              <Link
                to="/admin"
                className="btn-secondary inline-flex items-center gap-2 text-sm"
              >
                <Shield className="h-4 w-4" />
                Ouvrir le panneau admin
              </Link>
            </SettingsSection>
          )}

          <div className="border-t border-line pt-4">
            <button
              type="button"
              onClick={() => logout()}
              className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-fg-subtle transition hover:border-red-900/50 hover:bg-red-950/30 hover:text-red-300"
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
