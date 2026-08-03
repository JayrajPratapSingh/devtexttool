// Standalone developer utilities used by the Utilities panel. Each throws on
// bad input so the UI can show a friendly error.

// -- base64 (unicode-safe) -------------------------------------------------

export function base64Encode(text) {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
}

export function base64Decode(text) {
  const bin = atob(text.trim());
  const bytes = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

// base64url variant used inside JWTs
function base64UrlDecode(part) {
  const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64.padEnd(Math.ceil(b64.length / 4) * 4, "=");
  return base64Decode(padded);
}

// -- URL -------------------------------------------------------------------

export const urlEncode = (text) => encodeURIComponent(text);
export const urlDecode = (text) => decodeURIComponent(text.trim());

// -- JWT (decode only, no signature verification) --------------------------

export function decodeJwt(token) {
  const parts = token.trim().split(".");
  if (parts.length < 2) {
    throw new Error("Not a JWT — expected header.payload.signature");
  }
  const header = JSON.parse(base64UrlDecode(parts[0]));
  const payload = JSON.parse(base64UrlDecode(parts[1]));
  const out = { header, payload };

  // Surface common time claims in a human-readable form.
  const notes = [];
  if (payload.exp) notes.push(`exp: ${new Date(payload.exp * 1000).toISOString()}`);
  if (payload.iat) notes.push(`iat: ${new Date(payload.iat * 1000).toISOString()}`);
  if (payload.exp) {
    notes.push(payload.exp * 1000 < Date.now() ? "status: EXPIRED" : "status: valid");
  }
  return JSON.stringify(out, null, 2) + (notes.length ? "\n\n// " + notes.join("\n// ") : "");
}

// -- timestamp -------------------------------------------------------------

// Accepts a unix timestamp (seconds or milliseconds) OR a date string, and
// returns the complementary representation.
export function convertTimestamp(input) {
  const trimmed = input.trim();
  if (/^\d+$/.test(trimmed)) {
    const ms = trimmed.length > 10 ? Number(trimmed) : Number(trimmed) * 1000;
    const d = new Date(ms);
    if (isNaN(d.getTime())) throw new Error("Invalid timestamp");
    return `${d.toISOString()}\nLocal: ${d.toString()}`;
  }
  const d = new Date(trimmed);
  if (isNaN(d.getTime())) throw new Error("Enter a unix timestamp or a date string");
  return `Unix (s): ${Math.floor(d.getTime() / 1000)}\nUnix (ms): ${d.getTime()}`;
}

// -- hashing (Web Crypto, async) -------------------------------------------

async function hashHex(algo, text) {
  const buf = await crypto.subtle.digest(algo, new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const sha1 = (text) => hashHex("SHA-1", text);
export const sha256 = (text) => hashHex("SHA-256", text);
export const sha512 = (text) => hashHex("SHA-512", text);

// -- registry consumed by the panel ---------------------------------------
// `run` may be sync or async; the panel awaits it either way.

export const UTILITIES = [
  { id: "jwt", label: "JWT decode", run: decodeJwt },
  { id: "b64enc", label: "Base64 encode", run: base64Encode },
  { id: "b64dec", label: "Base64 decode", run: base64Decode },
  { id: "urlenc", label: "URL encode", run: urlEncode },
  { id: "urldec", label: "URL decode", run: urlDecode },
  { id: "ts", label: "Timestamp ↔ date", run: convertTimestamp },
  { id: "sha1", label: "SHA-1", run: sha1 },
  { id: "sha256", label: "SHA-256", run: sha256 },
  { id: "sha512", label: "SHA-512", run: sha512 },
];
