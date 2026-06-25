import { useSubscription } from "../contexts/SubscriptionContext";
import { getModeTheme } from "../utils/modeTheme";

export default function SubscriptionBadge({ mode = "meubler" }) {
  const {
    isSubscribed,
    plan,
    trialRemaining,
    monthlyRemaining,
    monthlyLimit,
    loading,
    canManageBilling,
    portalLoading,
    portalError,
    clearPortalError,
    openBillingPortal,
  } = useSubscription();
  const theme = getModeTheme(mode);

  if (loading) {
    return <span className="h-7 w-24 animate-pulse rounded-full bg-zinc-800" />;
  }

  let label;
  if (isSubscribed && plan) {
    if (monthlyLimit == null) {
      label = plan.label;
    } else {
      label = `${plan.label} · ${monthlyRemaining}/${monthlyLimit}`;
    }
  } else if (trialRemaining > 0) {
    label = `Essai · ${trialRemaining} restant${trialRemaining > 1 ? "s" : ""}`;
  } else {
    label = "Sans abonnement";
  }

  const badgeClass = isSubscribed
    ? theme.badgeSubscribed
    : trialRemaining > 0
      ? "border-zinc-700/80 bg-zinc-800/60 text-zinc-300"
      : "border-red-900/40 bg-red-950/40 text-red-300";

  const handleManage = async () => {
    clearPortalError();
    try {
      await openBillingPortal();
    } catch {
      // portalError est mis à jour dans le contexte
    }
  };

  return (
    <div className="flex flex-col items-end gap-1 max-sm:items-center">
      <div className="flex items-center gap-1.5 lg:gap-2">
        <span
          className={`max-w-[140px] truncate rounded-full border px-2.5 py-1 text-xs font-medium sm:max-w-none ${badgeClass}`}
        >
          {label}
        </span>
        {isSubscribed && canManageBilling && (
          <button
            type="button"
            onClick={handleManage}
            disabled={portalLoading}
            className="rounded-lg border border-zinc-700/80 px-2 py-1 text-xs text-zinc-400 transition hover:border-zinc-600 hover:text-white disabled:opacity-50"
          >
            {portalLoading ? "…" : "Gérer"}
          </button>
        )}
      </div>
      {portalError && (
        <p className="max-w-[220px] text-right text-[10px] leading-tight text-red-400">
          {portalError}
        </p>
      )}
    </div>
  );
}
