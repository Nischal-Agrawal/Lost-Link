import { z } from "zod";

const itemTypeSchema = z.enum(["LOST", "FOUND"]);

const itemStatusSchema = z.enum([
  "ACTIVE",
  "CLAIMED",
  "RESOLVED"
]);

const textField = (label, maxLength) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(maxLength, `${label} is too long`);

const optionalTextField = (maxLength) =>
  z
    .string()
    .trim()
    .max(maxLength)
    .optional()
    .nullable()
    .transform((value) => {
      if (value === undefined || value === null || value === "") {
        return null;
      }

      return value;
    });

const dateSchema = z
  .string()
  .trim()
  .refine(
    (value) => !Number.isNaN(Date.parse(value)),
    "Please provide a valid date"
  )
  .transform((value) => new Date(value));

export const createItemSchema = z.object({
  type: itemTypeSchema,

  title: textField("Title", 150),

  description: textField("Description", 3000),

  category: textField("Category", 100),

  color: textField("Color", 50),

  brand: optionalTextField(100),

  location: textField("Location", 200),

  date: dateSchema,

  imageUrl: z
    .string()
    .trim()
    .url("Image URL must be a valid URL")
    .max(2000, "Image URL is too long")
    .optional()
    .nullable()
    .or(z.literal(""))
    .transform((value) => {
      if (!value) {
        return null;
      }

      return value;
    })
});

export const updateItemSchema = z
  .object({
    type: itemTypeSchema.optional(),

    title: textField("Title", 150).optional(),

    description: textField("Description", 3000).optional(),

    category: textField("Category", 100).optional(),

    color: textField("Color", 50).optional(),

    brand: optionalTextField(100),

    location: textField("Location", 200).optional(),

    date: dateSchema.optional(),

    imageUrl: z
      .string()
      .trim()
      .url("Image URL must be a valid URL")
      .max(2000, "Image URL is too long")
      .optional()
      .nullable()
      .or(z.literal(""))
      .transform((value) => {
        if (!value) {
          return null;
        }

        return value;
      }),

    status: itemStatusSchema.optional()
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided"
  );