"use client";

export default function SignUpPage() {
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
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="email"
            placeholder="Email"
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

          <button
            style={{
              width: "100%",
              padding: "14px",
              fontSize: 15,
              fontWeight: 600,
              background: "rgba(255,255,255,0.92)",
              color: "#0a0a0a",
              border: "none",
              borderRadius: 12,
              cursor: "pointer",
              marginTop: 4,
            }}
          >
            Create account
          </button>
        </div>

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
          <span
            style={{
              color: "rgba(255,255,255,0.75)",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
}
