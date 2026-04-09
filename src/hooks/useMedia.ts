import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { APIResponse, Media } from "@/types";

export function useMedia(inspectionId: string) {
  return useQuery({
    queryKey: ["media", inspectionId],
    queryFn: async () => {
      const res = await api.get<APIResponse<{ media: Media[]; total: number }>>("/api/v1/media", {
        params: { inspection_id: inspectionId },
      });
      return res.data.data ?? { media: [], total: 0 };
    },
    enabled: !!inspectionId,
  });
}

export function useUploadMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      inspection_id: string;
      file: File;
      captured_via: "camera" | "gallery";
      latitude?: number;
      longitude?: number;
      gps_source?: "device" | "manual" | "none";
      captured_at?: string;
    }) => {
      const formData = new FormData();
      formData.append("inspection_id", data.inspection_id);
      formData.append("captured_via", data.captured_via);
      formData.append("gps_source", data.gps_source ?? "none");
      if (data.latitude !== undefined) formData.append("latitude", String(data.latitude));
      if (data.longitude !== undefined) formData.append("longitude", String(data.longitude));
      if (data.captured_at) formData.append("captured_at", data.captured_at);
      formData.append("file", data.file);

      const res = await api.post("/api/v1/media", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.data;
    },
    onSuccess: (_, { inspection_id }) => {
      qc.invalidateQueries({ queryKey: ["media", inspection_id] });
    },
  });
}

export function useDeleteMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      await api.delete(`/api/v1/media/${id}`);
    },
    onSuccess: (_, variables) => {
      void variables;
      qc.invalidateQueries({ queryKey: ["media"] });
    },
  });
}
