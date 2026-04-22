// src/components/AuthHydration.tsx
"use client";
import { useEffect } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";

export function AuthHydration() {
  useEffect(() => {
    const store = useAuthStore.getState();

    // Do NOT pass skipAuthRefresh — we want the interceptor in api.ts
    // to automatically call /auth/refresh if profile returns 401,
    // then retry profile with the new access token cookie
    api.get("/api/v1/auth/profile")
      .then((res) => {
        const payload = res.data?.data;
        if (payload?.user && payload?.org) {
          store.setAuth(payload.user, payload.org); // also sets hydrated:true
        } else {
          store.clearAuth(); // also sets hydrated:true
        }
      })
      .catch(() => {
        // Both profile and refresh failed — session is fully expired
        store.clearAuth(); // also sets hydrated:true
      })
      .finally(() => {
        // Belt-and-suspenders — always unblocks the app
        store.setHydrated(true);
      });
  }, []);

  return null;
}