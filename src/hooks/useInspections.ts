import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  AnalyticsCompareResponse,
  AnalyticsResponse,
  APIResponse,
  ChecklistTemplate,
  DashboardData,
  GeoJSONResponse,
  Inspection,
  MergeConflictResponse,
  SyncPullResponse,
} from "@/types";

function normalizeInspection(inspection: Inspection): Inspection {
  return {
    ...inspection,
    location_name: inspection.location_name ?? "",
    checklist_items: inspection.checklist_items ?? [],
    agreed_actions: inspection.agreed_actions ?? [],
    comments: inspection.comments ?? [],
    reviews: inspection.reviews ?? [],
  };
}

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await api.get<APIResponse<DashboardData>>("/api/v1/inspections/dashboard");
      const data = res.data.data!;
      return {
        ...data,
        recent: (data.recent ?? []).map(normalizeInspection),
      };
    },
  });
}

export function useAnalytics() {
  return useQuery({
    queryKey: ["inspection-analytics"],
    queryFn: async () => {
      const res = await api.get<APIResponse<AnalyticsResponse>>("/api/v1/inspections/analytics");
      return res.data.data!;
    },
  });
}

export function useAnalyticsCompare(from: string, to: string, enabled = true) {
  return useQuery({
    queryKey: ["inspection-analytics-compare", from, to],
    queryFn: async () => {
      const res = await api.get<APIResponse<AnalyticsCompareResponse>>("/api/v1/inspections/analytics/compare", {
        params: { from, to },
      });
      return res.data.data!;
    },
    enabled: enabled && !!from && !!to,
  });
}

export function useAnalyticsGeoJSON() {
  return useQuery({
    queryKey: ["inspection-analytics-geojson"],
    queryFn: async () => {
      const res = await api.get<APIResponse<GeoJSONResponse>>("/api/v1/inspections/analytics/geojson");
      return res.data.data!;
    },
  });
}

export function useTemplates() {
  return useQuery({
    queryKey: ["inspection-templates"],
    queryFn: async () => {
      const res = await api.get<APIResponse<ChecklistTemplate[]>>("/api/v1/inspections/templates");
      return res.data.data ?? [];
    },
  });
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      items: { description: string; sort_order: number }[];
    }) => {
      const res = await api.post<APIResponse<ChecklistTemplate>>("/api/v1/inspections/templates", data);
      return res.data.data!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inspection-templates"] }),
  });
}

export function useInspections(params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["inspections", params],
    queryFn: async () => {
      const res = await api.get<APIResponse<{
        inspections: Inspection[];
        total: number;
        page: number;
        limit: number;
        total_pages: number;
      }>>("/api/v1/inspections", { params });
      const data = res.data.data!;
      return {
        ...data,
        inspections: data.inspections.map(normalizeInspection),
      };
    },
  });
}

export function useInspection(id: string) {
  return useQuery({
    queryKey: ["inspection", id],
    queryFn: async () => {
      const res = await api.get<APIResponse<Inspection>>(`/api/v1/inspections/${id}`);
      return normalizeInspection(res.data.data!);
    },
    enabled: !!id,
  });
}

export function useCreateInspection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Inspection>) => {
      const res = await api.post<APIResponse<Inspection>>("/api/v1/inspections", data);
      return normalizeInspection(res.data.data!);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inspections"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateInspection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Inspection> }) => {
      const res = await api.patch<APIResponse<Inspection>>(`/api/v1/inspections/${id}`, data);
      return normalizeInspection(res.data.data!);
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["inspection", id] });
      qc.invalidateQueries({ queryKey: ["inspections"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteInspection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/v1/inspections/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inspections"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateInspectionStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await api.patch<APIResponse<Inspection>>(`/api/v1/inspections/${id}/status`, { status });
      return normalizeInspection(res.data.data!);
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["inspection", id] });
      qc.invalidateQueries({ queryKey: ["inspections"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["inspection-analytics"] });
    },
  });
}

export function useAddChecklistItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ inspectionId, description, sort_order }: {
      inspectionId: string;
      description: string;
      sort_order?: number;
    }) => {
      const res = await api.post(`/api/v1/inspections/${inspectionId}/checklist`, { description, sort_order });
      return res.data.data;
    },
    onSuccess: (_, { inspectionId }) => {
      qc.invalidateQueries({ queryKey: ["inspection", inspectionId] });
    },
  });
}

export function useUpdateChecklistItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ inspectionId, itemId, response, comment }: {
      inspectionId: string;
      itemId: string;
      response: boolean | null;
      comment?: string;
    }) => {
      const res = await api.patch(`/api/v1/inspections/${inspectionId}/checklist/${itemId}`, { response, comment });
      return res.data.data;
    },
    onSuccess: (_, { inspectionId }) => {
      qc.invalidateQueries({ queryKey: ["inspection", inspectionId] });
      qc.invalidateQueries({ queryKey: ["inspection-analytics"] });
    },
  });
}

export function useCreateAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ inspectionId, description, assignee_id, due_date }: {
      inspectionId: string;
      description: string;
      assignee_id: string;
      due_date: string;
    }) => {
      const res = await api.post(`/api/v1/inspections/${inspectionId}/actions`, {
        description,
        assignee_id,
        due_date,
      });
      return res.data.data;
    },
    onSuccess: (_, { inspectionId }) => {
      qc.invalidateQueries({ queryKey: ["inspection", inspectionId] });
      qc.invalidateQueries({ queryKey: ["inspection-analytics"] });
    },
  });
}

export function useUpdateAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ inspectionId, actionId, status, evidence_url }: {
      inspectionId: string;
      actionId: string;
      status?: string;
      evidence_url?: string;
    }) => {
      const res = await api.patch(`/api/v1/inspections/${inspectionId}/actions/${actionId}`, {
        status,
        evidence_url,
      });
      return res.data.data;
    },
    onSuccess: (_, { inspectionId }) => {
      qc.invalidateQueries({ queryKey: ["inspection", inspectionId] });
      qc.invalidateQueries({ queryKey: ["inspection-analytics"] });
    },
  });
}

export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ inspectionId, body }: { inspectionId: string; body: string }) => {
      const res = await api.post(`/api/v1/inspections/${inspectionId}/comments`, { body });
      return res.data.data;
    },
    onSuccess: (_, { inspectionId }) => {
      qc.invalidateQueries({ queryKey: ["inspection", inspectionId] });
    },
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ inspectionId, assigned_to_id, comment, due_date }: {
      inspectionId: string;
      assigned_to_id: string;
      comment: string;
      due_date: string;
    }) => {
      const res = await api.post(`/api/v1/inspections/${inspectionId}/reviews`, {
        assigned_to_id,
        comment,
        due_date,
      });
      return res.data.data;
    },
    onSuccess: (_, { inspectionId }) => {
      qc.invalidateQueries({ queryKey: ["inspection", inspectionId] });
      qc.invalidateQueries({ queryKey: ["inspections"] });
    },
  });
}

export function useUpdateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ inspectionId, reviewId, status, response_comment }: {
      inspectionId: string;
      reviewId: string;
      status: "addressed" | "approved" | "rejected";
      response_comment?: string;
    }) => {
      const res = await api.patch(`/api/v1/inspections/${inspectionId}/reviews/${reviewId}`, {
        status,
        response_comment,
      });
      return res.data.data;
    },
    onSuccess: (_, { inspectionId }) => {
      qc.invalidateQueries({ queryKey: ["inspection", inspectionId] });
      qc.invalidateQueries({ queryKey: ["inspections"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useSyncPull(since: string, enabled = true) {
  return useQuery({
    queryKey: ["inspection-sync", since],
    queryFn: async () => {
      const res = await api.get<APIResponse<SyncPullResponse>>("/api/v1/inspections/sync", {
        params: { since },
      });
      const data = res.data.data!;
      return {
        ...data,
        inspections: data.inspections.map(normalizeInspection),
      };
    },
    enabled: enabled && !!since,
  });
}

export function useOfflineMerge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: {
      id: string;
      data: {
        client_updated_at: string;
        project_name?: string;
        location_name?: string;
        latitude?: number;
        longitude?: number;
        notes?: string;
        status?: string;
      };
    }) => {
      try {
        const res = await api.post<APIResponse<Inspection>>(`/api/v1/inspections/${id}/offline-merge`, data);
        return { conflict: null, inspection: normalizeInspection(res.data.data!) };
      } catch (error: any) {
        if (error.response?.status === 409) {
          const conflict = error.response.data.data as MergeConflictResponse;
          return {
            conflict: {
              ...conflict,
              server_inspection: normalizeInspection(conflict.server_inspection),
            },
            inspection: null,
          };
        }
        throw error;
      }
    },
    onSuccess: (result, { id }) => {
      if (!result.conflict) {
        qc.invalidateQueries({ queryKey: ["inspection", id] });
        qc.invalidateQueries({ queryKey: ["inspections"] });
      }
    },
  });
}

export function useGenerateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (inspectionId: string) => {
      const res = await api.post("/api/v1/reports/generate", { inspection_id: inspectionId });
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reports"] }),
  });
}
