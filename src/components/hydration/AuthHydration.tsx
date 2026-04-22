"use client";
import { useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";

export function AuthHydration() {
  const hasRun = useRef(false); // ← prevents double execution

  useEffect(() => {
    if (hasRun.current) return; // ← exit if already ran
    hasRun.current = true;

    const store = useAuthStore.getState();

    const hydrate = async () => {
      try {
        const res = await api.get("/api/auth/profile", {
          skipAuthRefresh: true,  // handle manually below
          skipAuthRedirect: true,
        } as any);
        const payload = res.data?.data;
        if (payload?.user && payload?.org) {
          store.setAuth(payload.user, payload.org);
        } else {
          store.clearAuth();
        }
      } catch (profileErr: any) {
        if (profileErr?.response?.status === 401) {
          // Try refresh once manually
          try {
            await api.post("/api/auth/refresh", null, {
              skipAuthRefresh: true,
              skipAuthRedirect: true,
            } as any);

            // Retry profile once with new cookie
            const retryRes = await api.get("/api/auth/profile", {
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
            store.clearAuth();
          }
        } else {
          store.clearAuth();
        }
      }
    };

    hydrate();
  }, []);

  return null;
}