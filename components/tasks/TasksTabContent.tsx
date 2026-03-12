"use client";

import { useState, useRef } from "react";
import type { Item, SectionKey } from "../../types";
import { SECTION_META } from "../../lib/constants";
import { TaskItem } from "./TaskItem";

export function TasksTabContent({
  sectionKey,
  items,
  onAdd,
  onToggle,
  onDelete,
}: {
  sectionKey: "tasks";
  items: Item[];
  onAdd: (key: SectionKey, title: string, recurring: boolean) => void;
  onToggle: (key: SectionKey, id: string) => void;
  onDelete: (key: SectionKey, id: string) => void;
}) {
  const meta = SECTION_META[sectionKey];
  const [input, setInput] = useState("");
  const [recurring, setRecurring] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleAdd() {
    const trimmed = input.trim();
    if (!trimmed) return;
    onAdd(sectionKey, trimmed, recurring);
    setInput("");
    setRecurring(false);
    inputRef.current?.focus();
  }

  const active = items.filter((i) => !i.completed);
  const done = items.filter((i) => i.completed);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "#0a0a0a",
          display: "flex",
          gap: "10px",
          flexShrink: 0,
        }}
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder={meta.placeholder}
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            padding: "11px 15px",
            fontSize: "15px",
            color: "rgba(255,255,255,0.85)",
            outline: "none",
            fontFamily: "inherit",
            transition: "border-color 0.15s",
          }}
          onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.2)"; }}
          onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.08)"; }}
        />
        <button
          onClick={handleAdd}
          style={{
            flexShrink: 0,
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            width: "44px",
            height: "44px",
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.75)",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.16)";
            (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.95)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)";
            (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.75)";
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2V14M2 8H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <button
          onClick={() => setRecurring((r) => !r)}
          aria-label="Toggle recurring"
          title="Recurring task"
          style={{
            flexShrink: 0,
            background: recurring ? "rgba(120,180,255,0.15)" : "rgba(255,255,255,0.06)",
            border: recurring ? "1px solid rgba(120,180,255,0.35)" : "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            width: "44px",
            height: "44px",
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: recurring ? "rgba(140,200,255,0.9)" : "rgba(255,255,255,0.3)",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
            <path d="M13.5 3H4.5A3 3 0 0 0 1.5 6v1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M4.5 15h9a3 3 0 0 0 3-3v-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M11.5 1.5L13.5 3L11.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6.5 16.5L4.5 15L6.5 13.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {active.length === 0 && done.length === 0 ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px" }}>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.18)", fontStyle: "italic" }}>
              {meta.emptyText}
            </p>
          </div>
        ) : (
          <>
            {active.map((item) => (
              <TaskItem key={item.id} item={item} onToggle={() => onToggle(sectionKey, item.id)} onDelete={() => onDelete(sectionKey, item.id)} />
            ))}
            {done.length > 0 && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "16px 20px 8px" }}>
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Completed · {done.length}
                  </span>
                  <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.05)" }} />
                </div>
                {done.map((item) => (
                  <TaskItem key={item.id} item={item} onToggle={() => onToggle(sectionKey, item.id)} onDelete={() => onDelete(sectionKey, item.id)} />
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
