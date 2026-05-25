import api from "./api";
import { API_ROUTES } from "./API_routes";

export const login = (email, password) =>
  api.post(API_ROUTES.AUTH.LOGIN, { email, password });

export const register = (data) => api.post(API_ROUTES.AUTH.REGISTER, data);

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
