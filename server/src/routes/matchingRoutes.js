import { Router } from "express";

import {
  getMatches
} from "../controllers/matchingController.js";

import {
  authenticate
} from "../middleware/auth.js";

const router = Router();

router.get(
  "/items/:id/matches",
  authenticate,
  getMatches
);

export default router;