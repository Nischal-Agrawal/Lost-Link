import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.lostlink_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const decoded = jwt.verify(
      token,
      env.JWT_SECRET
    );

    const userId = decoded.sub;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        disabled: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.disabled) {
      return res.status(403).json({
        success: false,
        message: "Your account has been disabled",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }
}

/*
 * Alias kept for compatibility with any older code
 * that imports authenticate.
 */
export const authenticate = requireAuth;