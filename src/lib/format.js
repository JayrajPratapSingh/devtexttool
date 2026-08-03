// Formatting, minifying and validation for each mode. Every entry point is a
// pure function so behaviour is easy to reason about and test.

import { js as beautifyJs } from "js-beautify";
import { isXmlMode } from "../config/constants.js";

// -- helpers ---------------------------------------------------------------

// Turn a character offset into { line, col } (1-based) for error reporting.
function offsetToLineCol(text, offset) {
  const upto = text.slice(0, offset);
  const line = upto.split("\n").length;
  const col = offset - upto.lastIndexOf("\n");
  return { line, col };
}

// -- JSON ------------------------------------------------------------------

export function validateJson(content) {
  try {
    JSON.parse(content);
    return { ok: true };
  } catch (e) {
    const m = /position (\d+)/.exec(e.message);
    let where = "";
    if (m) {
      const { line, col } = offsetToLineCol(content, Number(m[1]));
      where = ` (line ${line}, col ${col})`;
    }
    return { ok: false, error: e.message.replace(/ in JSON.*$/, "") + where };
  }
}

export function formatJson(content, indent = 2) {
  return JSON.stringify(JSON.parse(content), null, indent);
}

export function minifyJson(content) {
  return JSON.stringify(JSON.parse(content));
}

export function sortJsonKeys(content) {
  const sort = (v) => {
    if (Array.isArray(v)) return v.map(sort);
    if (v && typeof v === "object") {
      return Object.keys(v)
        .sort()
        .reduce((acc, k) => {
          acc[k] = sort(v[k]);
          return acc;
        }, {});
    }
    return v;
  };
  return JSON.stringify(sort(JSON.parse(content)), null, 2);
}

// -- XML / SOAP ------------------------------------------------------------

// Self-contained XML pretty printer. Handles namespaced tags (soap:Body),
// declarations, comments and self-closing elements.
export function formatXml(xml, indentUnit = "  ") {
  const src = String(xml).replace(/\r\n?/g, "\n").replace(/>\s+</g, "><").trim();
  const withBreaks = src.replace(/(>)(<)(\/*)/g, "$1\n$2$3");
  let pad = 0;
  const out = [];
  for (const raw of withBreaks.split("\n")) {
    const node = raw.trim();
    if (!node) continue;
    let indent = 0;
    if (/^<\/\w/.test(node)) {
      pad = Math.max(pad - 1, 0); // closing tag
    } else if (/^<\w[^>]*[^/]>.*<\/\w/.test(node)) {
      indent = 0; // open + close on one line
    } else if (/^<\w[^>]*[^/]>$/.test(node) && !node.startsWith("<?")) {
      indent = 1; // opening tag only
    }
    out.push(indentUnit.repeat(pad) + node);
    pad += indent;
  }
  return out.join("\n");
}

export function minifyXml(xml) {
  return String(xml)
    .replace(/\r\n?/g, "\n")
    .replace(/>\s+</g, "><")
    .replace(/\n\s*/g, "")
    .trim();
}

export function validateXml(content) {
  if (typeof DOMParser === "undefined") return { ok: true };
  const doc = new DOMParser().parseFromString(content, "application/xml");
  const err = doc.querySelector("parsererror");
  if (err) {
    return {
      ok: false,
      error: err.textContent.replace(/\s+/g, " ").trim().slice(0, 200),
    };
  }
  return { ok: true };
}

// Pull the inner content of <...:Body>...</...:Body>, ignoring the namespace
// prefix. Returns the formatted inner payload, or null if no Body found.
export function extractSoapBody(content) {
  const m = /<(?:\w+:)?Body\b[^>]*>([\s\S]*?)<\/(?:\w+:)?Body>/i.exec(content);
  if (!m) return null;
  const inner = m[1].trim();
  try {
    return formatXml(inner);
  } catch {
    return inner;
  }
}

// -- escape / unescape -----------------------------------------------------

// Decode XML entities and common JSON string escapes so a payload stored as a
// string inside SOAP/JSON becomes readable XML/JSON.
export function unescapeString(s) {
  return String(s)
    .replace(/\\r\\n|\\n|\\r/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .replace(/\\\//g, "/")
    .replace(/\\\\/g, "\\")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, "&");
}

export function escapeString(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// -- generic text ----------------------------------------------------------

export function beautifyText(content) {
  return beautifyJs(content, { indent_size: 2 });
}

// -- mode-aware dispatch ---------------------------------------------------
// Each returns { value } on success or { error } on failure.

export function formatByMode(content, mode) {
  try {
    if (mode === "json") return { value: formatJson(content) };
    if (isXmlMode(mode)) return { value: formatXml(content) };
    return { value: beautifyText(content) };
  } catch (e) {
    return { error: e.message };
  }
}

export function minifyByMode(content, mode) {
  try {
    if (mode === "json") return { value: minifyJson(content) };
    if (isXmlMode(mode)) return { value: minifyXml(content) };
    return { value: content.replace(/\s+/g, " ").trim() };
  } catch (e) {
    return { error: e.message };
  }
}

export function validateByMode(content, mode) {
  if (!content.trim()) return { ok: true, empty: true };
  if (mode === "json") return validateJson(content);
  if (isXmlMode(mode)) return validateXml(content);
  return { ok: true };
}
