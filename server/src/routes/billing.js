import express from "express";
import {
  constructWebhookEvent,
  handleStripeWebhook,
  isStripeConfigured,
} from "../services/stripeService.js";
import { logStripeWebhook } from "../services/stripeWebhookLogService.js";

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

    let event;
    try {
      event = constructWebhookEvent(req.body, signature);
    } catch (err) {
      console.error("Webhook Stripe:", err.message);
      await logStripeWebhook({
        eventId: null,
        type: "unknown",
        status: "error",
        error: err.message,
      }).catch(() => {});
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    try {
      const { uid } = await handleStripeWebhook(event);
      const payloadPreview = JSON.stringify(event.data?.object ?? {}).slice(
        0,
        2048,
      );
      await logStripeWebhook({
        eventId: event.id,
        type: event.type,
        status: "success",
        uid,
        payloadPreview,
      });
      res.json({ received: true });
    } catch (err) {
      console.error("Webhook Stripe:", err.message);
      const payloadPreview = JSON.stringify(event.data?.object ?? {}).slice(
        0,
        2048,
      );
      await logStripeWebhook({
        eventId: event.id,
        type: event.type,
        status: "error",
        error: err.message,
        payloadPreview,
      }).catch(() => {});
      const { notifyAdmins } =
        await import("../services/notificationService.js");
      notifyAdmins({
        trigger: "webhookError",
        subject: `Webhook Stripe en erreur: ${event.type}`,
        text: err.message,
      }).catch(() => {});
      res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }
  },
);

export default router;
