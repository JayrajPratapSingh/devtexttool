"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import gsap from "gsap";

import { getTheme, themeVars, buttonStyle } from "./config/theme.js";
import { loadTabs, saveTabs, makeTab } from "./lib/storage.js";
import { detectMode } from "./lib/detect.js";
import {
  formatByMode,
  minifyByMode,
  validateByMode,
  sortJsonKeys,
  extractSoapBody,
  unescapeString,
  escapeString,
} from "./lib/format.js";
import { convert } from "./lib/convert.js";

import Toast from "./components/Toast.jsx";
import TopBar from "./components/TopBar.jsx";
import Toolbar from "./components/Toolbar.jsx";
import TabStrip from "./components/TabStrip.jsx";
import GlobalSearch from "./components/GlobalSearch.jsx";
import EditorArea from "./components/EditorArea.jsx";
import TreePanel from "./components/TreePanel.jsx";
import UtilitiesPanel from "./components/UtilitiesPanel.jsx";
import StatusBar from "./components/StatusBar.jsx";

export default function App() {
  const [tabs, setTabs] = useState(loadTabs);
  const [activeTab, setActiveTab] = useState(() => tabs[0].id);
  const [editingTab, setEditingTab] = useState(null);
  const [dark, setDark] = useState(true);
  const [message, setMessage] = useState(null);
  const [cursor, setCursor] = useState({ line: 1, col: 1 });

  // compare
  const [compareMode, setCompareMode] = useState(false);
  const [compareRightId, setCompareRightId] = useState("scratch");
  const [scratch, setScratch] = useState("");
  const [ignoreWs, setIgnoreWs] = useState(false);
  const [ignoreOrder, setIgnoreOrder] = useState(false);

  // side panel: null | "tree" | "utils"
  const [sidePanel, setSidePanel] = useState(null);

  // global search
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [regex, setRegex] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);

  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const searchInputRef = useRef(null);
  const pendingReveal = useRef(null);

  const currentTab = tabs.find((t) => t.id === activeTab) || tabs[0];
  const mode = currentTab?.mode || "text";
  const c = getTheme(dark);
  const btn = buttonStyle(c);

  // -- persistence & transient state --------------------------------------
  useEffect(() => saveTabs(tabs), [tabs]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 2500);
    return () => clearTimeout(t);
  }, [message]);

  const notify = useCallback((type, text) => setMessage({ type, text }), []);

  // -- tab operations ------------------------------------------------------
  const updateContent = (value) =>
    setTabs((prev) => prev.map((t) => (t.id === activeTab ? { ...t, content: value ?? "" } : t)));

  const updateTabContent = (id, value) =>
    setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, content: value ?? "" } : t)));

  const setTabMode = (m) =>
    setTabs((prev) => prev.map((t) => (t.id === activeTab ? { ...t, mode: m } : t)));

  const addTab = () => {
    const t = makeTab(tabs.length + 1, mode);
    setTabs([...tabs, t]);
    setActiveTab(t.id);
  };

  const removeTab = (id) =>
    setTabs((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      const safe = updated.length ? updated : [makeTab(1)];
      if (id === activeTab) setActiveTab(safe[0].id);
      return safe;
    });

  const renameTab = (id, name) =>
    setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, name } : t)));

  // -- content transforms --------------------------------------------------
  const applyResult = (res, okMsg) => {
    if (res.error) return notify("error", res.error);
    updateContent(res.value);
    notify("success", okMsg);
  };

  const handleFormat = () => applyResult(formatByMode(currentTab.content, mode), "Formatted");
  const handleMinify = () => applyResult(minifyByMode(currentTab.content, mode), "Minified");

  const handleValidate = () => {
    const v = validateByMode(currentTab.content, mode);
    if (v.empty) return notify("warn", "Nothing to validate");
    return v.ok ? notify("success", `Valid ${mode.toUpperCase()}`) : notify("error", v.error || "Invalid");
  };

  const handleSort = () => {
    try {
      updateContent(sortJsonKeys(currentTab.content));
      notify("success", "Keys sorted");
    } catch (e) {
      notify("error", e.message);
    }
  };

  const handleExtractBody = () => {
    const inner = extractSoapBody(currentTab.content);
    if (!inner) return notify("warn", "No <Body> found");
    updateContent(inner);
    notify("success", "SOAP body extracted");
  };

  const handleConvert = () => {
    const res = convert(currentTab.content, mode);
    if (res.error) return notify("error", res.error);
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTab ? { ...t, content: res.value, mode: res.mode } : t)),
    );
    notify("success", `Converted to ${res.mode.toUpperCase()}`);
  };

  const handleUnescape = () => {
    updateContent(unescapeString(currentTab.content));
    notify("success", "Unescaped");
  };
  const handleEscape = () => {
    updateContent(escapeString(currentTab.content));
    notify("success", "Escaped");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentTab.content);
      notify("success", "Copied");
    } catch {
      notify("error", "Copy failed");
    }
  };

  const copyText = async (text, okMsg) => {
    try {
      await navigator.clipboard.writeText(text);
      notify("success", okMsg);
    } catch {
      notify("error", "Copy failed");
    }
  };

  const handleDownload = () => {
    const ext = mode === "json" ? "json" : mode === "text" ? "txt" : "xml";
    const blob = new Blob([currentTab.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentTab.name.replace(/\s+/g, "_")}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      setTabs((prev) =>
        prev.map((t) =>
          t.id === activeTab ? { ...t, content, name: file.name, mode: detectMode(content) } : t,
        ),
      );
    };
    reader.readAsText(file);
  };

  // -- panels & search -----------------------------------------------------
  const toggleSidePanel = (panel) => setSidePanel((p) => (p === panel ? null : panel));

  const inEditorFind = () => editorRef.current?.getAction("actions.find")?.run();

  const openSearch = () => {
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 0);
  };

  const revealInEditor = useCallback((line, col, len) => {
    const ed = editorRef.current;
    const monaco = monacoRef.current;
    if (!ed || !monaco) return;
    const range = new monaco.Range(line, col, line, col + len);
    ed.revealRangeInCenter(range);
    ed.setSelection(range);
    ed.focus();
  }, []);

  const jumpToResult = (r) => {
    if (compareMode) setCompareMode(false);
    if (r.tabId !== activeTab) {
      pendingReveal.current = { line: r.line, col: r.col, len: r.matchLen };
      setActiveTab(r.tabId);
    } else {
      revealInEditor(r.line, r.col, r.matchLen);
    }
  };

  useEffect(() => {
    if (!pendingReveal.current) return;
    const { line, col, len } = pendingReveal.current;
    pendingReveal.current = null;
    const id = setTimeout(() => revealInEditor(line, col, len), 60);
    return () => clearTimeout(id);
  }, [activeTab, revealInEditor]);

  // -- keyboard shortcuts --------------------------------------------------
  useEffect(() => {
    const onKey = (e) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        openSearch();
      } else if (ctrl && e.key.toLowerCase() === "f") {
        e.preventDefault();
        inEditorFind();
      } else if (ctrl && (e.key.toLowerCase() === "s" || e.key.toLowerCase() === "b")) {
        e.preventDefault();
        handleFormat();
      } else if (ctrl && e.key.toLowerCase() === "d") {
        e.preventDefault();
        setCompareMode((p) => !p);
      } else if (e.altKey && /^[1-9]$/.test(e.key)) {
        const idx = Number(e.key) - 1;
        if (tabs[idx]) {
          e.preventDefault();
          setActiveTab(tabs[idx].id);
        }
      } else if (e.key === "Escape" && searchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tabs, activeTab, mode, searchOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // -- entrance animation --------------------------------------------------
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".chrome-shadow",
        { y: -12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power3.out", stagger: 0.06 },
      );
      gsap.fromTo(
        ".btn",
        { y: -6, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.25, stagger: 0.02, delay: 0.1, clearProps: "all" },
      );
    });
    return () => ctx.revert();
  }, []);

  // -- derived -------------------------------------------------------------
  const validity = useMemo(
    () => validateByMode(currentTab?.content || "", mode),
    [currentTab?.content, mode],
  );

  const stats = useMemo(() => {
    const text = currentTab?.content || "";
    return {
      lines: text ? text.split("\n").length : 0,
      words: text.split(/\s+/).filter(Boolean).length,
      chars: text.length,
    };
  }, [currentTab?.content]);

  const actions = {
    format: handleFormat,
    minify: handleMinify,
    validate: handleValidate,
    sort: handleSort,
    extractBody: handleExtractBody,
    convert: handleConvert,
    unescape: handleUnescape,
    escape: handleEscape,
    find: inEditorFind,
    toggleCompare: () => setCompareMode((p) => !p),
    toggleTree: () => toggleSidePanel("tree"),
    toggleUtils: () => toggleSidePanel("utils"),
    copy: handleCopy,
    download: handleDownload,
    openFile: handleFile,
    addTab,
  };

  return (
    <div
      className="app"
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: c.bg,
        color: c.text,
        fontFamily: "var(--sans)",
        overflow: "hidden",
        ...themeVars(c),
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        handleFile(e.dataTransfer.files[0]);
      }}
    >
      <Toast message={message} />

      <TopBar
        mode={mode}
        setMode={setTabMode}
        dark={dark}
        toggleTheme={() => setDark(!dark)}
        onOpenSearch={openSearch}
        validity={validity}
        c={c}
        btn={btn}
      />

      <Toolbar
        mode={mode}
        compareMode={compareMode}
        sidePanel={sidePanel}
        actions={actions}
        c={c}
        btn={btn}
      />

      <TabStrip
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        editingTab={editingTab}
        setEditingTab={setEditingTab}
        renameTab={renameTab}
        removeTab={removeTab}
        c={c}
      />

      {searchOpen && (
        <GlobalSearch
          tabs={tabs}
          query={query}
          setQuery={setQuery}
          regex={regex}
          setRegex={setRegex}
          caseSensitive={caseSensitive}
          setCaseSensitive={setCaseSensitive}
          inputRef={searchInputRef}
          onJump={jumpToResult}
          onClose={() => setSearchOpen(false)}
          c={c}
        />
      )}

      <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
        <EditorArea
          mode={mode}
          dark={dark}
          compareMode={compareMode}
          currentTab={currentTab}
          tabs={tabs}
          onChangeContent={updateContent}
          onChangeTabContent={updateTabContent}
          compareRightId={compareRightId}
          setCompareRightId={setCompareRightId}
          scratch={scratch}
          setScratch={setScratch}
          ignoreWs={ignoreWs}
          setIgnoreWs={setIgnoreWs}
          ignoreOrder={ignoreOrder}
          setIgnoreOrder={setIgnoreOrder}
          editorRef={editorRef}
          monacoRef={monacoRef}
          onCursor={setCursor}
          c={c}
        />

        {sidePanel && (
          <div
            className="side-panel glass"
            style={{
              width: 380,
              flexShrink: 0,
              borderLeft: `1px solid ${c.border}`,
              background: c.panel,
              minHeight: 0,
            }}
          >
            {sidePanel === "tree" ? (
              <TreePanel
                mode={mode}
                content={currentTab?.content || ""}
                onCopyPath={(path) => copyText(path, `Copied path: ${path}`)}
                c={c}
              />
            ) : (
              <UtilitiesPanel
                currentContent={currentTab?.content || ""}
                onCopyOut={(text) => copyText(text, "Copied output")}
                c={c}
                btn={btn}
              />
            )}
          </div>
        )}
      </div>

      <StatusBar mode={mode} cursor={cursor} stats={stats} compareMode={compareMode} c={c} />
    </div>
  );
}
