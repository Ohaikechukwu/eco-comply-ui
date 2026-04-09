import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { APIResponse, ExportJob } from "@/types";

export function useExports() {
  return useQuery({
    queryKey: ["exports"],
    queryFn: async () => {
      const res = await api.get<APIResponse<{ jobs: ExportJob[]; total: number }>>("/api/v1/exports");
      return res.data.data ?? { jobs: [], total: 0 };
    },
  });
}

export function useCreateExportJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (type: "db_backup" | "report_batch" | "media_export") => {
      const res = await api.post<APIResponse<ExportJob>>("/api/v1/exports", { type });
      return res.data.data!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["exports"] }),
  });
}
