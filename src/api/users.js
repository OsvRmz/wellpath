import client from "./client";

// Obtener un usuario por ID
export const getUserById = async (id) => {
  try {
    const response = await client.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener usuario ${id}:`, error);
    throw error;
  }
}; 

export const getString = async () => {
  try {
    const response = await client.get('/users/string');
    return response.data;
  }catch (error) {
    console.error('error');
    throw error;
  }
}

