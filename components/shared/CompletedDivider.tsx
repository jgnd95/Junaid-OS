"use client";

export function CompletedDivider({ count }: { count: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 20px 4px" }}>
      <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.18)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
        Done · {count}
      </span>
      <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.05)" }} />
    </div>
  );
}
