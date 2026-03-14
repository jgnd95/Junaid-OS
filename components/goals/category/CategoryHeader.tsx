"use client";

export function CategoryHeader({
  label,
  dim,
  expanded,
  onToggle,
}: {
  label: string;
  dim?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
}) {
  const isExpandable = expanded !== undefined && onToggle !== undefined;

  return (
    <div
      onClick={isExpandable ? onToggle : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "18px 20px 8px",
        cursor: isExpandable ? "pointer" : undefined,
        userSelect: isExpandable ? "none" : undefined,
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
      {isExpandable && (
        <svg
          width="8"
          height="5"
          viewBox="0 0 10 6"
          fill="none"
          style={{
            transform: expanded ? "rotate(0deg)" : "rotate(-90deg)",
            transition: "transform 0.15s",
            flexShrink: 0,
          }}
        >
          <path
            d="M1 1L5 5L9 1"
            stroke={dim ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.25)"}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.05)" }} />
    </div>
  );
}
