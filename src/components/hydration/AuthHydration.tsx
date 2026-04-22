"use client";
import { useEffect } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";

export function AuthHydration() {
  useEffect(() => {
    const store = useAuthStore.getState();

    const hydrate = async () => {
      try {
        // First try profile directly (access token may still be valid)
        const res = await api.get("/api/v1/auth/profile", {
          skipAuthRefresh: true,  // handle refresh manually below
          skipAuthRedirect: true,
        } as any);
        const payload = res.data?.data;
        if (payload?.user && payload?.org) {
          store.setAuth(payload.user, payload.org);
        } else {
          store.clearAuth();
        }
      } catch (profileErr: any) {
        const status = profileErr?.response?.status;

        if (status === 401) {
          // Access token expired — try refresh once
          try {
            await api.post("/api/v1/auth/refresh", null, {
              skipAuthRefresh: true,  // prevent interceptor looping
              skipAuthRedirect: true,
            } as any);

            // Refresh succeeded — retry profile once
            const retryRes = await api.get("/api/v1/auth/profile", {
              skipAuthRefresh: true,
              skipAuthRedirect: true,
            } as any);
            const payload = retryRes.data?.data;
            if (payload?.user && payload?.org) {
              store.setAuth(payload.user, payload.org);
            } else {
              store.clearAuth();
            }
          } catch {
            // Refresh also failed — session fully expired
            store.clearAuth();
          }
        } else {
          store.clearAuth();
        }
      } finally {
        store.setHydrated(true);
      }
    };

    hydrate();
  }, []);

  return null;
}