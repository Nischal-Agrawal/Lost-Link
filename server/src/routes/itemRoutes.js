import { Router } from "express";

import {
  create,
  getById,
  list,
  update
} from "../controllers/itemController.js";

import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/", list);

router.get("/:id", getById);

router.post(
  "/",
  authenticate,
  create
);

router.put(
  "/:id",
  authenticate,
  update
);

export default router;