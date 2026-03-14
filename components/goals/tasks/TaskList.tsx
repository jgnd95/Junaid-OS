"use client";

import { useState, useRef, useEffect } from "react";
import type { Task } from "../../../types";
import { TaskItem } from "../../tasks/TaskItem";

export function TaskList({
  linkedTasks,
  onToggleTask,
  onDeleteTask,
  onToggleActiveTask,
  onToggleRecurringTask,
  onAddTask,
  addingTask,
  setAddingTask,
}: {
  linkedTasks: Task[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onToggleActiveTask?: (id: string) => void;
  onToggleRecurringTask?: (id: string) => void;
  onAddTask?: (title: string) => void;
  addingTask: boolean;
  setAddingTask: (v: boolean) => void;
}) {
  const [taskInput, setTaskInput] = useState("");
  const addInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (addingTask) addInputRef.current?.focus();
  }, [addingTask]);

  function handleAddTask() {
    const trimmed = taskInput.trim();
    if (!trimmed || !onAddTask) return;
    onAddTask(trimmed);
    setTaskInput("");
    setAddingTask(false);
  }

  return (
    <>
      {/* Expanded task list */}
      <div
        style={{
          paddingLeft: "34px",
          background: "rgba(255,255,255,0.015)",
          borderBottom: addingTask ? "none" : "1px solid rgba(255,255,255,0.04)",
        }}
      >
        {linkedTasks.map((task) => (
          <TaskItem
            key={task.id}
            item={task}
            onToggle={() => onToggleTask(task.id)}
            onDelete={() => onDeleteTask(task.id)}
            onToggleActive={onToggleActiveTask ? () => onToggleActiveTask(task.id) : undefined}
            onToggleRecurring={onToggleRecurringTask ? () => onToggleRecurringTask(task.id) : undefined}
          />
        ))}
      </div>

      {/* Add task sheet */}
      {addingTask && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 20px 10px 34px",
            background: "rgba(255,255,255,0.025)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <input
            ref={addInputRef}
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddTask();
              if (e.key === "Escape") { setAddingTask(false); setTaskInput(""); }
            }}
            placeholder="New task…"
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              padding: "8px 12px",
              fontSize: "14px",
              color: "rgba(255,255,255,0.85)",
              outline: "none",
              fontFamily: "inherit",
            }}
          />
          <button
            onClick={handleAddTask}
            style={{
              flexShrink: 0,
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              width: "34px",
              height: "34px",
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.7)",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.16)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)";
            }}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M8 2V14M2 8H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <button
            onClick={() => { setAddingTask(false); setTaskInput(""); }}
            style={{
              flexShrink: 0,
              background: "transparent",
              border: "none",
              borderRadius: "8px",
              width: "34px",
              height: "34px",
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.3)",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            <svg width="10" height="10" viewBox="0 0 11 11" fill="none">
              <path d="M1 1L10 10M10 1L1 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
