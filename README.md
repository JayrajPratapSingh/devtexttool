# DevText Tool

A local, in-browser scratchpad for working with **Text, JSON, XML and SOAP** payloads — built on Monaco (the VS Code editor). Everything runs client-side; tabs persist in `localStorage`.

## Modes (per tab)

- **Text** – plain editing, beautify, word/line/char stats.
- **JSON** – format, minify, live validation with error location, **Sort keys**.
- **XML** – format (pretty-print), minify, well-formedness validation.
- **SOAP** – everything XML plus:
  - **Extract Body** – pulls the inner payload out of `<...:Body>…</...:Body>` (namespace-agnostic).
  - **Escape / Unescape** – decode/encode `&lt; &gt; &amp;` and JSON `\"` escapes for payloads stored as strings.

Each tab remembers its own mode; the mode is auto-detected on file open/paste.

## Search everywhere

- **Search all tabs** (`Ctrl+Shift+F`) – one finder that scans **every open tab at once**, groups hits by tab with `line:col`, and jumps straight to the match (switching tabs and selecting it). Supports case-sensitive and regex.
- **Find in file** (`Ctrl+F`) – the standard Monaco find/replace inside the active editor.

## Power tools

- **Compare** (`Ctrl+D`) – side-by-side diff of the current tab against **another tab** or a scratch buffer. Toggle **Ignore whitespace** / **Ignore key order** for a normalized (read-only) comparison.
- **Tree** – collapsible JSON/XML structure navigator; click any node to copy its **JSONPath** (JSON) or **XPath** (XML). The fastest way to locate a mapping field.
- **To XML / To JSON** – one-click conversion between JSON and XML/SOAP (attributes map to `@attr`, repeated tags to arrays).
- **Utils** – standalone developer utilities: JWT decode, Base64 encode/decode, URL encode/decode, Unix timestamp ↔ date, SHA-1/256/512. "From tab" loads the current editor content.

## Other

- Format (`Ctrl+S`), Copy, Download, drag-and-drop file open, dark/light theme.
- `Alt+1…9` to jump between tabs.
- Live status bar: mode, cursor position, lines / words / chars, validity.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # next build
npm run start    # serve the production build
npm run lint
```

Stack: **Next.js 15 (App Router)** + React 19 + `@monaco-editor/react`. No backend — the editor runs entirely client-side.

## SEO

`app/layout.jsx` sets title, description, keywords, Open Graph, Twitter and robots
metadata; `app/robots.js` and `app/sitemap.js` generate `/robots.txt` and
`/sitemap.xml`; `app/page.jsx` renders a crawlable (visually hidden) heading and
feature list. **Set the real domain** in the `SITE_URL` constant in
`app/layout.jsx`, `app/robots.js` and `app/sitemap.js` before deploying.

## Project structure

```
app/                     Next.js App Router (SEO + shell)
  layout.jsx             <html>/<head> metadata, global CSS
  page.jsx               loads the editor client-side (ssr:false) + SEO content
  globals.css            reset, font tokens, dark base
  robots.js, sitemap.js  generated /robots.txt and /sitemap.xml
next.config.mjs

src/                     the editor implementation
  App.jsx                orchestrator: state + wiring ("use client")
  App.css                UI polish (glass, gradients, animations)
  config/
    constants.js         modes, storage key, shortcut hints
    theme.js             light/dark color tokens + shared styles
  lib/                   pure logic (no React)
    detect.js            mode auto-detection
    format.js            format / minify / validate / escape per mode
    convert.js           JSON ⇄ XML/SOAP
    utilities.js         JWT / Base64 / URL / timestamp / hash
    search.js            cross-tab search
    paths.js             JSONPath / XPath builders
    storage.js           localStorage load/save + tab factory
    monacoThemes.js      custom dark/light editor themes
  components/            presentational React components
    Toast, TopBar, Toolbar, TabStrip, GlobalSearch,
    EditorArea, TreePanel, UtilitiesPanel, StatusBar
```
