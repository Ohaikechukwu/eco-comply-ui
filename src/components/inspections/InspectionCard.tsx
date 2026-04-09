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
          {inspection.location_name && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="line-clamp-1">{inspection.location_name}</span>
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
