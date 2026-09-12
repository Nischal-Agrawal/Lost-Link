import bcrypt from "bcrypt";
import prisma from "../src/config/prisma.js";

async function main() {
  const adminPassword = await bcrypt.hash(
    "Admin@12345",
    12
  );

  const existingAdmin = await prisma.user.findUnique({
    where: {
      email: "admin@lostlink.local",
    },
  });

  await prisma.user.upsert({
    where: {
      email: "admin@lostlink.local",
    },
    update: {
      name: "LostLink Admin",
      password: adminPassword,
      role: "ADMIN",
      disabled: false,
    },
    create: {
      name: "LostLink Admin",
      email: "admin@lostlink.local",
      password: adminPassword,
      role: "ADMIN",
      disabled: false,
    },
  });

  console.log("Admin account is ready.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });