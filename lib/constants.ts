import type { SectionKey } from "../types";

export const STORAGE_KEY = "realize-data";
export const TABS: SectionKey[] = ["goals", "tasks"];

export const SECTION_META: Record<SectionKey, { label: string; placeholder: string; emptyText: string }> = {
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

export const UNCAT_KEY = "__uncat__";
