// Cross-tab search: scan every tab and return flat match records that the
// GlobalSearch panel groups and links to.

export function searchAllTabs(tabs, query, { regex = false, caseSensitive = false } = {}) {
  if (!query) return [];

  let matcher;
  try {
    const source = regex ? query : query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    matcher = new RegExp(source, caseSensitive ? "g" : "gi");
  } catch {
    return []; // invalid regex -> no results
  }

  const results = [];
  const MAX = 500;
  for (const tab of tabs) {
    const lines = (tab.content || "").split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      matcher.lastIndex = 0;
      let m;
      while ((m = matcher.exec(line)) !== null) {
        results.push({
          tabId: tab.id,
          tabName: tab.name,
          mode: tab.mode,
          line: i + 1,
          col: m.index + 1,
          preview: line.trim().slice(0, 160),
          matchLen: m[0].length || 1,
        });
        if (m.index === matcher.lastIndex) matcher.lastIndex++; // avoid zero-width loop
        if (results.length >= MAX) return results;
      }
    }
  }
  return results;
}

// Group flat results by tab for rendering.
export function groupByTab(results) {
  const grouped = [];
  const idx = new Map();
  for (const r of results) {
    if (!idx.has(r.tabId)) {
      idx.set(r.tabId, grouped.length);
      grouped.push({ tabId: r.tabId, tabName: r.tabName, items: [] });
    }
    grouped[idx.get(r.tabId)].items.push(r);
  }
  return grouped;
}
