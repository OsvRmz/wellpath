// src/api/dashboard.js
import client from "./client";

/**
 * Obtener resumen para el dashboard
 * GET /api/dashboard
 * Response:
 * { name, totalHabits, habitsCompletedToday, percentageToday, remainingHabits, streak, message }
 */
export const fetchDashboard = async () => {
  try {
    const res = await client.get("/api/dashboard");
    return res.data;
  } catch (error) {
    const msg = error.response?.data?.message || "Error al obtener dashboard";
    throw new Error(msg);
  }
};
