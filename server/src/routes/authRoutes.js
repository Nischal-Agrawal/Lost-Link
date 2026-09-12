import { Router } from "express";

import {
  register,
  login,
  logout,
  me
} from "../controllers/authController.js";

import { authenticate } from "../middleware/auth.js";
import { authRateLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post(
  "/register",
  authRateLimiter,
  register
);

router.post(
  "/login",
  authRateLimiter,
  login
);

router.post(
  "/logout",
  authenticate,
  logout
);

router.get(
  "/me",
  authenticate,
  me
);

export default router;