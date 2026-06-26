import { useEffect, useState } from "react";
import { CheckCircle2, Flag, X } from "lucide-react";
import { REPORT_REASONS } from "../constants/reportReasons";
import { getModeTheme } from "../utils/modeTheme";

export default function ReportImageModal({
  open,
  onClose,
  onSubmit,
  mode = "meubler",
  generationLabel,
}) {
  const theme = getModeTheme(mode);
  const [reason, setReason] = useState(REPORT_REASONS[0].id);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!open) return;
    setReason(REPORT_REASONS[0].id);
    setComment("");
    setSubmitting(false);
    setError(null);
    setSuccess(false);
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (reason === "other" && !comment.trim()) {
      setError("Veuillez préciser le problème dans le commentaire.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ reason, comment: comment.trim() || null });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
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
          aria-label="Fermer"
        >
          <X className="h-5 w-5" />
        </button>

        {success ? (
          <div className="py-2 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-estate-stone/15 ring-1 ring-estate-stone/25">
              <CheckCircle2 className="h-6 w-6 text-estate-stone-light" />
            </div>
            <h2 className="text-lg font-bold text-white">Signalement envoyé</h2>
            <p className="mt-2 text-sm text-muted">
              Merci pour votre retour. Notre équipe examinera ce résultat.
            </p>
            <button
              type="button"
              onClick={onClose}
              className={`mt-6 w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white ${theme.btnPrimary}`}
            >
              Fermer
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-2">
              <Flag className="h-5 w-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">
                Signaler cette image
              </h2>
            </div>

            {generationLabel && (
              <p className="mb-4 text-sm text-muted">{generationLabel}</p>
            )}

            <fieldset className="mb-4 space-y-2">
              <legend className="mb-2 text-xs font-medium text-zinc-400">
                Motif du signalement
              </legend>
              {REPORT_REASONS.map((item) => (
                <label
                  key={item.id}
                  className={`flex cursor-pointer items-start gap-2 rounded-xl border px-3 py-2.5 transition ${
                    reason === item.id
                      ? `${theme.selected}`
                      : "border-zinc-700/80 hover:border-zinc-600"
                  }`}
                >
                  <input
                    type="radio"
                    name="report-reason"
                    value={item.id}
                    checked={reason === item.id}
                    onChange={() => setReason(item.id)}
                    className="mt-0.5"
                  />
                  <span className="text-sm text-zinc-200">{item.label}</span>
                </label>
              ))}
            </fieldset>

            <label className="mb-4 block">
              <span className="mb-1 block text-xs font-medium text-zinc-400">
                Commentaire{" "}
                {reason === "other" ? "(obligatoire)" : "(optionnel)"}
              </span>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Décrivez le problème observé…"
                rows={3}
                maxLength={1000}
                className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
              />
            </label>

            {error && (
              <p className="mb-3 text-sm text-red-400" role="alert">
                {error}
              </p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1 px-4 py-2.5 text-sm"
                disabled={submitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={`flex-1 px-4 py-2.5 text-sm ${theme.btnPrimary}`}
              >
                {submitting ? "Envoi…" : "Envoyer le signalement"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
