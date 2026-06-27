import { Router } from "express";
import { adminGlobalSearch } from "../../services/adminSearchService.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q?.trim()) {
      return res.status(400).json({ error: "Paramètre q requis." });
    }
    const result = await adminGlobalSearch(q);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
