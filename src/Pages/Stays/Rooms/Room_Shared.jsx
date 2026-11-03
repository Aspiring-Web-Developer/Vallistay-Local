import { useState,useRef } from "react";

/* ─────────────────────────────────────────────────
   🎨 THEME — Valli Stay green
───────────────────────────────────────────────── */
export const RT = {
  primary: "#3d5346",
  primaryDark: "#2c3d33",
  primaryText: "#ffffff",
  secondary: "#97bba8",
  secondaryLight: "#eef4f1",
  bg: "#f7f9f8",
  white: "#ffffff",
  border: "#e3e9e6",
  text: "#1f2a24",
  textSec: "#67766f",
  textTer: "#9aa8a2",
  red: "#ef4444",
  redLight: "#fee2e2",
  amber: "#f59e0b",
  green: "#22c55e",
  greenLight: "#dcfce7",
  radius: 8,
  radiusMd: 10,
  radiusLg: 16,
  shadow: "0 1px 3px rgba(31,42,36,0.07)",
  shadowMd: "0 10px 30px rgba(31,42,36,0.14)",
};

/* ─────────────────────────────────────────────────
   TOAST — bottom-right, smooth slide-in, no provider needed
───────────────────────────────────────────────── */
const TOAST_COLORS = {
  success: { bg: "#3b82f6", ring: "rgba(59,130,246,0.35)" },
  info: { bg: "#3b82f6", ring: "rgba(59,130,246,0.35)" },
  error: { bg: "#ef4444", ring: "rgba(239,68,68,0.35)" },
};

const ToastIcon = ({ type }) => {
  if (type === "error") {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#fff" strokeWidth="1.8" />
        <path d="M12 7.5v6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="16.3" r="1" fill="#fff" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
      <circle cx="12" cy="12" r="9" stroke="#fff" strokeWidth="1.8" />
      <path d="M8 12.5l2.6 2.6L16 9.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export function useToast() {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});          // id -> timeout
  const latest = useRef({});          // always holds the newest toasts + dismiss

  const dismiss = (id) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setToasts((t) => t.filter((x) => x.id !== id));
  };

  const startTimer = (id) => {
    clearTimeout(timers.current[id]);
    timers.current[id] = setTimeout(() => dismiss(id), 3200);
  };

  const push = (msg, type = "success") => {
    // same message already on screen -> keep it where it is, just extend its time
    const existing = latest.current.toasts?.find((x) => x.msg === msg && x.type === type);
    if (existing) {
      startTimer(existing.id);
      return;
    }
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, type }]);
    startTimer(id);
  };

  latest.current = { toasts, dismiss };

  // created ONCE, so React never remounts it (no animation replay on re-render)
  const hostRef = useRef(null);
  if (!hostRef.current) {
    hostRef.current = function ToastHost() {
      const { toasts, dismiss } = latest.current;
      return (
        <div
          style={{
            position: "fixed", bottom: 28, right: 28,
            display: "flex", flexDirection: "column", gap: 12,
            zIndex: 99999, fontFamily: "'Lato', 'Segoe UI', sans-serif",
          }}
        >
          {toasts.map((t) => {
            const c = TOAST_COLORS[t.type] || TOAST_COLORS.success;
            return (
              <div
                key={t.id}
                onClick={() => dismiss(t.id)}
                style={{
                  background: c.bg, color: "#fff", padding: "16px 22px",
                  borderRadius: 14, fontSize: 14.5, fontWeight: 600,
                  fontFamily: "'Lato', 'Segoe UI', sans-serif",
                  boxShadow: `0 12px 28px rgba(30,58,138,0.28), 0 0 0 4px ${c.ring}`,
                  minWidth: 280, maxWidth: 380,
                  display: "flex", alignItems: "center", gap: 12,
                  animation: "roomToastIn .45s cubic-bezier(.34,1.56,.64,1)",
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    width: 26, height: 26, borderRadius: "50%",
                    background: "rgba(255,255,255,0.18)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}
                >
                  <ToastIcon type={t.type} />
                </span>
                <span style={{ lineHeight: 1.4, letterSpacing: "0.01em" }}>{t.msg}</span>
              </div>
            );
          })}
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;500;600;700&display=swap');
            @keyframes roomToastIn {
              from { transform: translateX(120%) scale(0.95); opacity: 0; }
              to   { transform: translateX(0) scale(1);       opacity: 1; }
            }
          `}</style>
        </div>
      );
    };
  }

  return { push, ToastHost: hostRef.current };
}

/* ─────────────────────────────────────────────────
   ROOM TYPE ICONS — big, selectable
───────────────────────────────────────────────── */
export function IconStandard({ size = 40, active }) {
  const c = active ? "#fff" : RT.primary;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect x="4" y="22" width="40" height="14" rx="3" stroke={c} strokeWidth="2.3" />
      <path d="M8 22v-6a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v6" stroke={c} strokeWidth="2.3" />
      <line x1="4" y1="36" x2="4" y2="40" stroke={c} strokeWidth="2.3" strokeLinecap="round" />
      <line x1="44" y1="36" x2="44" y2="40" stroke={c} strokeWidth="2.3" strokeLinecap="round" />
    </svg>
  );
}

export function IconDeluxe({ size = 40, active }) {
  const c = active ? "#fff" : RT.primary;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect x="4" y="22" width="40" height="14" rx="3" stroke={c} strokeWidth="2.3" />
      <path d="M8 22v-6a4 4 0 0 1 4-4h20a4 4 0 0 1 4 4v6" stroke={c} strokeWidth="2.3" />
      <path
        d="M24 5.5l1.3 2.9 3.1.4-2.3 2.2.6 3.1L24 12.4l-2.7 1.7.6-3.1-2.3-2.2 3.1-.4z"
        fill={c}
      />
      <line x1="4" y1="36" x2="4" y2="40" stroke={c} strokeWidth="2.3" strokeLinecap="round" />
      <line x1="44" y1="36" x2="44" y2="40" stroke={c} strokeWidth="2.3" strokeLinecap="round" />
    </svg>
  );
}

export function IconSuite({ size = 40, active }) {
  const c = active ? "#fff" : RT.primary;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect x="2" y="24" width="24" height="12" rx="3" stroke={c} strokeWidth="2.3" />
      <path d="M5 24v-5a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v5" stroke={c} strokeWidth="2.3" />
      <rect x="29" y="17" width="17" height="19" rx="3" stroke={c} strokeWidth="2.3" />
      <line x1="33" y1="23.5" x2="42" y2="23.5" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <line x1="33" y1="29" x2="42" y2="29" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export const ROOM_TYPES = [
  { key: "standard", label: "Standard", sub: "Cozy & essential", icon: IconStandard },
  { key: "deluxe", label: "Deluxe", sub: "Extra comfort", icon: IconDeluxe },
  { key: "suite", label: "Suite", sub: "Premium living", icon: IconSuite },
];

export function getRoomType(key) {
  return ROOM_TYPES.find((r) => r.key === key) || ROOM_TYPES[0];
}

/* ─────────────────────────────────────────────────
   SMALL UI HELPERS
───────────────────────────────────────────────── */
export function Pill({ children, color = "green" }) {
  const map = {
    green: { bg: RT.greenLight, fg: "#15803d" },
    gray: { bg: "#f1f3f2", fg: RT.textSec },
    sec: { bg: RT.secondaryLight, fg: RT.primaryDark },
    red: { bg: RT.redLight, fg: RT.red },
  };
  const s = map[color] || map.gray;
  return (
    <span
      style={{
        background: s.bg,
        color: s.fg,
        fontSize: 11.5,
        fontWeight: 700,
        padding: "3px 10px",
        borderRadius: 999,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

export function Spinner({ size = 26 }) {
  return (
    <>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          border: `3px solid ${RT.secondaryLight}`,
          borderTopColor: RT.primary,
          animation: "roomSpin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes roomSpin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}