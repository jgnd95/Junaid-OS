"use client";

import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import type { Goal } from "../../types";
import { formatDate } from "../../lib/utils";

export function GoalRow({
  goal,
  categoryName,
  onToggle,
  onDelete,
}: {
  goal: Goal;
  categoryName: string | null;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: goal.id });
  return (
    <div
      ref={setNodeRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "12px 20px",
        background: hovered ? "rgba(255,255,255,0.025)" : "transparent",
        transition: "background 0.15s",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        opacity: isDragging ? 0.35 : 1,
      }}
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        aria-label={goal.completed ? "Mark incomplete" : "Mark complete"}
        style={{
          flexShrink: 0,
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          border: goal.completed ? "2px solid rgba(255,255,255,0.4)" : "2px solid rgba(255,255,255,0.18)",
          background: goal.completed ? "rgba(255,255,255,0.12)" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.15s",
          padding: 0,
        }}
      >
        {goal.completed && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.8 7L9 1" stroke="rgba(255,255,255,0.65)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Title + meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          {...listeners}
          {...attributes}
          style={{
            fontSize: "15px",
            color: goal.completed ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.85)",
            textDecoration: goal.completed ? "line-through rgba(255,255,255,0.18)" : "none",
            lineHeight: 1.35,
            transition: "color 0.15s",
            wordBreak: "break-word",
            cursor: "grab",
            userSelect: "none",
            touchAction: "none",
          }}
        >
          {goal.title}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px", flexWrap: "wrap" }}>
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.18)", fontVariantNumeric: "tabular-nums" }}>
            {formatDate(goal.createdAt)}
          </p>
          {categoryName && (
            <span
              style={{
                fontSize: "10px",
                fontWeight: 500,
                color: goal.completed ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.38)",
                background: goal.completed ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "4px",
                padding: "1px 5px",
                letterSpacing: "0.02em",
                transition: "all 0.15s",
              }}
            >
              {categoryName}
            </span>
          )}
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={onDelete}
        aria-label="Delete goal"
        style={{
          flexShrink: 0,
          width: "28px",
          height: "28px",
          borderRadius: "8px",
          border: "none",
          background: hovered ? "rgba(255,60,60,0.14)" : "transparent",
          color: hovered ? "rgba(255,90,90,0.75)" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.15s",
          padding: 0,
        }}
      >
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
          <path d="M1 1L10 10M10 1L1 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
