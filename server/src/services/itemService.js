import {
  createItem,
  deleteItem,
  findItemById,
  findItems,
  updateItem
} from "../repositories/itemRepository.js";

import {
  forbidden,
  notFound
} from "../utils/errors.js";

export async function createNewItem(userId, data) {
  return createItem({
    ...data,
    userId
  });
}

export async function getItem(id) {
  const item = await findItemById(id);

  if (!item) {
    throw notFound("Item not found");
  }

  return item;
}

export async function getItems(query) {
  return findItems(query);
}

export async function updateOwnItem(
  itemId,
  userId,
  data
) {
  const item = await findItemById(itemId);

  if (!item) {
    throw notFound("Item not found");
  }

  if (item.userId !== userId) {
    throw forbidden(
      "You can only modify your own reports"
    );
  }

  const safeData = {
    ...data
  };

  delete safeData.status;

  return updateItem(itemId, safeData);
}

export async function deleteOwnItem(
  itemId,
  userId
) {
  const item = await findItemById(itemId);

  if (!item) {
    throw notFound("Item not found");
  }

  if (item.userId !== userId) {
    throw forbidden(
      "You can only delete your own reports"
    );
  }

  await deleteItem(itemId);

  return {
    message: "Item deleted successfully"
  };
}