// CameraWarning.jsx
import React from "react";
import { createPortal } from "react-dom";
import { Camera, Upload } from "lucide-react";
import { T } from "./shared";

export function getCameraIssue(err) {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return {
      title: "Camera not available",
      msg: "Your device or browser doesn't support camera access here. Please upload a photo or file instead.",
    };
  }
  switch (err?.name) {
    case "NotFoundError":
    case "DevicesNotFoundError":
      return {
        title: "No camera found",
        msg: "To take a photo you need a camera on this device. You can upload an existing photo or file instead.",
      };
    case "NotAllowedError":
    case "PermissionDeniedError":
    case "SecurityError":
      return {
        title: "Camera access blocked",
        msg: "Please allow camera permission in your browser settings and try again, or upload a file instead.",
      };
    case "NotReadableError":
    case "TrackStartError":
      return {
        title: "Camera is busy",
        msg: "Another app is using your camera. Close it and try again, or upload a file instead.",
      };
    default:
      return {
        title: "Couldn't open the camera",
        msg: "Something went wrong while opening the camera. Please try again or upload a file instead.",
      };
  }
}

export function CameraWarningModal({ issue, onClose, onUpload }) {
  if (!issue) return null;
  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 10010,
        background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 18, width: 380, maxWidth: "100%",
          padding: "26px 24px 20px", textAlign: "center",
          boxShadow: "0 28px 70px rgba(0,0,0,0.22)",
          fontFamily: "'Inter','Segoe UI',sans-serif",
        }}
      >
        <div style={{
          width: 54, height: 54, borderRadius: "50%", background: "#fff7ed",
          display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px",
        }}>
          <Camera size={24} color="#ea580c" />
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 6 }}>{issue.title}</div>
        <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.55, marginBottom: 20 }}>{issue.msg}</div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1, padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.border}`,
              background: "#fff", color: "#374151", fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            Close
          </button>
          <button
            type="button"
            onClick={onUpload}
            style={{
              flex: 1, padding: "10px 14px", borderRadius: 10, border: "1px solid #2563eb",
              background: "#2563eb", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            <Upload size={14} /> Upload File instead
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}