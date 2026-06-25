import express from "express";
import {
  constructWebhookEvent,
  handleStripeWebhook,
  isStripeConfigured,
} from "../services/stripeService.js";

const router = express.Router();

router.post(
  "/billing/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    if (!isStripeConfigured()) {
      return res.status(501).json({ error: "Stripe non configuré." });
    }

    const signature = req.headers["stripe-signature"];
    if (!signature) {
      return res.status(400).json({ error: "Signature Stripe manquante." });
    }

    try {
      const event = constructWebhookEvent(req.body, signature);
      await handleStripeWebhook(event);
      res.json({ received: true });
    } catch (err) {
      console.error("Webhook Stripe:", err.message);
      res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }
  },
);

export default router;
