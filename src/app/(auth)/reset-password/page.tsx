"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

const schema = z.object({
  new_password: z.string().min(8, "Minimum 8 characters"),
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

type FormData = z.infer<typeof schema>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    if (!token) {
      error("Reset token is missing from the link.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/v1/auth/reset-password", {
        token,
        new_password: data.new_password,
      });
      success("Password reset successfully. Please sign in.");
      router.push("/login");
    } catch (err: any) {
      error(err.response?.data?.error ?? "Could not reset password");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.75rem 1rem",
    borderRadius: "0.5rem",
    border: "1px solid rgba(255,255,255,0.3)",
    background: "rgba(255,255,255,0.15)",
    color: "white",
    fontSize: "0.9375rem",
    outline: "none",
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100%" }}>
      <div style={{
        flex: 1,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "3rem",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url("https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2600&q=100")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.68) saturate(1.02)",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(8,30,12,0.15) 0%, rgba(8,30,12,0.88) 100%)",
        }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 460 }}>
          <p style={{ color: "#86efac", fontWeight: 600, marginBottom: "1rem" }}>Account Recovery</p>
          <h1 style={{ color: "white", fontSize: "2.25rem", lineHeight: 1.15, marginBottom: "1rem" }}>
            Set a new password and get back to field work.
          </h1>
          <p style={{ color: "rgba(255,255,255,0.72)", lineHeight: 1.7 }}>
            This reset page is connected to the backend token flow, so the link from your email now completes end to end.
          </p>
        </div>
      </div>

      <div style={{
        width: "100%",
        maxWidth: 520,
        background: "rgba(8, 22, 8, 0.9)",
        backdropFilter: "blur(24px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "3rem 3.5rem",
        borderLeft: "1px solid rgba(255,255,255,0.08)",
      }}>
        <h2 style={{ color: "white", fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.375rem" }}>
          Reset password
        </h2>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9375rem", marginBottom: "2rem" }}>
          Choose a new password for your EcoComply NG account.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.875rem", fontWeight: 500, display: "block", marginBottom: "0.5rem" }}>
              New password
            </label>
            <input
              {...register("new_password")}
              type="password"
              placeholder="Minimum 8 characters"
              autoComplete="new-password"
              style={inputStyle}
            />
            {errors.new_password && <p style={{ color: "#fca5a5", fontSize: "0.8125rem", marginTop: "0.375rem" }}>{errors.new_password.message}</p>}
          </div>

          <div>
            <label style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.875rem", fontWeight: 500, display: "block", marginBottom: "0.5rem" }}>
              Confirm password
            </label>
            <input
              {...register("confirm_password")}
              type="password"
              placeholder="Repeat your password"
              autoComplete="new-password"
              style={inputStyle}
            />
            {errors.confirm_password && <p style={{ color: "#fca5a5", fontSize: "0.8125rem", marginTop: "0.375rem" }}>{errors.confirm_password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading || !token}
            style={{
              width: "100%",
              padding: "0.875rem 1rem",
              borderRadius: "0.5rem",
              background: loading || !token ? "rgba(22,163,74,0.5)" : "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
              color: "white",
              fontWeight: 600,
              fontSize: "1rem",
              border: "none",
              cursor: loading || !token ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Resetting..." : "Reset password"}
          </button>
        </form>

        {!token && (
          <p style={{ color: "#fca5a5", fontSize: "0.875rem", marginTop: "1rem" }}>
            This link is missing a reset token.
          </p>
        )}

        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9375rem", textAlign: "center", marginTop: "2rem" }}>
          <Link href="/login" style={{ color: "#86efac", fontWeight: 600, textDecoration: "none" }}>
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#07150a" }} />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
