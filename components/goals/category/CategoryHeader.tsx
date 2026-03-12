"use client";

export function CategoryHeader({ label, dim }: { label: string; dim?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "18px 20px 8px",
      }}
    >
      <span
        style={{
          fontSize: "11px",
          fontWeight: 600,
          color: dim ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.3)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.05)" }} />
    </div>
  );
}
