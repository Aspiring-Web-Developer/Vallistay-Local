








// import React from "react";
// import { Receipt, Contact2, Building, ShieldCheck, History, Lock } from "lucide-react";
// import "./PermissionMatrix.css";

// /* ---------- shared rules (import these in CreateAccessUser too) ---------- */
// export const ACTIONS = ["view", "create", "update", "delete", "export"];

// // Audit Logs is read / export only
// export const LOCKED_ACTIONS = { audit_logs: ["create", "update", "delete"] };

// export const isLocked = (mod, action) => Boolean(LOCKED_ACTIONS[mod]?.includes(action));
// export const allowedActions = (mod) => ACTIONS.filter((a) => !isLocked(mod, a));
// export const fullPerm = (mod) =>
//   ACTIONS.reduce((o, a) => ({ ...o, [a]: !isLocked(mod, a) }), {});
// export const sanitizePerm = (mod, p) =>
//   ACTIONS.reduce((o, a) => ({ ...o, [a]: isLocked(mod, a) ? false : Boolean(p?.[a]) }), {});

// const ACTION_COLOR = {
//   view: "#2563eb",
//   create: "#059669",
//   update: "#d97706",
//   delete: "#dc2626",
//   export: "#7c3aed",
// };
// const ALL_COLOR = "#0f172a";

// /* ---------- round custom checkbox ---------- */
// function RoundCheck({ checked, partial = false, locked = false, color, label, onChange }) {
//   return (
//     <label
//       className={`am-rc ${locked ? "is-locked" : ""} ${partial ? "is-partial" : ""}`}
//       style={{ "--c": color }}
//       title={locked ? "Not available for this module" : label}
//     >
//       <input
//         type="checkbox"
//         checked={checked}
//         disabled={locked}
//         onChange={onChange}
//         aria-label={label}
//       />
//       <span className="am-rc-dot">
//         {locked ? (
//           <Lock size={10} />
//         ) : (
//           <>
//             <svg viewBox="0 0 16 16" aria-hidden="true">
//               <path d="M3.5 8.5l3 3 6-7" />
//             </svg>
//             <i className="am-rc-bar" />
//           </>
//         )}
//       </span>
//     </label>
//   );
// }

// export default function PermissionMatrix({ permissions, onChange, onSelectAll, onClearAll }) {
//   const modulesList = [
//     {
//       id: "invoice",
//       name: "Invoice",
//       description: "Billing records, payment receipts & statements",
//       icon: <Receipt size={18} color="#d97706" />,
//       iconBg: "#fffbeb",
//     },
//     {
//       id: "customers",
//       name: "Customers",
//       description: "Guest directory, contact cards & profiles",
//       icon: <Contact2 size={18} color="#2563eb" />,
//       iconBg: "#eff6ff",
//     },
//     {
//       id: "departments",
//       name: "Departments",
//       description: "Housekeeping, maintenance & room wings",
//       icon: <Building size={18} color="#059669" />,
//       iconBg: "#ecfdf5",
//     },
//     {
//       id: "access_management",
//       name: "Access Management",
//       description: "Security groups & permission scopes",
//       icon: <ShieldCheck size={18} color="#7c3aed" />,
//       iconBg: "#f5f3ff",
//     },
//     {
//       id: "audit_logs",
//       name: "Audit Logs",
//       description: "Activity history, change logs & compliance reports",
//       icon: <History size={18} color="#e11d48" />,
//       iconBg: "#fff1f2",
//       note: "Read & export only",
//     },
//   ];

//   const handleToggle = (moduleId, field) => {
//     if (!onChange || isLocked(moduleId, field)) return;
//     const current = permissions[moduleId] || {};
//     onChange(moduleId, field, !current[field]);
//   };

//   // one click = select / clear every allowed access in that module
//   const toggleModule = (moduleId, checked) => {
//     if (!onChange) return;
//     allowedActions(moduleId).forEach((a) => onChange(moduleId, a, checked));
//   };

//   return (
//     <div className="am-form-card">
//       <div className="am-matrix-header-row">
//         <div className="am-form-section-header" style={{ marginBottom: 0 }}>
//           <div className="am-step-num">2</div>
//           <div>
//             <div className="am-form-section-title">Module Permissions Matrix</div>
//             <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
//               Enable or disable specific CRUD operations per module
//             </div>
//           </div>
//         </div>

//         <div className="am-matrix-actions">
//           <button type="button" className="am-btn-ghost-sm" onClick={onSelectAll}>
//             Select All
//           </button>
//           <button
//             type="button"
//             className="am-btn-ghost-sm"
//             style={{ color: "#64748b", background: "#f1f5f9" }}
//             onClick={onClearAll}
//           >
//             Clear
//           </button>
//         </div>
//       </div>

//       <div className="am-matrix-scroll">
//         <table className="am-matrix-table am-matrix-table--round">
//           <thead>
//             <tr>
//               <th className="am-matrix-th module-col">Module</th>
//               <th className="am-matrix-th am-cell-center">All</th>
//               {ACTIONS.map((a) => (
//                 <th key={a} className="am-matrix-th am-cell-center">
//                   <span className="am-th-dot" style={{ background: ACTION_COLOR[a] }} />
//                   {a.charAt(0).toUpperCase() + a.slice(1)}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {modulesList.map((mod) => {
//               const modPerms = permissions[mod.id] || {};
//               const allowed = allowedActions(mod.id);
//               const allChecked = allowed.every((a) => modPerms[a]);
//               const someChecked = !allChecked && allowed.some((a) => modPerms[a]);

//               return (
//                 <tr key={mod.id} className="am-tr">
//                   <td className="am-matrix-td module-col">
//                     <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//                       <div className="am-module-icon-box" style={{ background: mod.iconBg }}>
//                         {mod.icon}
//                       </div>
//                       <div style={{ minWidth: 0 }}>
//                         <div className="am-mod-name">
//                           {mod.name}
//                           {mod.note && <span className="am-mod-note">{mod.note}</span>}
//                         </div>
//                         <div className="am-mod-desc">{mod.description}</div>
//                       </div>
//                     </div>
//                   </td>

//                   {/* ALL */}
//                   <td className="am-matrix-td am-cell-center">
//                     <RoundCheck
//                       checked={allChecked}
//                       partial={someChecked}
//                       color={ALL_COLOR}
//                       label={`Select all access for ${mod.name}`}
//                       onChange={(e) => toggleModule(mod.id, e.target.checked)}
//                     />
//                   </td>

//                   {ACTIONS.map((action) => {
//                     const locked = isLocked(mod.id, action);
//                     return (
//                       <td className="am-matrix-td am-cell-center" key={action}>
//                         <RoundCheck
//                           checked={locked ? false : Boolean(modPerms[action])}
//                           locked={locked}
//                           color={ACTION_COLOR[action]}
//                           label={`${action} ${mod.name}`}
//                           onChange={() => handleToggle(mod.id, action)}
//                         />
//                       </td>
//                     );
//                   })}
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }











































// import React from "react";
// import { Receipt, Contact2, Building, ShieldCheck, History, Lock } from "lucide-react";
// import "./PermissionMatrix.css";

// /* ---------- shared rules (import these in CreateAccessUser too) ---------- */
// export const ACTIONS = ["view", "create", "update", "delete", "export"];

// // Audit Logs is read / export only
// export const LOCKED_ACTIONS = { audit_logs: ["create", "update", "delete"] };

// export const isLocked = (mod, action) => Boolean(LOCKED_ACTIONS[mod]?.includes(action));
// export const allowedActions = (mod) => ACTIONS.filter((a) => !isLocked(mod, a));
// export const fullPerm = (mod) =>
//   ACTIONS.reduce((o, a) => ({ ...o, [a]: !isLocked(mod, a) }), {});
// export const sanitizePerm = (mod, p) =>
//   ACTIONS.reduce((o, a) => ({ ...o, [a]: isLocked(mod, a) ? false : Boolean(p?.[a]) }), {});

// const ACTION_COLOR = {
//   view: "#2563eb",
//   create: "#059669",
//   update: "#d97706",
//   delete: "#dc2626",
//   export: "#7c3aed",
// };
// const ALL_COLOR = "#0f172a";

// /* ---------- round custom checkbox ---------- */
// function RoundCheck({ checked, partial = false, locked = false, color, label, onChange }) {
//   return (
//     <label
//       className={`am-rc ${locked ? "is-locked" : ""} ${partial ? "is-partial" : ""}`}
//       style={{ "--c": color }}
//       title={locked ? "Not available for this module" : label}
//     >
//       <input
//         type="checkbox"
//         checked={checked}
//         disabled={locked}
//         onChange={onChange}
//         aria-label={label}
//       />
//       <span className="am-rc-dot">
//         {locked ? (
//           <Lock size={10} />
//         ) : (
//           <>
//             <svg viewBox="0 0 16 16" aria-hidden="true">
//               <path d="M3.5 8.5l3 3 6-7" />
//             </svg>
//             <i className="am-rc-bar" />
//           </>
//         )}
//       </span>
//     </label>
//   );
// }

// export default function PermissionMatrix({ permissions, onChange, onSelectAll, onClearAll }) {
//   const modulesList = [
//     {
//       id: "invoice",
//       name: "Invoice",
//       description: "Billing records, payment receipts & statements",
//       icon: <Receipt size={18} color="#d97706" />,
//       iconBg: "#fffbeb",
//     },
//     {
//       id: "customers",
//       name: "Customers",
//       description: "Guest directory, contact cards & profiles",
//       icon: <Contact2 size={18} color="#2563eb" />,
//       iconBg: "#eff6ff",
//     },
//     {
//       id: "departments",
//       name: "Departments",
//       description: "Housekeeping, maintenance & room wings",
//       icon: <Building size={18} color="#059669" />,
//       iconBg: "#ecfdf5",
//     },
//     {
//       id: "access_management",
//       name: "Access Management",
//       description: "Security groups & permission scopes",
//       icon: <ShieldCheck size={18} color="#7c3aed" />,
//       iconBg: "#f5f3ff",
//     },
//     {
//       id: "audit_logs",
//       name: "Audit Logs",
//       description: "Activity history, change logs & compliance reports",
//       icon: <History size={18} color="#e11d48" />,
//       iconBg: "#fff1f2",
//       note: "Read & export only",
//     },
//   ];

//   const handleToggle = (moduleId, field) => {
//     if (!onChange || isLocked(moduleId, field)) return;
//     const current = permissions[moduleId] || {};
//     onChange(moduleId, field, !current[field]);
//   };

//   // one click = select / clear every allowed access in that module
//   const toggleModule = (moduleId, checked) => {
//     if (!onChange) return;
//     allowedActions(moduleId).forEach((a) => onChange(moduleId, a, checked));
//   };

//   return (
//     <div className="am-form-card">
//       <div className="am-matrix-header-row">
//         <div className="am-form-section-header" style={{ marginBottom: 0 }}>
//           <div className="am-step-num">2</div>
//           <div>
//             <div className="am-form-section-title">Module Permissions Matrix</div>
//             <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
//               Enable or disable specific CRUD operations per module
//             </div>
//           </div>
//         </div>

//         <div className="am-matrix-actions">
//           <button type="button" className="am-btn-ghost-sm" onClick={onSelectAll}>
//             Select All
//           </button>
//           <button
//             type="button"
//             className="am-btn-ghost-sm"
//             style={{ color: "#64748b", background: "#f1f5f9" }}
//             onClick={onClearAll}
//           >
//             Clear
//           </button>
//         </div>
//       </div>

//       <div className="am-matrix-scroll">
//         <table className="am-matrix-table am-matrix-table--round">
//           <thead>
//             <tr>
//               <th className="am-matrix-th module-col">Module</th>
//               <th className="am-matrix-th am-cell-center">All</th>
//               {ACTIONS.map((a) => (
//                 <th key={a} className="am-matrix-th am-cell-center">
//                   <span className="am-th-dot" style={{ background: ACTION_COLOR[a] }} />
//                   {a.charAt(0).toUpperCase() + a.slice(1)}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {modulesList.map((mod) => {
//               const modPerms = permissions[mod.id] || {};
//               const allowed = allowedActions(mod.id);
//               const allChecked = allowed.every((a) => modPerms[a]);
//               const someChecked = !allChecked && allowed.some((a) => modPerms[a]);

//               return (
//                 <tr key={mod.id} className="am-tr">
//                   <td className="am-matrix-td module-col">
//                     <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//                       <div className="am-module-icon-box" style={{ background: mod.iconBg }}>
//                         {mod.icon}
//                       </div>
//                       <div style={{ minWidth: 0 }}>
//                         <div className="am-mod-name">
//                           {mod.name}
//                           {mod.note && <span className="am-mod-note">{mod.note}</span>}
//                         </div>
//                         <div className="am-mod-desc">{mod.description}</div>
//                       </div>
//                     </div>
//                   </td>

//                   {/* ALL */}
//                   <td className="am-matrix-td am-cell-center">
//                     <RoundCheck
//                       checked={allChecked}
//                       partial={someChecked}
//                       color={ALL_COLOR}
//                       label={`Select all access for ${mod.name}`}
//                       onChange={(e) => toggleModule(mod.id, e.target.checked)}
//                     />
//                   </td>

//                   {ACTIONS.map((action) => {
//                     const locked = isLocked(mod.id, action);
//                     return (
//                       <td className="am-matrix-td am-cell-center" key={action}>
//                         <RoundCheck
//                           checked={locked ? false : Boolean(modPerms[action])}
//                           locked={locked}
//                           color={ACTION_COLOR[action]}
//                           label={`${action} ${mod.name}`}
//                           onChange={() => handleToggle(mod.id, action)}
//                         />
//                       </td>
//                     );
//                   })}
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

























import React, { useRef } from "react";
import { History, Lock, Building2 } from "lucide-react";
import "./PermissionMatrix.css";
import { Buildings2 } from "iconsax-react";
/* ---------- shared rules (import these in CreateAccessUser too) ---------- */
export const ACTIONS = ["view", "create", "update", "delete", "export"];

// Audit Logs is read / export only
export const LOCKED_ACTIONS = {
  audit_logs: ["create", "update", "delete"],
  room_booking: ["export"], // no export feature on these pages
};

export const isLocked = (mod, action) => Boolean(LOCKED_ACTIONS[mod]?.includes(action));
export const allowedActions = (mod) => ACTIONS.filter((a) => !isLocked(mod, a));
export const fullPerm = (mod) =>
  ACTIONS.reduce((o, a) => ({ ...o, [a]: !isLocked(mod, a) }), {});
export const sanitizePerm = (mod, p) =>
  ACTIONS.reduce((o, a) => ({ ...o, [a]: isLocked(mod, a) ? false : Boolean(p?.[a]) }), {});

const ACTION_COLOR = {
  view: "#2563eb",
  create: "#059669",
  update: "#d97706",
  delete: "#dc2626",
  export: "#7c3aed",
};
const ALL_COLOR = "#0f172a";

/* ---------- single icon color for all modules ---------- */
const ICON_COLOR = "#4584E5";
const ICON_BG = "#eef4fd";

/* ---------- ICONSAX ICONS ---------- */
const InvoiceIcon = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 10V15C22 20 20 22 15 22H9C4 22 2 20 2 15V9C2 4 4 2 9 2H14" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M22 10H18C15 10 14 9 14 6V2L22 10Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 13H13" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 17H11" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CustomerIcon = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.16006 10.87C9.06006 10.86 8.94006 10.86 8.83006 10.87C6.45006 10.79 4.56006 8.84 4.56006 6.44C4.56006 3.99 6.54006 2 9.00006 2C11.4501 2 13.4401 3.99 13.4401 6.44C13.4301 8.84 11.5401 10.79 9.16006 10.87Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16.4098 4C18.3498 4 19.9098 5.57 19.9098 7.5C19.9098 9.39 18.4098 10.93 16.5398 11C16.4598 10.99 16.3698 10.99 16.2798 11" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4.16021 14.56C1.74021 16.18 1.74021 18.82 4.16021 20.43C6.91021 22.27 11.4202 22.27 14.1702 20.43C16.5902 18.81 16.5902 16.17 14.1702 14.56C11.4302 12.73 6.92021 12.73 4.16021 14.56Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18.3398 20C19.0598 19.85 19.7398 19.56 20.2998 19.13C21.8598 17.96 21.8598 16.03 20.2998 14.86C19.7498 14.44 19.0798 14.16 18.3698 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DepartmentIcon = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 13.02V15C2 20 4 22 9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7.7998 13.7996V9.59961" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7.95001 17.9996C9.02697 17.9996 9.90002 17.1265 9.90002 16.0496C9.90002 14.9726 9.02697 14.0996 7.95001 14.0996C6.87306 14.0996 6 14.9726 6 16.0496C6 17.1265 6.87306 17.9996 7.95001 17.9996Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7.79999 9.60001C8.7941 9.60001 9.59998 8.7941 9.59998 7.79999C9.59998 6.80588 8.7941 6 7.79999 6C6.80588 6 6 6.80588 6 7.79999C6 8.7941 6.80588 9.60001 7.79999 9.60001Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16.1999 9.60001C17.194 9.60001 17.9999 8.7941 17.9999 7.79999C17.9999 6.80588 17.194 6 16.1999 6C15.2058 6 14.3999 6.80588 14.3999 7.79999C14.3999 8.7941 15.2058 9.60001 16.1999 9.60001Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7.87988 13.8001C8.14988 12.7501 9.10987 11.9701 10.2399 11.9801L12.2999 11.9901C13.8699 12.0001 15.2099 10.9901 15.6999 9.58008" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const AccessIcon = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.08984 6.73028C3.08984 5.91028 3.70986 4.98028 4.47986 4.67028L10.0498 2.39031C11.2998 1.88031 12.7098 1.88031 13.9598 2.39031L19.5298 4.67028C20.2898 4.98028 20.9199 5.91028 20.9199 6.73028V11.1203C20.9199 16.0103 17.3698 20.5903 12.5198 21.9303C12.1898 22.0203 11.8298 22.0203 11.4998 21.9303C6.64985 20.5903 3.09985 16.0103 3.09985 11.1203" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 12.5C13.1046 12.5 14 11.6046 14 10.5C14 9.39543 13.1046 8.5 12 8.5C10.8954 8.5 10 9.39543 10 10.5C10 11.6046 10.8954 12.5 12 12.5Z" stroke={color} strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 12.5V15.5" stroke={color} strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ---------- round custom checkbox ---------- */
function RoundCheck({ checked, partial = false, locked = false, color, label, onChange }) {
  return (
    <label
      className={`am-rc ${locked ? "is-locked" : ""} ${partial ? "is-partial" : ""}`}
      style={{ "--c": color }}
      title={locked ? "Not available for this module" : label}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={locked}
        onChange={onChange}
        aria-label={label}
      />
      <span className="am-rc-dot">
        {locked ? (
          <Lock size={10} />
        ) : (
          <>
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M3.5 8.5l3 3 6-7" />
            </svg>
            <i className="am-rc-bar" />
          </>
        )}
      </span>
    </label>
  );
}

export default function PermissionMatrix({ permissions, onChange, onSelectAll, onClearAll }) {
  // remembers what each module looked like before "All" was clicked
  const prevSelection = useRef({});

  const modulesList = [
    {
      id: "invoice",
      name: "Invoice",
      description: "Billing records, payment receipts & statements",
      icon: <InvoiceIcon size={18} color={ICON_COLOR} />,
    },
    {
      id: "customers",
      name: "Guest",
      description: "Guest directory, contact cards & profiles",
      icon: <CustomerIcon size={18} color={ICON_COLOR} />,
    },
    {
      id: "departments",
      name: "Departments",
      description: "Manage departments for invoices & billing",
      icon: <Buildings2 size={18} color={ICON_COLOR} />,
    },
        {
      id: "room_booking",
      name: "Room & Booking",
      description: "Properties, rooms, availability & guest bookings",
      icon: <Building2 size={18} strokeWidth={1.5} color={ICON_COLOR} />,
      note: "No export",
    },
    {
      id: "access_management",
      name: "Access Management",
      description: "Security groups & permission scopes",
      icon: <AccessIcon size={18} color={ICON_COLOR} />,
    },
    {
      id: "audit_logs",
      name: "Audit Logs",
      description: "Activity history, change logs & compliance reports",
      icon: <History size={18} strokeWidth={1.5} color={ICON_COLOR} />,
      note: "Read & export only",
    },
  ];

  const handleToggle = (moduleId, field) => {
    if (!onChange || isLocked(moduleId, field)) return;
    const current = permissions[moduleId] || {};
    onChange(moduleId, field, !current[field]);
  };

  // "All" checkbox:
  //  - check   -> save what user had selected, then select everything
  //  - uncheck -> restore the saved selection (or clear if nothing was saved)
  const toggleModule = (moduleId, checked) => {
    if (!onChange) return;
    const actions = allowedActions(moduleId);

    if (checked) {
      prevSelection.current[moduleId] = sanitizePerm(moduleId, permissions[moduleId]);
      actions.forEach((a) => onChange(moduleId, a, true));
      return;
    }

    const saved = prevSelection.current[moduleId];
    delete prevSelection.current[moduleId];

    // set non-view actions first, view last, so the
    // "any action turns view on" rule can't override the restore
    const ordered = [...actions.filter((a) => a !== "view"), ...actions.filter((a) => a === "view")];
    ordered.forEach((a) => onChange(moduleId, a, saved ? Boolean(saved[a]) : false));
  };

  return (
    <div className="am-form-card">
      <div className="am-matrix-header-row">
        <div className="am-form-section-header" style={{ marginBottom: 0 }}>
          <div className="am-step-num">2</div>
          <div>
            <div className="am-form-section-title">Menu Permissions</div>
            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
              Choose which menus this user can open and what they can do in each
            </div>
          </div>
        </div>

        <div className="am-matrix-actions">
          <button type="button" className="am-btn-ghost-sm" onClick={onSelectAll}>
            Select All
          </button>
          <button
            type="button"
            className="am-btn-ghost-sm"
            style={{ color: "#64748b", background: "#f1f5f9" }}
            onClick={onClearAll}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="am-matrix-scroll">
        <table className="am-matrix-table am-matrix-table--round">
          <thead>
            <tr>
              <th className="am-matrix-th module-col">Module</th>
              <th className="am-matrix-th am-cell-center">All</th>
              {ACTIONS.map((a) => (
                <th key={a} className="am-matrix-th am-cell-center">
                  <span className="am-th-dot" style={{ background: ACTION_COLOR[a] }} />
                  {a.charAt(0).toUpperCase() + a.slice(1)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {modulesList.map((mod) => {
              const modPerms = permissions[mod.id] || {};
              const allowed = allowedActions(mod.id);
              const allChecked = allowed.every((a) => modPerms[a]);
              const someChecked = !allChecked && allowed.some((a) => modPerms[a]);

              return (
                <tr key={mod.id} className="am-tr">
                  <td className="am-matrix-td module-col">
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div className="am-module-icon-box" style={{ background: ICON_BG }}>
                        {mod.icon}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div className="am-mod-name">
                          {mod.name}
                          {mod.note && <span className="am-mod-note">{mod.note}</span>}
                        </div>
                        <div className="am-mod-desc">{mod.description}</div>
                      </div>
                    </div>
                  </td>

                  {/* ALL */}
                  <td className="am-matrix-td am-cell-center">
                    <RoundCheck
                      checked={allChecked}
                      partial={someChecked}
                      color={ALL_COLOR}
                      label={`Select all access for ${mod.name}`}
                      onChange={(e) => toggleModule(mod.id, e.target.checked)}
                    />
                  </td>

                  {ACTIONS.map((action) => {
                    const locked = isLocked(mod.id, action);
                    return (
                      <td className="am-matrix-td am-cell-center" key={action}>
                        <RoundCheck
                          checked={locked ? false : Boolean(modPerms[action])}
                          locked={locked}
                          color={ACTION_COLOR[action]}
                          label={`${action} ${mod.name}`}
                          onChange={() => handleToggle(mod.id, action)}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}