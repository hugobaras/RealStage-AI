import { loadStripe } from "@stripe/stripe-js";

const publishableKey =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.trim() ?? "";

export const isStripePublishableKeyConfigured = Boolean(publishableKey);

let stripePromise = null;

export function getStripe() {
  if (!isStripePublishableKeyConfigured) {
    return Promise.resolve(null);
  }
  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}
