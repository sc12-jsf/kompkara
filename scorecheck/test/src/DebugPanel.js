import React from "react";

export default function DebugPanel({ logs }) {
  return (
    <div
      style={{
        position: "fixed",
        right: 10,
        bottom: 10,
        width: 350,
        height: 300,
        background: "rgba(0,0,0,0.8)",
        color: "#0f0",
        padding: 10,
        fontSize: 12,
        overflowY: "scroll",
        borderRadius: 6,
        fontFamily: "monospace",
        zIndex: 9999
      }}
    >
      <strong style={{ color: "#fff" }}>Debug Log</strong>
      <hr style={{ borderColor: "#444" }} />
      {logs.map((log, i) => (
        <div key={i} style={{ marginBottom: 4 }}>
          <span style={{ color: "#888" }}>
            [{new Date(log.time).toLocaleTimeString()}]
          </span>{" "}
          <span style={{ color: log.color }}>{log.text}</span>
        </div>
      ))}
    </div>
  );
}
