import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Org } from "@/types";

interface AuthStore {
  user: User | null;
  org: Org | null;
  isAuthenticated: boolean;
  setAuth: (user: User, org: Org) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      org: null,
      isAuthenticated: false,
      setAuth: (user, org) => set({ user, org, isAuthenticated: true }),
      clearAuth: () => set({ user: null, org: null, isAuthenticated: false }),
      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),
    }),
    { name: "ecocomply-auth" }
  )
);
