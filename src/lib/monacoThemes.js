// Custom Monaco editor themes so the editor surface matches the app chrome
// instead of using the stock vs-dark / vs backgrounds.

export function defineMonacoThemes(monaco) {
  monaco.editor.defineTheme("devtext-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#0b0f1b",
      "editorGutter.background": "#0b0f1b",
      "editor.lineHighlightBackground": "#141a2c",
      "editor.lineHighlightBorder": "#00000000",
      "editorLineNumber.foreground": "#3b4560",
      "editorLineNumber.activeForeground": "#818cf8",
      "editor.selectionBackground": "#33407a",
      "editor.inactiveSelectionBackground": "#242c47",
      "editorIndentGuide.background1": "#1b2338",
      "editorWidget.background": "#0f1424",
      "editorWidget.border": "#232c45",
      "input.background": "#0f1424",
      "diffEditor.insertedTextBackground": "#22c55e22",
      "diffEditor.removedTextBackground": "#ef444422",
    },
  });

  monaco.editor.defineTheme("devtext-light", {
    base: "vs",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#ffffff",
      "editorGutter.background": "#ffffff",
      "editor.lineHighlightBackground": "#f3f5fb",
      "editor.lineHighlightBorder": "#00000000",
      "editorLineNumber.foreground": "#c2c8d6",
      "editorLineNumber.activeForeground": "#6366f1",
      "editor.selectionBackground": "#c7d2fe",
      "editorIndentGuide.background1": "#eef0f6",
      "editorWidget.background": "#ffffff",
      "editorWidget.border": "#e2e6f0",
      "diffEditor.insertedTextBackground": "#22c55e1f",
      "diffEditor.removedTextBackground": "#ef44441f",
    },
  });
}

export const monacoThemeName = (dark) => (dark ? "devtext-dark" : "devtext-light");
