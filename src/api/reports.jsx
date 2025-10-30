import client from "./client";

/**
 * Crear reporte
 * POST /api/reports
 * body: { type, title, description, metadata? }
 */
export const createReport = async ({ type = "other", title, description = "", metadata = {} }) => {
  try {
    const res = await client.post("/api/reports", { type, title, description, metadata });
    return res.data;
  } catch (error) {
    const msg = error.response?.data?.message || "Error al enviar reporte";
    throw new Error(msg);
  }
};

/**
 * Obtener reportes del usuario
 * GET /api/reports?limit=50
 */
export const fetchReports = async (limit = 50) => {
  try {
    const res = await client.get("/api/reports", { params: { limit } });
    return res.data;
  } catch (error) {
    const msg = error.response?.data?.message || "Error al obtener reportes";
    throw new Error(msg);
  }
};

/**
 * Obtener un reporte por id
 * GET /api/reports/:id
 */
export const fetchReportById = async (id) => {
  try {
    const res = await client.get(`/api/reports/${id}`);
    return res.data;
  } catch (error) {
    const msg = error.response?.data?.message || "Error al obtener reporte";
    throw new Error(msg);
  }
};

/**
 * Actualizar un reporte (patch)
 * PATCH /api/reports/:id
 */
export const updateReport = async (id, updates) => {
  try {
    const res = await client.patch(`/api/reports/${id}`, updates);
    return res.data;
  } catch (error) {
    const msg = error.response?.data?.message || "Error al actualizar reporte";
    throw new Error(msg);
  }
};

/**
 * Eliminar reporte
 * DELETE /api/reports/:id
 */
export const deleteReport = async (id) => {
  try {
    const res = await client.delete(`/api/reports/${id}`);
    return res.status === 204;
  } catch (error) {
    const msg = error.response?.data?.message || "Error al eliminar reporte";
    throw new Error(msg);
  }
};
