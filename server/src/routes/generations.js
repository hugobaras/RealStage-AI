import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  getUserCredits,
  listGenerations,
  updateGenerationFavorite,
} from "../services/generationStore.js";
import { getSubscriptionState } from "../services/subscriptionService.js";
import { isFirebaseConfigured } from "../services/firebaseAdmin.js";

const router = Router();

router.get("/generations", requireAuth, async (req, res, next) => {
  try {
    if (!isFirebaseConfigured() || !req.user) {
      return res.json({ generations: [], creditsUsed: 0 });
    }

    const propertyId = req.query.propertyId ?? null;

    const subscription = await getSubscriptionState(req.user.uid);
    const limit = subscription.plan?.id === "agence" ? 200 : 50;

    const [generations, creditsUsed] = await Promise.all([
      listGenerations(req.user.uid, limit, propertyId || null),
      getUserCredits(req.user.uid),
    ]);

    res.json({ generations, creditsUsed, subscription });
  } catch (err) {
    next(err);
  }
});

router.patch("/generations/:id", requireAuth, async (req, res, next) => {
  try {
    if (!isFirebaseConfigured() || !req.user) {
      return res.status(503).json({ error: "Historique non disponible." });
    }

    const { favorite } = req.body;
    if (typeof favorite !== "boolean") {
      return res.status(400).json({ error: "favorite must be a boolean" });
    }

    const generation = await updateGenerationFavorite(
      req.user.uid,
      req.params.id,
      favorite,
    );

    res.json({ generation });
  } catch (err) {
    if (err.status === 404) {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
});

export default router;
