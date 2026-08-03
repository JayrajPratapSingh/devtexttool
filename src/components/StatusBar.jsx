import { HOTKEYS_HELP } from "../config/constants.js";

// Bottom info strip: mode, cursor position, counts and shortcut hints.
export default function StatusBar({ mode, cursor, stats, compareMode, c }) {
  return (
    <div
      className="glass"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "5px 12px",
        background: c.panel,
        borderTop: `1px solid ${c.border}`,
        fontSize: 12,
        color: c.sub,
        flexWrap: "wrap",
      }}
    >
      <span style={{ textTransform: "uppercase", color: c.accent, fontWeight: 600 }}>
        {mode}
      </span>
      <span>
        Ln {cursor.line}, Col {cursor.col}
      </span>
      <span>Lines: {stats.lines}</span>
      <span>Words: {stats.words}</span>
      <span>Chars: {stats.chars}</span>
      {compareMode && <span style={{ color: c.accent }}>Compare mode</span>}
      <span style={{ flex: 1 }} />
      <span>{HOTKEYS_HELP}</span>
    </div>
  );
}
