import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signupUser } from "../api/auth";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      await signupUser({ nombre: name, correo: email, contraseña: password });
      navigate("/login");
    } catch (err) {
      setError("Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-md p-8 rounded-xl shadow-lg bg-white/80 backdrop-blur-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Registrarse
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="Tu nombre completo"
            className="w-full px-4 py-3 rounded-lg border focus:outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            className="w-full px-4 py-3 rounded-lg border focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="w-full px-4 py-3 rounded-lg border focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirmar contraseña"
            className="w-full px-4 py-3 rounded-lg border focus:outline-none"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 text-white font-semibold bg-purple-500 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Creando cuenta..." : "Registrarse"}
          </button>

          {error && (
            <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
              {error}
            </p>
          )}
        </form>

        <p className="mt-6 text-center text-gray-600 text-sm">
          ¿Ya tienes cuenta?{" "}
          <Link
            to="/login"
            className="text-green-600 hover:underline font-medium"
          >
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
