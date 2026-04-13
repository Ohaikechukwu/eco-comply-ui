// src/components/AuthHydration.tsx
"use client";
import { useEffect } from "react";
import axios from "axios";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";

export function AuthHydration() {
  useEffect(() => {
    const hydrateSession = async () => {
      try {
        const res = await api.get("/api/v1/auth/profile");
        const payload = res.data?.data;
        if (payload?.user && payload?.org) {
          useAuthStore.getState().setAuth(payload.user, payload.org);
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const status = err.response?.status;
          if (status === 401 || status === 403) {
            useAuthStore.getState().clearAuth();
          }
        }
      } finally {
        useAuthStore.getState().setHydrated(true);
      }
    };

    hydrateSession();
  }, []);
  return null;
}
