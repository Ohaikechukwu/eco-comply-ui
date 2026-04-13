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
    draft:            "badge--gray",
    in_progress:      "badge--blue",
    submitted:        "badge--yellow",
    under_review:     "badge--orange",
    pending_actions:  "badge--red",
    completed:        "badge--green",
    finalized:        "badge--green",
  };
  return map[status] ?? "badge--gray";
}

export function statusLabel(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
