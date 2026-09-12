import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { claimController } from "../controllers/claimController.js";

const router = Router();

router.use(requireAuth);

router.post("/items/:itemId/claims", claimController.create);

router.get("/claims/mine", claimController.mine);

router.get("/items/:itemId/claims", claimController.forItem);

export default router;