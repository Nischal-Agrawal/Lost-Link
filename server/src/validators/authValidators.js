import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .email("Please provide a valid email address")
  .max(254, "Email address is too long")
  .transform((value) => value.toLowerCase());

const passwordSchema = z
  .string()
  .min(8, "Password must contain at least 8 characters")
  .max(128, "Password must not exceed 128 characters");

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),

  email: emailSchema,

  password: passwordSchema
});

export const loginSchema = z.object({
  email: emailSchema,

  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Password must not exceed 128 characters")
});