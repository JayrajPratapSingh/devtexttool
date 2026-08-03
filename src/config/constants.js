// App-wide constants: the editing modes and shared keys.

export const MODES = [
  { id: "text", label: "Text", lang: "plaintext" },
  { id: "json", label: "JSON", lang: "json" },
  { id: "xml", label: "XML", lang: "xml" },
  { id: "soap", label: "SOAP", lang: "xml" },
];

// Monaco language id for a given mode.
export const modeLang = (mode) =>
  MODES.find((m) => m.id === mode)?.lang || "plaintext";

export const isXmlMode = (mode) => mode === "xml" || mode === "soap";

export const STORAGE_KEY = "history"; // kept for backward compatibility

export const HOTKEYS_HELP =
  "Ctrl+Shift+F search all · Ctrl+F find · Ctrl+S format · Ctrl+D compare · Alt+1-9 tabs";
