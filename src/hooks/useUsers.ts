import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { User, APIResponse } from "@/types";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await api.get<APIResponse<{ users: User[]; total: number }>>("/api/v1/auth/users");
      return res.data.data!;
    },
  });
}

export function useInviteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; email: string; role: string }) => {
      const res = await api.post<APIResponse<User>>("/api/v1/auth/users/invite", data);
      return res.data.data!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const res = await api.patch<APIResponse<User>>(`/api/v1/auth/users/${id}/role`, { role });
      return res.data.data!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}
