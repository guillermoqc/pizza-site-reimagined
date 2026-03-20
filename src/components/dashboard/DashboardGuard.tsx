import { Navigate, Outlet } from "react-router-dom";
import { useDashboardAuth } from "@/store/dashboardAuthStore";

export default function DashboardGuard() {
  const isAuthenticated = useDashboardAuth((s) => s.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/dashboard/login" replace />;
}
