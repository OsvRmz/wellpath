// src/api/habits.js
import client from "./client";

/**
 * Obtener lista de hábitos del usuario
 * GET /api/habits
 * @returns {Array} habits
 */
export const fetchHabits = async () => {
  try {
    const res = await client.get("/api/habits");
    return res.data;
  } catch (error) {
    const msg = error.response?.data?.message || "Error al obtener hábitos";
    throw new Error(msg);
  }
};

/**
 * Crear un nuevo hábito
 * POST /api/habits
 * body: { title, description?, frequency?, recordatorio?: { enabled, time }, icon?, motivation? }
 * @returns {Object} habit creado (contiene _id)
 */
export const createHabit = async (payload) => {
  try {
    const res = await client.post("/api/habits", payload);
    return res.data;
  } catch (error) {
    const msg = error.response?.data?.message || "Error al crear hábito";
    throw new Error(msg);
  }
};

/**
 * Actualizar hábito
 * PUT /api/habits/:id
 * @param {String} id
 * @param {Object} updates
 * @returns {Object} habit actualizado
 */
export const updateHabit = async (id, updates) => {
  try {
    const res = await client.put(`/api/habits/${id}`, updates);
    return res.data;
  } catch (error) {
    const msg = error.response?.data?.message || "Error al actualizar hábito";
    throw new Error(msg);
  }
};

/**
 * Eliminar (archivar) hábito
 * DELETE /api/habits/:id
 * @param {String} id
 * @returns {Boolean} true si OK
 */
export const deleteHabit = async (id) => {
  try {
    const res = await client.delete(`/api/habits/${id}`);
    // si devuelve 204, axios no tendrá data; devolvemos true
    return res.status === 204;
  } catch (error) {
    const msg = error.response?.data?.message || "Error al eliminar hábito";
    throw new Error(msg);
  }
};
