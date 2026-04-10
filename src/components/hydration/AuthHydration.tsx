// src/components/AuthHydration.tsx
"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";

export function AuthHydration() {
  useEffect(() => {
    useAuthStore.persist.rehydrate();
  }, []);
  return null;
}