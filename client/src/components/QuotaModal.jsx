import { X, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { getModeTheme } from "../utils/modeTheme";

export default function QuotaModal({
  open,
  onClose,
  plan,
  monthlyLimit,
  deepThinkingLimit,
  reason,
  mode = "meubler",
}) {
  const theme = getModeTheme(mode);
  if (!open) return null;

  const isDeepThinking = reason === "deep_thinking_quota_exceeded";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Fermer"
      />
      <div className="glass-panel relative w-full max-w-md rounded-2xl p-6 sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
          aria-label="Fermer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/15 ring-1 ring-amber-500/25">
          <TrendingUp className="h-5 w-5 text-amber-400" />
        </div>

        <h2 className="text-xl font-bold text-white">
          {isDeepThinking
            ? "Quota réflexion approfondie atteint"
            : "Quota mensuel atteint"}
        </h2>
        <p className="mt-2 text-sm text-muted">
          {isDeepThinking ? (
            deepThinkingLimit === 0 ? (
              <>
                La réflexion approfondie est incluse dans les forfaits Starter
                (10/mois), Pro (50/mois) et Agence (illimité).
              </>
            ) : (
              <>
                Votre forfait {plan?.label ?? "actuel"} inclut{" "}
                {deepThinkingLimit} réflexions approfondies par mois. Passez à
                un forfait supérieur pour continuer immédiatement.
              </>
            )
          ) : (
            <>
              Votre forfait {plan?.label ?? "actuel"} inclut {monthlyLimit}{" "}
              générations par mois. Passez à un forfait supérieur pour continuer
              immédiatement.
            </>
          )}
        </p>

        <Link
          to="/pricing"
          onClick={onClose}
          className={`mt-6 block w-full text-center ${theme.modalPrimary}`}
        >
          Changer de forfait
        </Link>
      </div>
    </div>
  );
}
