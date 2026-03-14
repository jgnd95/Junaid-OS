"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Target, LayoutList } from "lucide-react";
import type { AppData, Category, Goal, Item, SectionKey } from "../types";
import { SECTION_META } from "../lib/constants";
import { generateId } from "../lib/utils";
import { loadData, saveData } from "../lib/storage";
import { supabase } from "../lib/supabase";
import { GoalsTabContent } from "./goals/GoalsTabContent";
import { PlanningTabContent } from "./planning/PlanningTabContent";
import { TabBar } from "./TabBar";

export default function Home() {
  const router = useRouter();
  const [data, setData] = useState<AppData>({ goals: [], goalCategories: [], planning: [] });
  const [activeTab, setActiveTab] = useState<SectionKey>("goals");
  const [mounted, setMounted] = useState(false);
  const [userName, setUserName] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setData(loadData());
    setMounted(true);
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserName(user.user_metadata?.full_name || user.email || "");
    });
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  useEffect(() => {
    if (mounted) saveData(data);
  }, [data, mounted]);

  // ── Unified add ──
  function handleAdd(
    section: SectionKey | "goalCategories",
    title: string,
    opts?: { categoryId?: string | null; recurring?: boolean; goalId?: string | null },
  ) {
    const now = new Date().toISOString();
    if (section === "goals") {
      const goal: Goal = { id: generateId(), title, createdAt: now, completed: false, categoryId: opts?.categoryId ?? null };
      setData((prev) => ({ ...prev, goals: [goal, ...prev.goals] }));
    } else if (section === "goalCategories") {
      const cat: Category = { id: generateId(), name: title, createdAt: now };
      setData((prev) => ({ ...prev, goalCategories: [...prev.goalCategories, cat] }));
    } else {
      const item: Item = { id: generateId(), title, createdAt: now, completed: false, recurring: opts?.recurring ?? false, goalId: opts?.goalId ?? null };
      setData((prev) => ({ ...prev, planning: [item, ...prev.planning] }));
    }
  }

  // ── Goals ──
  function handleToggleGoal(id: string) {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.map((g) =>
        g.id === id
          ? { ...g, completed: !g.completed, completedAt: g.completed ? undefined : new Date().toISOString() }
          : g,
      ),
    }));
  }

  function handleDeleteGoal(id: string) {
    setData((prev) => ({ ...prev, goals: prev.goals.filter((g) => g.id !== id) }));
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

  function handleToggleTask(id: string) {
    setData((prev) => {
      const task = prev.planning.find((item) => item.id === id);
      if (!task) return prev;
      const toggled = { ...task, completed: !task.completed };
      const updated = prev.planning.map((item) => (item.id === id ? toggled : item));
      // If completing a recurring task, create a new copy
      if (!task.completed && task.recurring) {
        const copy: Item = {
          id: generateId(),
          title: task.title,
          createdAt: new Date().toISOString(),
          completed: false,
          recurring: task.recurring,
          goalId: task.goalId,
          active: task.active,
        };
        return { ...prev, planning: [copy, ...updated] };
      }
      return { ...prev, planning: updated };
    });
  }

  function handleDeleteTask(id: string) {
    setData((prev) => ({ ...prev, planning: prev.planning.filter((item) => item.id !== id) }));
  }

  function handleToggleActive(id: string) {
    setData((prev) => ({
      ...prev,
      planning: prev.planning.map((item) => (item.id === id ? { ...item, active: !item.active } : item)),
    }));
  }

  function handleToggleRecurring(id: string) {
    setData((prev) => ({
      ...prev,
      planning: prev.planning.map((item) => (item.id === id ? { ...item, recurring: !item.recurring } : item)),
    }));
  }

  const activeCounts: Record<SectionKey, number> = {
    goals: data.goals.filter((i) => !i.completed).length,
    planning: data.planning.filter((i) => !i.completed).length,
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
                  {activeTab === "planning" && <LayoutList size={22} color="rgba(255,255,255,0.92)" />}
                </div>
                <h1 style={{ fontSize: "28px", fontWeight: 700, color: "rgba(255,255,255,0.92)", letterSpacing: "-0.6px", lineHeight: 1 }}>
                  {headerLabel}
                </h1>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 14 }}>
              {mounted && (
                <div ref={menuRef} style={{ position: "relative" }}>
                  <button
                    onClick={() => setMenuOpen((v) => !v)}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "rgba(255,255,255,0.75)",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textTransform: "uppercase",
                    }}
                  >
                    {userName.charAt(0) || "?"}
                  </button>
                  {menuOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: 42,
                        right: 0,
                        background: "#1a1a1a",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 10,
                        padding: 4,
                        minWidth: 140,
                        zIndex: 50,
                      }}
                    >
                      <button
                        onClick={handleSignOut}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          fontSize: 14,
                          color: "rgba(255,255,255,0.75)",
                          background: "transparent",
                          border: "none",
                          borderRadius: 8,
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {mounted && activeTab === "goals" && (
            <GoalsTabContent
              goals={data.goals}
              tasks={data.planning}
              categories={data.goalCategories}
              onAddGoal={(title, catId) => handleAdd("goals", title, { categoryId: catId })}
              onToggleGoal={handleToggleGoal}
              onDeleteGoal={handleDeleteGoal}
              onAddCategory={(name) => handleAdd("goalCategories", name)}
              onDeleteCategory={handleDeleteCategory}
              onRenameCategory={handleRenameCategory}
              onReorderCategories={handleReorderCategories}
              onReassignGoal={handleReassignGoal}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onAddTask={(goalId, title) => handleAdd("planning", title, { goalId })}
              onToggleActiveTask={handleToggleActive}
              onToggleRecurringTask={handleToggleRecurring}
            />
          )}
          {mounted && activeTab === "planning" && (
            <PlanningTabContent />
          )}
        </div>

        {/* Bottom nav */}
        <TabBar active={activeTab} counts={activeCounts} onChange={setActiveTab} />
      </div>
    </div>
  );
}
