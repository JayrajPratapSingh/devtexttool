import { useMemo } from "react";
import { Search, X } from "lucide-react";
import { searchAllTabs, groupByTab } from "../lib/search.js";

// Cross-tab finder. Results are grouped by tab; clicking one calls onJump so the
// parent can switch tabs and reveal the match in the editor.
export default function GlobalSearch({
  tabs,
  query,
  setQuery,
  regex,
  setRegex,
  caseSensitive,
  setCaseSensitive,
  inputRef,
  onJump,
  onClose,
  c,
}) {
  const results = useMemo(
    () => searchAllTabs(tabs, query, { regex, caseSensitive }),
    [tabs, query, regex, caseSensitive],
  );
  const groups = useMemo(() => groupByTab(results), [results]);

  const toggle = (checked, setter, label) => (
    <label
      style={{ fontSize: 12, color: c.sub, display: "flex", gap: 4, alignItems: "center", cursor: "pointer" }}
    >
      <input type="checkbox" checked={checked} onChange={(e) => setter(e.target.checked)} />
      {label}
    </label>
  );

  return (
    <div
      className="search-panel glass"
      style={{
        background: c.panel,
        borderBottom: `1px solid ${c.border}`,
        padding: "10px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        maxHeight: "40vh",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Search size={16} color={c.sub} />
        <input
          ref={inputRef}
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search across all tabs…"
          style={{
            flex: 1,
            padding: "7px 10px",
            borderRadius: 8,
            border: `1px solid ${c.border}`,
            background: c.panel2,
            color: c.text,
            outline: "none",
            fontSize: 13,
          }}
        />
        {toggle(caseSensitive, setCaseSensitive, "Aa")}
        {toggle(regex, setRegex, ".*")}
        <span style={{ fontSize: 12, color: c.sub, minWidth: 70, textAlign: "right" }}>
          {query ? `${results.length} hit${results.length === 1 ? "" : "s"}` : ""}
        </span>
        <X size={16} style={{ cursor: "pointer", color: c.sub }} onClick={onClose} />
      </div>

      <div style={{ overflowY: "auto" }}>
        {query && results.length === 0 && (
          <div style={{ color: c.sub, fontSize: 13, padding: "6px 2px" }}>No matches</div>
        )}
        {groups.map((group) => (
          <div key={group.tabId} style={{ marginBottom: 6 }}>
            <div
              style={{
                fontSize: 11,
                color: c.sub,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                margin: "4px 0",
              }}
            >
              {group.tabName} · {group.items.length}
            </div>
            {group.items.slice(0, 50).map((r, i) => (
              <div
                key={i}
                className="search-result"
                onClick={() => onJump(r)}
                style={{
                  display: "flex",
                  gap: 10,
                  padding: "4px 8px",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 12.5,
                  fontFamily: "var(--mono)",
                }}
              >
                <span style={{ color: c.accent, minWidth: 46 }}>
                  {r.line}:{r.col}
                </span>
                <span style={{ color: c.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {r.preview}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
