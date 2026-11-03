






// import React, { useState } from "react";

// /* ─── Design tokens (same as Employees.jsx) ──────────────────────── */
// // 🎨 THEME: repoint these 2 values to re-skin every button, pill, and
// // active state that uses T.purple across the whole customer module.
// export const T = {
//   purple:      "#3d5346", // brand accent — deep green
//   purpleLight: "#e3e9e5", // light tint of #3d5346
//   purpleDark:  "#2c3d33", // darker shade for hover/active states
//   rowHover:    "#f3f6f4",
//   border:      "#e5e7eb",
//   borderDark:  "#d1d5db",
//   bg:          "#f9fafb",
//   white:       "#ffffff",
//   text:        "#111827",
//   textSec:     "#6b7280",
//   textTer:     "#9ca3af",
//   red:         "#f9391e",
//   redLight:    "#f9371e4b",
//   green:       "#10b981",
//   greenLight:  "#ecfdf5",
//   blue:        "#3a6fd5",
//   blueLight:   "#eff6ff",
//   shadow:      "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
//   shadowMd:    "0 8px 20px -4px rgba(61,83,70,0.18), 0 2px 6px -2px rgba(61,83,70,0.08)",
//   radius:      "8px",
//   radiusMd:    "10px",
//   radiusLg:    "14px",
// };

// const AVATAR_BG = [
//   ["#dbeafe","#1d4ed8"],["#d1fae5","#065f46"],["#ede9fe","#5b21b6"],
//   ["#fde8dc","#9a3412"],["#fef3c7","#92400e"],["#e0f2fe","#0369a1"],
//   ["#fce7f3","#9d174d"],["#dcfce7","#166534"],
// ];
// function avatarPalette(name = "") {
//   const i = (name.charCodeAt(0) || 0) % AVATAR_BG.length;
//   return { bg: AVATAR_BG[i][0], fg: AVATAR_BG[i][1] };
// }

// export function Avatar({ name = "?", size = 36 }) {
//   const { bg, fg } = avatarPalette(name);
//   return (
//     <div style={{
//       width: size, height: size, borderRadius: "50%", background: bg, color: fg,
//       display: "flex", alignItems: "center", justifyContent: "center",
//       fontWeight: 700, fontSize: size * 0.38, flexShrink: 0, userSelect: "none",
//       boxShadow: `0 0 0 2.5px ${T.white}, 0 0 0 3.5px ${T.border}`,
//     }}>{name.charAt(0).toUpperCase()}</div>
//   );
// }

// export function Btn({ children, onClick, variant = "primary", size = "md", disabled, style: sx }) {
//   const [h, setH] = useState(false);
//   const base = {
//     display: "inline-flex", alignItems: "center", gap: 6,
//     borderRadius: T.radiusMd, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
//     whiteSpace: "nowrap", lineHeight: 1, border: "none",
//     fontSize: size === "sm" ? 12 : 13,
//     padding: size === "sm" ? "6px 11px" : "9px 17px",
//     opacity: disabled ? 0.55 : 1, transition: "all .15s",
//   };
//   const variants = {
//     primary: {
//       background: h ? T.purpleDark : T.purple, color: "#fff",
//       boxShadow: h ? T.shadowMd : "0 1px 2px rgba(61,83,70,0.15)",
//     },
//     ghost:   { background: h ? T.bg : T.white, color: T.text, border: `1px solid ${T.border}` },
//     danger:  { background: T.redLight, color: T.red, border: `1px solid #fca5a5` },
//   };
//   return (
//     <button
//       onClick={onClick} disabled={disabled}
//       onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
//       style={{ ...base, ...variants[variant], ...sx }}
//     >
//       {children}
//     </button>
//   );
// }

// export function IconBtn({ children, onClick, title }) {
//   const [h, setH] = useState(false);
//   return (
//     <button
//       title={title} onClick={onClick}
//       onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
//       style={{
//         width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
//         borderRadius: T.radius, border: `1px solid ${h ? T.borderDark : T.border}`,
//         background: h ? T.bg : T.white, cursor: "pointer", flexShrink: 0, transition: "all .15s",
//         transform: h ? "translateY(-1px)" : "none",
//       }}
//     >{children}</button>
//   );
// }

// export function Pill({ children, color = "purple" }) {
//   const map = {
//     purple: { bg: T.purpleLight, fg: T.purpleDark },
//     blue:   { bg: T.blueLight,   fg: T.blue   },
//     green:  { bg: T.greenLight,  fg: T.green  },
//     gray:   { bg: "#f3f4f6",     fg: T.textSec},
//   };
//   const { bg, fg } = map[color] || map.gray;
//   return (
//     <span style={{
//       display: "inline-flex", alignItems: "center", background: bg, color: fg,
//       fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 999, whiteSpace: "nowrap",
//     }}>{children}</span>
//   );
// }











import React, { useState } from "react";

/* ─── Design tokens — Zoho-style flat blue theme ─────────────────── */
// 🎨 THEME: repoint these 2 values to re-skin every button, pill, and
// active state across the whole customer module.
export const T = {
  purple:      "#4584E5", // brand accent — matches sidebar active blue
  purpleLight: "#EAF1FD", // light tint
  purpleDark:  "#3568C4", // hover/active shade
  rowHover:    "#F7F9FC",
  border:      "#E5E7EB",
  borderDark:  "#D1D5DB",
  bg:          "#F9FAFB",
  white:       "#ffffff",
  text:        "#111827",
  textSec:     "#6b7280",
  textTer:     "#9ca3af",
  red:         "#DC2626",
  redLight:    "#FEE2E2",
  green:       "#16A34A",
  greenLight:  "#DCFCE7",
  blue:        "#4584E5",
  blueLight:   "#EAF1FD",
  shadow:      "0 1px 2px rgba(17,24,39,0.04)",
  shadowMd:    "0 8px 20px -4px rgba(69,132,229,0.18), 0 2px 6px -2px rgba(69,132,229,0.08)",
  radius:      "6px",
  radiusMd:    "8px",
  radiusLg:    "10px",
};

const AVATAR_BG = [
  ["#dbeafe","#1d4ed8"],["#d1fae5","#065f46"],["#ede9fe","#5b21b6"],
  ["#fde8dc","#9a3412"],["#fef3c7","#92400e"],["#e0f2fe","#0369a1"],
  ["#fce7f3","#9d174d"],["#dcfce7","#166534"],
];
function avatarPalette(name = "") {
  const i = (name.charCodeAt(0) || 0) % AVATAR_BG.length;
  return { bg: AVATAR_BG[i][0], fg: AVATAR_BG[i][1] };
}

export function Avatar({ name = "?", size = 36 }) {
  const { bg, fg } = avatarPalette(name);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: bg, color: fg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 700, fontSize: size * 0.38, flexShrink: 0, userSelect: "none",
      boxShadow: `0 0 0 2.5px ${T.white}, 0 0 0 3.5px ${T.border}`,
    }}>{name.charAt(0).toUpperCase()}</div>
  );
}

export function Btn({ children, onClick, variant = "primary", size = "md", disabled, style: sx }) {
  const [h, setH] = useState(false);
  const base = {
    display: "inline-flex", alignItems: "center", gap: 6,
    borderRadius: T.radiusMd, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
    whiteSpace: "nowrap", lineHeight: 1, border: "none",
    fontSize: size === "sm" ? 12 : 13,
    padding: size === "sm" ? "6px 11px" : "8px 15px",
    opacity: disabled ? 0.55 : 1, transition: "all .15s",
  };
  const variants = {
    primary: {
      background: h ? T.purpleDark : T.purple, color: "#fff",
      boxShadow: h ? T.shadowMd : "0 1px 2px rgba(69,132,229,0.18)",
    },
    ghost:   { background: h ? T.bg : T.white, color: T.text, border: `1px solid ${T.border}` },
    danger:  { background: T.redLight, color: T.red, border: `1px solid #fca5a5` },
  };
  return (
    <button
      onClick={onClick} disabled={disabled}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ ...base, ...variants[variant], ...sx }}
    >
      {children}
    </button>
  );
}

export function IconBtn({ children, onClick, title }) {
  const [h, setH] = useState(false);
  return (
    <button
      title={title} onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
        borderRadius: T.radius, border: `1px solid ${h ? T.borderDark : "transparent"}`,
        background: h ? T.bg : "transparent", cursor: "pointer", flexShrink: 0, transition: "all .15s",
      }}
    >{children}</button>
  );
}

export function Pill({ children, color = "purple" }) {
  const map = {
    purple: { bg: T.purpleLight, fg: T.purpleDark },
    blue:   { bg: T.blueLight,   fg: T.blue   },
    green:  { bg: T.greenLight,  fg: T.green  },
    gray:   { bg: "#f3f4f6",     fg: T.textSec},
  };
  const { bg, fg } = map[color] || map.gray;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", background: bg, color: fg,
      fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 999, whiteSpace: "nowrap",
    }}>{children}</span>
  );
}