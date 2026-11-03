// src/Pages/PropertyManagementV2/components/V2ToastMessages.js
import React, { useState, useCallback, createContext, useContext } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastContainer({ toasts, dismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return React.createElement(
    "div",
    {
      style: {
        position: "fixed",
        bottom: 28,
        right: 28,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        zIndex: 99999,
        fontFamily: "'Lato', sans-serif",
      },
    },
    toasts.map((t) => {
      const isError = t.type === "error";
      const isInfo = t.type === "info";
      const bgColor = isError ? "#EF4444" : isInfo ? "#2563EB" : "#10B981";
      const shadowColor = isError
        ? "rgba(239, 68, 68, 0.3)"
        : isInfo
        ? "rgba(37, 99, 235, 0.3)"
        : "rgba(16, 185, 129, 0.3)";

      return React.createElement(
        "div",
        {
          key: t.id,
          style: {
            backgroundColor: bgColor,
            color: "#FFFFFF",
            padding: "12px 18px",
            borderRadius: "10px",
            boxShadow: `0 10px 25px -4px ${shadowColor}`,
            display: "flex",
            alignItems: "center",
            gap: "12px",
            minWidth: "300px",
            maxWidth: "460px",
            fontSize: "13.5px",
            fontWeight: 600,
            lineHeight: 1.4,
            animation: "pmv2FadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          },
        },
        React.createElement(
          "div",
          { style: { flexShrink: 0, display: "flex", alignItems: "center" } },
          isError
            ? React.createElement(AlertCircle, { size: 19 })
            : isInfo
            ? React.createElement(Info, { size: 19 })
            : React.createElement(CheckCircle2, { size: 19 })
        ),
        React.createElement("div", { style: { flex: 1 } }, t.message),
        React.createElement(
          "button",
          {
            type: "button",
            onClick: () => dismiss(t.id),
            style: {
              border: "none",
              background: "transparent",
              color: "#FFFFFF",
              opacity: 0.8,
              cursor: "pointer",
              padding: 2,
              display: "flex",
              alignItems: "center",
            },
          },
          React.createElement(X, { size: 15 })
        )
      );
    })
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, type = "success", duration = 3500) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type }]);

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, duration);
      }
    },
    [dismiss]
  );

  const toast = {
    success: (msg, duration) => push(msg, "success", duration),
    error: (msg, duration) => push(msg, "error", duration),
    info: (msg, duration) => push(msg, "info", duration),
  };

  return React.createElement(
    ToastContext.Provider,
    { value: { push, dismiss, toast } },
    children,
    React.createElement(ToastContainer, { toasts, dismiss })
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  const [localToasts, setLocalToasts] = useState([]);

  const dismissLocal = useCallback((id) => {
    setLocalToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushLocal = useCallback(
    (message, type = "success", duration = 3500) => {
      const id = Date.now() + Math.random();
      setLocalToasts((prev) => [...prev, { id, message, type }]);

      if (duration > 0) {
        setTimeout(() => {
          dismissLocal(id);
        }, duration);
      }
    },
    [dismissLocal]
  );

  if (ctx) {
    return ctx;
  }

  const localToast = {
    success: (msg, duration) => pushLocal(msg, "success", duration),
    error: (msg, duration) => pushLocal(msg, "error", duration),
    info: (msg, duration) => pushLocal(msg, "info", duration),
  };

  const ToastHost = () =>
    React.createElement(ToastContainer, {
      toasts: localToasts,
      dismiss: dismissLocal,
    });

  return {
    push: pushLocal,
    dismiss: dismissLocal,
    toast: localToast,
    ToastHost,
    ToastContainer: ToastHost,
  };
}
