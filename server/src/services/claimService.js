import { claimRepository } from "../repositories/claimRepository.js";
import prisma from "../config/prisma.js";

export const claimService = {
  async createClaim(itemId, claimantId, message) {
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      select: {
        id: true,
        type: true,
        status: true,
        userId: true,
        title: true,
      },
    });

    if (!item) {
      const error = new Error("ITEM_NOT_FOUND");
      throw error;
    }

    if (item.status !== "ACTIVE") {
      const error = new Error("ITEM_NOT_ACTIVE");
      throw error;
    }

    const existingClaim = await claimRepository.findExisting(
      itemId,
      claimantId
    );

    if (existingClaim) {
      const error = new Error("CLAIM_ALREADY_EXISTS");
      throw error;
    }

    return claimRepository.create({
      itemId,
      claimantId,
      message,
      status: "PENDING",
    });
  },

  async getMyClaims(userId) {
    return claimRepository.findByClaimant(userId);
  },

  async getItemClaims(itemId, userId) {
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!item) {
      const error = new Error("ITEM_NOT_FOUND");
      throw error;
    }

    if (item.userId !== userId) {
      const error = new Error("FORBIDDEN");
      throw error;
    }

    return claimRepository.findByItem(itemId);
  },

  async updateClaim(claimId, userId, status) {
    const claim = await claimRepository.findById(claimId);

    if (!claim) {
      const error = new Error("CLAIM_NOT_FOUND");
      throw error;
    }

    if (claim.item.userId !== userId) {
      const error = new Error("FORBIDDEN");
      throw error;
    }

    if (claim.status !== "PENDING") {
      const error = new Error("CLAIM_ALREADY_PROCESSED");
      throw error;
    }

    if (status === "APPROVED") {
      return claimRepository.approve(claimId);
    }

    return claimRepository.reject(claimId);
  },
};