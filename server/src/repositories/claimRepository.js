import prisma from "../config/prisma.js";

export const claimRepository = {
  create(data) {
    return prisma.claim.create({
      data,
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
          },
        },
      },
    });
  },

  findById(id) {
    return prisma.claim.findUnique({
      where: { id },
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
          },
        },
      },
    });
  },

  findExisting(itemId, claimantId) {
    return prisma.claim.findFirst({
      where: {
        itemId,
        claimantId,
        status: "PENDING",
      },
    });
  },

  findByClaimant(claimantId) {
    return prisma.claim.findMany({
      where: {
        claimantId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        item: {
          select: {
            id: true,
            title: true,
            type: true,
            category: true,
            color: true,
            location: true,
            status: true,
            imageUrl: true,
            userId: true,
          },
        },
      },
    });
  },

  findByItem(itemId) {
    return prisma.claim.findMany({
      where: {
        itemId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        claimant: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  },

  async approve(claimId) {
    return prisma.$transaction(async (tx) => {
      const claim = await tx.claim.findUnique({
        where: { id: claimId },
        include: {
          item: true,
        },
      });

      if (!claim) {
        throw new Error("CLAIM_NOT_FOUND");
      }

      if (claim.status !== "PENDING") {
        throw new Error("CLAIM_ALREADY_PROCESSED");
      }

      if (claim.item.status !== "ACTIVE") {
        throw new Error("ITEM_NOT_ACTIVE");
      }

      const updatedClaim = await tx.claim.update({
        where: { id: claimId },
        data: {
          status: "APPROVED",
        },
        include: {
          item: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
          claimant: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
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
  },

  async reject(claimId) {
    return prisma.claim.update({
      where: {
        id: claimId,
      },
      data: {
        status: "REJECTED",
      },
      include: {
        item: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        claimant: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  },
};