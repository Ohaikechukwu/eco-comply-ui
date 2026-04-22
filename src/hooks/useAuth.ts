import { useAuthStore } from "@/stores/auth.store";
import { api, } from "@/lib/api";
import { useRouter } from "next/navigation";

export function useAuth() {
  const { user, org, isAuthenticated, hydrated, setAuth, clearAuth } = useAuthStore();
  const router = useRouter();

  const logout = async () => {
    try {
      await api.post("/api/v1/auth/logout");
    } finally {
      clearAuth();
      router.push("/login");
    }
  };

  const hasRole = (...roles: string[]) => {
    return user ? roles.includes(user.role) : false;
  };

  return { user, org, isAuthenticated, hydrated, logout, hasRole };
}