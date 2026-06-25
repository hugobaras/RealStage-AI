import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requirePlan } from "../middleware/requirePlan.js";
import {
  assertPropertyOwned,
  createProperty,
  deleteProperty,
  getProperty,
  listProperties,
  updateProperty,
} from "../services/propertyStore.js";
import { listGenerations } from "../services/generationStore.js";
import { isFirebaseConfigured } from "../services/firebaseAdmin.js";

const router = Router();

router.get(
  "/properties",
  requireAuth,
  requirePlan("agence"),
  async (req, res, next) => {
    try {
      if (!isFirebaseConfigured()) {
        return res.json({ properties: [] });
      }
      const properties = await listProperties(req.user.uid);
      res.json({ properties });
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  "/properties",
  requireAuth,
  requirePlan("agence"),
  async (req, res, next) => {
    try {
      if (!isFirebaseConfigured()) {
        return res.status(503).json({ error: "Firebase non configuré." });
      }

      const { label, address } = req.body;
      if (!address?.trim()) {
        return res.status(400).json({ error: "address requis." });
      }

      const property = await createProperty(req.user.uid, { label, address });
      res.status(201).json({ property });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/properties/:id",
  requireAuth,
  requirePlan("agence"),
  async (req, res, next) => {
    try {
      if (!isFirebaseConfigured()) {
        return res.status(503).json({ error: "Firebase non configuré." });
      }

      const property = await getProperty(req.user.uid, req.params.id);
      if (!property) {
        return res.status(404).json({ error: "Bien introuvable." });
      }
      res.json({ property });
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  "/properties/:id",
  requireAuth,
  requirePlan("agence"),
  async (req, res, next) => {
    try {
      if (!isFirebaseConfigured()) {
        return res.status(503).json({ error: "Firebase non configuré." });
      }

      const { label, address, roomProgress } = req.body;
      const property = await updateProperty(req.user.uid, req.params.id, {
        label,
        address,
        roomProgress,
      });
      res.json({ property });
    } catch (err) {
      if (err.status === 404) {
        return res.status(404).json({ error: err.message });
      }
      next(err);
    }
  },
);

router.delete(
  "/properties/:id",
  requireAuth,
  requirePlan("agence"),
  async (req, res, next) => {
    try {
      if (!isFirebaseConfigured()) {
        return res.status(503).json({ error: "Firebase non configuré." });
      }

      await deleteProperty(req.user.uid, req.params.id);
      res.json({ ok: true });
    } catch (err) {
      if (err.status === 404) {
        return res.status(404).json({ error: err.message });
      }
      next(err);
    }
  },
);

router.get(
  "/properties/:id/generations",
  requireAuth,
  requirePlan("agence"),
  async (req, res, next) => {
    try {
      if (!isFirebaseConfigured()) {
        return res.json({ generations: [] });
      }

      await assertPropertyOwned(req.user.uid, req.params.id);
      const all = await listGenerations(req.user.uid, 200);
      const generations = all.filter((g) => g.propertyId === req.params.id);
      res.json({ generations });
    } catch (err) {
      if (err.status === 404) {
        return res.status(404).json({ error: err.message });
      }
      next(err);
    }
  },
);

export default router;
