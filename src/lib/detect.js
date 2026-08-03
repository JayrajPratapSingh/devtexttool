// Best-effort guess of a content's mode, used when opening/dropping a file or
// restoring tabs saved before modes existed.

export function detectMode(content = "") {
  const t = content.trim();
  if (!t) return "text";

  if (
    (t.startsWith("{") && t.endsWith("}")) ||
    (t.startsWith("[") && t.endsWith("]"))
  ) {
    try {
      JSON.parse(t);
      return "json";
    } catch {
      /* not valid json, keep checking */
    }
  }

  if (/<\s*(\w+:)?Envelope[\s>]/i.test(t) || /soap/i.test(t.slice(0, 200))) {
    return "soap";
  }
  if (t.startsWith("<")) return "xml";
  return "text";
}
