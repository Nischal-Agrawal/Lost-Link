import { apiRequest } from "./api.js";

export async function getItems(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      query.set(key, value);
    }
  });

  const queryString = query.toString();

  return apiRequest(
    `/items${queryString ? `?${queryString}` : ""}`
  );
}

export async function getItem(id) {
  return apiRequest(`/items/${id}`);
}

export async function createItem(data) {
  return apiRequest("/items", {
    method: "POST",
    body: data
  });
}

export async function updateItem(id, data) {
  return apiRequest(`/items/${id}`, {
    method: "PUT",
    body: data
  });
}

export const itemService = {
  getAll: getItems,
  getById: getItem,
  create: createItem,
  update: updateItem
};