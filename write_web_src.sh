#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# EcoComply NG — write all Next.js source files
# Run from inside ~/ecocomplyng-ui:
#   chmod +x write_web_src.sh && ./write_web_src.sh
# =============================================================================

GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'
log()  { echo -e "${GREEN}[✔]${NC} $1"; }
info() { echo -e "${CYAN}[→]${NC} $1"; }

# Verify we are in the right place
if [ ! -f "package.json" ]; then
  echo "Error: run this from inside ~/ecocomplyng-ui"
  exit 1
fi

# =============================================================================
# CREATE ALL DIRECTORIES
# =============================================================================
info "Creating directory structure..."

mkdir -p src/lib
mkdir -p src/types
mkdir -p src/stores
mkdir -p src/hooks
mkdir -p src/providers
mkdir -p src/components/ui
mkdir -p src/components/layout
mkdir -p src/components/inspections
mkdir -p src/components/dashboard
mkdir -p "src/app/(auth)/login"
mkdir -p "src/app/(auth)/register"
mkdir -p "src/app/(auth)/forgot-password"
mkdir -p "src/app/(dashboard)/dashboard"
mkdir -p "src/app/(dashboard)/dashboard/inspections/new"
mkdir -p "src/app/(dashboard)/dashboard/inspections/[id]"
mkdir -p "src/app/(dashboard)/dashboard/checklists/[id]/fill"
mkdir -p "src/app/(dashboard)/dashboard/reports"
mkdir -p "src/app/(dashboard)/dashboard/users"
mkdir -p "src/app/(dashboard)/dashboard/profile/settings"
mkdir -p "src/app/(dashboard)/dashboard/profile/change-password"
mkdir -p "src/app/(public)/reports/share/[token]"

log "Directories created"

# =============================================================================
# TAILWIND CONFIG
# =============================================================================
info "Writing tailwind.config.ts..."

cat > tailwind.config.ts << 'EOF'
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
      },
      borderRadius: {
        lg: "0.625rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
EOF

log "tailwind.config.ts"

# =============================================================================
# GLOBAL CSS
# =============================================================================
cat > src/app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");

* { box-sizing: border-box; }
body { @apply bg-gray-50 text-gray-900 antialiased font-sans; }

@layer components {
  .card { @apply bg-white rounded-xl border border-gray-200 shadow-sm; }
  .btn-primary { @apply bg-brand-600 hover:bg-brand-700 text-white font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed; }
  .btn-secondary { @apply bg-white hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg border border-gray-200 transition-colors; }
  .btn-danger { @apply bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors; }
  .input { @apply w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all; }
  .label { @apply block text-sm font-medium text-gray-700 mb-1; }
}
EOF

log "globals.css"

# =============================================================================
# ENV
# =============================================================================
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF

# =============================================================================
# NEXT CONFIG
# =============================================================================
cat > next.config.ts << 'EOF'
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ hostname: "res.cloudinary.com" }],
  },
};

export default nextConfig;
EOF

log "next.config.ts"

# =============================================================================
# LIB
# =============================================================================
info "Writing lib/..."

cat > src/lib/api.ts << 'EOF'
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await api.post("/api/v1/auth/refresh");
        return api(error.config);
      } catch {
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);
EOF

cat > src/lib/utils.ts << 'EOF'
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), "dd MMM yyyy");
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), "dd MMM yyyy, HH:mm");
}

export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function statusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    draft:            "bg-gray-100 text-gray-700",
    in_progress:      "bg-blue-100 text-blue-700",
    submitted:        "bg-yellow-100 text-yellow-700",
    under_review:     "bg-orange-100 text-orange-700",
    pending_actions:  "bg-red-100 text-red-700",
    completed:        "bg-green-100 text-green-700",
    finalized:        "bg-brand-100 text-brand-700",
  };
  return map[status] ?? "bg-gray-100 text-gray-700";
}

export function statusLabel(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
EOF

log "lib/"

# =============================================================================
# TYPES
# =============================================================================
cat > src/types/index.ts << 'EOF'
export interface User {
  id: string;
  name: string;
  email: string;
  role: "org_admin" | "manager" | "supervisor" | "enumerator";
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
}

export interface Org {
  id: string;
  name: string;
  schema_name: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export type InspectionStatus =
  | "draft" | "in_progress" | "submitted"
  | "under_review" | "pending_actions"
  | "completed" | "finalized";

export interface Inspection {
  id: string;
  project_name: string;
  location: string;
  latitude?: number;
  longitude?: number;
  date: string;
  inspector_name: string;
  inspector_role: string;
  assigned_user_id: string;
  checklist_template_id?: string;
  status: InspectionStatus;
  supervisor_comment?: string;
  manager_comment?: string;
  created_at: string;
  updated_at: string;
  checklist_items?: ChecklistItem[];
  agreed_actions?: Action[];
}

export interface ChecklistItem {
  id: string;
  description: string;
  response: boolean | null;
  comment: string;
  sort_order: number;
}

export interface Action {
  id: string;
  description: string;
  assignee_id: string;
  due_date: string;
  status: "pending" | "in_progress" | "resolved" | "overdue";
  evidence_url?: string;
  resolved_at?: string;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  description?: string;
  is_system: boolean;
  items: TemplateItem[];
}

export interface TemplateItem {
  id: string;
  description: string;
  sort_order: number;
}

export interface Report {
  id: string;
  inspection_id: string;
  generated_by: string;
  status: "generating" | "ready" | "failed";
  file_url?: string;
  share_token?: string;
  share_expiry?: string;
  error_message?: string;
  created_at: string;
}

export interface Media {
  id: string;
  inspection_id: string;
  url: string;
  filename: string;
  mime_type: string;
  captured_via: "camera" | "gallery";
  latitude?: number;
  longitude?: number;
  gps_source: "device" | "manual" | "none";
  captured_at: string;
}

export interface DashboardData {
  total_inspections: number;
  completed: number;
  pending: number;
  pending_actions: number;
  recent_inspections: Inspection[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface APIResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
EOF

log "types/"

# =============================================================================
# STORES
# =============================================================================
info "Writing stores/..."

cat > src/stores/auth.store.ts << 'EOF'
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
EOF

cat > src/stores/ui.store.ts << 'EOF'
import { create } from "zustand";

interface UIStore {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
EOF

log "stores/"

# =============================================================================
# HOOKS
# =============================================================================
info "Writing hooks/..."

cat > src/hooks/useAuth.ts << 'EOF'
import { useAuthStore } from "@/stores/auth.store";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export function useAuth() {
  const { user, org, isAuthenticated, setAuth, clearAuth } = useAuthStore();
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

  return { user, org, isAuthenticated, logout, hasRole };
}
EOF

cat > src/hooks/useInspections.ts << 'EOF'
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Inspection, APIResponse, DashboardData } from "@/types";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await api.get<APIResponse<DashboardData>>("/api/v1/inspections/dashboard");
      return res.data.data!;
    },
  });
}

export function useInspections(params?: {
  page?: number; limit?: number; status?: string; search?: string;
}) {
  return useQuery({
    queryKey: ["inspections", params],
    queryFn: async () => {
      const res = await api.get<APIResponse<{
        inspections: Inspection[]; total: number; page: number;
        limit: number; total_pages: number;
      }>>("/api/v1/inspections", { params });
      return res.data.data!;
    },
  });
}

export function useInspection(id: string) {
  return useQuery({
    queryKey: ["inspection", id],
    queryFn: async () => {
      const res = await api.get<APIResponse<Inspection>>(`/api/v1/inspections/${id}`);
      return res.data.data!;
    },
    enabled: !!id,
  });
}

export function useCreateInspection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Inspection>) => {
      const res = await api.post<APIResponse<Inspection>>("/api/v1/inspections", data);
      return res.data.data!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inspections"] }),
  });
}

export function useUpdateInspectionStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, comment }: { id: string; status: string; comment?: string }) => {
      const res = await api.patch<APIResponse<Inspection>>(`/api/v1/inspections/${id}/status`, { status, comment });
      return res.data.data!;
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["inspection", id] });
      qc.invalidateQueries({ queryKey: ["inspections"] });
    },
  });
}

export function useUpdateChecklistItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ inspectionId, itemId, response, comment }: {
      inspectionId: string; itemId: string; response: boolean | null; comment?: string;
    }) => {
      const res = await api.patch(`/api/v1/inspections/${inspectionId}/checklist/${itemId}`, { response, comment });
      return res.data.data;
    },
    onSuccess: (_, { inspectionId }) => {
      qc.invalidateQueries({ queryKey: ["inspection", inspectionId] });
    },
  });
}

export function useGenerateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (inspectionId: string) => {
      const res = await api.post("/api/v1/reports/generate", { inspection_id: inspectionId });
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reports"] }),
  });
}
EOF

cat > src/hooks/useUsers.ts << 'EOF'
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { User, APIResponse } from "@/types";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await api.get<APIResponse<{ users: User[]; total: number }>>("/api/v1/auth/users");
      return res.data.data!;
    },
  });
}

export function useInviteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; email: string; role: string }) => {
      const res = await api.post<APIResponse<User>>("/api/v1/auth/users/invite", data);
      return res.data.data!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const res = await api.patch<APIResponse<User>>(`/api/v1/auth/users/${id}/role`, { role });
      return res.data.data!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}
EOF

log "hooks/"

# =============================================================================
# PROVIDERS
# =============================================================================
cat > src/providers/index.tsx << 'EOF'
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@/components/ui/Toast";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
    })
  );
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  );
}
EOF

log "providers/"

# =============================================================================
# UI COMPONENTS
# =============================================================================
info "Writing components/ui/..."

cat > src/components/ui/Button.tsx << 'EOF'
"use client";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: "btn-primary",
      secondary: "btn-secondary",
      danger: "btn-danger",
      ghost: "hover:bg-gray-100 text-gray-700 font-medium rounded-lg transition-colors",
    };
    const sizes = { sm: "text-xs px-3 py-1.5", md: "text-sm px-4 py-2", lg: "text-base px-5 py-2.5" };
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(variants[variant], sizes[size], "inline-flex items-center gap-2", className)}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
EOF

cat > src/components/ui/Input.tsx << 'EOF'
"use client";
import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="w-full">
      {label && <label htmlFor={id} className="label">{label}</label>}
      <input
        ref={ref}
        id={id}
        className={cn("input", error && "border-red-400 focus:ring-red-400", className)}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
);
Input.displayName = "Input";
EOF

cat > src/components/ui/Select.tsx << 'EOF'
"use client";
import { cn } from "@/lib/utils";
import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, ...props }, ref) => (
    <div className="w-full">
      {label && <label htmlFor={id} className="label">{label}</label>}
      <select ref={ref} id={id} className={cn("input", error && "border-red-400", className)} {...props}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
);
Select.displayName = "Select";
EOF

cat > src/components/ui/Badge.tsx << 'EOF'
import { cn, statusBadgeClass, statusLabel } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", statusBadgeClass(status))}>
      {statusLabel(status)}
    </span>
  );
}

export function Badge({ children, variant = "default" }: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}) {
  const variants = {
    default: "bg-gray-100 text-gray-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    danger:  "bg-red-100 text-red-700",
    info:    "bg-blue-100 text-blue-700",
  };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", variants[variant])}>
      {children}
    </span>
  );
}
EOF

cat > src/components/ui/Card.tsx << 'EOF'
import { cn } from "@/lib/utils";

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("card p-6", className)} {...props}>{children}</div>;
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center justify-between mb-4", className)} {...props}>{children}</div>;
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-base font-semibold text-gray-900", className)} {...props}>{children}</h3>;
}
EOF

cat > src/components/ui/Spinner.tsx << 'EOF'
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("animate-spin text-brand-600", className)} />;
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-64">
      <Spinner className="w-8 h-8" />
    </div>
  );
}
EOF

cat > src/components/ui/EmptyState.tsx << 'EOF'
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-gray-400" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
EOF

cat > src/components/ui/Toast.tsx << 'EOF'
"use client";
import { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";
interface Toast { id: string; type: ToastType; message: string; }
interface ToastContextValue {
  toast: (type: ToastType, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const ctx: ToastContextValue = {
    toast: addToast,
    success: (msg) => addToast("success", msg),
    error:   (msg) => addToast("error", msg),
    info:    (msg) => addToast("info", msg),
  };

  const icons  = { success: CheckCircle, error: XCircle, info: Info };
  const colors = {
    success: "bg-green-50 border-green-200 text-green-800",
    error:   "bg-red-50 border-red-200 text-red-800",
    info:    "bg-blue-50 border-blue-200 text-blue-800",
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = icons[t.type];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm shadow-md min-w-72 ${colors[t.type]}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{t.message}</span>
                <button onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))}>
                  <X className="w-4 h-4 opacity-60 hover:opacity-100" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
EOF

log "components/ui/"

# =============================================================================
# LAYOUT COMPONENTS
# =============================================================================
info "Writing components/layout/..."

cat > src/components/layout/Sidebar.tsx << 'EOF'
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, ClipboardList, FileText,
  Users, Settings, LogOut, Leaf, ChevronLeft, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/stores/ui.store";

const navItems = [
  { href: "/dashboard",                      label: "Dashboard",   icon: LayoutDashboard },
  { href: "/dashboard/inspections",          label: "Inspections", icon: ClipboardList   },
  { href: "/dashboard/reports",              label: "Reports",     icon: FileText        },
  { href: "/dashboard/users",                label: "Users",       icon: Users, roles: ["org_admin", "manager"] },
  { href: "/dashboard/profile/settings",     label: "Settings",    icon: Settings        },
];

export function Sidebar() {
  const pathname    = usePathname();
  const { user, logout, hasRole } = useAuth();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  const visible = navItems.filter((item) => !item.roles || hasRole(...item.roles));

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 240 : 64 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="relative flex flex-col h-screen bg-white border-r border-gray-200 overflow-hidden shrink-0"
    >
      <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shrink-0">
          <Leaf className="w-4 h-4 text-white" />
        </div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.span
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-sm font-bold text-gray-900 whitespace-nowrap"
            >
              EcoComply NG
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {visible.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon   = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                active ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      <div className="px-2 pb-4 border-t border-gray-100 pt-4">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Sign out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      <button
        onClick={toggleSidebar}
        className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:bg-gray-50 z-10"
      >
        {sidebarOpen ? <ChevronLeft className="w-3 h-3 text-gray-500" /> : <ChevronRight className="w-3 h-3 text-gray-500" />}
      </button>
    </motion.aside>
  );
}
EOF

cat > src/components/layout/Header.tsx << 'EOF'
"use client";
import { Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function Header({ title }: { title?: string }) {
  const { user } = useAuth();
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        {title && <h1 className="text-base font-semibold text-gray-900">{title}</h1>}
      </div>
      <div className="flex items-center gap-3">
        <button className="relative w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5 text-gray-500" />
        </button>
        <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center">
            <span className="text-xs font-semibold text-white">
              {user?.name?.slice(0, 2).toUpperCase() ?? "U"}
            </span>
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role?.replace("_", " ")}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
EOF

log "components/layout/"

# =============================================================================
# INSPECTION + DASHBOARD COMPONENTS
# =============================================================================
cat > src/components/inspections/InspectionCard.tsx << 'EOF'
"use client";
import Link from "next/link";
import { MapPin, Calendar, User } from "lucide-react";
import { StatusBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import type { Inspection } from "@/types";

export function InspectionCard({ inspection }: { inspection: Inspection }) {
  return (
    <Link href={`/dashboard/inspections/${inspection.id}`}>
      <div className="card p-4 hover:border-brand-300 hover:shadow-md transition-all cursor-pointer group">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-brand-700 transition-colors line-clamp-1">
            {inspection.project_name}
          </h3>
          <StatusBadge status={inspection.status} />
        </div>
        <div className="space-y-1.5">
          {inspection.location && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="line-clamp-1">{inspection.location}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>{formatDate(inspection.date)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <User className="w-3.5 h-3.5 shrink-0" />
            <span>{inspection.inspector_name}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
EOF

cat > src/components/dashboard/StatCard.tsx << 'EOF'
"use client";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color?: "green" | "blue" | "orange" | "red";
}

export function StatCard({ title, value, icon: Icon, color = "green" }: StatCardProps) {
  const colors = {
    green:  { bg: "bg-green-50",  icon: "text-green-600"  },
    blue:   { bg: "bg-blue-50",   icon: "text-blue-600"   },
    orange: { bg: "bg-orange-50", icon: "text-orange-600" },
    red:    { bg: "bg-red-50",    icon: "text-red-600"    },
  };
  const c = colors[color];
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500 font-medium">{title}</span>
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", c.bg)}>
          <Icon className={cn("w-5 h-5", c.icon)} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </motion.div>
  );
}
EOF

log "components/inspections/ + components/dashboard/"

# =============================================================================
# ROOT APP FILES
# =============================================================================
info "Writing app root files..."

cat > src/app/layout.tsx << 'EOF'
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EcoComply NG",
  description: "Environmental Compliance and Inspection Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
EOF

cat > src/app/page.tsx << 'EOF'
import { redirect } from "next/navigation";
export default function RootPage() {
  redirect("/login");
}
EOF

log "app root"

# =============================================================================
# AUTH PAGES
# =============================================================================
info "Writing auth pages..."

cat > "src/app/(auth)/layout.tsx" << 'EOF'
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-600 mb-4 shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">EcoComply NG</h1>
          <p className="text-sm text-gray-500 mt-1">Environmental Compliance Platform</p>
        </div>
        <div className="card p-8">{children}</div>
      </div>
    </div>
  );
}
EOF

cat > "src/app/(auth)/login/page.tsx" << 'EOF'
"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router  = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await api.post("/api/v1/auth/login", data);
      const { user, org } = res.data.data;
      setAuth(user, org);
      success("Welcome back!");
      router.push("/dashboard");
    } catch (err: any) {
      error(err.response?.data?.error ?? "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Sign in</h2>
      <p className="text-sm text-gray-500 mb-6">Enter your credentials to continue</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input {...register("email")} id="email" label="Email address" type="email"
          placeholder="you@example.com" error={errors.email?.message} autoComplete="email" />
        <Input {...register("password")} id="password" label="Password" type="password"
          placeholder="••••••••" error={errors.password?.message} autoComplete="current-password" />
        <div className="flex items-center justify-end">
          <Link href="/forgot-password" className="text-xs text-brand-600 hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" loading={loading} className="w-full justify-center">Sign in</Button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-500">
        New organisation?{" "}
        <Link href="/register" className="text-brand-600 font-medium hover:underline">Register here</Link>
      </p>
    </motion.div>
  );
}
EOF

cat > "src/app/(auth)/register/page.tsx" << 'EOF'
"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const schema = z.object({
  org_name: z.string().min(2, "Organisation name is required"),
  name: z.string().min(2, "Your name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Minimum 8 characters"),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  message: "Passwords do not match", path: ["confirm_password"],
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await api.post("/api/v1/auth/register", {
        org_name: data.org_name, name: data.name,
        email: data.email, password: data.password,
      });
      success("Organisation registered! Please sign in.");
      router.push("/login");
    } catch (err: any) {
      error(err.response?.data?.error ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Register your organisation</h2>
      <p className="text-sm text-gray-500 mb-6">Create your EcoComply NG account</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input {...register("org_name")} id="org_name" label="Organisation name" placeholder="Acme Environmental Ltd" error={errors.org_name?.message} />
        <Input {...register("name")} id="name" label="Your full name" placeholder="Jane Doe" error={errors.name?.message} />
        <Input {...register("email")} id="email" label="Email address" type="email" placeholder="you@example.com" error={errors.email?.message} />
        <Input {...register("password")} id="password" label="Password" type="password" placeholder="Min. 8 characters" error={errors.password?.message} />
        <Input {...register("confirm_password")} id="confirm_password" label="Confirm password" type="password" placeholder="Repeat password" error={errors.confirm_password?.message} />
        <Button type="submit" loading={loading} className="w-full justify-center">Create account</Button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="text-brand-600 font-medium hover:underline">Sign in</Link>
      </p>
    </motion.div>
  );
}
EOF

cat > "src/app/(auth)/forgot-password/page.tsx" << 'EOF'
"use client";
import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const schema = z.object({ email: z.string().email("Enter a valid email") });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { error } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await api.post("/api/v1/auth/forgot-password", data);
      setSent(true);
    } catch {
      error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Forgot password</h2>
      <p className="text-sm text-gray-500 mb-6">Enter your email to receive reset instructions</p>
      {sent ? (
        <div className="text-sm text-green-700 bg-green-50 rounded-lg px-4 py-3 text-center">
          Email sent! Check your inbox and follow the instructions.
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input {...register("email")} id="email" label="Email address" type="email" error={errors.email?.message} />
          <Button type="submit" loading={loading} className="w-full justify-center">Send reset link</Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-gray-500">
        <Link href="/login" className="text-brand-600 hover:underline">Back to sign in</Link>
      </p>
    </motion.div>
  );
}
EOF

log "auth pages"

# =============================================================================
# DASHBOARD LAYOUT
# =============================================================================
info "Writing dashboard layout + pages..."

cat > "src/app/(dashboard)/layout.tsx" << 'EOF'
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
EOF

# Dashboard home
cat > "src/app/(dashboard)/dashboard/page.tsx" << 'EOF'
"use client";
import { ClipboardList, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { StatCard } from "@/components/dashboard/StatCard";
import { InspectionCard } from "@/components/inspections/InspectionCard";
import { PageSpinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { useDashboard } from "@/hooks/useInspections";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();
  const router = useRouter();

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Overview of your inspection activity</p>
        </div>
        <Button onClick={() => router.push("/dashboard/inspections/new")}>
          + New inspection
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total"           value={data?.total_inspections ?? 0} icon={ClipboardList}  color="blue"   />
        <StatCard title="Completed"       value={data?.completed ?? 0}         icon={CheckCircle}    color="green"  />
        <StatCard title="Pending"         value={data?.pending ?? 0}           icon={Clock}          color="orange" />
        <StatCard title="Pending actions" value={data?.pending_actions ?? 0}   icon={AlertTriangle}  color="red"    />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Recent inspections</h2>
        {data?.recent_inspections?.length ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            initial="hidden" animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
          >
            {data.recent_inspections.map((i) => (
              <motion.div key={i.id} variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
                <InspectionCard inspection={i} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <EmptyState
            icon={ClipboardList}
            title="No inspections yet"
            description="Create your first inspection to get started"
            action={<Button onClick={() => router.push("/dashboard/inspections/new")}>Create inspection</Button>}
          />
        )}
      </div>
    </div>
  );
}
EOF

# Inspections list
cat > "src/app/(dashboard)/dashboard/inspections/page.tsx" << 'EOF'
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Filter, Plus, ClipboardList } from "lucide-react";
import { InspectionCard } from "@/components/inspections/InspectionCard";
import { Button } from "@/components/ui/Button";
import { PageSpinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useInspections } from "@/hooks/useInspections";

const STATUSES = ["", "draft", "in_progress", "submitted", "under_review", "pending_actions", "completed", "finalized"];

export default function InspectionsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage]   = useState(1);

  const { data, isLoading } = useInspections({ search, status, page, limit: 12 });

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Inspections</h1>
        <Button onClick={() => router.push("/dashboard/inspections/new")}>
          <Plus className="w-4 h-4" /> New inspection
        </Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pl-9" placeholder="Search by project or location..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select className="input w-auto" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s ? s.replace(/_/g, " ") : "All statuses"}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? <PageSpinner /> : data?.inspections?.length ? (
        <>
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            initial="hidden" animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}>
            {data.inspections.map((i) => (
              <motion.div key={i.id} variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}>
                <InspectionCard inspection={i} />
              </motion.div>
            ))}
          </motion.div>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Showing {data.inspections.length} of {data.total}</span>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <Button variant="secondary" size="sm" disabled={page >= (data.total_pages ?? 1)} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        </>
      ) : (
        <EmptyState icon={ClipboardList} title="No inspections found" description="Try adjusting your filters" />
      )}
    </div>
  );
}
EOF

# New inspection
cat > "src/app/(dashboard)/dashboard/inspections/new/page.tsx" << 'EOF'
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { useCreateInspection } from "@/hooks/useInspections";

const schema = z.object({
  project_name: z.string().min(2, "Project name is required"),
  location:  z.string().optional(),
  latitude:  z.string().optional(),
  longitude: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function NewInspectionPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const createInspection = useCreateInspection();
  const [gpsLoading, setGpsLoading] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const captureGPS = () => {
    if (!navigator.geolocation) { error("Geolocation not supported"); return; }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue("latitude",  String(pos.coords.latitude));
        setValue("longitude", String(pos.coords.longitude));
        setGpsLoading(false);
      },
      () => { setGpsLoading(false); error("Could not get GPS location"); }
    );
  };

  const onSubmit = async (data: FormData) => {
    try {
      const inspection = await createInspection.mutateAsync({
        project_name: data.project_name,
        location:     data.location,
        latitude:     data.latitude  ? parseFloat(data.latitude)  : undefined,
        longitude:    data.longitude ? parseFloat(data.longitude) : undefined,
      });
      success("Inspection created");
      router.push(`/dashboard/inspections/${inspection.id}`);
    } catch (err: any) {
      error(err.response?.data?.error ?? "Failed to create inspection");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-gray-900">New inspection</h1>
        <p className="text-sm text-gray-500 mt-0.5">Fill in the details to start a new inspection</p>
      </div>
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input {...register("project_name")} id="project_name" label="Project name *"
            placeholder="e.g. Ogun Road Rehabilitation Phase 2" error={errors.project_name?.message} />
          <Input {...register("location")} id="location" label="Location"
            placeholder="e.g. Km 12, Sagamu–Ore Expressway" />
          <div>
            <label className="label">GPS coordinates</label>
            <div className="flex gap-3">
              <Input {...register("latitude")}  placeholder="Latitude"  />
              <Input {...register("longitude")} placeholder="Longitude" />
              <Button type="button" variant="secondary" onClick={captureGPS} loading={gpsLoading} className="shrink-0">
                <MapPin className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={createInspection.isPending}>Create inspection</Button>
            <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
EOF

# Inspection detail
cat > "src/app/(dashboard)/dashboard/inspections/[id]/page.tsx" << 'EOF'
"use client";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Calendar, User } from "lucide-react";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { PageSpinner } from "@/components/ui/Spinner";
import { useInspection } from "@/hooks/useInspections";
import { formatDate } from "@/lib/utils";

export default function InspectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const { data: inspection, isLoading } = useInspection(id);

  if (isLoading) return <PageSpinner />;
  if (!inspection) return <p className="text-sm text-gray-500">Inspection not found</p>;

  const conformance    = inspection.checklist_items?.filter((i) => i.response === true).length  ?? 0;
  const nonConformance = inspection.checklist_items?.filter((i) => i.response === false).length ?? 0;
  const unanswered     = inspection.checklist_items?.filter((i) => i.response === null).length  ?? 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">{inspection.project_name}</h1>
            <StatusBadge status={inspection.status} />
          </div>
          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
            {inspection.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{inspection.location}</span>}
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(inspection.date)}</span>
            <span className="flex items-center gap-1"><User className="w-3 h-3" />{inspection.inspector_name}</span>
          </div>
        </div>
        <Button onClick={() => router.push(`/dashboard/reports?inspection_id=${id}`)}>
          Generate report
        </Button>
      </div>

      {(inspection.checklist_items?.length ?? 0) > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Conformance",     value: conformance,    color: "text-green-600 bg-green-50" },
            { label: "Non-conformance", value: nonConformance, color: "text-red-600 bg-red-50"     },
            { label: "Unanswered",      value: unanswered,     color: "text-gray-600 bg-gray-50"   },
          ].map((s) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className={`rounded-xl p-4 text-center ${s.color}`}>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs font-medium mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Checklist</CardTitle>
          <Button variant="secondary" size="sm"
            onClick={() => router.push(`/dashboard/checklists/${id}/fill`)}>
            Fill checklist
          </Button>
        </CardHeader>
        {inspection.checklist_items?.length ? (
          <div className="space-y-2">
            {inspection.checklist_items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                  ${item.response === true ? "bg-green-100 text-green-700" : item.response === false ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-400"}`}>
                  {item.response === true ? "Y" : item.response === false ? "N" : "–"}
                </div>
                <span className="text-sm text-gray-700 flex-1">{item.description}</span>
                {item.comment && <span className="text-xs text-gray-400 italic">{item.comment}</span>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-6">No checklist assigned yet</p>
        )}
      </Card>

      {(inspection.agreed_actions?.length ?? 0) > 0 && (
        <Card>
          <CardHeader><CardTitle>Agreed actions</CardTitle></CardHeader>
          <div className="space-y-3">
            {inspection.agreed_actions!.map((action) => (
              <div key={action.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{action.description}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Due: {formatDate(action.due_date)}</p>
                </div>
                <StatusBadge status={action.status} />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
EOF

# Checklist fill page
cat > "src/app/(dashboard)/dashboard/checklists/[id]/fill/page.tsx" << 'EOF'
"use client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Check, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageSpinner } from "@/components/ui/Spinner";
import { useInspection, useUpdateChecklistItem } from "@/hooks/useInspections";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

export default function ChecklistFillPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const { data: inspection, isLoading } = useInspection(id);
  const updateItem = useUpdateChecklistItem();
  const { success, error } = useToast();
  const [comments, setComments] = useState<Record<string, string>>({});

  if (isLoading) return <PageSpinner />;
  if (!inspection) return <p className="text-sm text-gray-500">Inspection not found</p>;

  const handleResponse = async (itemId: string, response: boolean | null) => {
    try {
      await updateItem.mutateAsync({ inspectionId: id, itemId, response, comment: comments[itemId] });
      success("Saved");
    } catch {
      error("Failed to save");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Fill checklist</h1>
          <p className="text-sm text-gray-500">{inspection.project_name}</p>
        </div>
      </div>

      <Card className="p-0 overflow-hidden divide-y divide-gray-100">
        {inspection.checklist_items?.length ? inspection.checklist_items.map((item, idx) => (
          <div key={item.id} className="p-4">
            <div className="flex items-start gap-3">
              <span className="text-xs text-gray-400 font-medium w-6 shrink-0 pt-0.5">{idx + 1}</span>
              <div className="flex-1">
                <p className="text-sm text-gray-900 mb-3">{item.description}</p>
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={() => handleResponse(item.id, true)}
                    className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                      item.response === true
                        ? "bg-green-100 text-green-700 border-green-300"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-green-50"
                    )}
                  >
                    <Check className="w-3.5 h-3.5" /> Yes
                  </button>
                  <button
                    onClick={() => handleResponse(item.id, false)}
                    className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                      item.response === false
                        ? "bg-red-100 text-red-700 border-red-300"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-red-50"
                    )}
                  >
                    <X className="w-3.5 h-3.5" /> No
                  </button>
                  {item.response !== null && (
                    <button onClick={() => handleResponse(item.id, null)}
                      className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1.5">
                      Clear
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Add comment..."
                  value={comments[item.id] ?? item.comment ?? ""}
                  onChange={(e) => setComments((prev) => ({ ...prev, [item.id]: e.target.value }))}
                  onBlur={() => handleResponse(item.id, item.response)}
                  className="input text-xs py-1.5"
                />
              </div>
            </div>
          </div>
        )) : (
          <div className="p-8 text-center text-sm text-gray-400">No checklist items assigned to this inspection</div>
        )}
      </Card>

      <Button variant="secondary" onClick={() => router.back()}>Done</Button>
    </div>
  );
}
EOF

# Reports page
cat > "src/app/(dashboard)/dashboard/reports/page.tsx" << 'EOF'
"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { FileText, Download, Share2, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageSpinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useGenerateReport } from "@/hooks/useInspections";
import { useToast } from "@/components/ui/Toast";
import { formatDateTime } from "@/lib/utils";
import type { Report, APIResponse } from "@/types";

export default function ReportsPage() {
  const searchParams  = useSearchParams();
  const router        = useRouter();
  const inspectionId  = searchParams.get("inspection_id");
  const generateReport = useGenerateReport();
  const { success, error } = useToast();

  const { data: reports, isLoading, refetch } = useQuery({
    queryKey: ["reports", inspectionId],
    queryFn: async () => {
      const url = inspectionId
        ? `/api/v1/reports?inspection_id=${inspectionId}`
        : "/api/v1/reports";
      const res = await api.get<APIResponse<Report[]>>(url);
      return res.data.data ?? [];
    },
  });

  const handleGenerate = async () => {
    if (!inspectionId) { error("No inspection selected"); return; }
    try {
      await generateReport.mutateAsync(inspectionId);
      success("Report generation started — refresh in a moment");
      setTimeout(() => refetch(), 3000);
    } catch {
      error("Failed to generate report");
    }
  };

  const statusVariant = (s: string) =>
    s === "ready" ? "success" : s === "failed" ? "danger" : "info";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Reports</h1>
        {inspectionId && (
          <Button onClick={handleGenerate} loading={generateReport.isPending}>
            <FileText className="w-4 h-4" /> Generate report
          </Button>
        )}
      </div>

      {isLoading ? <PageSpinner /> : reports?.length ? (
        <div className="space-y-3">
          {reports.map((report) => (
            <Card key={report.id} className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                {report.status === "generating"
                  ? <Loader2 className="w-5 h-5 text-brand-600 animate-spin" />
                  : <FileText className="w-5 h-5 text-brand-600" />
                }
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Report — {formatDateTime(report.created_at)}
                </p>
                <Badge variant={statusVariant(report.status) as any}>
                  {report.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {report.file_url && (
                  <a href={report.file_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary" size="sm">
                      <Download className="w-4 h-4" /> Download
                    </Button>
                  </a>
                )}
                {report.share_token && (
                  <Button variant="secondary" size="sm" onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/reports/share/${report.share_token}`
                    );
                    success("Share link copied");
                  }}>
                    <Share2 className="w-4 h-4" /> Copy link
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon={FileText} title="No reports yet"
          description={inspectionId ? "Generate your first report above" : "Select an inspection to view its reports"} />
      )}
    </div>
  );
}
EOF

# Users page
cat > "src/app/(dashboard)/dashboard/users/page.tsx" << 'EOF'
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PageSpinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { useUsers, useInviteUser } from "@/hooks/useUsers";
import { formatDate } from "@/lib/utils";

const schema = z.object({
  name:  z.string().min(2),
  email: z.string().email(),
  role:  z.enum(["manager", "supervisor", "enumerator"]),
});
type FormData = z.infer<typeof schema>;

export default function UsersPage() {
  const [showInvite, setShowInvite] = useState(false);
  const { data, isLoading } = useUsers();
  const inviteUser = useInviteUser();
  const { success, error } = useToast();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "enumerator" },
  });

  const onInvite = async (formData: FormData) => {
    try {
      await inviteUser.mutateAsync(formData);
      success("User invited successfully");
      setShowInvite(false);
      reset();
    } catch (err: any) {
      error(err.response?.data?.error ?? "Invite failed");
    }
  };

  const roleVariant: Record<string, "success" | "info" | "warning" | "default"> = {
    org_admin: "success", manager: "info", supervisor: "warning", enumerator: "default",
  };

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Users</h1>
        <Button onClick={() => setShowInvite(!showInvite)}>
          <UserPlus className="w-4 h-4" /> Invite user
        </Button>
      </div>

      {showInvite && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Invite new user</h3>
            <form onSubmit={handleSubmit(onInvite)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input {...register("name")} label="Full name" error={errors.name?.message} />
              <Input {...register("email")} label="Email" type="email" error={errors.email?.message} />
              <Select {...register("role")} label="Role" options={[
                { value: "enumerator", label: "Enumerator" },
                { value: "supervisor", label: "Supervisor" },
                { value: "manager",    label: "Manager"    },
              ]} />
              <div className="flex items-end gap-2">
                <Button type="submit" loading={inviteUser.isPending}>Send invite</Button>
                <Button type="button" variant="secondary" onClick={() => setShowInvite(false)}>Cancel</Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Name", "Email", "Role", "Status", "Joined"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data?.users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                <td className="px-4 py-3 text-gray-500">{user.email}</td>
                <td className="px-4 py-3"><Badge variant={roleVariant[user.role] ?? "default"}>{user.role.replace("_", " ")}</Badge></td>
                <td className="px-4 py-3"><Badge variant={user.is_active ? "success" : "danger"}>{user.is_active ? "Active" : "Inactive"}</Badge></td>
                <td className="px-4 py-3 text-gray-500">{formatDate(user.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
EOF

# Profile settings
cat > "src/app/(dashboard)/dashboard/profile/settings/page.tsx" << 'EOF'
"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import Link from "next/link";

const schema = z.object({ name: z.string().min(2, "Name is required") });
type FormData = z.infer<typeof schema>;

export default function ProfileSettingsPage() {
  const { user, org, updateUser } = useAuthStore();
  const { success, error } = useToast();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name ?? "" },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await api.patch("/api/v1/auth/profile", data);
      updateUser(res.data.data);
      success("Profile updated");
    } catch {
      error("Update failed");
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-xl font-bold text-gray-900">Profile settings</h1>

      <Card>
        <CardHeader><CardTitle>Personal details</CardTitle></CardHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input {...register("name")} label="Full name" error={errors.name?.message} />
          <Input value={user?.email ?? ""} label="Email address" disabled className="bg-gray-50 cursor-not-allowed" />
          <Input value={user?.role?.replace("_", " ") ?? ""} label="Role" disabled className="bg-gray-50 cursor-not-allowed capitalize" />
          <Input value={org?.name ?? ""} label="Organisation" disabled className="bg-gray-50 cursor-not-allowed" />
          <Button type="submit" loading={isSubmitting}>Save changes</Button>
        </form>
      </Card>

      <Card>
        <CardHeader><CardTitle>Security</CardTitle></CardHeader>
        <Link href="/dashboard/profile/change-password">
          <Button variant="secondary">Change password</Button>
        </Link>
      </Card>
    </div>
  );
}
EOF

# Change password
cat > "src/app/(dashboard)/dashboard/profile/change-password/page.tsx" << 'EOF'
"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { ArrowLeft } from "lucide-react";

const schema = z.object({
  current_password: z.string().min(1, "Current password required"),
  new_password:     z.string().min(8, "Minimum 8 characters"),
  confirm_password: z.string(),
}).refine((d) => d.new_password === d.confirm_password, {
  message: "Passwords do not match", path: ["confirm_password"],
});
type FormData = z.infer<typeof schema>;

export default function ChangePasswordPage() {
  const router = useRouter();
  const { success, error } = useToast();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await api.patch("/api/v1/auth/profile/password", {
        current_password: data.current_password,
        new_password:     data.new_password,
      });
      success("Password changed successfully");
      reset();
      router.push("/dashboard/profile/settings");
    } catch (err: any) {
      error(err.response?.data?.error ?? "Failed to change password");
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Change password</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Update your password</CardTitle></CardHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input {...register("current_password")} label="Current password" type="password" error={errors.current_password?.message} />
          <Input {...register("new_password")}     label="New password"     type="password" error={errors.new_password?.message} />
          <Input {...register("confirm_password")} label="Confirm password" type="password" error={errors.confirm_password?.message} />
          <Button type="submit" loading={isSubmitting}>Update password</Button>
        </form>
      </Card>
    </div>
  );
}
EOF

# Public share page
cat > "src/app/(public)/reports/share/[token]/page.tsx" << 'EOF'
"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PageSpinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { Leaf, Download } from "lucide-react";
import type { APIResponse, Report } from "@/types";

export default function SharedReportPage() {
  const { token } = useParams<{ token: string }>();

  const { data: report, isLoading, isError } = useQuery({
    queryKey: ["shared-report", token],
    queryFn: async () => {
      const res = await api.get<APIResponse<Report>>(`/api/v1/reports/share/${token}`);
      return res.data.data!;
    },
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><PageSpinner /></div>;

  if (isError || !report) return (
    <div className="min-h-screen flex items-center justify-center text-center p-8">
      <div>
        <p className="text-lg font-semibold text-gray-900 mb-2">Link unavailable</p>
        <p className="text-sm text-gray-500">This report link has expired or does not exist.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900">EcoComply NG</span>
        </div>
        {report.file_url && (
          <a href={report.file_url} target="_blank" rel="noopener noreferrer">
            <Button size="sm"><Download className="w-4 h-4" /> Download PDF</Button>
          </a>
        )}
      </header>
      <main className="max-w-4xl mx-auto p-6">
        {report.file_url ? (
          <iframe src={report.file_url} className="w-full rounded-xl border border-gray-200 shadow-sm" style={{ height: "85vh" }} />
        ) : (
          <div className="text-center py-16 text-sm text-gray-500">
            {report.status === "generating" ? "Report is being generated, check back shortly..." : "Report file unavailable"}
          </div>
        )}
      </main>
    </div>
  );
}
EOF

log "All pages written"

# =============================================================================
# VERIFY
# =============================================================================
echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  All source files written!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "  Source tree:"
find src -type f | sort | sed 's/^/    /'
echo ""
echo "  Start the dev server:"
echo "  npm run dev"
echo ""
