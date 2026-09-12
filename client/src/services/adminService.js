import { apiRequest } from "./api.js";

export const adminService = {
  async getDashboard() {
    return apiRequest("/admin/dashboard");
  },

  async getUsers() {
    return apiRequest("/admin/users");
  },

  async disableUser(id) {
    return apiRequest(`/admin/users/${id}/disable`, {
      method: "PATCH",
    });
  },

  async enableUser(id) {
    return apiRequest(`/admin/users/${id}/enable`, {
      method: "PATCH",
    });
  },

  async deleteUser(id) {
    return apiRequest(`/admin/users/${id}`, {
      method: "DELETE",
    });
  },

  async getItems() {
    return apiRequest("/admin/items");
  },

  async deleteItem(id) {
    return apiRequest(`/admin/items/${id}`, {
      method: "DELETE",
    });
  },

  async getClaims() {
    return apiRequest("/admin/claims");
  },

  async updateClaim(id, status) {
    return apiRequest(`/admin/claims/${id}`, {
      method: "PATCH",
      body: { status },
    });
  },

  async rankClaims(itemId) {
    return apiRequest(`/admin/items/${itemId}/claim-ranking`, {
      method: "POST",
    });
  },
};