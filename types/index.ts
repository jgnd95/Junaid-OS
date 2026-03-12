export type Item = {
  id: string;
  title: string;
  createdAt: string;
  completed: boolean;
  recurring: boolean;
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
  categoryId: string | null;
};

export type SectionKey = "goals" | "tasks";

export type AppData = {
  goals: Goal[];
  goalCategories: Category[];
  tasks: Item[];
};
