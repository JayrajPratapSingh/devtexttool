// Central color tokens for light/dark themes and shared style builders.
// Components receive the resolved token object `c` as a prop, and the same
// values are mirrored into CSS custom properties on the root element (see
// App.jsx) so App.css hover/focus states track the active theme.

export function getTheme(dark) {
  return dark
    ? {
        // layered radial glows over a deep base for a modern, lit backdrop
        bg: `radial-gradient(1100px 560px at 100% -12%, rgba(129,140,248,0.14), transparent 60%),
             radial-gradient(900px 520px at -10% 112%, rgba(167,139,250,0.12), transparent 55%),
             #0a0e17`,
        editorBg: "#0b0f1b", // Monaco surface, blends with the app
        panel: "rgba(15, 20, 35, 0.72)", // frosted glass (see .glass)
        panel2: "rgba(31, 39, 61, 0.72)",
        border: "rgba(255,255,255,0.08)",
        text: "#e6e9f2",
        sub: "#8b93a7",
        accent: "#818cf8",
        accent2: "#a78bfa",
      }
    : {
        bg: `radial-gradient(1100px 560px at 100% -12%, rgba(99,102,241,0.10), transparent 60%),
             radial-gradient(900px 520px at -10% 112%, rgba(59,130,246,0.08), transparent 55%),
             #f4f6fb`,
        editorBg: "#ffffff",
        panel: "rgba(255, 255, 255, 0.72)",
        panel2: "rgba(255, 255, 255, 0.9)",
        border: "rgba(15,23,42,0.10)",
        text: "#0f172a",
        sub: "#5b6472",
        accent: "#6366f1",
        accent2: "#8b5cf6",
      };
}

// Mirror theme tokens as CSS variables for the stylesheet layer.
export function themeVars(c) {
  return {
    "--accent": c.accent,
    "--accent2": c.accent2,
    "--panel": c.panel,
    "--panel2": c.panel2,
    "--border": c.border,
    "--text": c.text,
    "--sub": c.sub,
  };
}

// Gradient used for the brand and active controls.
export const accentGradient = (c) => `linear-gradient(135deg, ${c.accent}, ${c.accent2})`;

export function buttonStyle(c) {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 11px",
    borderRadius: 9,
    border: `1px solid ${c.border}`,
    background: c.panel2,
    color: c.text,
    cursor: "pointer",
    fontSize: 12.5,
    whiteSpace: "nowrap",
  };
}
