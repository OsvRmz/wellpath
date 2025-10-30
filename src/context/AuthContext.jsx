import { createContext, useState, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const [usuario, setUsuario] = useState(() => {
    try {
      const storedUser = localStorage.getItem("usuario");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Error parsing usuario from localStorage:", error);
      return null;
    }
  });

  const login = (jwt, userData) => {
    if (!jwt || !userData) {
      console.warn("login called without proper token or userData");
      return;
    }

    setToken(jwt);
    setUsuario(userData);

    localStorage.setItem("token", jwt);
    localStorage.setItem("usuario", JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);

    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
  };

  return (
    <AuthContext.Provider value={{ token, usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
