import { Code2, Search, Sun, Moon, CheckCircle2, XCircle } from "lucide-react";
import { MODES, isXmlMode } from "../config/constants.js";
import { accentGradient } from "../config/theme.js";

// Brand, per-tab mode pills, live validity badge and the global controls.
export default function TopBar({ mode, setMode, dark, toggleTheme, onOpenSearch, validity, c, btn }) {
  const showValidity = (mode === "json" || isXmlMode(mode)) && !validity.empty;

  return (
    <div
      className="chrome-shadow glass"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "9px 14px",
        background: c.panel,
        borderBottom: `1px solid ${c.border}`,
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontWeight: 800,
          letterSpacing: "-0.3px",
          fontSize: 15,
        }}
      >
        <Code2 size={18} color={c.accent} />
        <span className="brand-text">DevText Tool</span>
      </div>

      {/* mode pills */}
      <div style={{ display: "flex", gap: 4, background: c.panel2, padding: 3, borderRadius: 10 }}>
        {MODES.map((m) => (
          <button
            key={m.id}
            className={`mode-pill${mode === m.id ? " is-active" : ""}`}
            onClick={() => setMode(m.id)}
            style={{
              border: "none",
              cursor: "pointer",
              padding: "5px 13px",
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: mode === m.id ? 600 : 500,
              background: mode === m.id ? accentGradient(c) : "transparent",
              color: mode === m.id ? "#fff" : c.sub,
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      {showValidity && (
        <span
          title={validity.ok ? "" : validity.error}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            fontSize: 12,
            color: validity.ok ? "#22c55e" : "#ef4444",
          }}
        >
          {validity.ok ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
          {validity.ok ? "Valid" : "Invalid"}
        </span>
      )}

      <button className="btn" style={btn} onClick={onOpenSearch} title="Search all tabs (Ctrl+Shift+F)">
        <Search size={15} /> Search all
      </button>
      <button className="btn" style={btn} onClick={toggleTheme} title="Toggle theme">
        {dark ? <Sun size={15} /> : <Moon size={15} />}
      </button>
    </div>
  );
}
