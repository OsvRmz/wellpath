// src/api/stats.js
import client from "./client";

/**
 * Obtener estadísticas semanales
 * GET /api/stats/week?monday=YYYY-MM-DD
 * @param {String} mondayISO optional (si no se pasa, el servidor usa la semana actual del usuario)
 * @returns {Object} { porDia: [ { date, weekdayName, percentage } ], progresoGeneral, promedioDiario }
 */
export const fetchWeekStats = async (mondayISO) => {
  try {
    const params = mondayISO ? { monday: mondayISO } : {};
    const res = await client.get("/api/stats/week", { params });
    return res.data;
  } catch (error) {
    const msg = error.response?.data?.message || "Error al obtener estadísticas semanales";
    throw new Error(msg);
  }
};

/**
 * Obtener estadísticas mensuales (4 semanas)
 * GET /api/stats/month?start=YYYY-MM-DD
 * @param {String} startISO optional (primer día del periodo; por defecto el servidor usa la semana actual)
 * @returns {Array} [ { etiqueta, porcentaje }, ... ]
 */
export const fetchMonthStats = async (startISO) => {
  try {
    const params = startISO ? { start: startISO } : {};
    const res = await client.get("/api/stats/month", { params });
    return res.data;
  } catch (error) {
    const msg = error.response?.data?.message || "Error al obtener estadísticas mensuales";
    throw new Error(msg);
  }
};
