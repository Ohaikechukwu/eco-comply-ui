"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FileText, Download, Share2, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageSpinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useGenerateReport } from "@/hooks/useInspections";
import { useToast } from "@/components/ui/Toast";
import { formatDateTime } from "@/lib/utils";
import type { Report, APIResponse } from "@/types";

export default function ReportsPage() {
  const searchParams  = useSearchParams();
  const router        = useRouter();
  const inspectionId  = searchParams.get("inspection_id");
  const generateReport = useGenerateReport();
  const { success, error } = useToast();

  const { data: reports, isLoading, refetch } = useQuery({
    queryKey: ["reports", inspectionId],
    queryFn: async () => {
      const url = inspectionId
        ? `/api/v1/reports?inspection_id=${inspectionId}`
        : "/api/v1/reports";
      const res = await api.get<APIResponse<Report[]>>(url);
      // data could be null from backend, force to []
      return res.data.data ?? [];  // already there but add the cast below
    },
  });

  const createShareLink = useMutation({
    mutationFn: async (reportId: string) => {
      const res = await api.post<APIResponse<Report>>(`/api/v1/reports/${reportId}/share`);
      return res.data.data!;
    },
    onSuccess: () => refetch(),
  });

  const handleGenerate = async () => {
    if (!inspectionId) { error("No inspection selected"); return; }
    try {
      await generateReport.mutateAsync(inspectionId);
      success("Report generation started — refresh in a moment");
      setTimeout(() => refetch(), 3000);
    } catch {
      error("Failed to generate report");
    }
  };

  const statusVariant = (s: string) =>
    s === "ready" ? "success" : s === "failed" ? "danger" : "info";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Reports</h1>
        {inspectionId && (
          <Button onClick={handleGenerate} loading={generateReport.isPending}>
            <FileText className="w-4 h-4" /> Generate report
          </Button>
        )}
      </div>

      {isLoading ? <PageSpinner /> : (reports ?? []).length ? (
        <div className="space-y-3">
          {(reports ?? []).map((report) => (
            <Card key={report.id} className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                {report.status === "generating"
                  ? <Loader2 className="w-5 h-5 text-brand-600 animate-spin" />
                  : <FileText className="w-5 h-5 text-brand-600" />
                }
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Report — {formatDateTime(report.created_at)}
                </p>
                <Badge variant={statusVariant(report.status) as any}>
                  {report.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {report.file_url && (
                  <a href={report.file_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary" size="sm">
                      <Download className="w-4 h-4" /> Download
                    </Button>
                  </a>
                )}
                {report.share_token ? (
                  <Button variant="secondary" size="sm" onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/reports/share/${report.share_token}`
                    );
                    success("Share link copied");
                  }}>
                    <Share2 className="w-4 h-4" /> Copy link
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={createShareLink.isPending}
                    onClick={async () => {
                      try {
                        const shared = await createShareLink.mutateAsync(report.id);
                        if (shared.share_token) {
                          navigator.clipboard.writeText(
                            `${window.location.origin}/reports/share/${shared.share_token}`
                          );
                          success("Share link created and copied");
                        }
                      } catch {
                        error("Could not create share link");
                      }
                    }}
                  >
                    <Share2 className="w-4 h-4" /> Create share link
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon={FileText} title="No reports yet"
          description={inspectionId
            ? "Generate your first report above"
            : "Select an inspection to view its reports"} />
      )}
    </div>
  );
}
