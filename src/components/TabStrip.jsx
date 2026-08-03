import { X } from "lucide-react";

// Horizontal tab bar. Double-click a tab to rename it.
export default function TabStrip({
  tabs,
  activeTab,
  setActiveTab,
  editingTab,
  setEditingTab,
  renameTab,
  removeTab,
  c,
}) {
  return (
    <div
      className="glass"
      style={{
        display: "flex",
        gap: 4,
        padding: "6px 12px",
        background: c.panel,
        borderBottom: `1px solid ${c.border}`,
        overflowX: "auto",
      }}
    >
      {tabs.map((tab) => {
        const active = tab.id === activeTab;
        return (
          <div
            key={tab.id}
            className="tab-item"
            onClick={() => setActiveTab(tab.id)}
            onDoubleClick={() => setEditingTab(tab.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 10px",
              borderRadius: 7,
              fontSize: 12.5,
              cursor: "pointer",
              whiteSpace: "nowrap",
              background: active ? c.panel2 : "transparent",
              border: `1px solid ${active ? c.border : "transparent"}`,
              color: active ? c.text : c.sub,
            }}
          >
            <span style={{ fontSize: 9, textTransform: "uppercase", color: c.accent, fontWeight: 700 }}>
              {tab.mode}
            </span>
            {editingTab === tab.id ? (
              <input
                autoFocus
                value={tab.name}
                onChange={(e) => renameTab(tab.id, e.target.value)}
                onBlur={() => setEditingTab(null)}
                onKeyDown={(e) => e.key === "Enter" && setEditingTab(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "inherit",
                  width: Math.max(tab.name.length, 4) + "ch",
                }}
              />
            ) : (
              <span>{tab.name}</span>
            )}
            <X
              size={13}
              className="tab-close"
              onClick={(e) => {
                e.stopPropagation();
                removeTab(tab.id);
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
