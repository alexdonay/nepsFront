import api from './api';

export const login = (email, password) => 
  api.post('/auth/login', { email, password });

export const register = (data) => 
  api.post('/auth/register', data);

export const getCurrentUser = () => 
  api.get('/users/me');

export const updateProfile = (data) => 
  api.put('/users/me', data);

export const resetPassword = (email) => repository.auth.resetPassword(email);
export const confirmReset = (hash, newPassword) =>
  repository.auth.confirmReset(hash, newPassword);

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("permission");
  try {
    localStorage.removeItem("currentUser");
  } catch (e) {}
};
