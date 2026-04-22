"use client";

import { useMemo, useState } from "react";
import { BarChart3, MapPinned, ShieldCheck, TriangleAlert } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageSpinner } from "@/components/ui/Spinner";
import { useAnalytics, useAnalyticsCompare, useAnalyticsGeoJSON } from "@/hooks/useInspections";
import { formatDate } from "@/lib/utils";

function isoDateDaysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

export default function AnalyticsPage() {
  const [from, setFrom] = useState(isoDateDaysAgo(30));
  const [to, setTo] = useState(new Date().toISOString());

  const { data, isLoading } = useAnalytics();
  const { data: comparison } = useAnalyticsCompare(from, to);
  const { data: geojson } = useAnalyticsGeoJSON();

  const statusCards = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.status_counts).map(([status, value]) => ({ status, value }));
  }, [data]);

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Organisation-wide inspection, action, and location overview.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input className="input" type="datetime-local" value={from.slice(0, 16)} onChange={(e) => setFrom(new Date(e.target.value).toISOString())} />
          <input className="input" type="datetime-local" value={to.slice(0, 16)} onChange={(e) => setTo(new Date(e.target.value).toISOString())} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {statusCards.map((item) => (
          <Card key={item.status} className="p-5">
            <p className="text-xs uppercase tracking-wide text-gray-500">{item.status.replace(/_/g, " ")}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{item.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Checklist Summary</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-green-50 p-4">
              <p className="text-xs text-green-700">Conformance</p>
              <p className="text-2xl font-bold text-green-900 mt-2">{data?.checklist_summary.conformance ?? 0}</p>
            </div>
            <div className="rounded-xl bg-red-50 p-4">
              <p className="text-xs text-red-700">Non-conformance</p>
              <p className="text-2xl font-bold text-red-900 mt-2">{data?.checklist_summary.non_conformance ?? 0}</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs text-gray-700">Unanswered</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{data?.checklist_summary.unanswered ?? 0}</p>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Action Summary</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Pending", value: data?.action_summary.pending ?? 0, icon: TriangleAlert },
              { label: "In progress", value: data?.action_summary.in_progress ?? 0, icon: BarChart3 },
              { label: "Resolved", value: data?.action_summary.resolved ?? 0, icon: ShieldCheck },
              { label: "Overdue", value: data?.action_summary.overdue ?? 0, icon: MapPinned },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-xl border border-gray-100 p-4">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Icon className="w-4 h-4" />
                    <span className="text-xs">{item.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{item.value}</p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Period Comparison</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            {comparison ? (
              <>
                <div className="rounded-xl bg-brand-50 p-4">
                  <p className="text-xs text-brand-700">Current period</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatDate(comparison.current_period.from)} to {formatDate(comparison.current_period.to)}
                  </p>
                  <p className="text-2xl font-bold text-brand-900 mt-2">{comparison.current_period.total} inspections</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-700">Previous period</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatDate(comparison.previous_period.from)} to {formatDate(comparison.previous_period.to)}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{comparison.previous_period.total} inspections</p>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500">Choose a valid period to load comparison data.</p>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Map Feed</CardTitle>
          </CardHeader>
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-sm text-gray-700">
              {geojson?.features?.length ?? 0} mapped inspections available from the backend GeoJSON endpoint.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Use this feed for spatial analysis, dashboards, or mobile map overlays.
            </p>
          </div>
          <div className="mt-4 space-y-3 max-h-80 overflow-y-auto">
            {(data?.inspection_locations ?? []).map((location) => (
              <div key={location.id} className="rounded-lg border border-gray-100 p-3">
                <p className="text-sm font-medium text-gray-900">{location.project_name}</p>
                <p className="text-xs text-gray-500 mt-1">{location.location_name || "No location name"}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {location.latitude ?? "NA"}, {location.longitude ?? "NA"} • {location.status.replace(/_/g, " ")}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
