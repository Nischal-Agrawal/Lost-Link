import { z } from "zod";

const optionalEnum = (values) =>
  z.enum(values).optional();

export const itemQuerySchema = z.object({
  search: z
    .string()
    .trim()
    .max(100, "Search query is too long")
    .optional()
    .default(""),

  type: optionalEnum(["LOST", "FOUND"]),

  category: z
    .string()
    .trim()
    .max(100)
    .optional(),

  location: z
    .string()
    .trim()
    .max(200)
    .optional(),

  status: optionalEnum([
    "ACTIVE",
    "CLAIMED",
    "RESOLVED"
  ]),

  page: z.coerce
    .number()
    .int()
    .min(1)
    .max(100000)
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(50)
    .default(12)
});