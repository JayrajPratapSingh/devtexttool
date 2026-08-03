import { useState } from "react";
import { ChevronRight, ChevronDown, Copy } from "lucide-react";
import { isXmlMode } from "../config/constants.js";
import { jsonChildPath, xmlChildPath } from "../lib/paths.js";

const rowStyle = {
  display: "flex",
  alignItems: "center",
  gap: 4,
  fontFamily: "var(--mono)",
  fontSize: 12.5,
  lineHeight: "20px",
  whiteSpace: "nowrap",
};

function CopyBtn({ path, onCopyPath, c }) {
  return (
    <Copy
      size={12}
      className="tree-copy"
      title={`Copy path: ${path}`}
      onClick={(e) => {
        e.stopPropagation();
        onCopyPath(path);
      }}
      style={{ color: c.sub, cursor: "pointer", opacity: 0.55 }}
    />
  );
}

// -- JSON tree -------------------------------------------------------------

function JsonNode({ nodeKey, value, path, depth, onCopyPath, c }) {
  const [open, setOpen] = useState(depth < 2);
  const isArr = Array.isArray(value);
  const isObj = value !== null && typeof value === "object";
  const pad = { paddingLeft: depth * 14 };
  const keyLabel =
    nodeKey === null ? "$" : <span style={{ color: c.accent }}>{nodeKey}</span>;

  if (!isObj) {
    let color = c.text;
    if (typeof value === "string") color = "#22c55e";
    else if (typeof value === "number") color = "#f59e0b";
    else if (typeof value === "boolean" || value === null) color = "#818cf8";
    const display = typeof value === "string" ? `"${value}"` : String(value);
    return (
      <div className="tree-row" style={{ ...rowStyle, ...pad }}>
        <span style={{ width: 14 }} />
        {keyLabel}
        <span style={{ color: c.sub }}>:</span>
        <span style={{ color, overflow: "hidden", textOverflow: "ellipsis" }}>{display}</span>
        <CopyBtn path={path} onCopyPath={onCopyPath} c={c} />
      </div>
    );
  }

  const entries = isArr
    ? value.map((v, i) => [i, v])
    : Object.entries(value);
  const summary = isArr ? `[] ${value.length}` : `{} ${entries.length}`;

  return (
    <div>
      <div className="tree-row" style={{ ...rowStyle, ...pad, cursor: "pointer" }} onClick={() => setOpen(!open)}>
        {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        {keyLabel}
        <span style={{ color: c.sub }}>{summary}</span>
        <CopyBtn path={path} onCopyPath={onCopyPath} c={c} />
      </div>
      {open &&
        entries.map(([k, v]) => (
          <JsonNode
            key={k}
            nodeKey={k}
            value={v}
            path={jsonChildPath(path, k)}
            depth={depth + 1}
            onCopyPath={onCopyPath}
            c={c}
          />
        ))}
    </div>
  );
}

// -- XML tree --------------------------------------------------------------

function XmlNode({ el, path, depth, onCopyPath, c }) {
  const [open, setOpen] = useState(depth < 3);
  const pad = { paddingLeft: depth * 14 };
  const childEls = Array.from(el.children);
  const attrs = Array.from(el.attributes || []);
  const text = childEls.length === 0 ? el.textContent.trim() : "";

  return (
    <div>
      <div
        className="tree-row"
        style={{ ...rowStyle, ...pad, cursor: childEls.length ? "pointer" : "default" }}
        onClick={() => childEls.length && setOpen(!open)}
      >
        {childEls.length ? (
          open ? <ChevronDown size={13} /> : <ChevronRight size={13} />
        ) : (
          <span style={{ width: 13 }} />
        )}
        <span style={{ color: c.accent }}>{el.nodeName}</span>
        {attrs.map((a) => (
          <span key={a.name} style={{ color: c.sub }}>
            {" "}
            {a.name}=<span style={{ color: "#22c55e" }}>"{a.value}"</span>
          </span>
        ))}
        {text && <span style={{ color: c.text }}> {text.slice(0, 60)}</span>}
        <CopyBtn path={path} onCopyPath={onCopyPath} c={c} />
      </div>
      {open &&
        childEls.map((child, i) => (
          <XmlNode
            key={i}
            el={child}
            path={xmlChildPath(path, child)}
            depth={depth + 1}
            onCopyPath={onCopyPath}
            c={c}
          />
        ))}
    </div>
  );
}

// -- panel -----------------------------------------------------------------

export default function TreePanel({ mode, content, onCopyPath, c }) {
  let body;
  const empty = !content.trim();

  if (empty) {
    body = <Hint c={c}>Nothing to show yet.</Hint>;
  } else if (mode === "json") {
    let parsed;
    let valid = true;
    try {
      parsed = JSON.parse(content);
    } catch {
      valid = false;
    }
    body = valid ? (
      <JsonNode nodeKey={null} value={parsed} path="$" depth={0} onCopyPath={onCopyPath} c={c} />
    ) : (
      <Hint c={c}>Invalid JSON — fix it to see the tree.</Hint>
    );
  } else if (isXmlMode(mode)) {
    const doc = new DOMParser().parseFromString(content, "application/xml");
    if (doc.querySelector("parsererror")) {
      body = <Hint c={c}>Invalid XML — fix it to see the tree.</Hint>;
    } else {
      const root = doc.documentElement;
      body = <XmlNode el={root} path={`/${root.nodeName}`} depth={0} onCopyPath={onCopyPath} c={c} />;
    }
  } else {
    body = <Hint c={c}>Tree view is available in JSON, XML and SOAP modes.</Hint>;
  }

  return (
    <div style={{ padding: "10px 8px", overflow: "auto", height: "100%" }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color: c.sub, padding: "0 6px 8px" }}>
        Structure · click <Copy size={11} style={{ verticalAlign: "middle" }} /> to copy path
      </div>
      {body}
    </div>
  );
}

function Hint({ children, c }) {
  return <div style={{ color: c.sub, fontSize: 13, padding: "6px" }}>{children}</div>;
}
