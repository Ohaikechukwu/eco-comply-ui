import { cn, statusBadgeClass, statusLabel } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("badge", statusBadgeClass(status))}>
      {statusLabel(status)}
    </span>
  );
}

export function Badge({ children, variant = "default" }: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}) {
  const variants = {
    default: "badge--gray",
    success: "badge--green",
    warning: "badge--yellow",
    danger:  "badge--red",
    info:    "badge--blue",
  };
  return (
    <span className={cn("badge", variants[variant])}>
      {children}
    </span>
  );
}
