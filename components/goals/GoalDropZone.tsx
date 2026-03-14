"use client";

import { useDroppable } from "@dnd-kit/core";

export function GoalDropZone({ id, children }: { id: string; children: (isOver: boolean) => React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return <div ref={setNodeRef}>{children(isOver)}</div>;
}
