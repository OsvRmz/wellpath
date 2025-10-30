// src/api/habitHistory.js
import client from "./client";

/**
 * Obtener historial en un rango de fechas (inclusive)
 * GET /api/habit-history?start=YYYY-MM-DD&end=YYYY-MM-DD
 * @param {String} start YYYY-MM-DD
 * @param {String} end YYYY-MM-DD
 * @returns {Array} registros [{ _id, userId, habitId, date, completed, notes }]
 */
export const fetchHabitHistoryRange = async (start, end) => {
  try {
    const res = await client.get("/api/habit-history", { params: { start, end } });
    return res.data;
  } catch (error) {
    const msg = error.response?.data?.message || "Error al obtener historial";
    throw new Error(msg);
  }
};

/**
 * Upsert (marcar/desmarcar) un registro de hábito para una fecha
 * POST /api/habit-history
 * body: { habitId, date: YYYY-MM-DD, completed, notes? }
 * @returns {Object} registro actualizado/creado
 */
export const upsertHabitHistory = async ({ habitId, date, completed, notes }) => {
  try {
    const res = await client.post("/api/habit-history", { habitId, date, completed, notes });
    return res.data;
  } catch (error) {
    const msg = error.response?.data?.message || "Error al actualizar historial";
    throw new Error(msg);
  }
};

/**
 * Eliminar un registro por id
 * DELETE /api/habit-history/:id
 * @param {String} id
 * @returns {Boolean}
 */
export const deleteHabitHistory = async (id) => {
  try {
    const res = await client.delete(`/api/habit-history/${id}`);
    return res.status === 204;
  } catch (error) {
    const msg = error.response?.data?.message || "Error al eliminar registro";
    throw new Error(msg);
  }
};
