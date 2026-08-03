// Tab persistence in localStorage, with migration for tabs saved before the
// per-tab `mode` field existed.

import { v4 as uuid } from "uuid";
import { STORAGE_KEY } from "../config/constants.js";
import { detectMode } from "./detect.js";

export const makeTab = (n, mode = "text") => ({
  id: uuid(),
  name: `Tab ${n}`,
  content: "",
  mode,
});

export function loadTabs() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (Array.isArray(parsed) && parsed.length) {
      return parsed.map((t) => ({ ...t, mode: t.mode || detectMode(t.content) }));
    }
  } catch {
    /* ignore corrupt history */
  }
  return [makeTab(1)];
}

export function saveTabs(tabs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
}
