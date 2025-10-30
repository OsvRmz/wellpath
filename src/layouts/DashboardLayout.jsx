import { Outlet, useLocation } from "react-router-dom";
import {
  FaUser,
  FaHome,
  FaSignal,
  FaPlus,
  FaClipboard
} from "react-icons/fa";

export default function DashboardLayout() {
  const location = useLocation();

  const navItems = [
    { name: "Principal", icon: <FaHome />, path: "/dashboard/principal", color: "bg-[#FBCEE9]" },
    { name: "Estadisticas", icon: <FaSignal />, path: "/dashboard/estadisticas", color: "bg-[#CEF8CA]" },
    { name: "Historial", icon: <FaClipboard />, path: "/dashboard/historial", color: "bg-[#B7F2FF]" },
    { name: "Nuevo", icon: <FaPlus  />, path: "/dashboard/nuevo", color: "bg-[#FAFAA5]" },
    { name: "Perfil", icon: <FaUser />, path: "/dashboard/perfil", color: "bg-[#E9DBFE]" },
  ];

  return (
    <div className="min-h-screen bg-[#F7F2EC] overflow-hidden relative">
      {/* Header */}
      <div
        style={{
          height: "40px",
          background:
            "linear-gradient(to bottom, #836E5D 0%, rgba(75,63,51,0.7) 50%, #836E5D 100%)",
        }}
      />

      {/* Main scrollable area */}
      <main
        className="overflow-y-auto"
        style={{ height: "calc(100vh - 40px)" }} // altura fija del viewport menos header
      >
        <div className="min-h-full p-2 pr-[160px]">
          <Outlet />
        </div>
      </main>

      {/* Sidebar derecha */}
      <aside
        aria-label="barra lateral derecha"
        className="absolute top-[40px] right-0 h-[calc(100vh-40px)] flex flex-col items-end"
      >
        {navItems.map((item, i) => {
          const active = location.pathname === item.path;
          return (
            <a
              key={item.name}
              href={item.path}
              title={item.name}
              className={`
                ${item.color}
                h-[20%] flex items-center justify-center
                transition-all duration-200 ease-in-out
                w-[120px] hover:w-[140px]
                flex-none rounded-md
                ${active ? "w-[140px] shadow-lg" : "shadow-md"}
              `}
              style={{ zIndex: 100 + (navItems.length - i), overflow: "hidden" }}
            >
              <span className="block flex items-center justify-center w-full h-full">
                <span style={{ fontSize: 50 }} className="text-gray-700">
                  {item.icon}
                </span>
              </span>
            </a>
          );
        })}
      </aside>
    </div>
  );
}
