import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import { env } from "./config/env.js";

import authRoutes from "./routes/authRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import matchingRoutes from "./routes/matchingRoutes.js";
import claimRoutes from "./routes/claimRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.disable("x-powered-by");

app.use(
  cors({
    origin: env.CLIENT_URL || true,
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/*
 * Health check
 */
app.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "LostLink",
    status: "healthy",
  });
});

/*
 * API routes
 */
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api", matchingRoutes);
app.use("/api", claimRoutes);
app.use("/api/admin", adminRoutes);
/*
 * Production React frontend
 */
const clientDistPath = path.resolve(
  __dirname,
  "../../client/dist"
);

app.use(express.static(clientDistPath));

/*
 * SPA fallback.
 *
 * API routes have already been mounted above, so this only
 * handles frontend navigation such as /items/123.
 */
app.use((req, res, next) => {
  if (
    req.method === "GET" &&
    !req.path.startsWith("/api") &&
    req.path !== "/health"
  ) {
    return res.sendFile(
      path.join(clientDistPath, "index.html")
    );
  }

  next();
});

/*
 * 404
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/*
 * Global error handler
 */
app.use((error, req, res, next) => {
  console.error(error);

  res.status(error.status || 500).json({
    success: false,
    message:
      env.NODE_ENV === "production"
        ? "Internal server error"
        : error.message || "Internal server error",
  });
});

export default app;