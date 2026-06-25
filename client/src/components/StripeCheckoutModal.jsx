import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { getStripe } from "../lib/stripe";

export default function StripeCheckoutModal({
  open,
  clientSecret,
  planLabel,
  onClose,
}) {
  const containerRef = useRef(null);
  const checkoutRef = useRef(null);

  useEffect(() => {
    if (!open || !clientSecret || !containerRef.current) return undefined;

    let cancelled = false;

    async function mountCheckout() {
      const stripe = await getStripe();
      if (!stripe || cancelled || !containerRef.current) return;

      if (checkoutRef.current) {
        checkoutRef.current.destroy();
        checkoutRef.current = null;
      }

      const checkout = await stripe.createEmbeddedCheckoutPage({
        fetchClientSecret: () => Promise.resolve(clientSecret),
      });
      checkout.mount(containerRef.current);
      checkoutRef.current = checkout;
    }

    mountCheckout();

    return () => {
      cancelled = true;
      checkoutRef.current?.destroy();
      checkoutRef.current = null;
    };
  }, [open, clientSecret]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
        aria-label="Fermer"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="stripe-checkout-title"
        className="relative flex max-h-[95dvh] w-full max-w-xl flex-col rounded-xl border border-zinc-800 bg-panel shadow-2xl sm:max-w-2xl lg:max-h-[min(92vh,860px)]"
      >
        <div className="flex shrink-0 items-center justify-between rounded-t-xl border-b border-zinc-800 px-4 py-3">
          <div>
            <h2
              id="stripe-checkout-title"
              className="text-sm font-semibold text-white"
            >
              Paiement
            </h2>
            {planLabel && (
              <p className="text-xs text-muted">Forfait {planLabel}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-b-xl bg-white">
          <div
            ref={containerRef}
            className="w-full [&_iframe]:block [&_iframe]:min-h-[360px] [&_iframe]:w-full sm:[&_iframe]:min-h-[520px]"
          />
        </div>
      </div>
    </div>
  );
}
