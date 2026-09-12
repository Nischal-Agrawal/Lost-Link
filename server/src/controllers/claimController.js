import { claimService } from "../services/claimService.js";
import {
  createClaimSchema,
} from "../validators/claimValidators.js";

function handleError(res, error) {
  const errorMap = {
    ITEM_NOT_FOUND: [404, "Item not found"],
    CLAIM_NOT_FOUND: [404, "Claim not found"],
    FORBIDDEN: [403, "You are not allowed to perform this action"],
    ITEM_NOT_ACTIVE: [400, "This item is no longer active"],
    CLAIM_ALREADY_EXISTS: [
      409,
      "You already have a pending claim for this item",
    ],
    CLAIM_ALREADY_PROCESSED: [
      409,
      "This claim has already been processed",
    ],
  };

  const mapped = errorMap[error.message];

  if (mapped) {
    return res.status(mapped[0]).json({
      success: false,
      message: mapped[1],
    });
  }

  console.error(error);

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}

export const claimController = {
  async create(req, res) {
    try {
      const data = createClaimSchema.parse(req.body);

      const claim = await claimService.createClaim(
        req.params.itemId,
        req.user.id,
        data.message
      );

      return res.status(201).json({
        success: true,
        claim,
      });
    } catch (error) {
      if (error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          message: error.issues[0]?.message || "Invalid claim",
        });
      }

      return handleError(res, error);
    }
  },

  async mine(req, res) {
    try {
      const claims = await claimService.getMyClaims(req.user.id);

      return res.json({
        success: true,
        claims,
      });
    } catch (error) {
      return handleError(res, error);
    }
  },

  async forItem(req, res) {
    try {
      const claims = await claimService.getItemClaims(
        req.params.itemId,
        req.user.id
      );

      return res.json({
        success: true,
        claims,
      });
    } catch (error) {
      return handleError(res, error);
    }
  },

};