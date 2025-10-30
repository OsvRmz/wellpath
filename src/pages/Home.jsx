import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center p-8 relative z-10">
      {/* Lado izquierdo - Branding */}
      <div className="space-y-12 text-center lg:text-left">
        <div className="space-y-4">
          <h1 className="title-script-large text-6xl text-purple-800 drop-shadow-md">
            Wellpath
          </h1>
          <p className="text-3xl text-gray-700 font-medium">
            Pequeños hábitos, grandes cambios
          </p>
        </div>

        <div>
          <Link
            to="/dashboard"
            className="inline-block px-16 py-6 btn-pastel btn-purple text-3xl font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Empezar
          </Link>
        </div>
      </div>

      {/* Lado derecho - Login / Signup / Info */}
      <div className="space-y-8 flex flex-col items-center">
        <Link
          to="/login"
          className="block w-full max-w-md px-10 py-6 btn-pastel btn-green text-center text-2xl font-bold rounded-lg shadow-md hover:shadow-lg transition"
        >
          Iniciar sesión
        </Link>

        <Link
          to="/signup"
          className="block w-full max-w-md px-10 py-6 btn-pastel btn-pink text-center text-2xl font-bold rounded-lg shadow-md hover:shadow-lg transition"
        >
          Registrarse
        </Link>

        {/* Sticky note informativa */}
        <div className="sticky-note-yellow p-8 max-w-md w-full rounded-lg shadow-md transform hover:scale-[1.02] transition-transform duration-300">
          <h3 className="font-bold text-gray-800 mb-4 text-lg text-center">
            Más información
          </h3>
          <ul className="space-y-3 text-base text-gray-700">
            <li className="flex items-center">
              <span className="w-3 h-3 bg-gray-600 rounded-full mr-4"></span>
              Objetivo
            </li>
            <li className="flex items-center">
              <span className="w-3 h-3 bg-gray-600 rounded-full mr-4"></span>
              Cómo se usa
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
