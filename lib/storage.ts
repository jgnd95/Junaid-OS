import type { AppData, Goal, Item } from "../types";
import { STORAGE_KEY } from "./constants";

export function loadData(): AppData {
  if (typeof window === "undefined")
    return { goals: [], goalCategories: [], planning: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        goals: (parsed.goals ?? []).map((g: Goal) => ({
          ...g,
          categoryId: g.categoryId !== undefined ? g.categoryId : null,
        })),
        goalCategories: parsed.goalCategories ?? [],
        // Migrate from old "tasks" key if present
        planning: (parsed.planning ?? parsed.tasks ?? []).map((t: Item) => ({
          ...t,
          recurring: t.recurring !== undefined ? t.recurring : false,
        })),
      };
    }
  } catch {}
  return { goals: [], goalCategories: [], planning: [] };
}

export function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
