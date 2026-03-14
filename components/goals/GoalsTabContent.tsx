"use client";

import { useState, useRef } from "react";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import type { Goal, Category, Item } from "../../types";
import { UNCAT_KEY } from "../../lib/constants";
import { GoalRow } from "./GoalRow";
import { GoalInputBar } from "./GoalInputBar";
import { GoalDropZone } from "./GoalDropZone";
import { CategoryHeader } from "./category/CategoryHeader";
import { CategorySheet } from "./category/CategorySheet";
import { CompletedDivider } from "../shared/CompletedDivider";

export function GoalsTabContent({
  goals,
  tasks,
  categories,
  onAddGoal,
  onToggleGoal,
  onDeleteGoal,
  onAddCategory,
  onDeleteCategory,
  onRenameCategory,
  onReorderCategories,
  onReassignGoal,
  onToggleTask,
  onDeleteTask,
  onAddTask,
  onToggleActiveTask,
}: {
  goals: Goal[];
  tasks: Item[];
  categories: Category[];
  onAddGoal: (title: string, categoryId: string | null) => void;
  onToggleGoal: (id: string) => void;
  onDeleteGoal: (id: string) => void;
  onAddCategory: (name: string) => void;
  onDeleteCategory: (id: string) => void;
  onRenameCategory: (id: string, newName: string) => void;
  onReorderCategories: (newOrder: Category[]) => void;
  onReassignGoal: (goalId: string, categoryId: string | null) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onAddTask: (goalId: string, title: string) => void;
  onToggleActiveTask: (id: string) => void;
}) {
  const [titleInput, setTitleInput] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [showCategorySheet, setShowCategorySheet] = useState(false);
  const [dragGoalId, setDragGoalId] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const titleRef = useRef<HTMLInputElement>(null);

  function toggleSection(key: string) {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

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

  // Build grouped list
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const grouped: Map<string | null, Goal[]> = new Map();
  for (const cat of categories) grouped.set(cat.id, []);
  grouped.set(null, []);
  for (const goal of goals) {
    if (goal.completed) continue;
    const key = goal.categoryId && categoryMap.has(goal.categoryId) ? goal.categoryId : null;
    grouped.get(key)!.push(goal);
  }

  const allDone = goals
    .filter((g) => g.completed)
    .sort((a, b) => (b.completedAt ?? b.createdAt).localeCompare(a.completedAt ?? a.createdAt));

  const sections = [
    ...categories.map((cat) => ({ key: cat.id, label: cat.name, catId: cat.id as string | null, dim: false })),
    { key: UNCAT_KEY, label: "Uncategorized", catId: null as string | null, dim: true },
  ];

  // Task stats per goal
  const taskStatsByGoal = new Map<string, { total: number; completed: number }>();
  const tasksByGoal = new Map<string, Item[]>();
  for (const task of tasks) {
    if (!task.goalId) continue;
    const stats = taskStatsByGoal.get(task.goalId) ?? { total: 0, completed: 0 };
    stats.total++;
    if (task.completed) stats.completed++;
    taskStatsByGoal.set(task.goalId, stats);
    const list = tasksByGoal.get(task.goalId) ?? [];
    list.push(task);
    tasksByGoal.set(task.goalId, list);
  }

  const draggedGoal = dragGoalId ? goals.find((g) => g.id === dragGoalId) : null;

  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <GoalInputBar
        titleInput={titleInput}
        setTitleInput={setTitleInput}
        titleRef={titleRef}
        selectedCategoryId={selectedCategoryId}
        setSelectedCategoryId={setSelectedCategoryId}
        categories={categories}
        onAdd={handleAdd}
        onOpenCategories={() => setShowCategorySheet(true)}
      />

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
                    taskStats={taskStatsByGoal.get(goal.id) ?? null}
                    linkedTasks={tasksByGoal.get(goal.id)}
                    onToggle={() => onToggleGoal(goal.id)}
                    onDelete={() => onDeleteGoal(goal.id)}
                    onToggleTask={onToggleTask}
                    onDeleteTask={onDeleteTask}
                    onAddTask={(title) => onAddTask(goal.id, title)}
                    onToggleActiveTask={onToggleActiveTask}
                  />
                ))
              );
            })()
          ) : (
          <>
          {sections.map(({ key, label, catId, dim }) => {
            const catGoals = grouped.get(catId) ?? [];
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
                    {showHeader && (
                      <CategoryHeader
                        label={label}
                        dim={dim}
                        expanded={!collapsedSections.has(key)}
                        onToggle={() => toggleSection(key)}
                      />
                    )}

                    {collapsedSections.has(key) ? null : catGoals.length === 0 ? (
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
                          taskStats={taskStatsByGoal.get(goal.id) ?? null}
                          linkedTasks={tasksByGoal.get(goal.id)}
                          onToggle={() => onToggleGoal(goal.id)}
                          onDelete={() => onDeleteGoal(goal.id)}
                          onToggleTask={onToggleTask}
                          onDeleteTask={onDeleteTask}
                          onAddTask={(title) => onAddTask(goal.id, title)}
                          onToggleActiveTask={onToggleActiveTask}
                        />
                      ))
                    )}
                  </div>
                )}
              </GoalDropZone>
            );
          })}

          {allDone.length > 0 && (
            <div style={{ margin: "2px 8px" }}>
              <CompletedDivider count={allDone.length} />
              {allDone.map((goal) => (
                <GoalRow
                  key={goal.id}
                  goal={goal}
                  categoryName={goal.categoryId ? categoryMap.get(goal.categoryId)?.name ?? null : null}
                  taskStats={taskStatsByGoal.get(goal.id) ?? null}
                  linkedTasks={tasksByGoal.get(goal.id)}
                  onToggle={() => onToggleGoal(goal.id)}
                  onDelete={() => onDeleteGoal(goal.id)}
                  onToggleTask={onToggleTask}
                  onDeleteTask={onDeleteTask}
                  onAddTask={(title) => onAddTask(goal.id, title)}
                  onToggleActiveTask={onToggleActiveTask}
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
