import { z } from "zod";

export const createClaimSchema = z.object({
  message: z
    .string()
    .trim()
    .min(10, "Claim message must be at least 10 characters")
    .max(1000, "Claim message must be at most 1000 characters"),
});

export const updateClaimSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});