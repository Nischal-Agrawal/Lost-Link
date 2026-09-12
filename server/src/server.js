import app from "./app.js";
import { env } from "./config/env.js";
import prisma from "./config/prisma.js";

const server = app.listen(env.PORT, () => {
  console.log(`LostLink server running on port ${env.PORT}`);
});

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down...`);

  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));