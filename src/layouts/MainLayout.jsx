import { Outlet, Link, useLocation } from "react-router-dom";

export default function MainLayout() {
    const location = useLocation();

    const navItems = [
        { name: "Home", path: "/" },
        { name: "Login", path: "/login" },
        { name: "Signup", path: "/signup" },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Navbar */}
            <nav className="bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        {/* Logo */}
                        <div className="text-xl font-bold text-white tracking-wide">Wellpath</div>

                        {/* Links */}
                        <div className="flex space-x-6">
                            {navItems.map((item) => {
                                const active = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        className={`font-medium transition-colors duration-300 ${active
                                                ? "text-white border-b-2 border-yellow-400"
                                                : "text-white hover:text-yellow-300"
                                            }`}
                                    >
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Contenido principal */}
            <main className="flex-1 flex items-center justify-center p-6 bg-gray-50">
                <Outlet />
            </main>


            {/* Footer */}
            <footer className="bg-white shadow-inner py-4 mt-auto text-center text-gray-500 text-sm">
                &copy; 2025 Wellpath
            </footer>
        </div>
    );
}
