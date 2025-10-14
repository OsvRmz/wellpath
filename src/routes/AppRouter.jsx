import { Routes, Route } from "react-router-dom";
import {ProtectedRoute} from '../routes/ProtectedRoute'
import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from '../pages/Signup';
import Dashboard from "../pages/Dashboard";
import MainLayout from "../layouts/MainLayout";
import DashboardLayout from "../layouts/DashboardLayout";


export default function AppRouter() {
  return (
    <Routes>

      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
      </Route>

      <Route element={<ProtectedRoute />}>

        <Route element={<DashboardLayout />}>

          <Route path="dashboard" element={<Dashboard />} />

        </Route>

      </Route>
    </Routes>
  );
}