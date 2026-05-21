import { API_ROUTES } from "./API_routes";
import api from "./api";

export const login = (email, password) =>
  api.post("/v1/auth/login", { email, password });

export const register = (data) => api.post("/v1/auth/register", data);

export const getCurrentUser = () => api.get("/v1/users/me");

export const updateProfile = (data) => api.put("/v1/users/me", data);

export const resetPassword = (email) =>
  api.post(API_ROUTES.AUTH.RESET_PASSWORD, { email });

export const confirmReset = (hash, newPassword) =>
  api.post(API_ROUTES.AUTH.RESET_PASSWORD_CONFIRM, {
    reset_token: hash,
    new_password: newPassword,
  });

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("permission");
  try {
    localStorage.removeItem("currentUser");
  } catch (e) {}
};
