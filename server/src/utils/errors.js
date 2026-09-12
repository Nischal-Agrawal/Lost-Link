export class AppError extends Error {
  constructor(message, statusCode = 500, code = "INTERNAL_ERROR") {
    super(message);

    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}

export function notFound(message = "Resource not found") {
  return new AppError(message, 404, "NOT_FOUND");
}

export function unauthorized(message = "Authentication required") {
  return new AppError(message, 401, "UNAUTHORIZED");
}

export function forbidden(message = "You do not have permission to perform this action") {
  return new AppError(message, 403, "FORBIDDEN");
}

export function badRequest(message = "Invalid request") {
  return new AppError(message, 400, "BAD_REQUEST");
}

export function conflict(message = "Resource conflict") {
  return new AppError(message, 409, "CONFLICT");
}