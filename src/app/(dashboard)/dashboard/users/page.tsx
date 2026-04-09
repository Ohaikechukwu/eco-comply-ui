"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PageSpinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { useUsers, useInviteUser } from "@/hooks/useUsers";
import { formatDate } from "@/lib/utils";

const schema = z.object({
  name:  z.string().min(2),
  email: z.string().email(),
  role:  z.enum(["manager", "supervisor", "enumerator"]),
});
type FormData = z.infer<typeof schema>;

export default function UsersPage() {
  const [showInvite, setShowInvite] = useState(false);
  const { data, isLoading } = useUsers();
  const inviteUser = useInviteUser();
  const { success, error } = useToast();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "enumerator" },
  });

  const onInvite = async (formData: FormData) => {
    try {
      await inviteUser.mutateAsync(formData);
      success("User invited successfully");
      setShowInvite(false);
      reset();
    } catch (err: any) {
      error(err.response?.data?.error ?? "Invite failed");
    }
  };

  const roleVariant: Record<string, "success" | "info" | "warning" | "default"> = {
    org_admin: "success", manager: "info", supervisor: "warning", enumerator: "default",
  };

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Users</h1>
        <Button onClick={() => setShowInvite(!showInvite)}>
          <UserPlus className="w-4 h-4" /> Invite user
        </Button>
      </div>

      {showInvite && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Invite new user</h3>
            <form onSubmit={handleSubmit(onInvite)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input {...register("name")} label="Full name" error={errors.name?.message} />
              <Input {...register("email")} label="Email" type="email" error={errors.email?.message} />
              <Select {...register("role")} label="Role" options={[
                { value: "enumerator", label: "Enumerator" },
                { value: "supervisor", label: "Supervisor" },
                { value: "manager",    label: "Manager"    },
              ]} />
              <div className="flex items-end gap-2">
                <Button type="submit" loading={inviteUser.isPending}>Send invite</Button>
                <Button type="button" variant="secondary" onClick={() => setShowInvite(false)}>Cancel</Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Name", "Email", "Role", "Status", "Joined"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data?.users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                <td className="px-4 py-3 text-gray-500">{user.email}</td>
                <td className="px-4 py-3"><Badge variant={roleVariant[user.role] ?? "default"}>{user.role.replace("_", " ")}</Badge></td>
                <td className="px-4 py-3"><Badge variant={user.is_active ? "success" : "danger"}>{user.is_active ? "Active" : "Inactive"}</Badge></td>
                <td className="px-4 py-3 text-gray-500">{formatDate(user.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
