import Editor, { DiffEditor } from "@monaco-editor/react";
import { modeLang } from "../config/constants.js";
import { formatJson, sortJsonKeys, formatXml, minifyXml } from "../lib/format.js";
import { defineMonacoThemes, monacoThemeName } from "../lib/monacoThemes.js";

// Normalize a side of the diff so cosmetic differences can be ignored.
function normalize(content, mode, { ignoreWs, ignoreOrder }) {
  if (!ignoreWs && !ignoreOrder) return content;
  try {
    if (mode === "json") {
      return ignoreOrder ? sortJsonKeys(content) : formatJson(content);
    }
    if (mode === "xml" || mode === "soap") {
      return formatXml(minifyXml(content)); // re-indent uniformly
    }
  } catch {
    /* fall through to raw handling */
  }
  return ignoreWs ? content.replace(/[ \t]+/g, " ").trim() : content;
}

// Single editor, or a side-by-side diff when compareMode is on. In compare mode
// the right-hand source can be another tab or a scratch buffer, and the two
// "ignore" toggles switch to a normalized, read-only comparison.
export default function EditorArea({
  mode,
  dark,
  compareMode,
  currentTab,
  tabs,
  onChangeContent,
  onChangeTabContent,
  compareRightId,
  setCompareRightId,
  scratch,
  setScratch,
  ignoreWs,
  setIgnoreWs,
  ignoreOrder,
  setIgnoreOrder,
  editorRef,
  monacoRef,
  onCursor,
  c,
}) {
  const theme = monacoThemeName(dark);
  const normalized = ignoreWs || ignoreOrder;
  // Solid editor-surface background so the region is never transparent/white,
  // including the brief moment before Monaco paints.
  const editorLoading = <div style={{ height: "100%", background: c.editorBg }} />;

  if (!compareMode) {
    return (
      <div style={{ flex: 1, minHeight: 0, background: c.editorBg }}>
        <Editor
          height="100%"
          language={modeLang(mode)}
          theme={theme}
          beforeMount={defineMonacoThemes}
          loading={editorLoading}
          value={currentTab?.content}
          onChange={(v) => onChangeContent(v ?? "")}
          onMount={(editor, monaco) => {
            editorRef.current = editor;
            monacoRef.current = monaco;
            editor.onDidChangeCursorPosition((e) =>
              onCursor({ line: e.position.lineNumber, col: e.position.column }),
            );
          }}
          options={{
            wordWrap: "on",
            minimap: { enabled: false },
            folding: true,
            lineNumbers: "on",
            fontSize: 13,
            fontFamily: "var(--font-mono), ui-monospace, monospace",
            fontLigatures: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>
    );
  }

  // Resolve the right-hand comparison source.
  const rightIsScratch = compareRightId === "scratch";
  const rightTab = rightIsScratch ? null : tabs.find((t) => t.id === compareRightId);
  const rightRaw = rightIsScratch ? scratch : (rightTab?.content ?? "");
  const setRight = rightIsScratch
    ? setScratch
    : (v) => onChangeTabContent(compareRightId, v);

  const leftValue = normalize(currentTab?.content || "", mode, { ignoreWs, ignoreOrder });
  const rightValue = normalize(rightRaw, mode, { ignoreWs, ignoreOrder });

  const select = {
    padding: "5px 8px",
    borderRadius: 7,
    border: `1px solid ${c.border}`,
    background: c.panel2,
    color: c.text,
    fontSize: 12.5,
  };
  const toggle = (checked, setter, label) => (
    <label style={{ fontSize: 12, color: c.sub, display: "flex", gap: 5, alignItems: "center", cursor: "pointer" }}>
      <input type="checkbox" checked={checked} onChange={(e) => setter(e.target.checked)} />
      {label}
    </label>
  );

  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "6px 12px",
          background: c.panel,
          borderBottom: `1px solid ${c.border}`,
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: 12, color: c.sub }}>
          Left: <b style={{ color: c.text }}>{currentTab?.name}</b> vs Right:
        </span>
        <select
          value={compareRightId}
          onChange={(e) => setCompareRightId(e.target.value)}
          style={select}
        >
          <option value="scratch">Scratch buffer</option>
          {tabs
            .filter((t) => t.id !== currentTab?.id)
            .map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
        </select>
        {toggle(ignoreWs, setIgnoreWs, "Ignore whitespace")}
        {mode === "json" && toggle(ignoreOrder, setIgnoreOrder, "Ignore key order")}
        {normalized && (
          <span style={{ fontSize: 11, color: c.accent }}>normalized (read-only)</span>
        )}
      </div>

      <div style={{ flex: 1, minHeight: 0, background: c.editorBg }}>
        <DiffEditor
          key={`${compareRightId}-${normalized}`}
          height="100%"
          language={modeLang(mode)}
          theme={theme}
          beforeMount={defineMonacoThemes}
          loading={editorLoading}
          original={leftValue}
          modified={rightValue}
          options={{
            wordWrap: "on",
            automaticLayout: true,
            fontSize: 13,
            fontFamily: "var(--font-mono), ui-monospace, monospace",
            fontLigatures: true,
            readOnly: normalized,
          }}
          onMount={(editor) => {
            const original = editor.getOriginalEditor();
            const modified = editor.getModifiedEditor();
            original.updateOptions({ readOnly: normalized });
            modified.updateOptions({ readOnly: normalized });
            if (!normalized) {
              original.onDidChangeModelContent(() => onChangeContent(original.getValue()));
              modified.onDidChangeModelContent(() => setRight(modified.getValue()));
            }
          }}
        />
      </div>
    </div>
  );
}
