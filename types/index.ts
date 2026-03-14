export type Item = {
  id: string;
  title: string;
  createdAt: string;
  completed: boolean;
  recurring: boolean;
  goalId?: string | null;
  active?: boolean;
};

export type Category = {
  id: string;
  name: string;
  createdAt: string;
};

export type Goal = {
  id: string;
  title: string;
  createdAt: string;
  completed: boolean;
  completedAt?: string;
  categoryId: string | null;
};

export type SectionKey = "goals" | "tasks";

export type AppData = {
  goals: Goal[];
  goalCategories: Category[];
  tasks: Item[];
};
