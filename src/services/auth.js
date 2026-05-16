import { repository } from "./repository";

export const login = (email, password) =>
  repository.auth.login(email, password);

export const register = (data) => repository.auth.register(data);

export const getCurrentUser = () => repository.users.me();

export const updateProfile = (data) => repository.users.updateMe(data);

export const resetPassword = (email) => repository.auth.resetPassword(email);

export const confirmReset = (hash, newPassword) =>
  repository.auth.confirmReset(hash, newPassword);

export const logout = () => {
  localStorage.removeItem("token");
};
