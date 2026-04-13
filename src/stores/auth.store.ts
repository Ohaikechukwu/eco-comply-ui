// src/stores/auth.store.ts
import { create } from "zustand";
import type { User, Org } from "@/types";

interface AuthStore {
  user: User | null;
  org: Org | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  setAuth: (user: User, org: Org) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
  setHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  org: null,
  isAuthenticated: false,
  hydrated: false,
  setAuth: (user, org) => set({ user, org, isAuthenticated: true }),
  clearAuth: () => set({ user: null, org: null, isAuthenticated: false }),
  updateUser: (partial) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...partial } : null,
    })),
  setHydrated: (hydrated) => set({ hydrated }),
}));
