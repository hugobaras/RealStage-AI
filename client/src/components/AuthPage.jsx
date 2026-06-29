import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { TRIAL_LIMIT } from "../constants/plans";

const BENEFITS = [
  "Meubler et désencombrer par IA",
  "30+ styles de décoration",
  "Comparaison avant / après instantanée",
];

export default function AuthPage() {
  const {
    signIn,
    signUp,
    signInWithGoogle,
    sendPasswordReset,
    firebaseConfigured,
  } = useAuth();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState(() =>
    searchParams.get("mode") === "signup" ? "signup" : "login",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const isSignup = mode === "signup";
  const isForgot = mode === "forgot";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      if (isForgot) {
        await sendPasswordReset(email);
        setSuccess(
          "Si un compte existe avec cette adresse, un e-mail de réinitialisation vient d'être envoyé. Consultez votre boîte de réception.",
        );
      } else if (isSignup) {
        await signUp(email, password, displayName);
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError(null);
    setSuccess(null);
    if (nextMode !== "forgot") {
      setPassword("");
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!firebaseConfigured) {
    return (
      <div className="app-themed page-bg flex min-h-screen items-center justify-center px-4">
        <div className="glass-panel w-full max-w-md rounded-2xl p-8 text-center">
          <img
            src="/realstage-logo.png"
            alt="RealStage AI"
            className="mx-auto mb-6 h-14 w-14 object-contain"
          />
          <h1 className="font-display text-xl font-semibold text-fg">
            Configuration requise
          </h1>
          <p className="mt-3 text-sm text-fg-muted">
            Copiez <code className="text-fg-subtle">client/.env.example</code>{" "}
            vers <code className="text-fg-subtle">client/.env</code> et
            renseignez vos clés Firebase.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-themed page-bg flex min-h-screen">
      <aside className="relative hidden w-[45%] overflow-hidden border-r border-line/80 md:flex md:flex-col md:justify-between">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-accent/20 blur-[100px]" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-accent-light/10 blur-[80px]" />
          <div className="app-grid-bg absolute inset-0 opacity-60" />
        </div>

        <div className="relative p-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-fg-muted transition hover:text-fg"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l&apos;accueil
          </Link>

          <div className="mt-16">
            <div className="mb-6 flex items-center gap-3">
              <img
                src="/realstage-logo.png"
                alt="RealStage AI"
                className="h-11 w-11 object-contain"
              />
              <span className="font-display text-xl font-semibold tracking-tight text-fg">
                RealStage AI
              </span>
            </div>

            <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-fg">
              Vos biens méritent
              <br />
              <span className="text-gradient-animated">des visuels pro</span>
            </h2>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-fg-muted">
              Home staging virtuel en quelques secondes. Conçu pour les agents
              immobiliers qui enchaînent les photos au quotidien.
            </p>

            <ul className="mt-8 space-y-3">
              {BENEFITS.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2.5 text-sm text-fg-subtle"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20">
                    <Check className="h-3 w-3 text-accent" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative border-t border-line/60 p-10">
          <div className="flex items-center gap-2 text-sm text-fg-muted">
            <Sparkles className="h-4 w-4 text-accent" />
            <span>
              <strong className="text-fg">{TRIAL_LIMIT} générations</strong>{" "}
              offertes à l&apos;inscription
            </span>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="p-6 lg:hidden">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-fg-muted transition hover:text-fg"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
        </header>

        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-8">
          <div className="w-full max-w-[400px]">
            <div className="mb-8 text-center lg:text-left">
              <div className="mb-4 flex items-center justify-center gap-2 lg:hidden">
                <img
                  src="/realstage-logo.png"
                  alt="RealStage AI"
                  className="h-10 w-10 object-contain"
                />
                <span className="font-display text-lg font-semibold text-fg">
                  RealStage AI
                </span>
              </div>

              {!isForgot && (
                <div className="surface-card mb-6 flex p-1">
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                      mode === "login"
                        ? "mode-pill-active"
                        : "text-fg-muted hover:text-fg"
                    }`}
                  >
                    Connexion
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode("signup")}
                    className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                      isSignup
                        ? "mode-pill-active"
                        : "text-fg-muted hover:text-fg"
                    }`}
                  >
                    Inscription
                  </button>
                </div>
              )}

              <h1 className="font-display text-2xl font-semibold text-fg">
                {isForgot
                  ? "Mot de passe oublié"
                  : isSignup
                    ? "Créer un compte"
                    : "Bon retour"}
              </h1>
              <p className="mt-2 text-sm text-fg-muted">
                {isForgot
                  ? "Saisissez votre e-mail pour recevoir un lien de réinitialisation."
                  : isSignup
                    ? `${TRIAL_LIMIT} essais gratuits, sans carte bancaire.`
                    : "Connectez-vous pour accéder à votre studio."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignup && (
                <div>
                  <label
                    htmlFor="displayName"
                    className="section-label mb-2 block"
                  >
                    Nom
                  </label>
                  <input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="input-field"
                    placeholder="Jean Dupont"
                    autoComplete="name"
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="section-label mb-2 block">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="vous@exemple.com"
                  autoComplete="email"
                />
              </div>

              {!isForgot && (
                <div>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <label htmlFor="password" className="section-label">
                      Mot de passe
                    </label>
                    {!isSignup && (
                      <button
                        type="button"
                        onClick={() => switchMode("forgot")}
                        className="text-xs font-medium text-accent-light transition hover:text-accent"
                      >
                        Mot de passe oublié ?
                      </button>
                    )}
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                    placeholder="••••••••"
                    autoComplete={
                      isSignup ? "new-password" : "current-password"
                    }
                  />
                </div>
              )}

              {error && (
                <p className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                  {error}
                </p>
              )}

              {success && (
                <p className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                  {success}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary btn-shimmer w-full"
              >
                {submitting
                  ? "Chargement…"
                  : isForgot
                    ? "Envoyer le lien"
                    : isSignup
                      ? "Créer mon compte"
                      : "Se connecter"}
              </button>

              {isForgot && (
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="w-full text-center text-sm text-fg-muted transition hover:text-fg"
                >
                  Retour à la connexion
                </button>
              )}
            </form>

            {!isForgot && (
              <>
                <div className="my-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-line" />
                  <span className="text-xs text-fg-muted">ou</span>
                  <div className="h-px flex-1 bg-line" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={submitting}
                  className="btn-secondary flex w-full items-center justify-center gap-2.5"
                >
                  <GoogleIcon />
                  Continuer avec Google
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
