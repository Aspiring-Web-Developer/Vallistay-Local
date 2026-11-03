import React from "react";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

export default function AuditStatusBadge({ status }) {
  const norm = (status || "").toLowerCase();

  if (norm === "success") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          background: "#ecfdf5",
          color: "#059669",
          padding: "2px 8px",
          borderRadius: "9999px",
          fontSize: "12px",
          fontWeight: 600,
        }}
      >
        <CheckCircle size={13} />
        Success
      </span>
    );
  }

  if (norm === "failed" || norm === "error") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          background: "#fef2f2",
          color: "#dc2626",
          padding: "2px 8px",
          borderRadius: "9999px",
          fontSize: "12px",
          fontWeight: 600,
        }}
      >
        <XCircle size={13} />
        Failed
      </span>
    );
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        background: "#fffbeb",
        color: "#d97706",
        padding: "2px 8px",
        borderRadius: "9999px",
        fontSize: "12px",
        fontWeight: 600,
      }}
    >
      <AlertTriangle size={13} />
      Warning
    </span>
  );
}
