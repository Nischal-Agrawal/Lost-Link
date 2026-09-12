const attempts = new Map();

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 20;

function cleanupExpired(now) {
  for (const [key, record] of attempts.entries()) {
    if (now - record.firstAttempt >= WINDOW_MS) {
      attempts.delete(key);
    }
  }
}

export function authRateLimiter(req, res, next) {
  const now = Date.now();

  cleanupExpired(now);

  const forwardedFor = req.headers["x-forwarded-for"];
  const ip =
    typeof forwardedFor === "string"
      ? forwardedFor.split(",")[0].trim()
      : req.ip || "unknown";

  const key = `${ip}:${req.path}`;

  let record = attempts.get(key);

  if (!record || now - record.firstAttempt >= WINDOW_MS) {
    record = {
      firstAttempt: now,
      count: 0
    };

    attempts.set(key, record);
  }

  record.count += 1;

  if (record.count > MAX_ATTEMPTS) {
    const retryAfterSeconds = Math.ceil(
      (WINDOW_MS - (now - record.firstAttempt)) / 1000
    );

    res.setHeader("Retry-After", retryAfterSeconds);

    return res.status(429).json({
      success: false,
      message: "Too many authentication attempts. Please try again later."
    });
  }

  next();
}