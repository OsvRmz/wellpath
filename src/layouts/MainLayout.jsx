import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="min-h-screen relative cork-bg flex flex-col items-center justify-between overflow-hidden">
      {/* Elementos decorativos flotantes */}
      <div className="decorative-shape shape-pink w-40 h-40 top-10 left-10 float-animation absolute"></div>
      <div
        className="decorative-shape shape-yellow w-32 h-32 bottom-20 right-20 float-animation absolute"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="decorative-shape shape-blue w-24 h-24 top-1/2 left-1/3 float-animation absolute"
        style={{ animationDelay: "2s" }}
      ></div>

      {/* Encabezado */}
      <header className="w-full notebook-spiral py-4 shadow-md text-center relative z-10">
        <h1 className="title-script text-4xl"></h1>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 flex items-center justify-center w-full p-6 relative z-10">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white/70 backdrop-blur-md shadow-inner py-4 w-full text-center text-gray-700 text-sm relative z-10">
        &copy; 2025 Wellpath
      </footer>
    </div>
  );
}
