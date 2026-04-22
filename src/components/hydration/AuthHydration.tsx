"use client";
import { useEffect } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";

export function AuthHydration() {
  useEffect(() => {
    const store = useAuthStore.getState();

    const hydrate = async () => {
      try {
        // Calls /api/auth/profile (Next.js route) which reads httpOnly cookie server-side
        const res = await api.get("/api/auth/profile");
        const payload = res.data?.data;
        if (payload?.user && payload?.org) {
          store.setAuth(payload.user, payload.org);
        } else {
          store.clearAuth();
        }
      } catch {
        // 401 interceptor in api.ts will auto-refresh before this catch runs
        // If we're here, both profile and refresh failed
        store.clearAuth();
      }
    };

    hydrate();
  }, []);

  return null;
}