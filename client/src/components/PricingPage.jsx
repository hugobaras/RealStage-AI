import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check, Sparkles } from "lucide-react";
import {
  PLANS,
  formatGenerationsLimit,
  getPlan,
  getPlanDisplayFeatures,
  TRIAL_LIMIT,
} from "../constants/plans";
import { useSubscription } from "../contexts/SubscriptionContext";
import AppShell from "./AppShell";
import SecondaryPageLayout from "./SecondaryPageLayout";
import StripeCheckoutModal from "./StripeCheckoutModal";
import { isStripePublishableKeyConfigured } from "../lib/stripe";

function PlanCard({
  plan,
  onSelect,
  selecting,
  selectedId,
  stripeFrontendReady,
  currentPlanId,
  isSubscribed,
}) {
  const isPopular = plan.popular;
  const isCurrent = isSubscribed && currentPlanId === plan.id;

  const buttonLabel = () => {
    if (selecting && selectedId === plan.id) return "Chargement…";
    if (isCurrent) return "Forfait actuel";
    if (isSubscribed) {
      return stripeFrontendReady
        ? "Changer pour ce forfait"
        : "Choisir ce plan";
    }
    return stripeFrontendReady ? "S'abonner" : "Choisir ce plan";
  };

  const badgeLabel = isCurrent
    ? "Votre forfait"
    : isPopular
      ? "Populaire"
      : null;

  return (
    <div className="relative pt-4">
      {badgeLabel && (
        <span className="absolute left-1/2 top-0 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-accent px-3 py-0.5 text-xs font-semibold text-white shadow-lg shadow-accent/30">
          {badgeLabel}
        </span>
      )}
      <div
        className={`card-glow relative flex h-full flex-col rounded-2xl border p-6 transition duration-300 sm:p-8 ${
          isCurrent
            ? "border-accent/60 bg-accent/10 shadow-xl shadow-accent/20 ring-1 ring-accent/40"
            : isPopular
              ? "border-accent/50 bg-accent/5 shadow-xl shadow-accent/15 hover:-translate-y-1"
              : "border-line/80 bg-panel/80 hover:-translate-y-1 hover:border-line hover:shadow-xl"
        }`}
      >
        <h3 className="font-display text-lg font-semibold text-fg">
          {plan.label}
        </h3>
        <div className="mt-3 flex items-baseline gap-1">
          <span className="font-display text-4xl font-semibold text-fg">
            {plan.priceMonthly} €
          </span>
          <span className="text-sm text-muted">/ mois</span>
        </div>
        <p className="mt-1 text-sm font-medium text-accent-light">
          {formatGenerationsLimit(plan)}
        </p>

        <ul className="mt-6 flex-1 space-y-3">
          {getPlanDisplayFeatures(plan).map((feature, index) => (
            <li
              key={`${feature}-${index}`}
              className={`flex items-start gap-2.5 text-sm ${
                index === 0 && plan.id !== "starter"
                  ? "font-semibold text-accent-light"
                  : "text-fg-subtle"
              }`}
            >
              {index === 0 && plan.id !== "starter" ? (
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent-light" />
              ) : (
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-light" />
              )}
              {feature}
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => onSelect(plan.id)}
          disabled={selecting || isCurrent}
          className={`mt-8 w-full rounded-xl py-3 text-sm font-semibold transition disabled:cursor-default disabled:opacity-100 ${
            isCurrent
              ? "border border-accent/50 bg-accent/20 text-accent-light"
              : isPopular
                ? "btn-shimmer text-white shadow-lg shadow-accent/25 hover:scale-[1.02] disabled:opacity-50"
                : "border border-line text-fg hover:bg-elevated-hover hover:scale-[1.02] disabled:opacity-50"
          }`}
        >
          {buttonLabel()}
        </button>
      </div>
    </div>
  );
}

export default function PricingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    startCheckout,
    isSubscribed,
    plan,
    planId,
    stripeConfigured,
    stripeFrontendReady,
  } = useSubscription();
  const [selecting, setSelecting] = useState(null);
  const [error, setError] = useState(null);
  const [checkoutSession, setCheckoutSession] = useState(null);

  const checkoutCanceled = searchParams.get("checkout") === "canceled";
  const missingPublishableKey =
    stripeConfigured && !isStripePublishableKeyConfigured;

  const handleSelect = async (planId) => {
    setError(null);
    setSelecting(planId);
    try {
      const result = await startCheckout(planId);
      if (result?.plan?.id === planId && !result?.clientSecret) {
        navigate("/");
        return;
      }
      if (result?.clientSecret) {
        setCheckoutSession({
          clientSecret: result.clientSecret,
          planLabel: getPlan(planId)?.label ?? planId,
        });
        setSelecting(null);
        return;
      }
      if (result) navigate("/");
    } catch (err) {
      setError(err.message);
      setSelecting(null);
    }
  };

  const closeCheckout = () => {
    setCheckoutSession(null);
  };

  return (
    <AppShell>
      <SecondaryPageLayout>
        <div className="page-bg relative flex-1">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-accent/10 blur-[120px]" />
          <div className="absolute -right-32 top-1/3 h-80 w-80 rounded-full bg-accent-light/8 blur-[100px]" />
          <div className="app-grid-bg absolute inset-0 opacity-40" />
        </div>

        <main className="relative mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            {stripeFrontendReady ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent-light">
                <Sparkles className="h-3.5 w-3.5" />
                Paiement sécurisé Stripe
              </span>
            ) : missingPublishableKey ? (
              <span className="inline-block rounded-full border border-amber-800/50 bg-amber-950/40 px-3 py-1 text-xs text-amber-200">
                Ajoutez VITE_STRIPE_PUBLISHABLE_KEY dans client/.env
              </span>
            ) : (
              <span className="inline-block rounded-full border border-amber-800/50 bg-amber-950/40 px-3 py-1 text-xs text-amber-200">
                Mode démo — Stripe non configuré
              </span>
            )}

            <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
              Choisissez votre forfait
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-base text-fg-muted">
              {TRIAL_LIMIT} générations gratuites à l&apos;inscription, puis
              abonnement mensuel adapté à votre volume de photos.
            </p>

            {checkoutCanceled && (
              <p className="mt-4 rounded-xl border border-amber-800/40 bg-amber-950/30 px-4 py-2 text-sm text-amber-200">
                Paiement annulé. Vous pouvez réessayer quand vous voulez.
              </p>
            )}
            {isSubscribed && plan && (
              <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm text-accent-light">
                Forfait actuel : <strong>{plan.label}</strong>
              </p>
            )}
          </div>

          {error && (
            <p className="mb-8 rounded-xl border border-red-900/50 bg-red-950/40 px-4 py-3 text-center text-sm text-red-300">
              {error}
            </p>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {PLANS.map((p) => (
              <PlanCard
                key={p.id}
                plan={p}
                onSelect={handleSelect}
                selecting={Boolean(selecting)}
                selectedId={selecting}
                stripeFrontendReady={stripeFrontendReady}
                currentPlanId={planId ?? plan?.id ?? null}
                isSubscribed={isSubscribed}
              />
            ))}
          </div>

          <p className="mt-10 text-center text-sm text-fg-muted">
            Résiliation libre · Sans frais cachés · Résultats instantanés
          </p>
        </main>

        <StripeCheckoutModal
          open={Boolean(checkoutSession)}
          clientSecret={checkoutSession?.clientSecret}
          planLabel={checkoutSession?.planLabel}
          onClose={closeCheckout}
        />
        </div>
      </SecondaryPageLayout>
    </AppShell>
  );
}
