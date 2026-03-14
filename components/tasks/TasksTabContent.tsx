"use client";

import { useState, useRef } from "react";
import type { Item, Goal, SectionKey } from "../../types";
import { SECTION_META } from "../../lib/constants";
import { TaskItem } from "./TaskItem";
import { CategoryHeader } from "../goals/category/CategoryHeader";

export function TasksTabContent({
  sectionKey,
  items,
  goals,
  onAdd,
  onToggle,
  onDelete,
}: {
  sectionKey: "tasks";
  items: Item[];
  goals: Goal[];
  onAdd: (key: SectionKey, title: string, recurring: boolean, goalId: string | null) => void;
  onToggle: (key: SectionKey, id: string) => void;
  onDelete: (key: SectionKey, id: string) => void;
}) {
  const meta = SECTION_META[sectionKey];
  const [input, setInput] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleAdd() {
    const trimmed = input.trim();
    if (!trimmed) return;
    onAdd(sectionKey, trimmed, recurring, selectedGoalId || null);
    setInput("");
    setRecurring(false);
    setSelectedGoalId("");
    inputRef.current?.focus();
  }

  const active = items.filter((i) => !i.completed);
  const done = items.filter((i) => i.completed);

  // Build goal map for lookups
  const goalMap = new Map(goals.map((g) => [g.id, g]));

  // Group active tasks by goalId
  const groupedActive: Map<string | null, Item[]> = new Map();
  for (const goal of goals) groupedActive.set(goal.id, []);
  groupedActive.set(null, []);
  for (const item of active) {
    const key = item.goalId && goalMap.has(item.goalId) ? item.goalId : null;
    if (!groupedActive.has(key)) groupedActive.set(key, []);
    groupedActive.get(key)!.push(item);
  }

  // Build sections: goals with tasks first, then "No goal" last
  const goalSections = goals
    .filter((g) => (groupedActive.get(g.id) ?? []).length > 0)
    .map((g) => ({ key: g.id, label: g.title, goalId: g.id as string | null, dim: false }));
  const noGoalTasks = groupedActive.get(null) ?? [];
  const hasGoalSections = goalSections.length > 0 || goals.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "#0a0a0a",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", gap: "10px" }}>
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

        {/* Goal selector */}
        {goals.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>
              Goal
            </span>
            <div style={{ position: "relative", flex: 1 }}>
              <select
                value={selectedGoalId}
                onChange={(e) => setSelectedGoalId(e.target.value)}
                style={{
                  width: "100%",
                  appearance: "none",
                  WebkitAppearance: "none",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                  padding: "7px 28px 7px 11px",
                  fontSize: "13px",
                  color: selectedGoalId ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.3)",
                  outline: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <option value="">None</option>
                {goals.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.title}
                  </option>
                ))}
              </select>
              <svg
                style={{ position: "absolute", right: "9px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                width="10"
                height="6"
                viewBox="0 0 10 6"
                fill="none"
              >
                <path d="M1 1L5 5L9 1" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        )}
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
            {/* Goal-grouped active tasks */}
            {goalSections.map(({ key, label }) => (
              <div key={key}>
                <CategoryHeader label={label} />
                {(groupedActive.get(key) ?? []).map((item) => (
                  <TaskItem key={item.id} item={item} onToggle={() => onToggle(sectionKey, item.id)} onDelete={() => onDelete(sectionKey, item.id)} />
                ))}
              </div>
            ))}

            {/* Tasks with no goal */}
            {noGoalTasks.length > 0 && (
              <div>
                {hasGoalSections && <CategoryHeader label="No goal" dim />}
                {noGoalTasks.map((item) => (
                  <TaskItem key={item.id} item={item} onToggle={() => onToggle(sectionKey, item.id)} onDelete={() => onDelete(sectionKey, item.id)} />
                ))}
              </div>
            )}

            {/* Completed tasks */}
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
