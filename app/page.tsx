"use client";

import { useState, useEffect, useRef } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ─── Types ────────────────────────────────────────────────────────────────────

type Item = {
  id: string;
  title: string;
  createdAt: string;
  completed: boolean;
  recurring: boolean;
};

type Category = {
  id: string;
  name: string;
  createdAt: string;
};

type Goal = {
  id: string;
  title: string;
  createdAt: string;
  completed: boolean;
  categoryId: string | null;
};

type SectionKey = "goals" | "tasks";

type AppData = {
  goals: Goal[];
  goalCategories: Category[];
  tasks: Item[];
};

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "realize-data";
const TABS: SectionKey[] = ["goals", "tasks"];

const SECTION_META: Record<SectionKey, { label: string; placeholder: string; emptyText: string }> = {
  goals: {
    label: "🎯 Goals",
    placeholder: "Add a new goal…",
    emptyText: "No goals yet. Dream big.",
  },
  tasks: {
    label: "Tasks",
    placeholder: "Add a new task…",
    emptyText: "Nothing to do. Enjoy the calm.",
  },
};

// ─── Tab Icons ────────────────────────────────────────────────────────────────

function GoalsIcon({ active }: { active: boolean }) {
  const c = active ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.3)";
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="9" stroke={c} strokeWidth="1.6" />
      <circle cx="11" cy="11" r="5.5" stroke={c} strokeWidth="1.6" />
      <circle cx="11" cy="11" r="2" fill={c} />
    </svg>
  );
}

function TasksIcon({ active }: { active: boolean }) {
  const c = active ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.3)";
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="2" y="4" width="18" height="2.2" rx="1.1" fill={c} opacity={active ? "0.92" : "0.3"} />
      <rect x="2" y="9.9" width="18" height="2.2" rx="1.1" fill={c} opacity={active ? "0.92" : "0.3"} />
      <rect x="2" y="15.8" width="12" height="2.2" rx="1.1" fill={c} opacity={active ? "0.92" : "0.3"} />
      <path d="M16.5 13.5L18.5 15.5L21.5 12" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function loadData(): AppData {
  if (typeof window === "undefined")
    return { goals: [], goalCategories: [], tasks: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        // Migrate old Item[] goals to Goal[] by adding categoryId if missing
        goals: (parsed.goals ?? []).map((g: Goal) => ({
          ...g,
          categoryId: g.categoryId !== undefined ? g.categoryId : null,
        })),
        goalCategories: parsed.goalCategories ?? [],
        tasks: (parsed.tasks ?? []).map((t: Item) => ({
          ...t,
          recurring: t.recurring !== undefined ? t.recurring : false,
        })),
      };
    }
  } catch {}
  return { goals: [], goalCategories: [], tasks: [] };
}

function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ─── Shared: Item Row ────────────────────────────────────────────────────────

function ItemRow({
  item,
  onToggle,
  onDelete,
}: {
  item: Item;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
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
      {item.recurring ? (
        <div
          style={{
            flexShrink: 0,
            width: "20px",
            height: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(140,200,255,0.6)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
            <path d="M13.5 3H4.5A3 3 0 0 0 1.5 6v1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M4.5 15h9a3 3 0 0 0 3-3v-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M11.5 1.5L13.5 3L11.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6.5 16.5L4.5 15L6.5 13.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      ) : (
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
      )}

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
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.18)", marginTop: "3px", fontVariantNumeric: "tabular-nums" }}>
          {formatDate(item.createdAt)}
        </p>
      </div>

      <button
        onClick={onDelete}
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
  );
}

// ─── Goal Row ─────────────────────────────────────────────────────────────────

function GoalRow({
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

// ─── Category Sheet ───────────────────────────────────────────────────────────

function CategorySheet({
  categories,
  onAdd,
  onDelete,
  onRename,
  onReorder,
  onClose,
}: {
  categories: Category[];
  onAdd: (name: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onReorder: (newOrder: Category[]) => void;
  onClose: () => void;
}) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  );

  useEffect(() => {
    // Small delay so the sheet animation settles first
    const t = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, []);

  function handleAdd() {
    const trimmed = input.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setInput("");
    inputRef.current?.focus();
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((c) => c.id === active.id);
      const newIndex = categories.findIndex((c) => c.id === over.id);
      onReorder(arrayMove(categories, oldIndex, newIndex));
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          zIndex: 20,
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 21,
          background: "#161616",
          borderRadius: "20px 20px 0 0",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          maxHeight: "75%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
          <div style={{ width: "36px", height: "4px", borderRadius: "2px", background: "rgba(255,255,255,0.12)" }} />
        </div>

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 20px 16px",
            flexShrink: 0,
          }}
        >
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "rgba(255,255,255,0.9)", letterSpacing: "-0.3px" }}>
            Categories
          </h2>
          <button
            onClick={onClose}
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              border: "none",
              background: "rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M1 1L10 10M10 1L1 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Add input */}
        <div
          style={{
            padding: "0 16px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
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
            placeholder="New category name…"
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "10px",
              padding: "10px 14px",
              fontSize: "14px",
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
              borderRadius: "10px",
              width: "40px",
              height: "40px",
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
        </div>

        {/* Category list */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {categories.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                padding: "32px 20px",
                fontSize: "13px",
                color: "rgba(255,255,255,0.2)",
                fontStyle: "italic",
              }}
            >
              No categories yet
            </p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                {categories.map((cat) => (
                  <CategorySheetRow
                    key={cat.id}
                    category={cat}
                    onDelete={() => onDelete(cat.id)}
                    onRename={(newName) => onRename(cat.id, newName)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </>
  );
}

function CategorySheetRow({
  category,
  onDelete,
  onRename,
}: {
  category: Category;
  onDelete: () => void;
  onRename: (newName: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
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
        onClick={onDelete}
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
    </div>
  );
}

// ─── Goals Tab Content ────────────────────────────────────────────────────────

const UNCAT_KEY = "__uncat__";

function GoalDropZone({ id, children }: { id: string; children: (isOver: boolean) => React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return <div ref={setNodeRef}>{children(isOver)}</div>;
}

function GoalsTabContent({
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

  // Group goals by categoryId
  const grouped: Map<string | null, Goal[]> = new Map();
  for (const cat of categories) grouped.set(cat.id, []);
  grouped.set(null, []);
  for (const goal of goals) {
    const key = goal.categoryId && categoryMap.has(goal.categoryId) ? goal.categoryId : null;
    grouped.get(key)!.push(goal);
  }

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
          sections.map(({ key, label, catId, dim }) => {
            const catGoals = grouped.get(catId) ?? [];
            const active = catGoals.filter((g) => !g.completed);
            const done = catGoals.filter((g) => g.completed);
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
                      <>
                        {active.map((goal) => (
                          <GoalRow
                            key={goal.id}
                            goal={goal}
                            categoryName={null}
                            onToggle={() => onToggleGoal(goal.id)}
                            onDelete={() => onDeleteGoal(goal.id)}
                          />
                        ))}
                        {done.length > 0 && active.length > 0 && <CompletedDivider count={done.length} />}
                        {done.map((goal) => (
                          <GoalRow
                            key={goal.id}
                            goal={goal}
                            categoryName={null}
                            onToggle={() => onToggleGoal(goal.id)}
                            onDelete={() => onDeleteGoal(goal.id)}
                          />
                        ))}
                      </>
                    )}
                  </div>
                )}
              </GoalDropZone>
            );
          })
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

function CategoryHeader({ label, dim }: { label: string; dim?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "18px 20px 8px",
      }}
    >
      <span
        style={{
          fontSize: "11px",
          fontWeight: 600,
          color: dim ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.3)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.05)" }} />
    </div>
  );
}

function CompletedDivider({ count }: { count: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 20px 4px" }}>
      <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.18)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
        Done · {count}
      </span>
      <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.05)" }} />
    </div>
  );
}

// ─── Tasks Tab Content ────────────────────────────────────────────────────────

function TabContent({
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
              <ItemRow key={item.id} item={item} onToggle={() => onToggle(sectionKey, item.id)} onDelete={() => onDelete(sectionKey, item.id)} />
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
                  <ItemRow key={item.id} item={item} onToggle={() => onToggle(sectionKey, item.id)} onDelete={() => onDelete(sectionKey, item.id)} />
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Bottom Tab Bar ───────────────────────────────────────────────────────────

function TabBar({
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
            {tab === "goals" && <GoalsIcon active={isActive} />}
            {tab === "tasks" && <TasksIcon active={isActive} />}
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

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [data, setData] = useState<AppData>({ goals: [], goalCategories: [], tasks: [] });
  const [activeTab, setActiveTab] = useState<SectionKey>("goals");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setData(loadData());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) saveData(data);
  }, [data, mounted]);

  // ── Goals ──
  function handleAddGoal(title: string, categoryId: string | null) {
    const goal: Goal = { id: generateId(), title, createdAt: new Date().toISOString(), completed: false, categoryId };
    setData((prev) => ({ ...prev, goals: [goal, ...prev.goals] }));
  }

  function handleToggleGoal(id: string) {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g)),
    }));
  }

  function handleDeleteGoal(id: string) {
    setData((prev) => ({ ...prev, goals: prev.goals.filter((g) => g.id !== id) }));
  }

  function handleAddCategory(name: string) {
    const cat: Category = { id: generateId(), name, createdAt: new Date().toISOString() };
    setData((prev) => ({ ...prev, goalCategories: [...prev.goalCategories, cat] }));
  }

  function handleDeleteCategory(id: string) {
    setData((prev) => ({
      ...prev,
      goalCategories: prev.goalCategories.filter((c) => c.id !== id),
      goals: prev.goals.map((g) => (g.categoryId === id ? { ...g, categoryId: null } : g)),
    }));
  }

  function handleRenameCategory(id: string, newName: string) {
    setData((prev) => ({
      ...prev,
      goalCategories: prev.goalCategories.map((c) => (c.id === id ? { ...c, name: newName } : c)),
    }));
  }

  function handleReorderCategories(newOrder: Category[]) {
    setData((prev) => ({ ...prev, goalCategories: newOrder }));
  }

  function handleReassignGoal(goalId: string, categoryId: string | null) {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => (g.id === goalId ? { ...g, categoryId } : g)),
    }));
  }

  // ── Tasks / Habits ──
  function handleAdd(key: SectionKey, title: string, recurring = false) {
    if (key === "goals") return;
    const item: Item = { id: generateId(), title, createdAt: new Date().toISOString(), completed: false, recurring };
    setData((prev) => ({ ...prev, [key]: [item, ...(prev[key] as Item[])] }));
  }

  function handleToggle(key: SectionKey, id: string) {
    if (key === "goals") return;
    setData((prev) => ({
      ...prev,
      [key]: (prev[key] as Item[]).map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)),
    }));
  }

  function handleDelete(key: SectionKey, id: string) {
    if (key === "goals") return;
    setData((prev) => ({ ...prev, [key]: (prev[key] as Item[]).filter((item) => item.id !== id) }));
  }

  const activeCounts: Record<SectionKey, number> = {
    goals: data.goals.filter((i) => !i.completed).length,
    tasks: data.tasks.filter((i) => !i.completed).length,
  };

  const headerLabel = activeTab === "goals" ? "Goals" : SECTION_META[activeTab].label;

  return (
    <div
      style={{
        height: "100dvh",
        background: "#0a0a0a",
        display: "flex",
        justifyContent: "center",
        fontFamily: "var(--font-geist), -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {/* App header */}
        <div
          style={{
            padding: "54px 20px 18px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "#0a0a0a",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 500, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>
                Realize
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ opacity: 0.75 }}>
                  {activeTab === "goals" && <GoalsIcon active={true} />}
                  {activeTab === "tasks" && <TasksIcon active={true} />}
                </div>
                <h1 style={{ fontSize: "28px", fontWeight: 700, color: "rgba(255,255,255,0.92)", letterSpacing: "-0.6px", lineHeight: 1 }}>
                  {headerLabel}
                </h1>
              </div>
            </div>
            {mounted && activeCounts[activeTab] > 0 && (
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.22)", fontVariantNumeric: "tabular-nums", paddingBottom: "3px" }}>
                {activeCounts[activeTab]} remaining
              </p>
            )}
          </div>
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {mounted && activeTab === "goals" && (
            <GoalsTabContent
              goals={data.goals}
              categories={data.goalCategories}
              onAddGoal={handleAddGoal}
              onToggleGoal={handleToggleGoal}
              onDeleteGoal={handleDeleteGoal}
              onAddCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
              onRenameCategory={handleRenameCategory}
              onReorderCategories={handleReorderCategories}
              onReassignGoal={handleReassignGoal}
            />
          )}
          {mounted && activeTab !== "goals" && (
            <TabContent
              key={activeTab}
              sectionKey={activeTab}
              items={data[activeTab] as Item[]}
              onAdd={handleAdd}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          )}
        </div>

        {/* Bottom nav */}
        <TabBar active={activeTab} counts={activeCounts} onChange={setActiveTab} />
      </div>
    </div>
  );
}
