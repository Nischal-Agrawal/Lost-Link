import { apiRequest } from "./api.js";

export async function getMatches(itemId) {
  return apiRequest(`/items/${itemId}/matches`);
}

export const matchingService = {
  getMatches,
};