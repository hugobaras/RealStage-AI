import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { PLANS } from "../constants/plans";
import { getModeTheme } from "../utils/modeTheme";

export default function PaywallModal({ open, onClose, mode = "meubler" }) {
  const theme = getModeTheme(mode);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Fermer"
      />
      <div className="glass-panel relative w-full max-w-lg rounded-2xl p-6 sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
          aria-label="Fermer"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold text-white">
          Vos essais gratuits sont terminés
        </h2>
        <p className="mt-2 text-sm text-muted">
          Vous avez utilisé vos 3 générations d&apos;essai. Choisissez un
          abonnement pour continuer à meubler et désencombrer vos photos.
        </p>

        <ul className="surface-card mt-5 space-y-2 p-3 text-sm text-zinc-300">
          {PLANS.map((plan) => (
            <li key={plan.id} className="flex justify-between gap-2">
              <span className="font-medium">{plan.label}</span>
              <span className="text-muted">{plan.priceMonthly} €/mois</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link
            to="/pricing"
            onClick={onClose}
            className={`flex-1 text-center ${theme.modalPrimary}`}
          >
            Voir les tarifs
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary flex-1"
          >
            Plus tard
          </button>
        </div>
      </div>
    </div>
  );
}
