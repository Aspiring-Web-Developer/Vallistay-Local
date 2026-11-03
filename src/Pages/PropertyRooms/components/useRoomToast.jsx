// src/Pages/PropertyRooms/components/useRoomToast.jsx
import React, { useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export function useRoomToast() {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, type = "success", duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const ToastContainer = () => {
    if (toasts.length === 0) return null;

    return (
      <div
        style={{
          position: "fixed",
          bottom: 28,
          right: 28,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          zIndex: 99999,
          fontFamily: "'Lato', sans-serif",
        }}
      >
        {toasts.map((t) => {
          const isError = t.type === "error";
          const isInfo = t.type === "info";
          const bgColor = isError ? "#dc2626" : isInfo ? "#2563eb" : "#16a34a";
          const shadowColor = isError
            ? "rgba(220, 38, 38, 0.25)"
            : isInfo
            ? "rgba(37, 99, 235, 0.25)"
            : "rgba(22, 163, 74, 0.25)";

          return (
            <div
              key={t.id}
              style={{
                backgroundColor: bgColor,
                color: "#ffffff",
                padding: "14px 20px",
                borderRadius: "12px",
                boxShadow: `0 10px 25px -3px ${shadowColor}`,
                display: "flex",
                alignItems: "center",
                gap: "12px",
                minWidth: "320px",
                maxWidth: "460px",
                fontSize: "14px",
                fontWeight: 600,
                lineHeight: 1.4,
                animation: "prSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <div style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
                {isError ? (
                  <AlertCircle size={20} />
                ) : isInfo ? (
                  <Info size={20} />
                ) : (
                  <CheckCircle2 size={20} />
                )}
              </div>
              <div style={{ flex: 1 }}>{t.message}</div>
              <button
                onClick={() => dismiss(t.id)}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#ffffff",
                  opacity: 0.8,
                  cursor: "pointer",
                  padding: 2,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  return { push, dismiss, ToastContainer };
}
