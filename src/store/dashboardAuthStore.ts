import { create } from "zustand";
import { persist } from "zustand/middleware";
import { dashboardApi, type AdminUser } from "@/lib/dashboardApi";

interface DashboardAuthState {
  token: string | null;
  user: AdminUser | null;
  isAuthenticated: boolean;
  login: (token: string, user: AdminUser) => void;
  logout: () => void;
}

export const useDashboardAuth = create<DashboardAuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login(token, user) {
        dashboardApi.setToken(token);
        set({ token, user, isAuthenticated: true });
      },

      logout() {
        dashboardApi.setToken(null);
        set({ token: null, user: null, isAuthenticated: false });
      },
    }),
    {
      name: "dashboard-auth",
      onRehydrateStorage: () => (state) => {
        // Re-attach token to the API client after page reload
        if (state?.token) {
          dashboardApi.setToken(state.token);
        }
      },
    }
  )
);
