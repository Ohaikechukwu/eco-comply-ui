import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { APIResponse, CollaborationAccess } from "@/types";

export function useCollaborationAccess(inspectionId: string) {
  return useQuery({
    queryKey: ["collaboration", inspectionId],
    queryFn: async () => {
      const res = await api.get<APIResponse<CollaborationAccess[]>>(`/api/v1/collaborate/${inspectionId}/access`);
      return res.data.data ?? [];
    },
    enabled: !!inspectionId,
  });
}

export function useShareInspection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ inspectionId, user_id, permission }: {
      inspectionId: string;
      user_id: string;
      permission: "viewer" | "editor" | "reviewer";
    }) => {
      const res = await api.post(`/api/v1/collaborate/${inspectionId}/share`, {
        user_id,
        permission,
      });
      return res.data.data;
    },
    onSuccess: (_, { inspectionId }) => {
      qc.invalidateQueries({ queryKey: ["collaboration", inspectionId] });
    },
  });
}

export function useRevokeInspectionAccess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ inspectionId, userId }: { inspectionId: string; userId: string }) => {
      await api.delete(`/api/v1/collaborate/${inspectionId}/share/${userId}`);
    },
    onSuccess: (_, { inspectionId }) => {
      qc.invalidateQueries({ queryKey: ["collaboration", inspectionId] });
    },
  });
}
