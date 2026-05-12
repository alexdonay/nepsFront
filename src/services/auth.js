import { repository } from "./repository";

export const login = (email, password) =>
  repository.auth.login(email, password);

export const register = (data) => repository.auth.register(data);

export const getCurrentUser = () => repository.users.me();

export const updateProfile = (data) => repository.users.updateMe(data);

export const resetPassword = (email) => repository.auth.resetPassword(email);
