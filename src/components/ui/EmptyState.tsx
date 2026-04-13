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
        <div className="w-12 h-12 rounded-full bg-[var(--surface-2)] flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 app-muted" />
        </div>
      )}
      <h3 className="text-sm font-semibold app-text mb-1">{title}</h3>
      {description && <p className="text-sm app-muted max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
