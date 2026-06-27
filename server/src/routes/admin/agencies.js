import { Router } from "express";
import {
  listAgenciesAdmin,
  getAgencyDetail,
} from "../../services/agencyWorkspaceService.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const agencies = await listAgenciesAdmin();
    res.json({ agencies });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const agency = await getAgencyDetail(req.params.id);
    res.json({ agency });
  } catch (err) {
    if (err.status === 404) {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
});

export default router;
