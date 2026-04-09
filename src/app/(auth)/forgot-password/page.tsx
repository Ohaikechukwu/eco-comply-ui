"use client";
import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  organization: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { error } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await api.post("/api/v1/auth/forgot-password", data);
      setSent(true);
    } catch {
      error("Something went wrong. Try again.");
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

      {/* ── LEFT PANEL — image + messaging ── */}
      <div style={{
        flex: 1,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "3rem",
      }}>
        {/* Background image — misty forest / nature */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url("https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2600&q=100")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "brightness(0.68) saturate(1.08) contrast(1.04)",
          transform: "scale(1.015)",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(0,20,5,0.15) 0%, rgba(0,40,10,0.85) 100%)",
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

        {/* Bottom messaging */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            background: "rgba(22,163,74,0.25)", border: "1px solid rgba(74,222,128,0.4)",
            borderRadius: "2rem", padding: "0.375rem 1rem", marginBottom: "1.25rem",
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
            <span style={{ color: "#86efac", fontSize: "0.8125rem", fontWeight: 500 }}>
              Secure · Encrypted · Compliant
            </span>
          </div>

          <h2 style={{ color: "white", fontSize: "2.25rem", fontWeight: 700, lineHeight: 1.2, marginBottom: "1rem", maxWidth: 460 }}>
            Your compliance data is safe with us
          </h2>

          <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "1rem", lineHeight: 1.7, maxWidth: 420, marginBottom: "2rem" }}>
            EcoComply NG uses industry-standard encryption to protect inspection records,
            field data, and compliance reports for all organisations.
          </p>

          {/* Security feature list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {[
              "End-to-end encrypted inspection data",
              "Per-organisation isolated data schemas",
              "Role-based access for field teams",
              "Audit trails on all compliance actions",
            ].map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                  background: "rgba(22,163,74,0.3)", border: "1px solid rgba(74,222,128,0.4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="#4ade80" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span style={{ color: "rgba(255,255,255,0.72)", fontSize: "0.9rem" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — forgot password form ── */}
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
          {/* Lock icon */}
          <div style={{
            width: 52, height: 52, borderRadius: "0.875rem",
            background: "rgba(22,163,74,0.2)", border: "1px solid rgba(74,222,128,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: "1.5rem",
          }}>
            <svg width="24" height="24" fill="none" stroke="#4ade80" strokeWidth="1.75" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <h2 style={{ color: "white", fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.375rem" }}>
            Forgot password?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9375rem", marginBottom: "2.25rem", lineHeight: 1.6 }}>
            Enter the email address linked to your account and we'll send you a reset link.
          </p>

          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                background: "rgba(22,163,74,0.15)",
                border: "1px solid rgba(74,222,128,0.35)",
                borderRadius: "0.75rem",
                padding: "1.5rem",
                textAlign: "center",
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: "50%",
                background: "rgba(22,163,74,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 1rem",
              }}>
                <svg width="22" height="22" fill="none" stroke="#4ade80" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p style={{ color: "white", fontWeight: 600, fontSize: "1rem", marginBottom: "0.5rem" }}>
                Check your inbox
              </p>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.875rem", lineHeight: 1.6 }}>
                We've sent password reset instructions to your email address.
                Check your spam folder if you don't see it.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.875rem", fontWeight: 500, display: "block", marginBottom: "0.5rem" }}>
                  Organisation
                </label>
                <input
                  {...register("organization")}
                  type="text"
                  placeholder="Optional for member accounts"
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
                {errors.email && (
                  <p style={{ color: "#fca5a5", fontSize: "0.8125rem", marginTop: "0.375rem" }}>{errors.email.message}</p>
                )}
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
                  boxShadow: "0 4px 20px rgba(22,163,74,0.3)",
                }}
              >
                {loading && (
                  <svg style={{ animation: "spin 1s linear infinite", width: 18, height: 18 }} fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                )}
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>
          )}

          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9375rem", textAlign: "center", marginTop: "2rem" }}>
            <Link href="/login" style={{ color: "#86efac", fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to sign in
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
