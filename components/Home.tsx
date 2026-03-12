"use client";

import { useState, useEffect } from "react";
import { Target, CheckSquare } from "lucide-react";
import type { AppData, Category, Goal, Item, SectionKey } from "../types";
import { SECTION_META } from "../lib/constants";
import { generateId } from "../lib/utils";
import { loadData, saveData } from "../lib/storage";
import { GoalsTabContent } from "./goals/GoalsTabContent";
import { TasksTabContent } from "./tasks/TasksTabContent";
import { TabBar } from "./TabBar";

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
                  {activeTab === "goals" && <Target size={22} color="rgba(255,255,255,0.92)" />}
                  {activeTab === "tasks" && <CheckSquare size={22} color="rgba(255,255,255,0.92)" />}
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
            <TasksTabContent
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
