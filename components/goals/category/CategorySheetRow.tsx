"use client";

import { useState, useEffect, useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Category } from "../../../types";
import { ConfirmDialog } from "../../shared/ConfirmDialog";

export function CategorySheetRow({
  category,
  onDelete,
  onRename,
}: {
  category: Category;
  onDelete: () => void;
  onRename: (newName: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editValue, setEditValue] = useState(category.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: category.id });

  useEffect(() => {
    setEditValue(category.name);
  }, [category.name]);

  function handleCommit() {
    const trimmed = editValue.trim();
    if (!trimmed) { setEditValue(category.name); return; }
    if (trimmed !== category.name) onRename(trimmed);
  }

  return (
    <div
      ref={setNodeRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        padding: "10px 20px",
        gap: "12px",
        background: hovered ? "rgba(255,255,255,0.025)" : "transparent",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        opacity: isDragging ? 0.35 : 1,
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      {/* Drag handle */}
      <div
        {...listeners}
        {...attributes}
        style={{ flexShrink: 0, color: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", cursor: "grab", userSelect: "none", touchAction: "none" }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <circle cx="4" cy="3" r="1.1" fill="currentColor" />
          <circle cx="8" cy="3" r="1.1" fill="currentColor" />
          <circle cx="4" cy="6" r="1.1" fill="currentColor" />
          <circle cx="8" cy="6" r="1.1" fill="currentColor" />
          <circle cx="4" cy="9" r="1.1" fill="currentColor" />
          <circle cx="8" cy="9" r="1.1" fill="currentColor" />
        </svg>
      </div>
      <input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onFocus={(e) => { (e.target as HTMLInputElement).style.borderBottomColor = "rgba(255,255,255,0.2)"; }}
        onBlur={(e) => { (e.target as HTMLInputElement).style.borderBottomColor = "transparent"; handleCommit(); }}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") { setEditValue(category.name); e.currentTarget.blur(); }
        }}
        style={{
          flex: 1,
          fontSize: "15px",
          color: "rgba(255,255,255,0.8)",
          background: "transparent",
          border: "none",
          borderBottom: "1px solid transparent",
          outline: "none",
          fontFamily: "inherit",
          lineHeight: 1.3,
          padding: "3px 0",
          transition: "border-color 0.15s",
        }}
      />
      <button
        onClick={() => setConfirmDelete(true)}
        aria-label={`Delete ${category.name}`}
        style={{
          flexShrink: 0,
          width: "28px",
          height: "28px",
          borderRadius: "8px",
          border: "none",
          background: hovered ? "rgba(255,60,60,0.14)" : "transparent",
          color: hovered ? "rgba(255,90,90,0.75)" : "rgba(255,255,255,0.18)",
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
      {confirmDelete && (
        <ConfirmDialog
          message={`Delete "${category.name}"?`}
          onConfirm={() => { setConfirmDelete(false); onDelete(); }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}
