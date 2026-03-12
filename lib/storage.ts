import type { AppData, Goal, Item } from "../types";
import { STORAGE_KEY } from "./constants";

export function loadData(): AppData {
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

export function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
