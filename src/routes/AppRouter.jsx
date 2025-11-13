import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from '../routes/ProtectedRoute';
import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from '../pages/Signup';
import Principal from "../pages/Principal";
import Estadisticas from "../pages/Estadisticas";
import Historial from "../pages/Historial";
import MainLayout from "../layouts/MainLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import NotFound from "../pages/NotFound"; 
import CrearHabito from "../pages/CrearHabito";
import PerfilUsuario from "../pages/PerfilUsuario";
import Vacio from "../pages/Vacio"

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="dashboard" element={<DashboardLayout />}>
          <Route index element={<Principal />} />
          <Route path="principal" element={<Principal />} />
          <Route path="estadisticas" element={<Estadisticas />} />
          <Route path="historial" element={<Historial />} />
          <Route path="nuevo" element={<CrearHabito />} />
          <Route path="perfil" element={<PerfilUsuario />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
