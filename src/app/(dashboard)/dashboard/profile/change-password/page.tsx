"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { ArrowLeft } from "lucide-react";

const schema = z.object({
  current_password: z.string().min(1, "Current password required"),
  new_password:     z.string().min(8, "Minimum 8 characters"),
  confirm_password: z.string(),
}).refine((d) => d.new_password === d.confirm_password, {
  message: "Passwords do not match", path: ["confirm_password"],
});
type FormData = z.infer<typeof schema>;

export default function ChangePasswordPage() {
  const router = useRouter();
  const { success, error } = useToast();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await api.patch("/api/v1/auth/profile/password", {
        current_password: data.current_password,
        new_password:     data.new_password,
      });
      success("Password changed successfully");
      reset();
      router.push("/dashboard/profile/settings");
    } catch (err: any) {
      error(err.response?.data?.error ?? "Failed to change password");
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Change password</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Update your password</CardTitle></CardHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input {...register("current_password")} label="Current password" type="password" error={errors.current_password?.message} />
          <Input {...register("new_password")}     label="New password"     type="password" error={errors.new_password?.message} />
          <Input {...register("confirm_password")} label="Confirm password" type="password" error={errors.confirm_password?.message} />
          <Button type="submit" loading={isSubmitting}>Update password</Button>
        </form>
      </Card>
    </div>
  );
}
