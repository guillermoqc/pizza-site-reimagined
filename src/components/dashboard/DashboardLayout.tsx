import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  LogOut,
  Pizza,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboardAuth } from "@/store/dashboardAuthStore";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/dashboard/orders", label: "Orders", icon: ClipboardList },
  { to: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
] as const;

export default function DashboardLayout() {
  const { user, logout } = useDashboardAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/dashboard/login");
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 py-5 border-b border-gray-100">
          <Pizza className="h-6 w-6 text-red-500" />
          <span className="font-bold text-gray-900 text-lg">Pizza Dashboard</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-red-50 text-red-600"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
        <div className="px-4 py-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 truncate mb-1">{user?.email}</p>
          <p className="text-xs font-medium text-gray-700 truncate mb-3">
            {user?.full_name ?? "Admin"}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-gray-600 hover:text-red-600"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
