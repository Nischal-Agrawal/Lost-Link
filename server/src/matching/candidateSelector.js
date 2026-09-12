import { prisma } from "../config/prisma.js";

const CANDIDATE_LIMIT = 50;

function getDateRange(date) {
  const sourceDate =
    new Date(date);

  const start =
    new Date(sourceDate);

  const end =
    new Date(sourceDate);

  start.setDate(
    start.getDate() - 14
  );

  end.setDate(
    end.getDate() + 14
  );

  return {
    gte: start,
    lte: end
  };
}

export async function findCandidates(
  sourceItem
) {
  const oppositeType =
    sourceItem.type === "LOST"
      ? "FOUND"
      : "LOST";

  const dateRange =
    getDateRange(
      sourceItem.date
    );

  /*
   * Category is used as a first-pass filter,
   * but location is deliberately not required to
   * match exactly because users may describe the
   * same place differently.
   */
  const candidates =
    await prisma.item.findMany({
      where: {
        id: {
          not: sourceItem.id
        },

        type: oppositeType,

        status: "ACTIVE",

        category: {
          contains:
            sourceItem.category,
          mode: "insensitive"
        },

        date: dateRange
      },

      orderBy: {
        createdAt: "desc"
      },

      take: CANDIDATE_LIMIT,

      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    });

  /*
   * If category filtering is too restrictive, retrieve
   * a second small candidate set using only type/status
   * and date. This keeps the matcher useful when two
   * users classify the same item differently.
   */
  if (candidates.length > 0) {
    return candidates;
  }

  return prisma.item.findMany({
    where: {
      id: {
        not: sourceItem.id
      },

      type: oppositeType,

      status: "ACTIVE",

      date: dateRange
    },

    orderBy: {
      createdAt: "desc"
    },

    take: CANDIDATE_LIMIT,

    include: {
      user: {
        select: {
          id: true,
          name: true,
          role: true
        }
      }
    }
  });
}