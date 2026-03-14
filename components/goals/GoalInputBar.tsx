"use client";

import type { Category } from "../../types";

export function GoalInputBar({
  titleInput,
  setTitleInput,
  titleRef,
  selectedCategoryId,
  setSelectedCategoryId,
  categories,
  onAdd,
  onOpenCategories,
}: {
  titleInput: string;
  setTitleInput: (v: string) => void;
  titleRef: React.RefObject<HTMLInputElement | null>;
  selectedCategoryId: string;
  setSelectedCategoryId: (v: string) => void;
  categories: Category[];
  onAdd: () => void;
  onOpenCategories: () => void;
}) {
  return (
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
          onKeyDown={(e) => e.key === "Enter" && onAdd()}
          placeholder="Add or search a goal…"
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
          onClick={onAdd}
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
          onClick={onOpenCategories}
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
  );
}
