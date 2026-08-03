import {
  Wand2,
  Minimize2,
  CheckCircle2,
  ArrowDownAZ,
  Braces,
  Repeat,
  Search,
  GitCompare,
  ListTree,
  Wrench,
  Copy,
  Download,
  Upload,
  Plus,
} from "lucide-react";
import { isXmlMode } from "../config/constants.js";
import { accentGradient } from "../config/theme.js";

// Mode-aware action bar. All behaviour is passed in through `actions` so this
// component stays purely presentational.
export default function Toolbar({ mode, compareMode, sidePanel, actions, c, btn }) {
  const xml = isXmlMode(mode);
  const activeBtn = {
    ...btn,
    background: accentGradient(c),
    color: "#fff",
    border: "1px solid transparent",
  };
  const cls = (active) => (active ? "btn ctrl-active" : "btn");
  const divider = (
    <span style={{ width: 1, height: 20, background: c.border, margin: "0 4px" }} />
  );

  return (
    <div
      className="chrome-shadow glass"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 12px",
        background: c.panel,
        borderBottom: `1px solid ${c.border}`,
        flexWrap: "wrap",
      }}
    >
      <button className="btn" style={btn} onClick={actions.format} title="Format (Ctrl+S)">
        <Wand2 size={15} /> Format
      </button>
      <button className="btn" style={btn} onClick={actions.minify}>
        <Minimize2 size={15} /> Minify
      </button>
      <button className="btn" style={btn} onClick={actions.validate}>
        <CheckCircle2 size={15} /> Validate
      </button>

      {mode === "json" && (
        <button className="btn" style={btn} onClick={actions.sort}>
          <ArrowDownAZ size={15} /> Sort keys
        </button>
      )}
      {mode === "soap" && (
        <button className="btn" style={btn} onClick={actions.extractBody}>
          <Braces size={15} /> Extract Body
        </button>
      )}
      {(mode === "json" || xml) && (
        <button className="btn" style={btn} onClick={actions.convert}>
          <Repeat size={15} /> {mode === "json" ? "To XML" : "To JSON"}
        </button>
      )}
      {(xml || mode === "json") && (
        <>
          <button className="btn" style={btn} onClick={actions.unescape}>
            Unescape
          </button>
          <button className="btn" style={btn} onClick={actions.escape}>
            Escape
          </button>
        </>
      )}

      {divider}

      <button className="btn" style={btn} onClick={actions.find} title="Find in file (Ctrl+F)">
        <Search size={15} /> Find
      </button>
      <button
        className={cls(compareMode)}
        style={compareMode ? activeBtn : btn}
        onClick={actions.toggleCompare}
        title="Compare (Ctrl+D)"
      >
        <GitCompare size={15} /> Compare
      </button>
      <button
        className={cls(sidePanel === "tree")}
        style={sidePanel === "tree" ? activeBtn : btn}
        onClick={actions.toggleTree}
      >
        <ListTree size={15} /> Tree
      </button>
      <button
        className={cls(sidePanel === "utils")}
        style={sidePanel === "utils" ? activeBtn : btn}
        onClick={actions.toggleUtils}
      >
        <Wrench size={15} /> Utils
      </button>

      <span style={{ flex: 1 }} />

      <button className="btn" style={btn} onClick={actions.copy}>
        <Copy size={15} /> Copy
      </button>
      <button className="btn" style={btn} onClick={actions.download}>
        <Download size={15} /> Download
      </button>
      <label className="btn" style={btn}>
        <Upload size={15} /> Open
        <input type="file" hidden onChange={(e) => actions.openFile(e.target.files[0])} />
      </label>
      <button className="btn" style={btn} onClick={actions.addTab}>
        <Plus size={15} /> Tab
      </button>
    </div>
  );
}
