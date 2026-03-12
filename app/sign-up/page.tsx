"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          background: "#0a0a0a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-geist), -apple-system, BlinkMacSystemFont, sans-serif",
          padding: "24px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 400, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✉️</div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "rgba(255,255,255,0.92)",
              letterSpacing: "-0.6px",
              lineHeight: 1,
              marginBottom: 12,
            }}
          >
            Check your email
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>
            We sent a confirmation link to <strong style={{ color: "rgba(255,255,255,0.7)" }}>{email}</strong>. Click the link to activate your account.
          </p>
          <a
            href="/login"
            style={{
              display: "inline-block",
              marginTop: 28,
              fontSize: 14,
              color: "rgba(255,255,255,0.75)",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Back to sign in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#0a0a0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-geist), -apple-system, BlinkMacSystemFont, sans-serif",
        padding: "24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Branding */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: "rgba(255,255,255,0.92)",
              letterSpacing: "-0.8px",
              lineHeight: 1,
              marginBottom: 8,
            }}
          >
            Create account
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.35)", fontWeight: 400 }}>
            Start turning ideas into reality
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignUp} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "14px 16px",
              fontSize: 15,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              color: "rgba(255,255,255,0.9)",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "14px 16px",
              fontSize: 15,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              color: "rgba(255,255,255,0.9)",
              outline: "none",
              boxSizing: "border-box",
            }}
          />

          {error && (
            <p style={{ fontSize: 13, color: "#ef4444", margin: 0 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              fontSize: 15,
              fontWeight: 600,
              background: loading ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.92)",
              color: "#0a0a0a",
              border: "none",
              borderRadius: 12,
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: 4,
            }}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        {/* Sign in link */}
        <p
          style={{
            textAlign: "center",
            marginTop: 32,
            fontSize: 14,
            color: "rgba(255,255,255,0.35)",
          }}
        >
          Already have an account?{" "}
          <a
            href="/login"
            style={{
              color: "rgba(255,255,255,0.75)",
              fontWeight: 500,
              cursor: "pointer",
              textDecoration: "none",
            }}
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
