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
