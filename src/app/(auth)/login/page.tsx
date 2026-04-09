"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { useToast } from "@/components/ui/Toast";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
  organization: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router  = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await api.post("/api/v1/auth/login", data);
      const { user, org } = res.data.data;
      setAuth(user, org);
      success("Welcome back!");
      router.push("/dashboard");
    } catch (err: any) {
      error(err.response?.data?.error ?? "Login failed. Check your credentials.");
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

      {/* ── LEFT PANEL — background image + environmental messaging ── */}
      <div style={{
        flex: 1,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "3rem",
      }}>
        {/* Background image — less blur, more visible */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url("https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2600&q=100")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "brightness(0.72) saturate(1.08) contrast(1.04)",
          transform: "scale(1.015)",
        }} />
        {/* Gradient overlay — stronger at bottom for text readability */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(0,20,5,0.15) 0%, rgba(0,40,10,0.82) 100%)",
        }} />

        {/* Logo top-left */}
        <div style={{ position: "absolute", top: "2rem", left: "2.5rem", display: "flex", alignItems: "center", gap: "0.75rem", zIndex: 1 }}>
          <div style={{
            width: 44, height: 44, borderRadius: "0.75rem",
            backgroundColor: "#16a34a",
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

        {/* Bottom messaging */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            background: "rgba(22,163,74,0.25)", border: "1px solid rgba(74,222,128,0.4)",
            borderRadius: "2rem", padding: "0.375rem 1rem", marginBottom: "1.25rem",
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
            <span style={{ color: "#86efac", fontSize: "0.8125rem", fontWeight: 500 }}>
              NESREA · FEPA · EIA Compliance
            </span>
          </div>

          <h2 style={{ color: "white", fontSize: "2.25rem", fontWeight: 700, lineHeight: 1.2, marginBottom: "1rem", maxWidth: 480 }}>
            Digitising Environmental Compliance in Nigeria
          </h2>

          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1rem", lineHeight: 1.7, maxWidth: 440, marginBottom: "2rem" }}>
            Streamline EIA monitoring, field inspections, and compliance reporting for
            infrastructure projects, contractors, and government officers — in real time.
          </p>

          <div style={{ display: "flex", gap: "2rem" }}>
            {[
              { value: "500+", label: "Inspections logged"   },
              { value: "3",    label: "Checklist frameworks" },
              { value: "100%", label: "Audit-ready reports"  },
            ].map((stat) => (
              <div key={stat.label}>
                <p style={{ color: "white", fontSize: "1.5rem", fontWeight: 700, lineHeight: 1 }}>{stat.value}</p>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8125rem", marginTop: "0.25rem" }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — login form ── */}
      <div style={{
        width: "100%",
        maxWidth: 520,
        background: "rgba(8, 22, 8, 0.88)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "3rem 3.5rem",
        borderLeft: "1px solid rgba(255,255,255,0.08)",
      }}>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <h2 style={{ color: "white", fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.375rem" }}>
            Sign in
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9375rem", marginBottom: "2.25rem" }}>
            Access your compliance dashboard
          </p>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.875rem", fontWeight: 500, display: "block", marginBottom: "0.5rem" }}>
                Organisation
              </label>
              <input
                {...register("organization")}
                type="text"
                placeholder="Optional for member login"
                autoComplete="organization"
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = "#4ade80"; e.target.style.boxShadow = "0 0 0 3px rgba(74,222,128,0.2)"; }}
                onBlur={(e)  => { e.target.style.borderColor = "rgba(255,255,255,0.3)"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <div>
              <label style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.875rem", fontWeight: 500, display: "block", marginBottom: "0.5rem" }}>
                Email address
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = "#4ade80"; e.target.style.boxShadow = "0 0 0 3px rgba(74,222,128,0.2)"; }}
                onBlur={(e)  => { e.target.style.borderColor = "rgba(255,255,255,0.3)"; e.target.style.boxShadow = "none"; }}
              />
              {errors.email && <p style={{ color: "#fca5a5", fontSize: "0.8125rem", marginTop: "0.375rem" }}>{errors.email.message}</p>}
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <label style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.875rem", fontWeight: 500 }}>Password</label>
                <Link href="/forgot-password" style={{ color: "#86efac", fontSize: "0.8125rem", textDecoration: "none" }}>
                  Forgot password?
                </Link>
              </div>
              <input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = "#4ade80"; e.target.style.boxShadow = "0 0 0 3px rgba(74,222,128,0.2)"; }}
                onBlur={(e)  => { e.target.style.borderColor = "rgba(255,255,255,0.3)"; e.target.style.boxShadow = "none"; }}
              />
              {errors.password && <p style={{ color: "#fca5a5", fontSize: "0.8125rem", marginTop: "0.375rem" }}>{errors.password.message}</p>}
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
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9375rem", textAlign: "center", marginTop: "2rem" }}>
            New organisation?{" "}
            <Link href="/register" style={{ color: "#86efac", fontWeight: 600, textDecoration: "none" }}>
              Register here
            </Link>
          </p>

          <div style={{
            marginTop: "2.5rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            justifyContent: "center",
            gap: "1.5rem",
          }}>
            {["GBV Compliant", "HSE Monitored", "EIA Tracked"].map((badge) => (
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
