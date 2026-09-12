import { forbidden } from "../utils/errors.js";

export function requireAdmin(req, _res, next) {
  if (!req.user) {
    return next(forbidden());
  }

  if (req.user.role !== "ADMIN") {
    return next(
      forbidden("Administrator access is required")
    );
  }

  next();
}