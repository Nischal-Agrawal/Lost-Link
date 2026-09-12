import { apiRequest } from "./api.js";

export const claimService = {
  async create(itemId, message) {
    return apiRequest(`/items/${itemId}/claims`, {
      method: "POST",
      body: { message },
    });
  },

  async getMine() {
    return apiRequest("/claims/mine");
  },

  async getForItem(itemId) {
    return apiRequest(`/items/${itemId}/claims`);
  },
};