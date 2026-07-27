import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { components } from "@/lib/api.d";

type User = components["schemas"]["UserRead"];

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
};

type AuthActions = {
  login(user: User, token: string): void;
  logout(): void;
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login(user, token) {
        set({ user, token, isAuthenticated: true });
      },

      logout() {
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    { name: "tick/auth" },
  ),
);
