import prisma from "../config/prisma.js";

export const adminRepository = {
  async getStats() {
    const [
      totalUsers,
      activeUsers,
      disabledUsers,
      totalItems,
      lostItems,
      foundItems,
      activeItems,
      resolvedItems,
      totalClaims,
      pendingClaims,
    ] = await Promise.all([
      prisma.user.count(),

      prisma.user.count({
        where: { disabled: false },
      }),

      prisma.user.count({
        where: { disabled: true },
      }),

      prisma.item.count(),

      prisma.item.count({
        where: { type: "LOST" },
      }),

      prisma.item.count({
        where: { type: "FOUND" },
      }),

      prisma.item.count({
        where: { status: "ACTIVE" },
      }),

      prisma.item.count({
        where: { status: "RESOLVED" },
      }),

      prisma.claim.count(),

      prisma.claim.count({
        where: { status: "PENDING" },
      }),
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        disabled: disabledUsers,
      },

      items: {
        total: totalItems,
        lost: lostItems,
        found: foundItems,
        active: activeItems,
        resolved: resolvedItems,
      },

      claims: {
        total: totalClaims,
        pending: pendingClaims,
      },
    };
  },

  async getUsers() {
    return prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        disabled: true,
        createdAt: true,
        _count: {
          select: {
            items: true,
            claims: true,
          },
        },
      },
    });
  },

  async getItems() {
    return prisma.item.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            disabled: true,
          },
        },
        _count: {
          select: {
            claims: true,
          },
        },
      },
    });
  },

  async getClaims() {
    return prisma.claim.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        item: {
          select: {
            id: true,
            title: true,
            type: true,
            status: true,
            userId: true,
          },
        },
        claimant: {
          select: {
            id: true,
            name: true,
            email: true,
            disabled: true,
          },
        },
      },
    });
  },

  async setUserDisabled(userId, disabled) {
    return prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        disabled,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        disabled: true,
      },
    });
  },

  async deleteUser(userId) {
    return prisma.user.delete({
      where: {
        id: userId,
      },
    });
  },

  async deleteItem(itemId) {
    return prisma.item.delete({
      where: {
        id: itemId,
      },
    });
  },

  async updateClaimStatus(claimId, status) {
    return prisma.claim.update({
      where: {
        id: claimId,
      },
      data: {
        status,
      },
    });
  },
};