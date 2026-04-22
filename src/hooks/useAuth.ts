import { useAuthStore } from "@/stores/auth.store";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export function useAuth() {
  const { user, org, isAuthenticated, hydrated, setAuth, clearAuth } = useAuthStore();
  const router = useRouter();

  const clearCSRFCookie = () => {
    if (typeof document === "undefined") return;
    const name = process.env.NEXT_PUBLIC_CSRF_COOKIE_NAME ?? "csrf_token";
    document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
  };

  const logout = async () => {
    try {
      await api.post("/api/v1/auth/logout");
    } finally {
      clearCSRFCookie();
      clearAuth();
      router.push("/login");
    }
  };

  const hasRole = (...roles: string[]) => {
    return user ? roles.includes(user.role) : false;
  };

  return { user, org, isAuthenticated, hydrated, logout, hasRole };
}