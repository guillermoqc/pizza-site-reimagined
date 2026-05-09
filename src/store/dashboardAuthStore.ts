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
      // sessionStorage scopes the token to the current browser tab; tokens are
      // cleared when the tab closes, reducing the window of exposure vs. localStorage.
      storage: {
        getItem: (key) => {
          const v = sessionStorage.getItem(key);
          return v ? JSON.parse(v) : null;
        },
        setItem: (key, value) => sessionStorage.setItem(key, JSON.stringify(value)),
        removeItem: (key) => sessionStorage.removeItem(key),
      },
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          dashboardApi.setToken(state.token);
        }
      },
    }
  )
);
