import api from './api';

export const login = (email, password) => 
  api.post('/auth/login', { email, password });

export const register = (data) => 
  api.post('/auth/register', data);

export const getCurrentUser = () => 
  api.get('/users/me');

export const updateProfile = (data) => 
  api.put('/users/me', data);

export const resetPassword = (email) => 
  api.post('/auth/reset-password', { email });