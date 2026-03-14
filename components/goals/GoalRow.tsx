"use client";

import { useState, useRef, useEffect } from "react";
import { useDraggable } from "@dnd-kit/core";
import type { Goal, Item } from "../../types";
import { formatDate } from "../../lib/utils";
import { TaskList } from "./tasks/TaskList";

export function GoalRow({
  goal,
  categoryName,
  taskStats,
  linkedTasks,
  onToggle,
  onDelete,
  onToggleTask,
  onDeleteTask,
  onAddTask,
  onToggleActiveTask,
}: {
  goal: Goal;
  categoryName: string | null;
  taskStats?: { total: number; completed: number } | null;
  linkedTasks?: Item[];
  onToggle: () => void;
  onDelete: () => void;
  onToggleTask?: (id: string) => void;
  onDeleteTask?: (id: string) => void;
  onAddTask?: (title: string) => void;
  onToggleActiveTask?: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [addingTask, setAddingTask] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: goal.id });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const hasTasks = linkedTasks && linkedTasks.length > 0;

  return (
    <div ref={setNodeRef} style={{ opacity: isDragging ? 0.35 : 1 }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          padding: "12px 20px",
          background: hovered ? "rgba(255,255,255,0.025)" : "transparent",
          transition: "background 0.15s",
          borderBottom: expanded && hasTasks ? "none" : "1px solid rgba(255,255,255,0.04)",
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
            {taskStats !== undefined && (() => {
              const allTasksDone = !!(taskStats && taskStats.total > 0 && taskStats.completed === taskStats.total);
              return (
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 500,
                    color: goal.completed
                      ? "rgba(255,255,255,0.15)"
                      : allTasksDone
                        ? "rgba(100,210,130,0.85)"
                        : "rgba(255,255,255,0.3)",
                    background: goal.completed
                      ? "rgba(255,255,255,0.04)"
                      : allTasksDone
                        ? "rgba(100,210,130,0.1)"
                        : "rgba(255,255,255,0.06)",
                    border: allTasksDone && !goal.completed
                      ? "1px solid rgba(100,210,130,0.2)"
                      : "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "4px",
                    padding: "1px 5px",
                    letterSpacing: "0.02em",
                    transition: "all 0.15s",
                  }}
                >
                  {taskStats && taskStats.total > 0
                    ? `${taskStats.completed} of ${taskStats.total} completed`
                    : "No tasks"}
                </span>
              );
            })()}
          </div>
        </div>

        {/* Expand chevron */}
        {hasTasks && (
          <button
            onClick={() => setExpanded((e) => !e)}
            aria-label={expanded ? "Collapse tasks" : "Expand tasks"}
            style={{
              flexShrink: 0,
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              border: "none",
              background: expanded ? "rgba(255,255,255,0.08)" : "transparent",
              color: "rgba(255,255,255,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s",
              padding: 0,
            }}
          >
            <svg
              width="10"
              height="6"
              viewBox="0 0 10 6"
              fill="none"
              style={{
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.15s",
              }}
            >
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        {/* Actions menu */}
        <div ref={menuRef} style={{ position: "relative", flexShrink: 0 }}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Goal actions"
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              border: "none",
              background: menuOpen ? "rgba(255,255,255,0.1)" : hovered ? "rgba(255,255,255,0.06)" : "transparent",
              color: menuOpen ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s",
              padding: 0,
            }}
          >
            <svg width="14" height="4" viewBox="0 0 14 4" fill="none">
              <circle cx="2" cy="2" r="1.5" fill="currentColor" />
              <circle cx="7" cy="2" r="1.5" fill="currentColor" />
              <circle cx="12" cy="2" r="1.5" fill="currentColor" />
            </svg>
          </button>

          {menuOpen && (
            <div
              style={{
                position: "absolute",
                top: 32,
                right: 0,
                background: "#1a1a1a",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
                padding: "4px",
                minWidth: "140px",
                zIndex: 50,
                boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
              }}
            >
              {onAddTask && (
                <button
                  onClick={() => { setMenuOpen(false); setAddingTask(true); }}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.75)",
                    background: "transparent",
                    border: "none",
                    borderRadius: "7px",
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2V14M2 8H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Add task
                </button>
              )}
              <button
                onClick={() => { setMenuOpen(false); onDelete(); }}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  fontSize: "13px",
                  color: "rgba(255,90,90,0.8)",
                  background: "transparent",
                  border: "none",
                  borderRadius: "7px",
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,60,60,0.08)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M1 1L10 10M10 1L1 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Delete goal
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Task list (expanded + add-task input) */}
      {expanded && hasTasks && onToggleTask && onDeleteTask && (
        <TaskList
          linkedTasks={linkedTasks}
          onToggleTask={onToggleTask}
          onDeleteTask={onDeleteTask}
          onToggleActiveTask={onToggleActiveTask}
          onAddTask={onAddTask}
          addingTask={addingTask}
          setAddingTask={setAddingTask}
        />
      )}

      {/* Add task input when no tasks exist yet */}
      {(!hasTasks || !expanded) && addingTask && onAddTask && (
        <TaskList
          linkedTasks={[]}
          onToggleTask={() => {}}
          onDeleteTask={() => {}}
          onToggleActiveTask={onToggleActiveTask}
          onAddTask={onAddTask}
          addingTask={addingTask}
          setAddingTask={setAddingTask}
        />
      )}
    </div>
  );
}
