// src/api/users.js
import client from "./client";

/**
 * Obtener perfil actual (requiere token)
 * GET /api/users/me
 * @returns {Object} { id, name, email, timezone, locale, createdAt }
 */
export const fetchProfile = async () => {
  try {
    const res = await client.get("/api/users/me");
    return res.data;
  } catch (error) {
    const msg = error.response?.data?.message || "Error al obtener perfil";
    throw new Error(msg);
  }
};

/**
 * Actualizar perfil del usuario logueado
 * PUT /api/users/me
 * @param {Object} updates { name?, timezone?, locale? }
 * @returns {Object} { message, user }
 */
export const updateProfile = async (updates) => {
  try {
    const res = await client.put("/api/users/me", updates);
    return res.data;
  } catch (error) {
    const msg = error.response?.data?.message || "Error al actualizar perfil";
    throw new Error(msg);
  }
};
