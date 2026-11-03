import React from "react";
import { Trash2 } from "lucide-react";

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = "Yes, Delete User" }) {
  if (!isOpen) return null;

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.45)",
          backdropFilter: "blur(2px)",
          zIndex: 1080,
        }}
        onClick={onCancel}
      />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "420px",
          maxWidth: "92vw",
          background: "#ffffff",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          zIndex: 1090,
          textAlign: "left",
        }}
        role="dialog"
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "#fee2e2",
            color: "#dc2626",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <Trash2 size={22} />
        </div>

        <h3 style={{ margin: "0 0 8px 0", fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
          {title || "Confirm Action"}
        </h3>
        <p style={{ margin: "0 0 24px 0", fontSize: 13.5, color: "#64748b", lineHeight: 1.5 }}>
          {message}
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10 }}>
          <button
            type="button"
            className="am-btn-outline"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "13.5px",
              fontWeight: 600,
              background: "#dc2626",
              color: "#ffffff",
              border: "none",
              cursor: "pointer",
            }}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </>
  );
}
