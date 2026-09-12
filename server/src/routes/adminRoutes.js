import { Router } from "express";

import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";
import { adminController } from "../controllers/adminController.js";

const router = Router();

router.use(requireAuth);
router.use(requireAdmin);

router.get("/dashboard", adminController.dashboard);

router.get("/users", adminController.users);

router.patch(
  "/users/:id/disable",
  adminController.disableUser
);

router.patch(
  "/users/:id/enable",
  adminController.enableUser
);

router.delete(
  "/users/:id",
  adminController.deleteUser
);

router.get("/items", adminController.items);

router.delete(
  "/items/:id",
  adminController.deleteItem
);

router.get("/claims", adminController.claims);

router.post(
  "/items/:itemId/claim-ranking",
  adminController.rankClaims
);

router.patch(
  "/claims/:id",
  adminController.updateClaim
);

export default router;