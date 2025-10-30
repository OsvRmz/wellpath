import client from "./client";

/**
 * Iniciar sesión
 * @param {Object} credentials { correo, contraseña }
 * @returns {Object} { token, usuario }
 */
export const loginUser = async (credentials) => {
  try {
    const res = await client.post("/auth/login", credentials);
    return res.data; // { token, usuario }
  } catch (error) {
    const msg = error.response?.data?.message || "Error al iniciar sesión";
    throw new Error(msg);
  }
};

/**
 * Registrar nuevo usuario
 * @param {Object} data { nombre, correo, contraseña, timezone?, locale? }
 * @returns {Object} { message }
 */
export const signupUser = async (data) => {
  try {
    const res = await client.post("/auth/signup", data);
    return res.data; // { message }
  } catch (error) {
    const msg = error.response?.data?.message || "Error al registrar usuario";
    throw new Error(msg);
  }
};

/**
 * Logout (cliente) — elimina token local
 * No contacta al servidor (simplemente borra token de localStorage)
 */
export const logoutClient = () => {
  localStorage.removeItem("token");
};

/**
 * Helper opcional: guardar token localmente
 * @param {String} token
 */
export const saveToken = (token) => {
  if (token) localStorage.setItem("token", token);
};
