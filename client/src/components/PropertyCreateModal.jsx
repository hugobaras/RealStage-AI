import { useState } from "react";
import { Building2, Plus, X } from "lucide-react";
import { Link } from "react-router-dom";
import { getModeTheme } from "../utils/modeTheme";

export default function PropertyCreateModal({
  open,
  onClose,
  onCreate,
  loading,
}) {
  const [label, setLabel] = useState("");
  const [address, setAddress] = useState("");

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address.trim()) return;
    await onCreate({
      label: label.trim() || address.trim(),
      address: address.trim(),
    });
    setLabel("");
    setAddress("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Fermer"
      />
      <form
        onSubmit={handleSubmit}
        className="glass-panel relative w-full max-w-md rounded-2xl p-6"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-accent-light" />
          <h2 className="text-lg font-bold text-white">Nouveau bien</h2>
        </div>

        <label className="mb-3 block">
          <span className="mb-1 block text-xs font-medium text-zinc-400">
            Adresse
          </span>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="12 rue de la Paix, Paris"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
            required
          />
        </label>

        <label className="mb-5 block">
          <span className="mb-1 block text-xs font-medium text-zinc-400">
            Libellé court (optionnel)
          </span>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Appartement T3"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
          />
        </label>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading || !address.trim()}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            {loading ? "Création…" : "Créer le dossier"}
          </button>
          <button type="button" onClick={onClose} className="btn-secondary">
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}

export function PropertySelector({
  mode,
  properties,
  activePropertyId,
  onSelect,
  onCreateClick,
  hasFeature,
  compact = false,
}) {
  const theme = getModeTheme(mode);

  if (!hasFeature) {
    return (
      <Link
        to="/pricing"
        className={`rounded-lg border border-zinc-700 text-zinc-400 hover:text-white ${compact ? "px-2 py-1 text-[10px]" : "px-3 py-1.5 text-xs"}`}
      >
        {compact ? "Agence" : "Multi-projets — forfait Agence"}
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-1 md:gap-2">
      <Building2 className="hidden h-4 w-4 text-zinc-500 md:block" />
      <select
        value={activePropertyId ?? ""}
        onChange={(e) => onSelect(e.target.value || null)}
        className={`truncate rounded-lg border border-zinc-700 bg-zinc-900 px-1.5 py-1 text-[11px] text-white md:max-w-xs md:px-2 md:py-1.5 md:text-sm ${compact ? "max-w-[5.5rem] sm:max-w-[7rem]" : "max-w-[200px] sm:max-w-xs"} ${theme.border}`}
        aria-label="Sélectionner un bien"
      >
        <option value="">Sans bien</option>
        {properties.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label || p.address}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={onCreateClick}
        className={`flex items-center justify-center rounded-lg ${theme.bgSubtle} ${theme.text} ring-1 ${theme.border} ${compact ? "h-7 w-7" : "h-8 w-8"}`}
        title="Nouveau bien"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
