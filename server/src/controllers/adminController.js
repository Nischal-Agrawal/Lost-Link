import { adminService } from "../services/adminService.js";

const errorMap = {
  USER_NOT_FOUND: [404, "User not found"],
  ITEM_NOT_FOUND: [404, "Item not found"],
  CLAIM_NOT_FOUND: [404, "Claim not found"],

  CANNOT_DISABLE_SELF: [
    400,
    "You cannot disable your own admin account",
  ],

  CANNOT_DISABLE_ADMIN: [
    400,
    "Admin accounts cannot be disabled",
  ],

  CANNOT_DELETE_SELF: [400, "You cannot delete your own admin account"],
  CANNOT_DELETE_ADMIN: [400, "Admin accounts cannot be deleted"],
  NO_PENDING_CLAIMS: [400, "This report has no pending claims"],
  AI_NOT_CONFIGURED: [503, "AI claim ranking is not configured"],
  AI_REQUEST_FAILED: [502, "The AI ranking request failed"],
  AI_INVALID_RESPONSE: [502, "The AI returned an invalid ranking"],

  USER_ALREADY_DISABLED: [
    409,
    "User is already disabled",
  ],

  USER_ALREADY_ENABLED: [
    409,
    "User is already enabled",
  ],

  CLAIM_ALREADY_PROCESSED: [
    409,
    "Claim has already been processed",
  ],
};

function handleError(res, error) {
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

export const adminController = {
  async dashboard(req, res) {
    try {
      const stats = await adminService.getDashboard();

      return res.json({
        success: true,
        stats,
      });
    } catch (error) {
      return handleError(res, error);
    }
  },

  async users(req, res) {
    try {
      const users = await adminService.getUsers();

      return res.json({
        success: true,
        users,
      });
    } catch (error) {
      return handleError(res, error);
    }
  },

  async disableUser(req, res) {
    try {
      const user = await adminService.disableUser(
        req.user.id,
        req.params.id
      );

      return res.json({
        success: true,
        user,
      });
    } catch (error) {
      return handleError(res, error);
    }
  },

  async enableUser(req, res) {
    try {
      const user = await adminService.enableUser(
        req.params.id
      );

      return res.json({
        success: true,
        user,
      });
    } catch (error) {
      return handleError(res, error);
    }
  },

  async deleteUser(req, res) {
    try {
      await adminService.deleteUser(req.user.id, req.params.id);
      return res.json({ success: true });
    } catch (error) {
      return handleError(res, error);
    }
  },

  async items(req, res) {
    try {
      const items = await adminService.getItems();

      return res.json({
        success: true,
        items,
      });
    } catch (error) {
      return handleError(res, error);
    }
  },

  async deleteItem(req, res) {
    try {
      await adminService.deleteItem(req.params.id);

      return res.json({
        success: true,
        message: "Item deleted successfully",
      });
    } catch (error) {
      return handleError(res, error);
    }
  },

  async claims(req, res) {
    try {
      const claims = await adminService.getClaims();

      return res.json({
        success: true,
        claims,
      });
    } catch (error) {
      return handleError(res, error);
    }
  },

  async updateClaim(req, res) {
    try {
      const { status } = req.body;

      if (!["APPROVED", "REJECTED"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid claim status",
        });
      }

      const claim = await adminService.updateClaim(
        req.params.id,
        status
      );

      return res.json({
        success: true,
        claim,
      });
    } catch (error) {
      return handleError(res, error);
    }
  },

  async rankClaims(req, res) {
    try {
      const result = await adminService.rankClaims(req.params.itemId);
      return res.json({ success: true, data: result });
    } catch (error) {
      return handleError(res, error);
    }
  },
};