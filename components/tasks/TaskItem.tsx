"use client";

import { useState } from "react";
import type { Item } from "../../types";
import { formatDate } from "../../lib/utils";
import { ConfirmDialog } from "../shared/ConfirmDialog";

export function TaskItem({
  item,
  onToggle,
  onDelete,
  onToggleActive,
  onToggleRecurring,
}: {
  item: Item;
  onToggle: () => void;
  onDelete: () => void;
  onToggleActive?: () => void;
  onToggleRecurring?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  return (
    <>
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "13px 20px",
        background: hovered ? "rgba(255,255,255,0.025)" : "transparent",
        transition: "background 0.15s",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <button
        onClick={onToggle}
        aria-label={item.completed ? "Mark incomplete" : "Mark complete"}
        style={{
          flexShrink: 0,
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          border: item.completed ? "2px solid rgba(255,255,255,0.4)" : "2px solid rgba(255,255,255,0.18)",
          background: item.completed ? "rgba(255,255,255,0.12)" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.15s",
          padding: 0,
        }}
      >
        {item.completed && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.8 7L9 1" stroke="rgba(255,255,255,0.65)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: "15px",
            color: item.completed ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.85)",
            textDecoration: item.completed ? "line-through rgba(255,255,255,0.18)" : "none",
            lineHeight: 1.35,
            transition: "color 0.15s",
            wordBreak: "break-word",
          }}
        >
          {item.title}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "3px" }}>
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.18)", fontVariantNumeric: "tabular-nums" }}>
            {formatDate(item.createdAt)}
          </p>
          {item.recurring && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(140,200,255,0.9)",
                background: "rgba(140,200,255,0.1)",
                border: "1px solid rgba(140,200,255,0.2)",
                borderRadius: "4px",
                padding: "2px 4px",
              }}
            >
              <svg width="10" height="10" viewBox="0 0 18 18" fill="none">
                <path d="M13.5 3H4.5A3 3 0 0 0 1.5 6v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M4.5 15h9a3 3 0 0 0 3-3v-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M11.5 1.5L13.5 3L11.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6.5 16.5L4.5 15L6.5 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          )}
          {item.active && (
            <span
              style={{
                fontSize: "10px",
                fontWeight: 500,
                color: "rgba(240,200,80,0.9)",
                background: "rgba(240,200,80,0.1)",
                border: "1px solid rgba(240,200,80,0.2)",
                borderRadius: "4px",
                padding: "1px 5px",
                letterSpacing: "0.02em",
              }}
            >
              Working on it
            </span>
          )}
        </div>
      </div>

      {onToggleRecurring && (
        <button
          onClick={onToggleRecurring}
          aria-label={item.recurring ? "Disable recurring" : "Enable recurring"}
          style={{
            flexShrink: 0,
            width: "28px",
            height: "28px",
            borderRadius: "8px",
            border: "none",
            background: item.recurring ? "rgba(140,200,255,0.12)" : hovered ? "rgba(255,255,255,0.06)" : "transparent",
            color: item.recurring ? "rgba(140,200,255,0.9)" : hovered ? "rgba(255,255,255,0.3)" : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.15s",
            padding: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
            <path d="M13.5 3H4.5A3 3 0 0 0 1.5 6v1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M4.5 15h9a3 3 0 0 0 3-3v-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M11.5 1.5L13.5 3L11.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6.5 16.5L4.5 15L6.5 13.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}

      {onToggleActive && (
        <button
          onClick={onToggleActive}
          aria-label={item.active ? "Deactivate task" : "Activate task"}
          style={{
            flexShrink: 0,
            width: "28px",
            height: "28px",
            borderRadius: "8px",
            border: "none",
            background: item.active ? "rgba(240,200,80,0.12)" : hovered ? "rgba(255,255,255,0.06)" : "transparent",
            color: item.active ? "rgba(240,200,80,0.9)" : hovered ? "rgba(255,255,255,0.3)" : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.15s",
            padding: 0,
          }}
        >
          <svg width="12" height="14" viewBox="0 0 12 16" fill="none">
            <path d="M7 1L1 9h5l-1 6 6-8H6l1-6z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill={item.active ? "rgba(240,200,80,0.3)" : "none"} />
          </svg>
        </button>
      )}

      <button
        onClick={() => setConfirmDelete(true)}
        aria-label="Delete item"
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
    {confirmDelete && (
      <ConfirmDialog
        message={`Delete "${item.title}"?`}
        onConfirm={() => { setConfirmDelete(false); onDelete(); }}
        onCancel={() => setConfirmDelete(false)}
      />
    )}
    </>
  );
}
