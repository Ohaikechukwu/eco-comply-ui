"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, ClipboardList, FileText, BarChart3,
  Users, Settings, LogOut, Leaf, ChevronLeft, ChevronRight, Files, HardDriveDownload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/stores/ui.store";

const navItems = [
  { href: "/dashboard",                      label: "Dashboard",   icon: LayoutDashboard },
  { href: "/dashboard/inspections",          label: "Inspections", icon: ClipboardList   },
  { href: "/dashboard/analytics",            label: "Analytics",   icon: BarChart3       },
  { href: "/dashboard/templates",            label: "Templates",   icon: Files, roles: ["org_admin", "manager"] },
  { href: "/dashboard/reports",              label: "Reports",     icon: FileText        },
  { href: "/dashboard/exports",              label: "Exports",     icon: HardDriveDownload, roles: ["org_admin", "manager"] },
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
      className="app-sidebar"
    >
      <div className="flex items-center gap-3 px-4 h-16 border-b border-[var(--border)]">
        <div className="w-8 h-8 rounded-lg bg-[var(--brand)] flex items-center justify-center shrink-0">
          <Leaf className="w-4 h-4 text-white" />
        </div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.span
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-sm font-bold app-text whitespace-nowrap"
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
                active ? "bg-[var(--surface-2)] text-[var(--brand-700)]" : "app-muted hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
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

      <div className="px-2 pb-4 border-t border-[var(--border)] pt-4">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-[var(--danger)] hover:bg-[var(--danger-bg)] transition-colors"
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
        className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center shadow-sm hover:bg-[var(--surface-2)] z-10"
      >
        {sidebarOpen ? <ChevronLeft className="w-3 h-3 app-muted" /> : <ChevronRight className="w-3 h-3 app-muted" />}
      </button>
    </motion.aside>
  );
}
