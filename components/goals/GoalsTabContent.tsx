"use client";

import { useState, useRef } from "react";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import type { Goal, Category } from "../../types";
import { UNCAT_KEY } from "../../lib/constants";
import { GoalRow } from "./GoalRow";
import { CategoryHeader } from "./category/CategoryHeader";
import { CategorySheet } from "./category/CategorySheet";
import { CompletedDivider } from "../shared/CompletedDivider";

function GoalDropZone({ id, children }: { id: string; children: (isOver: boolean) => React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return <div ref={setNodeRef}>{children(isOver)}</div>;
}

export function GoalsTabContent({
  goals,
  categories,
  onAddGoal,
  onToggleGoal,
  onDeleteGoal,
  onAddCategory,
  onDeleteCategory,
  onRenameCategory,
  onReorderCategories,
  onReassignGoal,
}: {
  goals: Goal[];
  categories: Category[];
  onAddGoal: (title: string, categoryId: string | null) => void;
  onToggleGoal: (id: string) => void;
  onDeleteGoal: (id: string) => void;
  onAddCategory: (name: string) => void;
  onDeleteCategory: (id: string) => void;
  onRenameCategory: (id: string, newName: string) => void;
  onReorderCategories: (newOrder: Category[]) => void;
  onReassignGoal: (goalId: string, categoryId: string | null) => void;
}) {
  const [titleInput, setTitleInput] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [showCategorySheet, setShowCategorySheet] = useState(false);
  const [dragGoalId, setDragGoalId] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  );

  function handleAdd() {
    const trimmed = titleInput.trim();
    if (!trimmed) return;
    onAddGoal(trimmed, selectedCategoryId || null);
    setTitleInput("");
    titleRef.current?.focus();
  }

  function handleDragStart(event: DragStartEvent) {
    setDragGoalId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { over } = event;
    if (over && dragGoalId !== null) {
      const catId = over.id === UNCAT_KEY ? null : (over.id as string);
      onReassignGoal(dragGoalId, catId);
    }
    setDragGoalId(null);
  }

  // Build grouped list: one group per category (in order), then uncategorized
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  // Group only active goals by categoryId
  const grouped: Map<string | null, Goal[]> = new Map();
  for (const cat of categories) grouped.set(cat.id, []);
  grouped.set(null, []);
  for (const goal of goals) {
    if (goal.completed) continue;
    const key = goal.categoryId && categoryMap.has(goal.categoryId) ? goal.categoryId : null;
    grouped.get(key)!.push(goal);
  }

  // All completed goals, sorted by most recently completed
  const allDone = goals
    .filter((g) => g.completed)
    .sort((a, b) => (b.completedAt ?? b.createdAt).localeCompare(a.completedAt ?? a.createdAt));

  // Build flat sections list: named categories + uncategorized always last
  const sections = [
    ...categories.map((cat) => ({ key: cat.id, label: cat.name, catId: cat.id as string | null, dim: false })),
    { key: UNCAT_KEY, label: "Uncategorized", catId: null as string | null, dim: true },
  ];

  const draggedGoal = dragGoalId ? goals.find((g) => g.id === dragGoalId) : null;

  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Input bar */}
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
        {/* Row 1: title + add + categories button */}
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            ref={titleRef}
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Add a new goal…"
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
          {/* Categories button */}
          <button
            onClick={() => setShowCategorySheet(true)}
            aria-label="Manage categories"
            title="Manage categories"
            style={{
              flexShrink: 0,
              width: "44px",
              height: "44px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s",
              padding: 0,
              color: "rgba(255,255,255,0.45)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.11)";
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.75)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.45)";
            }}
          >
            {/* Tag / label icon */}
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
              <path
                d="M2 2h6.2a1 1 0 0 1 .7.3l6 6a1 1 0 0 1 0 1.4l-4.2 4.2a1 1 0 0 1-1.4 0l-6-6A1 1 0 0 1 3 7.2V3a1 1 0 0 1 1-1Z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="5.5" cy="5.5" r="1" fill="currentColor" />
            </svg>
          </button>
        </div>

        {/* Row 2: category selector (only shown if categories exist) */}
        {categories.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>
              Category
            </span>
            <div style={{ position: "relative", flex: 1 }}>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                style={{
                  width: "100%",
                  appearance: "none",
                  WebkitAppearance: "none",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                  padding: "7px 28px 7px 11px",
                  fontSize: "13px",
                  color: selectedCategoryId ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.3)",
                  outline: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <option value="">None</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {/* Chevron */}
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

      {/* Goal list */}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {titleInput.trim().length >= 1 ? (
            (() => {
              const q = titleInput.trim().toLowerCase();
              const matches = goals.filter((g) => g.title.toLowerCase().includes(q));
              return matches.length === 0 ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "120px" }}>
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.18)", fontStyle: "italic" }}>No matching goals</p>
                </div>
              ) : (
                matches.map((goal) => (
                  <GoalRow
                    key={goal.id}
                    goal={goal}
                    categoryName={null}
                    onToggle={() => onToggleGoal(goal.id)}
                    onDelete={() => onDeleteGoal(goal.id)}
                  />
                ))
              );
            })()
          ) : (
          <>
          {sections.map(({ key, label, catId, dim }) => {
            const catGoals = grouped.get(catId) ?? [];
            // Only show "Uncategorized" header when there are named categories
            const showHeader = catId !== null || categories.length > 0;

            return (
              <GoalDropZone key={key} id={key}>
                {(isOver) => (
                  <div
                    style={{
                      background: isOver && dragGoalId ? "rgba(255,255,255,0.03)" : "transparent",
                      border: isOver && dragGoalId ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
                      borderRadius: "10px",
                      margin: "2px 8px",
                      transition: "background 0.15s, border-color 0.15s",
                    }}
                  >
                    {showHeader && <CategoryHeader label={label} dim={dim} />}

                    {catGoals.length === 0 ? (
                      <p style={{
                        padding: "8px 20px 16px",
                        fontSize: "12px",
                        color: isOver && dragGoalId ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)",
                        fontStyle: "italic",
                        transition: "color 0.15s",
                      }}>
                        {isOver && dragGoalId ? "Drop here" : "No goals yet"}
                      </p>
                    ) : (
                      catGoals.map((goal) => (
                        <GoalRow
                          key={goal.id}
                          goal={goal}
                          categoryName={null}
                          onToggle={() => onToggleGoal(goal.id)}
                          onDelete={() => onDeleteGoal(goal.id)}
                        />
                      ))
                    )}
                  </div>
                )}
              </GoalDropZone>
            );
          })}

          {/* Single Done section at the bottom */}
          {allDone.length > 0 && (
            <div style={{ margin: "2px 8px" }}>
              <CompletedDivider count={allDone.length} />
              {allDone.map((goal) => (
                <GoalRow
                  key={goal.id}
                  goal={goal}
                  categoryName={goal.categoryId ? categoryMap.get(goal.categoryId)?.name ?? null : null}
                  onToggle={() => onToggleGoal(goal.id)}
                  onDelete={() => onDeleteGoal(goal.id)}
                />
              ))}
            </div>
          )}
          </>
          )}
        </div>

        <DragOverlay>
          {draggedGoal ? (
            <div
              style={{
                padding: "12px 20px",
                background: "#1c1c1c",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.85)",
                fontSize: "15px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                cursor: "grabbing",
                userSelect: "none",
              }}
            >
              {draggedGoal.title}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Category sheet overlay */}
      {showCategorySheet && (
        <CategorySheet
          categories={categories}
          onAdd={onAddCategory}
          onDelete={onDeleteCategory}
          onRename={onRenameCategory}
          onReorder={onReorderCategories}
          onClose={() => setShowCategorySheet(false)}
        />
      )}
    </div>
  );
}
