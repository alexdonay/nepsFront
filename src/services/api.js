import axios from "axios";

const defaultApiBaseUrl =
  typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}/api`
    : "";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultApiBaseUrl,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Erro na API:", error.response || error.message);
    if (error.response?.status === 401) {
      try {
        localStorage.removeItem("token");
      } catch (e) {
        console.debug("Error clearing localStorage", e);
      }
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login")
      ) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
