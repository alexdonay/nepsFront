import api from "./api";
import { API_ROUTES } from "./API_routes";

export const login = (email, password) =>
  api.post(API_ROUTES.AUTH.LOGIN, { email, password }).then((r) => {
    // Backend returns token (JWT) containing role; store only token
    const token = r.data?.token || r.data?.accessToken || r.data?.jwt;
    if (token) {
      localStorage.setItem('token', token);
    }
    return r;
  });

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
  try {
    localStorage.removeItem("token");
  } catch (e) {
    // eslint-disable-next-line no-console
    console.debug("logout localStorage cleanup failed", e);
  }
};
