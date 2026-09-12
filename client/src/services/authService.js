import { apiRequest } from "./api.js";

export async function registerUser(data) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: data
  });
}

export async function loginUser(data) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: data
  });
}

export async function logoutUser() {
  return apiRequest("/auth/logout", {
    method: "POST"
  });
}

export async function getCurrentUser() {
  return apiRequest("/auth/me");
}