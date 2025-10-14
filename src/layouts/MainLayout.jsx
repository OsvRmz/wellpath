import { Outlet, Link } from "react-router-dom";

export default function MainLayout() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Navbar */}
            <nav className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        {/* Logo o nombre */}
                        <div className="text-xl font-bold text-blue-600">MiApp</div>

                        {/* Links */}
                        <div className="space-x-4">
                            <Link
                                to="/"
                                className="text-gray-700 hover:text-blue-600 font-medium transition"
                            >
                                Home
                            </Link>
                            <Link
                                to="/login"
                                className="text-gray-700 hover:text-blue-600 font-medium transition"
                            >
                                Login
                            </Link>
                            <Link
                                to="/signup"
                                className="text-gray-700 hover:text-blue-600 font-medium transition"
                            >
                                Signup
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Contenido principal */}
            <main className="flex-1 flex items-center justify-center p-4">
                <Outlet />
            </main>


            {/* Footer */}
            <footer className="bg-white shadow-inner py-4 mt-auto text-center text-gray-500 text-sm">
                &copy; 2025 
            </footer>
        </div>
    );
}
