import axios from "axios";

const defaultProtocol =
  typeof window !== "undefined" ? window.location.protocol : "http:";
const defaultApiBaseUrl = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultApiBaseUrl,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log("Token encontrado:", token ? "Sim" : "Não");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Erro na API:", error.response || error.message);

    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      // Clear auth data
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("permission");
        localStorage.removeItem("user");
        localStorage.removeItem("currentUser");
      } catch (e) {
        console.debug("Error clearing localStorage", e);
      }

      // Redirect to login if not already there
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
