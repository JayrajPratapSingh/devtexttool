import { useState } from "react";
import { Play, Copy, ArrowDownToLine } from "lucide-react";
import { UTILITIES } from "../lib/utilities.js";

// Self-contained scratch area for the developer utilities (JWT, Base64, URL,
// timestamp, hashes). It never touches the editor unless you press "From tab".
export default function UtilitiesPanel({ currentContent, onCopyOut, c, btn }) {
  const [toolId, setToolId] = useState(UTILITIES[0].id);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const tool = UTILITIES.find((u) => u.id === toolId);

  const run = async () => {
    setError("");
    try {
      const result = await tool.run(input);
      setOutput(result);
    } catch (e) {
      setOutput("");
      setError(e.message || "Failed");
    }
  };

  const field = {
    width: "100%",
    boxSizing: "border-box",
    padding: 8,
    borderRadius: 8,
    border: `1px solid ${c.border}`,
    background: c.panel2,
    color: c.text,
    fontFamily: "var(--mono)",
    fontSize: 12.5,
    resize: "vertical",
  };

  return (
    <div style={{ padding: 10, overflow: "auto", height: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color: c.sub }}>
        Utilities
      </div>

      <select
        value={toolId}
        onChange={(e) => {
          setToolId(e.target.value);
          setOutput("");
          setError("");
        }}
        style={{ ...field, fontFamily: "var(--sans)" }}
      >
        {UTILITIES.map((u) => (
          <option key={u.id} value={u.id}>
            {u.label}
          </option>
        ))}
      </select>

      <div style={{ display: "flex", gap: 6 }}>
        <button className="btn" style={btn} onClick={run}>
          <Play size={14} /> Run
        </button>
        <button
          className="btn"
          style={btn}
          title="Load current tab content"
          onClick={() => setInput(currentContent || "")}
        >
          <ArrowDownToLine size={14} /> From tab
        </button>
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Input…"
        rows={6}
        style={field}
      />

      {error && <div style={{ color: "#ef4444", fontSize: 12.5 }}>{error}</div>}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color: c.sub }}>
          Output
        </span>
        {output && (
          <button
            className="btn"
            style={{ ...btn, padding: "3px 8px" }}
            onClick={() => onCopyOut(output)}
          >
            <Copy size={13} /> Copy
          </button>
        )}
      </div>
      <textarea readOnly value={output} placeholder="Result appears here…" rows={8} style={field} />
    </div>
  );
}
