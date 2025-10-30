import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await loginUser({ correo: email, contraseña: password });
      login(data.token, data.usuario);
      navigate("/dashboard");
    } catch {
      setError("Correo o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-pastel p-8 w-full max-w-md rounded-xl shadow-lg bg-white/80 backdrop-blur-md">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">Iniciar sesión</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="email"
          placeholder="Correo electrónico"
          className="w-full px-4 py-3 input-pastel focus:outline-none rounded-lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          className="w-full px-4 py-3 input-pastel focus:outline-none rounded-lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 btn-pastel btn-green text-white font-semibold rounded-lg transition disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        {error && <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">{error}</p>}
      </form>

      <p className="mt-6 text-center text-gray-600 text-sm">
        ¿No tienes cuenta?{" "}
        <Link to="/signup" className="text-purple-600 hover:underline font-medium">
          Regístrate aquí
        </Link>
      </p>
    </div>
  );
}
