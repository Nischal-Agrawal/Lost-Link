import prisma from "../config/prisma.js";
import { adminRepository } from "../repositories/adminRepository.js";
import { rankClaimsWithAi } from "../matching/claimRanker.js";

export const adminService = {
  async getDashboard() {
    return adminRepository.getStats();
  },

  async getUsers() {
    return adminRepository.getUsers();
  },

  async disableUser(adminId, userId) {
    if (adminId === userId) {
      const error = new Error("CANNOT_DISABLE_SELF");
      throw error;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        role: true,
        disabled: true,
      },
    });

    if (!user) {
      const error = new Error("USER_NOT_FOUND");
      throw error;
    }

    if (user.role === "ADMIN") {
      const error = new Error("CANNOT_DISABLE_ADMIN");
      throw error;
    }

    if (user.disabled) {
      const error = new Error("USER_ALREADY_DISABLED");
      throw error;
    }

    return adminRepository.setUserDisabled(userId, true);
  },

  async enableUser(userId) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        disabled: true,
      },
    });

    if (!user) {
      const error = new Error("USER_NOT_FOUND");
      throw error;
    }

    if (!user.disabled) {
      const error = new Error("USER_ALREADY_ENABLED");
      throw error;
    }

    return adminRepository.setUserDisabled(userId, false);
  },

  async deleteUser(adminId, userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    if (adminId === userId) {
      throw new Error("CANNOT_DELETE_SELF");
    }

    if (user.role === "ADMIN") {
      throw new Error("CANNOT_DELETE_ADMIN");
    }

    return adminRepository.deleteUser(userId);
  },

  async getItems() {
    return adminRepository.getItems();
  },

  async deleteItem(itemId) {
    const item = await prisma.item.findUnique({
      where: {
        id: itemId,
      },
      select: {
        id: true,
      },
    });

    if (!item) {
      const error = new Error("ITEM_NOT_FOUND");
      throw error;
    }

    await adminRepository.deleteItem(itemId);

    return {
      success: true,
    };
  },

  async getClaims() {
    return adminRepository.getClaims();
  },

  async rankClaims(itemId) {
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      select: {
        id: true,
        title: true,
        type: true,
        category: true,
        color: true,
        brand: true,
        location: true,
        date: true,
        description: true,
        claims: {
          where: { status: "PENDING" },
          orderBy: { createdAt: "asc" },
          take: 10,
          include: {
            claimant: { select: { name: true } },
          },
        },
      },
    });

    if (!item) {
      throw new Error("ITEM_NOT_FOUND");
    }

    if (!item.claims.length) {
      throw new Error("NO_PENDING_CLAIMS");
    }

    return rankClaimsWithAi(item, item.claims);
  },

  async updateClaim(claimId, status) {
    const claim = await prisma.claim.findUnique({
      where: {
        id: claimId,
      },
      include: {
        item: true,
      },
    });

    if (!claim) {
      const error = new Error("CLAIM_NOT_FOUND");
      throw error;
    }

    if (claim.status !== "PENDING") {
      const error = new Error("CLAIM_ALREADY_PROCESSED");
      throw error;
    }

    if (status === "APPROVED") {
      return prisma.$transaction(async (tx) => {
        const updatedClaim = await tx.claim.update({
          where: {
            id: claimId,
          },
          data: {
            status: "APPROVED",
          },
        });

        await tx.claim.updateMany({
          where: {
            itemId: claim.itemId,
            id: {
              not: claimId,
            },
            status: "PENDING",
          },
          data: {
            status: "REJECTED",
          },
        });

        await tx.item.update({
          where: {
            id: claim.itemId,
          },
          data: {
            status: "RESOLVED",
          },
        });

        return updatedClaim;
      });
    }

    return adminRepository.updateClaimStatus(
      claimId,
      "REJECTED"
    );
  },
};