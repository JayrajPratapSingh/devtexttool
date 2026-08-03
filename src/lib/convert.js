// Conversion between JSON and XML/SOAP. These cover the common shapes seen in
// API payloads: nested objects, arrays (repeated tags), text values and
// attributes (represented with a leading "@" key in JSON).

import { formatXml } from "./format.js";

const escapeXml = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

// Make an arbitrary JSON key safe to use as an XML tag name.
function sanitizeTag(key) {
  const cleaned = String(key).replace(/[^\w.:-]/g, "_").replace(/^(\d)/, "_$1");
  return cleaned || "item";
}

function buildNode(name, value, depth) {
  const pad = "  ".repeat(depth);

  if (Array.isArray(value)) {
    // repeat the same tag for each array item
    return value.map((v) => buildNode(name, v, depth)).join("\n");
  }

  if (value !== null && typeof value === "object") {
    const attrs = [];
    const children = [];
    for (const [k, v] of Object.entries(value)) {
      if (k.startsWith("@")) attrs.push(`${sanitizeTag(k.slice(1))}="${escapeXml(v)}"`);
      else if (k === "#text") children.push(`${pad}  ${escapeXml(v)}`);
      else children.push(buildNode(sanitizeTag(k), v, depth + 1));
    }
    const attrStr = attrs.length ? " " + attrs.join(" ") : "";
    if (!children.length) return `${pad}<${name}${attrStr} />`;
    return `${pad}<${name}${attrStr}>\n${children.join("\n")}\n${pad}</${name}>`;
  }

  return `${pad}<${name}>${escapeXml(value)}</${name}>`;
}

export function jsonToXml(jsonStr, rootName = "root") {
  const obj = JSON.parse(jsonStr);
  // If the top-level object has a single key, use it as the document root.
  let root = rootName;
  let value = obj;
  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
    const keys = Object.keys(obj).filter((k) => !k.startsWith("@"));
    if (keys.length === 1) {
      root = sanitizeTag(keys[0]);
      value = obj[keys[0]];
    }
  }
  const body = buildNode(root, value, 0);
  return `<?xml version="1.0" encoding="UTF-8"?>\n${body}`;
}

function elementToObj(el) {
  const result = {};

  for (const attr of Array.from(el.attributes || [])) {
    result[`@${attr.name}`] = attr.value;
  }

  const childEls = Array.from(el.children);
  if (childEls.length === 0) {
    const text = el.textContent.trim();
    if (Object.keys(result).length === 0) return text; // pure text node
    if (text) result["#text"] = text;
    return result;
  }

  for (const child of childEls) {
    const name = child.nodeName;
    const val = elementToObj(child);
    if (result[name] === undefined) {
      result[name] = val;
    } else {
      if (!Array.isArray(result[name])) result[name] = [result[name]];
      result[name].push(val);
    }
  }
  return result;
}

export function xmlToJson(xmlStr) {
  const doc = new DOMParser().parseFromString(xmlStr, "application/xml");
  const err = doc.querySelector("parsererror");
  if (err) throw new Error("Invalid XML — cannot convert");
  const root = doc.documentElement;
  return JSON.stringify({ [root.nodeName]: elementToObj(root) }, null, 2);
}

// Mode-aware convenience used by the toolbar. Returns { value, mode } or { error }.
export function convert(content, mode) {
  try {
    if (mode === "json") {
      return { value: formatXml(jsonToXml(content)), mode: "xml" };
    }
    // xml or soap -> json
    return { value: xmlToJson(content), mode: "json" };
  } catch (e) {
    return { error: e.message };
  }
}
