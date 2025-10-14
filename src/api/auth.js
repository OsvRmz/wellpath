import client from "./client";

// Login
export const loginUser = async (credentials) => { // entrada -> {email,password}
  try {
    const response = await client.post("/auth/login", credentials);
    return response.data; // respuesta -> {token, user }
  } catch (error) {
    console.error("Error al hacer login:", error);
    throw error;
  }
};

export const signupUser = async (credentials) => { //entrada -> {name,email,password}
  try {
    const response = await client.post('/auth/signup', credentials);
    return response.data // respuesta -> {message}
  }catch(error){
    console.error('Error al registrarse:', error);
    throw error;
  }
}