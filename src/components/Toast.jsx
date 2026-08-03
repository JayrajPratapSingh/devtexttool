// Transient status message shown top-right.

export default function Toast({ message }) {
  if (!message) return null;
  const bg =
    message.type === "error"
      ? "#ef4444"
      : message.type === "warn"
        ? "#f59e0b"
        : "#22c55e";

  return (
    <div
      className="toast"
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        padding: "9px 14px",
        borderRadius: 8,
        color: "white",
        zIndex: 999,
        fontSize: 13,
        maxWidth: 420,
        background: bg,
        boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
      }}
    >
      {message.text}
    </div>
  );
}
