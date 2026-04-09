"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PageSpinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { Leaf, Download } from "lucide-react";
import type { APIResponse, Report } from "@/types";

export default function SharedReportPage() {
  const { token } = useParams<{ token: string }>();

  const { data: report, isLoading, isError } = useQuery({
    queryKey: ["shared-report", token],
    queryFn: async () => {
      const res = await api.get<APIResponse<Report>>(`/api/v1/reports/share/${token}`);
      return res.data.data!;
    },
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><PageSpinner /></div>;

  if (isError || !report) return (
    <div className="min-h-screen flex items-center justify-center text-center p-8">
      <div>
        <p className="text-lg font-semibold text-gray-900 mb-2">Link unavailable</p>
        <p className="text-sm text-gray-500">This report link has expired or does not exist.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900">EcoComply NG</span>
        </div>
        {report.file_url && (
          <a href={report.file_url} target="_blank" rel="noopener noreferrer">
            <Button size="sm"><Download className="w-4 h-4" /> Download PDF</Button>
          </a>
        )}
      </header>
      <main className="max-w-4xl mx-auto p-6">
        {report.file_url ? (
          <iframe src={report.file_url} className="w-full rounded-xl border border-gray-200 shadow-sm" style={{ height: "85vh" }} />
        ) : (
          <div className="text-center py-16 text-sm text-gray-500">
            {report.status === "generating" ? "Report is being generated, check back shortly..." : "Report file unavailable"}
          </div>
        )}
      </main>
    </div>
  );
}
