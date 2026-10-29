import type { Group } from "./types";

const KEY = "goodsplit_group_data";

export function loadGroup(): Group | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        typeof parsed === "object" &&
        typeof parsed.name === "string" &&
        Array.isArray(parsed.members) &&
        parsed.members.length > 0 &&
        Array.isArray(parsed.expenses)
      ) {
        return parsed as Group;
      }
    }
  } catch (err) {
    console.error("Failed to load from localStorage:", err);
  }
  return null;
}

export function saveGroup(group: Group): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(group));
  } catch (err) {
    console.error("Failed to save to localStorage:", err);
  }
}

export function clearGroup(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
  } catch (err) {
    console.error("Failed to clear localStorage:", err);
  }
}
