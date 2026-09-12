import {
  registerSchema,
  loginSchema
} from "../validators/authValidators.js";

import {
  registerUser,
  loginUser,
  getCurrentUser
} from "../services/authService.js";

import {
  getAuthCookieOptions,
  getClearCookieOptions
} from "../utils/jwt.js";

function parseValidationError(error) {
  if (error?.issues) {
    return error.issues
      .map((issue) => issue.message)
      .join(", ");
  }

  return "Invalid request";
}

export async function register(req, res, next) {
  try {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parseValidationError(parsed.error)
      });
    }

    const result = await registerUser(parsed.data);

    res.cookie(
      "lostlink_token",
      result.token,
      getAuthCookieOptions()
    );

    return res.status(201).json({
      success: true,
      data: {
        user: result.user
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parseValidationError(parsed.error)
      });
    }

    const result = await loginUser(parsed.data);

    res.cookie(
      "lostlink_token",
      result.token,
      getAuthCookieOptions()
    );

    return res.status(200).json({
      success: true,
      data: {
        user: result.user
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(_req, res, next) {
  try {
    res.clearCookie(
      "lostlink_token",
      getClearCookieOptions()
    );

    return res.status(200).json({
      success: true,
      data: {
        message: "Logged out successfully"
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function me(req, res, next) {
  try {
    const user = await getCurrentUser(req.user.id);

    return res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
}