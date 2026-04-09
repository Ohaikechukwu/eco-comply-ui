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
