import axios from "axios";

// URL base del servidor (usa variables de entorno)
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Crear instancia de axios
const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor opcional para agregar token a todas las peticiones
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // o desde tu contexto
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;