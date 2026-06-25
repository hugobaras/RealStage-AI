import { Sparkles, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useSubscription } from "../contexts/SubscriptionContext";
import { getModeTheme } from "../utils/modeTheme";

export default function TrialBanner({ mode = "meubler" }) {
  const { isSubscribed, trialRemaining, trialLimit, loading } =
    useSubscription();
  const theme = getModeTheme(mode);

  if (loading || isSubscribed) return null;

  if (trialRemaining <= 0) {
    return (
      <div className="flex shrink-0 flex-col gap-2 border-b border-amber-900/40 bg-gradient-to-r from-amber-950/50 to-amber-950/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between lg:px-6">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 shrink-0 text-amber-400" />
          <p className="text-sm text-amber-100">
            Essais gratuits épuisés — abonnement requis pour continuer.
          </p>
        </div>
        <Link
          to="/pricing"
          className={`shrink-0 rounded-xl px-4 py-2 text-xs font-semibold text-white transition ${theme.bannerCta}`}
        >
          Voir les tarifs
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center gap-2 border-b px-4 py-1.5 lg:px-6 ${theme.bannerRow}`}
    >
      <Sparkles className={`h-3.5 w-3.5 shrink-0 ${theme.bannerIcon}`} />
      <p className="text-xs text-zinc-300">
        <span className="font-semibold text-white">{trialRemaining}</span> essai
        {trialRemaining > 1 ? "s" : ""} sur {trialLimit}
      </p>
      <Link
        to="/pricing"
        className={`ml-auto shrink-0 text-xs font-medium transition hover:text-white ${theme.text}`}
      >
        Forfaits →
      </Link>
    </div>
  );
}
