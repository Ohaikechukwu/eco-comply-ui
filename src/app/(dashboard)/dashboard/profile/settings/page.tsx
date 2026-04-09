"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import Link from "next/link";

const schema = z.object({ name: z.string().min(2, "Name is required") });
type FormData = z.infer<typeof schema>;

export default function ProfileSettingsPage() {
  const { user, org, updateUser } = useAuthStore();
  const { success, error } = useToast();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name ?? "" },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await api.patch("/api/v1/auth/profile", data);
      updateUser(res.data.data);
      success("Profile updated");
    } catch {
      error("Update failed");
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-xl font-bold text-gray-900">Profile settings</h1>

      <Card>
        <CardHeader><CardTitle>Personal details</CardTitle></CardHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input {...register("name")} label="Full name" error={errors.name?.message} />
          <Input value={user?.email ?? ""} label="Email address" disabled className="bg-gray-50 cursor-not-allowed" />
          <Input value={user?.role?.replace("_", " ") ?? ""} label="Role" disabled className="bg-gray-50 cursor-not-allowed capitalize" />
          <Input value={org?.name ?? ""} label="Organisation" disabled className="bg-gray-50 cursor-not-allowed" />
          <Button type="submit" loading={isSubmitting}>Save changes</Button>
        </form>
      </Card>

      <Card>
        <CardHeader><CardTitle>Security</CardTitle></CardHeader>
        <Link href="/dashboard/profile/change-password">
          <Button variant="secondary">Change password</Button>
        </Link>
      </Card>
    </div>
  );
}
