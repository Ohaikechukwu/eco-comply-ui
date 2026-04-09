"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

const schema = z.object({
  org_name:         z.string().min(2, "Organisation name is required"),
  name:             z.string().min(2, "Your name is required"),
  email:            z.string().email("Enter a valid email"),
  password:         z.string().min(8, "Minimum 8 characters"),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  message: "Passwords do not match", path: ["confirm_password"],
});
type FormData = z.infer<typeof schema>;

function GlassInput({
  label, error, ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <div>
      <label style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.875rem", fontWeight: 500, display: "block", marginBottom: "0.5rem" }}>
        {label}
      </label>
      <input
        {...props}
        style={{
          width: "100%",
          padding: "0.75rem 1rem",
          borderRadius: "0.5rem",
          border: "1px solid rgba(255,255,255,0.3)",
          background: "rgba(255,255,255,0.15)",
          color: "white",
          fontSize: "0.9375rem",
          outline: "none",
        }}
        onFocus={(e) => { e.target.style.borderColor = "#4ade80"; e.target.style.boxShadow = "0 0 0 3px rgba(74,222,128,0.2)"; }}
        onBlur={(e)  => { e.target.style.borderColor = "rgba(255,255,255,0.3)"; e.target.style.boxShadow = "none"; }}
      />
      {error && <p style={{ color: "#fca5a5", fontSize: "0.8125rem", marginTop: "0.375rem" }}>{error}</p>}
    </div>
  );
}

const features = [
  {
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    title: "GBV & Social Safeguards",
    desc:  "Track Gender-Based Violence checklists and social safeguard compliance across all project sites.",
  },
  {
    icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064",
    title: "Environment & HSE",
    desc:  "Monitor health, safety, and environmental obligations — burrow pits, PPE, waste management and more.",
  },
  {
    icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    title: "Automated PDF Reports",
    desc:  "Generate audit-ready inspection reports with embedded photos, GPS data, and agreed action plans.",
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await api.post("/api/v1/auth/register", {
        org_name: data.org_name,
        name:     data.name,
        email:    data.email,
        password: data.password,
      });
      success("Organisation registered! Please sign in.");
      router.push("/login");
    } catch (err: any) {
      error(err.response?.data?.error ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100%" }}>

      {/* ── LEFT PANEL — image + feature highlights ── */}
      <div style={{
        flex: 1,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "3rem",
      }}>
        {/* Background image — aerial green landscape */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url("https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=2600&q=100")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "brightness(0.68) saturate(1.08) contrast(1.04)",
          transform: "scale(1.015)",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(0,20,5,0.1) 0%, rgba(0,40,10,0.85) 100%)",
        }} />

        {/* Logo */}
        <div style={{ position: "absolute", top: "2rem", left: "2.5rem", display: "flex", alignItems: "center", gap: "0.75rem", zIndex: 1 }}>
          <div style={{
            width: 44, height: 44, borderRadius: "0.75rem", backgroundColor: "#16a34a",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 20px rgba(22,163,74,0.5)",
          }}>
            <svg width="22" height="22" fill="none" stroke="white" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <span style={{ color: "white", fontWeight: 700, fontSize: "1.125rem" }}>EcoComply NG</span>
        </div>

        {/* Bottom content */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            background: "rgba(22,163,74,0.25)", border: "1px solid rgba(74,222,128,0.4)",
            borderRadius: "2rem", padding: "0.375rem 1rem", marginBottom: "1.25rem",
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
            <span style={{ color: "#86efac", fontSize: "0.8125rem", fontWeight: 500 }}>
              Built for Nigerian Environmental Professionals
            </span>
          </div>

          <h2 style={{ color: "white", fontSize: "2rem", fontWeight: 700, lineHeight: 1.25, marginBottom: "1rem", maxWidth: 460 }}>
            Everything you need for field compliance — in one platform
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginTop: "1.5rem" }}>
            {features.map((f) => (
              <div key={f.title} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "0.625rem", flexShrink: 0,
                  background: "rgba(22,163,74,0.3)", border: "1px solid rgba(74,222,128,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="18" height="18" fill="none" stroke="#4ade80" strokeWidth="1.75" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                  </svg>
                </div>
                <div>
                  <p style={{ color: "white", fontWeight: 600, fontSize: "0.9375rem", marginBottom: "0.25rem" }}>{f.title}</p>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8125rem", lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — register form ── */}
      <div style={{
        width: "100%",
        maxWidth: 540,
        background: "rgba(8, 22, 8, 0.88)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "3rem 3.5rem",
        borderLeft: "1px solid rgba(255,255,255,0.08)",
        overflowY: "auto",
      }}>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <h2 style={{ color: "white", fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.375rem" }}>
            Register your organisation
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9375rem", marginBottom: "2rem" }}>
            Create your EcoComply NG account
          </p>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
            <GlassInput
              {...register("org_name")}
              label="Organisation name"
              placeholder="Acme Environmental Consulting Ltd"
              error={errors.org_name?.message}
            />
            <GlassInput
              {...register("name")}
              label="Your full name"
              placeholder="Jane Adeyemi"
              error={errors.name?.message}
            />
            <GlassInput
              {...register("email")}
              label="Email address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
            />

            {/* Side-by-side password fields */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <GlassInput
                {...register("password")}
                label="Password"
                type="password"
                placeholder="Min. 8 characters"
                error={errors.password?.message}
              />
              <GlassInput
                {...register("confirm_password")}
                label="Confirm password"
                type="password"
                placeholder="Repeat password"
                error={errors.confirm_password?.message}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.875rem 1rem",
                borderRadius: "0.5rem",
                background: loading ? "rgba(22,163,74,0.5)" : "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                color: "white",
                fontWeight: 600,
                fontSize: "1rem",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                marginTop: "0.5rem",
                boxShadow: "0 4px 20px rgba(22,163,74,0.3)",
              }}
            >
              {loading && (
                <svg style={{ animation: "spin 1s linear infinite", width: 18, height: 18 }} fill="none" viewBox="0 0 24 24">
                  <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              )}
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9375rem", textAlign: "center", marginTop: "1.75rem" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "#86efac", fontWeight: 600, textDecoration: "none" }}>
              Sign in
            </Link>
          </p>

          <div style={{
            marginTop: "2rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            justifyContent: "center",
            gap: "1.5rem",
          }}>
            {["NESREA Aligned", "EIA Ready", "Field Tested"].map((badge) => (
              <div key={badge} style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#4ade80" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.75rem" }}>{badge}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}