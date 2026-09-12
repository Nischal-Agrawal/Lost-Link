import { prisma } from "../config/prisma.js";

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  disabled: true,
  createdAt: true,
  updatedAt: true
};

export async function findUserByEmail(email) {
  return prisma.user.findUnique({
    where: {
      email
    }
  });
}

export async function findUserById(id) {
  return prisma.user.findUnique({
    where: {
      id
    },
    select: publicUserSelect
  });
}

export async function createUser({
  name,
  email,
  passwordHash
}) {
  return prisma.user.create({
    data: {
      name,
      email,
      password: passwordHash
    },
    select: publicUserSelect
  });
}