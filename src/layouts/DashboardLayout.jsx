import { Outlet, useLocation } from "react-router-dom";
import {
  FaUser,
  FaRegBell,
  FaClipboardList,
  FaChartLine,
  FaCog,
} from "react-icons/fa";

export default function DashboardLayout() {
  const location = useLocation();

  const navItems = [
    { name: "Perfil", icon: <FaUser />, path: "/dashboard/perfil" },
    { name: "Hábitos", icon: <FaClipboardList />, path: "/dashboard/habitos" },
    { name: "Estadísticas", icon: <FaChartLine />, path: "/dashboard/estadisticas" },
    { name: "Configuración", icon: <FaCog />, path: "/dashboard/configuracion" },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-blue-500 to-indigo-600 text-white shadow-lg flex flex-col">
        {/* Notificaciones */}
        <div className="flex items-center justify-between p-4 border-b border-blue-400">
          <h2 className="text-xl font-bold">Dashboard</h2>
          <button className="relative text-white hover:text-yellow-300 transition-colors">
            <FaRegBell size={20} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-2 py-4 space-y-2">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <a
                key={item.name}
                href={item.path}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors
                  ${active ? "bg-white text-blue-600 font-semibold" : "text-white hover:bg-blue-400 hover:text-white"}`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </a>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-blue-400 text-white text-sm text-center">
          &copy; 2025 Wellpath
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}
