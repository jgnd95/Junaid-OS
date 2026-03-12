"use client";

import { Target, CheckSquare } from "lucide-react";
import type { SectionKey } from "../types";
import { TABS, SECTION_META } from "../lib/constants";

export function TabBar({
  active,
  counts,
  onChange,
}: {
  active: SectionKey;
  counts: Record<SectionKey, number>;
  onChange: (tab: SectionKey) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        background: "rgba(10,10,10,0.96)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        flexShrink: 0,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {TABS.map((tab) => {
        const isActive = tab === active;
        const label = tab === "goals" ? "Goals" : SECTION_META[tab].label;
        const count = counts[tab];
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "5px",
              padding: "12px 0 14px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              position: "relative",
              transition: "opacity 0.15s",
            }}
          >
            {tab === "goals" && <Target size={22} color={isActive ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.3)"} />}
            {tab === "tasks" && <CheckSquare size={22} color={isActive ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.3)"} />}
            <span
              style={{
                fontSize: "10px",
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)",
                letterSpacing: "0.02em",
                transition: "color 0.15s",
              }}
            >
              {label}
            </span>
            {count > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "9px",
                  right: "calc(50% - 16px)",
                  minWidth: "16px",
                  height: "16px",
                  borderRadius: "8px",
                  background: isActive ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.18)",
                  color: isActive ? "#0a0a0a" : "rgba(255,255,255,0.5)",
                  fontSize: "9px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 4px",
                  transition: "all 0.15s",
                }}
              >
                {count > 99 ? "99+" : count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
