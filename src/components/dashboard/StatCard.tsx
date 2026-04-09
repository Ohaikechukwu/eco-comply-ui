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
