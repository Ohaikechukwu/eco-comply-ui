"use client";

import { Archive, Database, FileArchive } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageSpinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { useCreateExportJob, useExports } from "@/hooks/useExports";
import { formatDateTime } from "@/lib/utils";

const exportTypes = [
  { type: "db_backup" as const, title: "Database Backup", icon: Database, description: "Create a backend data backup job." },
  { type: "report_batch" as const, title: "Report Batch", icon: FileArchive, description: "Export compiled report data for the organisation." },
  { type: "media_export" as const, title: "Media Export", icon: Archive, description: "Package uploaded field media for download." },
];

export default function ExportsPage() {
  const { data, isLoading } = useExports();
  const createExport = useCreateExportJob();
  const { success, error } = useToast();

  const handleCreate = async (type: "db_backup" | "report_batch" | "media_export") => {
    try {
      await createExport.mutateAsync(type);
      success("Export job queued");
    } catch (err: any) {
      error(err.response?.data?.error ?? "Could not queue export job");
    }
  };

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Exports</h1>
        <p className="text-sm text-gray-500 mt-0.5">Queue and monitor organisation-level export jobs.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {exportTypes.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.type}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-brand-700" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
              </div>
              <Button onClick={() => handleCreate(item.type)} loading={createExport.isPending}>Queue job</Button>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Jobs</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          {data?.jobs.length ? data.jobs.map((job) => (
            <div key={job.id} className="rounded-lg border border-gray-100 p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{job.type.replace(/_/g, " ")}</p>
                <p className="text-xs text-gray-500 mt-1">Created {formatDateTime(job.created_at)}</p>
                {job.error_message && <p className="text-xs text-red-600 mt-1">{job.error_message}</p>}
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={job.status === "completed" ? "success" : job.status === "failed" ? "danger" : "info"}>
                  {job.status}
                </Badge>
                {job.file_url && (
                  <a className="text-sm font-medium text-brand-700" href={job.file_url} target="_blank" rel="noreferrer">
                    Download
                  </a>
                )}
              </div>
            </div>
          )) : (
            <p className="text-sm text-gray-500">No export jobs yet.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
