import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  activateSubscription,
  cancelSubscription,
  createBillingPortalSession,
  createCheckoutSession,
  fetchSubscription,
  syncBillingSubscription,
} from "../api/subscription";
import { hasFeature as checkFeature } from "../constants/features";
import { isStripePublishableKeyConfigured } from "../lib/stripe";
import { useAuth } from "./AuthContext";

const SubscriptionContext = createContext(null);

export function SubscriptionProvider({ children }) {
  const { user, getIdToken } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [quotaModalOpen, setQuotaModalOpen] = useState(false);
  const [paywallReason, setPaywallReason] = useState(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState(null);

  const refreshSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return null;
    }

    setLoading(true);
    try {
      const idToken = await getIdToken();
      const data = await fetchSubscription(idToken);
      setSubscription(data);
      return data;
    } catch {
      setSubscription(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, getIdToken]);

  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  const openPaywall = useCallback((reason = "trial_exhausted") => {
    setPaywallReason(reason);
    if (
      reason === "quota_exceeded" ||
      reason === "deep_thinking_quota_exceeded"
    ) {
      setQuotaModalOpen(true);
    } else {
      setPaywallOpen(true);
    }
  }, []);

  const closePaywall = useCallback(() => {
    setPaywallOpen(false);
    setQuotaModalOpen(false);
    setPaywallReason(null);
  }, []);

  const startCheckout = useCallback(
    async (planId) => {
      const idToken = await getIdToken();

      if (subscription?.stripeConfigured && isStripePublishableKeyConfigured) {
        const session = await createCheckoutSession(idToken, planId, true);
        if (session.url) {
          window.location.href = session.url;
          return null;
        }
        if (session.clientSecret) {
          return session;
        }
        throw new Error("Session de paiement Stripe indisponible.");
      }

      const data = await activateSubscription(idToken, planId);
      setSubscription(data);
      closePaywall();
      return data;
    },
    [getIdToken, subscription?.stripeConfigured, closePaywall],
  );

  const syncSubscription = useCallback(async () => {
    const idToken = await getIdToken();
    const data = await syncBillingSubscription(idToken);
    setSubscription(data);
    return data;
  }, [getIdToken]);

  const openBillingPortal = useCallback(async () => {
    setPortalError(null);
    setPortalLoading(true);
    try {
      const idToken = await getIdToken();
      const { url } = await createBillingPortalSession(idToken);
      if (url) {
        window.location.assign(url);
        return;
      }
      throw new Error("URL du portail Stripe indisponible.");
    } catch (err) {
      setPortalError(err.message);
      throw err;
    } finally {
      setPortalLoading(false);
    }
  }, [getIdToken]);

  const cancelPlan = useCallback(async () => {
    const idToken = await getIdToken();
    const data = await cancelSubscription(idToken);
    setSubscription(data);
    return data;
  }, [getIdToken]);

  const handleGenerationError = useCallback(
    (err) => {
      if (err.status === 402 && err.code) {
        openPaywall(err.code);
        return true;
      }
      if (err.status === 403 && err.code) {
        openPaywall(err.code);
        return true;
      }
      return false;
    },
    [openPaywall],
  );

  const planId = subscription?.subscription?.planId ?? null;

  const hasFeature = useCallback(
    (featureKey) => {
      if (subscription?.demoMode && !subscription?.stripeConfigured) {
        return true;
      }
      return checkFeature(planId, featureKey);
    },
    [planId, subscription?.demoMode, subscription?.stripeConfigured],
  );

  const value = useMemo(
    () => ({
      subscription,
      loading,
      refreshSubscription,
      syncSubscription,
      startCheckout,
      openBillingPortal,
      cancelPlan,
      canGenerate: subscription?.canGenerate ?? false,
      trialRemaining: subscription?.trialRemaining ?? 0,
      trialUsed: subscription?.trialUsed ?? 0,
      trialLimit: subscription?.trialLimit ?? 3,
      plan: subscription?.plan ?? null,
      monthlyRemaining: subscription?.monthlyRemaining,
      monthlyLimit: subscription?.monthlyLimit,
      deepThinkingLimit: subscription?.deepThinkingLimit,
      deepThinkingRemaining: subscription?.deepThinkingRemaining,
      canUseDeepThinking: subscription?.canUseDeepThinking ?? false,
      paywallOpen,
      quotaModalOpen,
      paywallReason,
      openPaywall,
      closePaywall,
      handleGenerationError,
      isSubscribed: subscription?.subscription?.status === "active",
      stripeConfigured: subscription?.stripeConfigured ?? false,
      stripeFrontendReady:
        (subscription?.stripeConfigured ?? false) &&
        isStripePublishableKeyConfigured,
      canManageBilling: subscription?.canManageBilling ?? false,
      portalLoading,
      portalError,
      clearPortalError: () => setPortalError(null),
      demoMode: subscription?.demoMode ?? true,
      hasFeature,
      planId,
    }),
    [
      subscription,
      loading,
      refreshSubscription,
      syncSubscription,
      startCheckout,
      openBillingPortal,
      cancelPlan,
      paywallOpen,
      quotaModalOpen,
      paywallReason,
      openPaywall,
      closePaywall,
      handleGenerationError,
      portalLoading,
      portalError,
      hasFeature,
      planId,
    ],
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error(
      "useSubscription doit être utilisé dans un SubscriptionProvider.",
    );
  }
  return context;
}
