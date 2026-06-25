import { Router } from "express";
import { PLANS } from "../config/plans.js";
import { getStripeConfig } from "../config.js";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  activatePlanDemo,
  cancelSubscriptionDemo,
  getSubscriptionState,
} from "../services/subscriptionService.js";
import {
  cancelStripeSubscription,
  createBillingPortalSession,
  createCheckoutSession,
  isStripeConfigured,
  syncSubscriptionForUser,
} from "../services/stripeService.js";

const router = Router();

router.get("/subscription", requireAuth, async (req, res, next) => {
  try {
    if (!req.user) {
      return res.json({
        canGenerate: true,
        demoMode: true,
        stripeConfigured: false,
      });
    }
    if (isStripeConfigured()) {
      try {
        await syncSubscriptionForUser(req.user.uid);
      } catch {
        /* pas encore de client Stripe */
      }
    }
    const state = await getSubscriptionState(req.user.uid);
    res.json(state);
  } catch (err) {
    next(err);
  }
});

router.get("/subscription/plans", (_req, res) => {
  res.json({
    plans: Object.values(PLANS),
    demoMode: !isStripeConfigured(),
    stripeConfigured: isStripeConfigured(),
  });
});

router.post("/subscription/activate", requireAuth, async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentification requise." });
    }

    if (isStripeConfigured()) {
      return res.status(400).json({
        error: "Utilisez le paiement Stripe pour activer un forfait.",
      });
    }

    const { planId } = req.body;
    if (!planId) {
      return res.status(400).json({ error: "planId requis." });
    }
    const state = await activatePlanDemo(req.user.uid, planId);
    res.json(state);
  } catch (err) {
    next(err);
  }
});

router.post("/subscription/cancel", requireAuth, async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentification requise." });
    }

    if (isStripeConfigured()) {
      await cancelStripeSubscription(req.user.uid);
      return res.json(await getSubscriptionState(req.user.uid));
    }

    const state = await cancelSubscriptionDemo(req.user.uid);
    res.json(state);
  } catch (err) {
    next(err);
  }
});

router.post("/billing/checkout", requireAuth, async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentification requise." });
    }

    if (!isStripeConfigured()) {
      return res.status(503).json({
        error: "Stripe non configuré. Ajoutez les clés dans server/.env",
      });
    }

    const { planId, embedded = true } = req.body;
    if (!planId) {
      return res.status(400).json({ error: "planId requis." });
    }

    const session = await createCheckoutSession({
      uid: req.user.uid,
      email: req.user.email,
      planId,
      embedded: Boolean(embedded),
    });

    res.json(session);
  } catch (err) {
    next(err);
  }
});

router.post("/billing/portal", requireAuth, async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentification requise." });
    }

    if (!isStripeConfigured()) {
      return res.status(503).json({ error: "Stripe non configuré." });
    }

    const session = await createBillingPortalSession(req.user.uid);
    res.json({ url: session.url });
  } catch (err) {
    next(err);
  }
});

router.post("/billing/sync", requireAuth, async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentification requise." });
    }

    if (!isStripeConfigured()) {
      return res.status(503).json({ error: "Stripe non configuré." });
    }

    await syncSubscriptionForUser(req.user.uid);
    const state = await getSubscriptionState(req.user.uid);
    res.json(state);
  } catch (err) {
    next(err);
  }
});

export default router;
