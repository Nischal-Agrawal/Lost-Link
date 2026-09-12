import { prisma } from "../config/prisma.js";

const userSelect = {
  id: true,
  name: true,
  role: true
};

const itemInclude = {
  user: {
    select: userSelect
  }
};

export async function createItem(data) {
  return prisma.item.create({
    data,
    include: itemInclude
  });
}

export async function findItemById(id) {
  return prisma.item.findUnique({
    where: {
      id
    },
    include: itemInclude
  });
}

export async function findItems({
  search,
  type,
  category,
  location,
  status,
  page,
  limit
}) {
  const where = {};

  if (type) {
    where.type = type;
  }

  if (category) {
    where.category = {
      contains: category,
      mode: "insensitive"
    };
  }

  if (location) {
    where.location = {
      contains: location,
      mode: "insensitive"
    };
  }

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      {
        title: {
          contains: search,
          mode: "insensitive"
        }
      },
      {
        description: {
          contains: search,
          mode: "insensitive"
        }
      },
      {
        category: {
          contains: search,
          mode: "insensitive"
        }
      },
      {
        color: {
          contains: search,
          mode: "insensitive"
        }
      },
      {
        brand: {
          contains: search,
          mode: "insensitive"
        }
      },
      {
        location: {
          contains: search,
          mode: "insensitive"
        }
      }
    ];
  }

  const skip = (page - 1) * limit;

  const [items, total] = await prisma.$transaction([
    prisma.item.findMany({
      where,
      include: itemInclude,
      orderBy: {
        createdAt: "desc"
      },
      skip,
      take: limit
    }),

    prisma.item.count({
      where
    })
  ]);

  return {
    items,
    total
  };
}

export async function updateItem(id, data) {
  return prisma.item.update({
    where: {
      id
    },
    data,
    include: itemInclude
  });
}

export async function deleteItem(id) {
  return prisma.item.delete({
    where: {
      id
    }
  });
}