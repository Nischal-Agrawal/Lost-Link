import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

const JWT_EXPIRES_IN = "7d";

export function generateToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role
    },
    env.JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN
    }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}

export function getAuthCookieOptions() {
  const isProduction = env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/"
  };
}

export function getClearCookieOptions() {
  const options = getAuthCookieOptions();

  return {
    httpOnly: options.httpOnly,
    secure: options.secure,
    sameSite: options.sameSite,
    path: options.path
  };
}