import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PASSWORD_ROUNDS = 12;

async function main() {
  const adminPassword = await bcrypt.hash("Admin@12345", PASSWORD_ROUNDS);
  const userPassword = await bcrypt.hash("User@12345", PASSWORD_ROUNDS);

  const admin = await prisma.user.upsert({
    where: {
      email: "admin@lostlink.local"
    },
    update: {
      name: "LostLink Admin",
      role: "ADMIN",
      disabled: false,
      password: adminPassword
    },
    create: {
      name: "LostLink Admin",
      email: "admin@lostlink.local",
      password: adminPassword,
      role: "ADMIN"
    }
  });

  const userOne = await prisma.user.upsert({
    where: {
      email: "alex@lostlink.local"
    },
    update: {
      name: "Alex Sharma",
      disabled: false,
      password: userPassword
    },
    create: {
      name: "Alex Sharma",
      email: "alex@lostlink.local",
      password: userPassword
    }
  });

  const userTwo = await prisma.user.upsert({
    where: {
      email: "riya@lostlink.local"
    },
    update: {
      name: "Riya Mehta",
      disabled: false,
      password: userPassword
    },
    create: {
      name: "Riya Mehta",
      email: "riya@lostlink.local",
      password: userPassword
    }
  });

  await prisma.claim.deleteMany();
  await prisma.item.deleteMany();

  await prisma.item.createMany({
    data: [
      {
        type: "LOST",
        title: "Black Nike Water Bottle",
        description:
          "Black Nike reusable water bottle with a small white Nike logo. I last had it near the library study area.",
        category: "Water Bottle",
        color: "Black",
        brand: "Nike",
        location: "Central Library",
        date: new Date("2026-09-10"),
        status: "ACTIVE",
        userId: userOne.id
      },
      {
        type: "FOUND",
        title: "Black Nike Bottle",
        description:
          "Found a black Nike water bottle with a white logo near the library entrance.",
        category: "Water Bottle",
        color: "Black",
        brand: "Nike",
        location: "Central Library",
        date: new Date("2026-09-10"),
        status: "ACTIVE",
        userId: userTwo.id
      },
      {
        type: "LOST",
        title: "Silver Wireless Headphones",
        description:
          "Silver Sony wireless headphones lost around the computer laboratory. They have padded ear cups.",
        category: "Headphones",
        color: "Silver",
        brand: "Sony",
        location: "Computer Laboratory",
        date: new Date("2026-09-09"),
        status: "ACTIVE",
        userId: userOne.id
      },
      {
        type: "FOUND",
        title: "Silver Sony Headphones",
        description:
          "Found silver Sony wireless headphones on a desk inside the computer lab.",
        category: "Headphones",
        color: "Silver",
        brand: "Sony",
        location: "Computer Laboratory",
        date: new Date("2026-09-09"),
        status: "ACTIVE",
        userId: userTwo.id
      },
      {
        type: "LOST",
        title: "Blue College Backpack",
        description:
          "Dark blue backpack with several notebooks and a small keychain attached to the front zip.",
        category: "Backpack",
        color: "Blue",
        brand: null,
        location: "Student Cafeteria",
        date: new Date("2026-09-08"),
        status: "ACTIVE",
        userId: userOne.id
      },
      {
        type: "FOUND",
        title: "Dark Blue Backpack",
        description:
          "Found a dark blue backpack containing notebooks near the cafeteria seating area.",
        category: "Backpack",
        color: "Blue",
        brand: null,
        location: "Student Cafeteria",
        date: new Date("2026-09-08"),
        status: "ACTIVE",
        userId: userTwo.id
      }
    ]
  });

  console.log("LostLink seed completed.");
  console.log("");
  console.log("Demo admin:");
  console.log("Email: admin@lostlink.local");
  console.log("Password: Admin@12345");
  console.log("");
  console.log("Demo users:");
  console.log("Email: alex@lostlink.local");
  console.log("Password: User@12345");
  console.log("");
  console.log("Email: riya@lostlink.local");
  console.log("Password: User@12345");
  console.log("");
  console.log(`Admin ID: ${admin.id}`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });