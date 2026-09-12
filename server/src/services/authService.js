import {
  conflict,
  unauthorized
} from "../utils/errors.js";

import {
  comparePassword,
  hashPassword
} from "../utils/password.js";

import { generateToken } from "../utils/jwt.js";

import {
  createUser,
  findUserByEmail,
  findUserById
} from "../repositories/userRepository.js";

export async function registerUser({
  name,
  email,
  password
}) {
  const normalizedEmail = email.toLowerCase().trim();

  const existingUser =
    await findUserByEmail(normalizedEmail);

  if (existingUser) {
    throw conflict(
      "An account with this email already exists"
    );
  }

  const passwordHash =
    await hashPassword(password);

  const user = await createUser({
    name,
    email: normalizedEmail,
    passwordHash
  });

  const token = generateToken(user);

  return {
    user,
    token
  };
}

export async function loginUser({
  email,
  password
}) {
  const normalizedEmail =
    email.toLowerCase().trim();

  const user =
    await findUserByEmail(normalizedEmail);

  if (!user) {
    throw unauthorized(
      "Invalid email or password"
    );
  }

  if (user.disabled) {
    throw unauthorized(
      "Your account has been disabled"
    );
  }

  const passwordMatches =
    await comparePassword(
      password,
      user.password
    );

  if (!passwordMatches) {
    throw unauthorized(
      "Invalid email or password"
    );
  }

  const publicUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    disabled: user.disabled,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };

  const token = generateToken(publicUser);

  return {
    user: publicUser,
    token
  };
}

export async function getCurrentUser(userId) {
  const user =
    await findUserById(userId);

  if (!user) {
    throw unauthorized(
      "User account no longer exists"
    );
  }

  if (user.disabled) {
    throw unauthorized(
      "Your account has been disabled"
    );
  }

  return user;
}