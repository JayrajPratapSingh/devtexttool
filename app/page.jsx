"use client";

import dynamic from "next/dynamic";

// The editor app is browser-only (Monaco, localStorage, clipboard), so it is
// loaded client-side with SSR disabled. A dark placeholder keeps the first
// paint from flashing white.
const App = dynamic(() => import("../src/App.jsx"), {
  ssr: false,
  loading: () => <div style={{ height: "100vh", background: "#0a0e17" }} />,
});

export default function Page() {
  return (
    <main>
      {/* Crawlable content for search engines (visually hidden). */}
      <section className="sr-only">
        <h1>DevText Tool — JSON, XML &amp; SOAP Formatter, Validator, Diff and JWT Decoder</h1>
        <p>
          DevText Tool is a free, in-browser developer toolkit for working with Text, JSON,
          XML and SOAP. Format and beautify or minify payloads, validate JSON and XML with
          precise error locations, and diff two payloads side-by-side with options to ignore
          whitespace or key order.
        </p>
        <h2>Features</h2>
        <ul>
          <li>JSON formatter, validator, minifier and key sorter</li>
          <li>XML and SOAP formatter with well-formedness validation</li>
          <li>Extract the contents of a SOAP Body (namespace-agnostic)</li>
          <li>Convert between JSON and XML/SOAP</li>
          <li>Diff two tabs or a scratch buffer, with ignore-whitespace / ignore-key-order</li>
          <li>Tree navigator that copies JSONPath and XPath for any field</li>
          <li>Search across all open tabs at once</li>
          <li>JWT decode, Base64 and URL encode/decode, timestamp conversion, SHA hashing</li>
          <li>Runs entirely in your browser — nothing is uploaded</li>
        </ul>
      </section>
      <App />
    </main>
  );
}
