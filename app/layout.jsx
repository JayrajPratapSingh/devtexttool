import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "../src/App.css";

// Modern typeface pairing: Inter for UI, JetBrains Mono for code. Self-hosted
// by next/font (no layout shift, no external request), exposed as CSS variables
// that globals.css maps onto --sans / --mono.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

// NOTE: change SITE_URL to your real deployed domain — it drives canonical,
// Open Graph and sitemap URLs used by Google.
const SITE_URL = "https://devtext.studio";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "DevText Tool — JSON, XML & SOAP Formatter, Validator, Diff & JWT Decoder",
    template: "%s | DevText Tool",
  },
  description:
    "Free online developer tool to format, validate and compare JSON, XML and SOAP payloads. Beautify & minify, diff two payloads side-by-side, decode JWTs, Base64/URL encode-decode, extract SOAP bodies and copy JSONPath / XPath — all in your browser, nothing uploaded.",
  applicationName: "DevText Tool",
  keywords: [
    "JSON formatter",
    "JSON validator",
    "XML formatter",
    "SOAP formatter",
    "JSON diff",
    "compare JSON",
    "JWT decoder",
    "Base64 encode decode",
    "URL encode decode",
    "JSONPath",
    "XPath",
    "SOAP body extractor",
    "beautify minify JSON XML",
    "online developer tools",
  ],
  authors: [{ name: "DevText Tool" }],
  category: "developer tools",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "DevText Tool",
    title: "DevText Tool — Format, Validate & Diff JSON, XML and SOAP",
    description:
      "Format, validate, minify and diff JSON / XML / SOAP. Decode JWT, Base64/URL, extract SOAP bodies, copy JSONPath & XPath. Fast, private, in-browser.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevText Tool — JSON / XML / SOAP toolkit",
    description:
      "Format, validate, minify and diff JSON, XML and SOAP. JWT decode, Base64/URL, JSONPath & XPath — all in-browser.",
  },
};

export const viewport = {
  themeColor: "#0a0e17",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
