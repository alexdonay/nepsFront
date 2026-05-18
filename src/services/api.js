import axios from 'axios';

const defaultProtocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
const defaultApiBaseUrl = `${defaultProtocol}//localhost:8000/api`;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultApiBaseUrl,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;