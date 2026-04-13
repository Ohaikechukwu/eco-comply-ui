"use client";
import { Bell, Moon, Sun } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/stores/ui.store";

export function Header({ title }: { title?: string }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useUIStore();
  return (
    <header className="app-header">
      <div className="flex items-center gap-4">
        {title && <h1 className="app-title">{title}</h1>}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="app-icon-button"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>
        <button className="app-icon-button" aria-label="Notifications">
          <Bell className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 pl-3 border-l border-[var(--border)]">
          <div className="w-8 h-8 rounded-full bg-[var(--brand)] flex items-center justify-center">
            <span className="text-xs font-semibold text-white">
              {user?.name?.slice(0, 2).toUpperCase() ?? "U"}
            </span>
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold app-text">{user?.name}</p>
            <p className="text-xs app-muted capitalize">{user?.role?.replace("_", " ")}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
