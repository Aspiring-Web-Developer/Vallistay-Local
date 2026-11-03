










// import React, { useState, useEffect, useRef } from "react";
// import { createPortal } from "react-dom";
// import { Receipt, Contact2, Building, Key, ShieldCheck, MoreHorizontal, Eye, FileText, LogOut } from "lucide-react";
// import AuditActionBadge from "./AuditActionBadge";

// const MENU_W = 170;
// const MENU_H = 92;

// const isLogout = (event) =>
//   String(event.action || "").toLowerCase() === "logout" ||
//   String(event.action_label || "").toLowerCase() === "logout";

// const LogoutBadge = ({ label }) => (
//   <span
//     style={{
//       display: "inline-flex",
//       alignItems: "center",
//       gap: 5,
//       padding: "3px 10px",
//       fontSize: 12,
//       fontWeight: 600,
//       color: "#dc2626",
//       background: "#fee2e2",
//       border: "1px solid #fecaca",
//       borderRadius: 999,
//       whiteSpace: "nowrap",
//     }}
//   >
//     <LogOut size={12} />
//     {label || "Logout"}
//   </span>
// );

// export default function AuditTable({ events, onSelectEvent, onDownloadEventPdf }) {
//   const [menu, setMenu] = useState(null); // { event, top, left }
//   const menuRef = useRef(null);

//   useEffect(() => {
//     const close = () => setMenu(null);
//     const onDown = (e) => {
//       if (menuRef.current?.contains(e.target)) return;
//       if (e.target.closest?.("[data-menu-btn]")) return;
//       close();
//     };
//     document.addEventListener("mousedown", onDown);
//     window.addEventListener("scroll", close, true);
//     window.addEventListener("resize", close);
//     return () => {
//       document.removeEventListener("mousedown", onDown);
//       window.removeEventListener("scroll", close, true);
//       window.removeEventListener("resize", close);
//     };
//   }, []);

//   const getModuleIcon = (moduleKey) => {
//     const key = (moduleKey || "").toLowerCase();
//     if (key.includes("invoice")) return <Receipt size={14} color="#d97706" />;
//     if (key.includes("customer")) return <Contact2 size={14} color="#2563eb" />;
//     if (key.includes("department")) return <Building size={14} color="#059669" />;
//     if (key.includes("auth")) return <Key size={14} color="#4b5563" />;
//     return <ShieldCheck size={14} color="#7c3aed" />;
//   };

//   const toggleMenu = (e, event) => {
//     e.stopPropagation();
//     if (menu?.event.audit_id === event.audit_id) return setMenu(null);
//     const r = e.currentTarget.getBoundingClientRect();
//     const openUp = window.innerHeight - r.bottom < MENU_H + 12;
//     setMenu({
//       event,
//       top: openUp ? r.top - MENU_H - 6 : r.bottom + 6,
//       left: Math.max(8, r.right - MENU_W),
//     });
//   };

//   return (
//     <div className="al-table-container">
//       <table className="al-table">
//         <thead>
//           <tr>
//             <th className="al-th" style={{ width: "17%" }}>Date & Time</th>
//             <th className="al-th" style={{ width: "22%" }}>Performed By</th>
//             <th className="al-th" style={{ width: "12%" }}>Action</th>
//             <th className="al-th" style={{ width: "15%" }}>Module</th>
//             <th className="al-th">Description</th>
//             <th className="al-th" style={{ width: "10%" }}>Status</th>
//             <th className="al-th" style={{ width: "6%", textAlign: "center" }}>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {events.map((event) => {
//             const isFailed = event.status === "failed";
//             const isOpen = menu?.event.audit_id === event.audit_id;
//             return (
//               <tr key={event.audit_id} className="al-tr" onClick={() => onSelectEvent(event)} title="Click to view event details">
//                 <td className="al-td">
//                   <span className="al-datetime-primary">{event.formatted_date}</span>
//                 </td>

//                 <td className="al-td">
//                   <div className="al-user-cell">
//                     <div
//                       className="al-avatar-circle"
//                       style={{
//                         background: event.performed_by_name === "Administrator" ? "#0f172a"
//                           : event.performed_by_name === "Unknown Client" ? "#fee2e2" : "#e0f2fe",
//                         color: event.performed_by_name === "Administrator" ? "#ffffff"
//                           : event.performed_by_name === "Unknown Client" ? "#dc2626" : "#0284c7",
//                       }}
//                     >
//                       {event.performed_by_avatar || "U"}
//                     </div>
//                     <div className="al-user-info">
//                       <span className="al-user-name">{event.performed_by_name}</span>
//                       <span className="al-user-sub">{event.performed_by_email} • {event.performed_by_role}</span>
//                     </div>
//                   </div>
//                 </td>

//                 <td className="al-td">
//                   {isLogout(event) ? (
//                     <LogoutBadge label={event.action_label} />
//                   ) : (
//                     <AuditActionBadge action={event.action} />
//                   )}
//                 </td>

//                 <td className="al-td">
//                   <span className="al-module-pill">
//                     {getModuleIcon(event.module_key)}
//                     {event.module_name}
//                   </span>
//                 </td>

//                 <td className="al-td">
//                   <div className={`al-desc-text ${isFailed ? "error" : ""}`}>{event.description}</div>
//                 </td>

//                 <td className="al-td">
//                   <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 600, fontSize: 12.5, color: isFailed ? "#dc2626" : "#16a34a" }}>
//                     <span style={{ width: 6, height: 6, borderRadius: "50%", background: isFailed ? "#dc2626" : "#16a34a" }} />
//                     {isFailed ? "Failed" : "Success"}
//                   </span>
//                 </td>

//                 <td className="al-td" style={{ textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
//                   <button
//                     type="button"
//                     data-menu-btn
//                     className={`al-menu-btn ${isOpen ? "open" : ""}`}
//                     onClick={(e) => toggleMenu(e, event)}
//                     title="More actions"
//                   >
//                     <MoreHorizontal size={18} />
//                   </button>
//                 </td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>

//       {menu &&
//         createPortal(
//           <div ref={menuRef} className="al-menu" style={{ top: menu.top, left: menu.left, width: MENU_W }}>
//             <button type="button" className="al-menu-item" onClick={() => { const ev = menu.event; setMenu(null); onSelectEvent(ev); }}>
//               <Eye size={14} color="#2563eb" /> View Details
//             </button>
//             <button type="button" className="al-menu-item" onClick={() => { const ev = menu.event; setMenu(null); onDownloadEventPdf?.(ev); }}>
//               <FileText size={14} color="#ea580c" /> Download PDF
//             </button>
//           </div>,
//           document.body
//         )}
//     </div>
//   );
// }






















































// import React, { useState, useEffect, useRef } from "react";
// import { createPortal } from "react-dom";
// import { Receipt, Contact2, Building, Key, ShieldCheck, MoreHorizontal, Eye, FileText, LogOut } from "lucide-react";
// import AuditActionBadge from "./AuditActionBadge";

// const MENU_W = 180;
// const MENU_H = 104; // 2 items, touch-sized

// const isLogout = (event) =>
//   String(event.action || "").toLowerCase() === "logout" ||
//   String(event.action_label || "").toLowerCase() === "logout";

// const LogoutBadge = ({ label }) => (
//   <span
//     style={{
//       display: "inline-flex",
//       alignItems: "center",
//       gap: 5,
//       padding: "3px 10px",
//       fontSize: 12,
//       fontWeight: 600,
//       color: "#dc2626",
//       background: "#fee2e2",
//       border: "1px solid #fecaca",
//       borderRadius: 999,
//       whiteSpace: "nowrap",
//     }}
//   >
//     <LogOut size={12} />
//     {label || "Logout"}
//   </span>
// );

// export default function AuditTable({ events, onSelectEvent, onDownloadEventPdf }) {
//   const [menu, setMenu] = useState(null); // { event, top, left }
//   const menuRef = useRef(null);

//   useEffect(() => {
//     const close = () => setMenu(null);
//     const onDown = (e) => {
//       if (menuRef.current?.contains(e.target)) return;
//       if (e.target.closest?.("[data-menu-btn]")) return;
//       close();
//     };
//     // pointerdown covers mouse + touch + pen
//     document.addEventListener("pointerdown", onDown);
//     window.addEventListener("scroll", close, true);
//     window.addEventListener("resize", close);
//     return () => {
//       document.removeEventListener("pointerdown", onDown);
//       window.removeEventListener("scroll", close, true);
//       window.removeEventListener("resize", close);
//     };
//   }, []);

//   const getModuleIcon = (moduleKey) => {
//     const key = (moduleKey || "").toLowerCase();
//     if (key.includes("invoice")) return <Receipt size={14} color="#d97706" />;
//     if (key.includes("customer")) return <Contact2 size={14} color="#2563eb" />;
//     if (key.includes("department")) return <Building size={14} color="#059669" />;
//     if (key.includes("auth")) return <Key size={14} color="#4b5563" />;
//     return <ShieldCheck size={14} color="#7c3aed" />;
//   };

//   const toggleMenu = (e, event) => {
//     e.stopPropagation();
//     if (menu?.event.audit_id === event.audit_id) return setMenu(null);
//     const r = e.currentTarget.getBoundingClientRect();
//     const openUp = window.innerHeight - r.bottom < MENU_H + 12;
//     // keep the menu fully on-screen (important on phones / narrow tablets)
//     const left = Math.min(
//       Math.max(8, r.right - MENU_W),
//       window.innerWidth - MENU_W - 8
//     );
//     setMenu({
//       event,
//       top: openUp ? r.top - MENU_H - 6 : r.bottom + 6,
//       left,
//     });
//   };

//   const onRowKey = (e, event) => {
//     if (e.key === "Enter" || e.key === " ") {
//       e.preventDefault();
//       onSelectEvent(event);
//     }
//   };

//   return (
//     <div className="al-table-container">
//       <table className="al-table">
//         <thead>
//           <tr>
//             <th className="al-th al-th--date">Date & Time</th>
//             <th className="al-th al-th--user">Performed By</th>
//             <th className="al-th al-th--action">Action</th>
//             <th className="al-th al-th--module">Module</th>
//             <th className="al-th al-th--desc">Description</th>
//             <th className="al-th al-th--status">Status</th>
//             <th className="al-th al-th--menu">Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {events.map((event) => {
//             const isFailed = event.status === "failed";
//             const isOpen = menu?.event.audit_id === event.audit_id;
//             return (
//               <tr
//                 key={event.audit_id}
//                 className={`al-tr ${isFailed ? "al-tr--failed" : ""}`}
//                 onClick={() => onSelectEvent(event)}
//                 onKeyDown={(e) => onRowKey(e, event)}
//                 tabIndex={0}
//                 title="Click to view event details"
//               >
//                 <td className="al-td al-td--date">
//                   <span className="al-datetime-primary">{event.formatted_date}</span>
//                 </td>

//                 <td className="al-td al-td--user">
//                   <div className="al-user-cell">
//                     <div
//                       className="al-avatar-circle"
//                       style={{
//                         background: event.performed_by_name === "Administrator" ? "#0f172a"
//                           : event.performed_by_name === "Unknown Client" ? "#fee2e2" : "#e0f2fe",
//                         color: event.performed_by_name === "Administrator" ? "#ffffff"
//                           : event.performed_by_name === "Unknown Client" ? "#dc2626" : "#0284c7",
//                       }}
//                     >
//                       {event.performed_by_avatar || "U"}
//                     </div>
//                     <div className="al-user-info">
//                       <span className="al-user-name">{event.performed_by_name}</span>
//                       <span className="al-user-sub">{event.performed_by_email} • {event.performed_by_role}</span>
//                     </div>
//                   </div>
//                 </td>

//                 <td className="al-td al-td--action">
//                   {isLogout(event) ? (
//                     <LogoutBadge label={event.action_label} />
//                   ) : (
//                     <AuditActionBadge action={event.action} />
//                   )}
//                 </td>

//                 <td className="al-td al-td--module">
//                   <span className="al-module-pill">
//                     {getModuleIcon(event.module_key)}
//                     <span className="al-module-name">{event.module_name}</span>
//                   </span>
//                 </td>

//                 <td className="al-td al-td--desc">
//                   <div className={`al-desc-text ${isFailed ? "error" : ""}`} title={event.description}>
//                     {event.description}
//                   </div>
//                 </td>

//                 <td className="al-td al-td--status">
//                   <span className="al-status" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 600, fontSize: 12.5, color: isFailed ? "#dc2626" : "#16a34a" }}>
//                     <span style={{ width: 6, height: 6, borderRadius: "50%", background: isFailed ? "#dc2626" : "#16a34a" }} />
//                     {isFailed ? "Failed" : "Success"}
//                   </span>
//                 </td>

//                 <td className="al-td al-td--menu" style={{ textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
//                   <button
//                     type="button"
//                     data-menu-btn
//                     className={`al-menu-btn ${isOpen ? "open" : ""}`}
//                     onClick={(e) => toggleMenu(e, event)}
//                     title="More actions"
//                     aria-label="More actions"
//                     aria-haspopup="menu"
//                     aria-expanded={isOpen}
//                   >
//                     <MoreHorizontal size={18} />
//                   </button>
//                 </td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>

//       {menu &&
//         createPortal(
//           <div ref={menuRef} className="al-menu" style={{ top: menu.top, left: menu.left, width: MENU_W }}>
//             <button type="button" className="al-menu-item" onClick={() => { const ev = menu.event; setMenu(null); onSelectEvent(ev); }}>
//               <Eye size={14} color="#2563eb" /> View Details
//             </button>
//             <button type="button" className="al-menu-item" onClick={() => { const ev = menu.event; setMenu(null); onDownloadEventPdf?.(ev); }}>
//               <FileText size={14} color="#ea580c" /> Download PDF
//             </button>
//           </div>,
//           document.body
//         )}
//     </div>
//   );
// }























import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Key, History, MoreHorizontal, Eye, FileText, LogOut } from "lucide-react";
import AuditActionBadge from "./AuditActionBadge";

const MENU_W = 180;
// const MENU_H = 104; // 2 items, touch-sized
const ITEM_H = 48;

/* ---------- single icon color for all modules ---------- */
const ICON_COLOR = "#4584E5";

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

const isLogout = (event) =>
  String(event.action || "").toLowerCase() === "logout" ||
  String(event.action_label || "").toLowerCase() === "logout";

const LogoutBadge = ({ label }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      padding: "3px 10px",
      fontSize: 12,
      fontWeight: 600,
      color: "#dc2626",
      background: "#fee2e2",
      border: "1px solid #fecaca",
      borderRadius: 999,
      whiteSpace: "nowrap",
    }}
  >
    <LogOut size={12} />
    {label || "Logout"}
  </span>
);

export default function AuditTable({ events, onSelectEvent, onDownloadEventPdf,canExport = false }) {
  const [menu, setMenu] = useState(null); // { event, top, left }
  const menuRef = useRef(null);
const menuH = (canExport ? 2 : 1) * ITEM_H + 8;
// const openUp = window.innerHeight - r.bottom < menuH + 12;

  useEffect(() => {
    const close = () => setMenu(null);
    const onDown = (e) => {
      if (menuRef.current?.contains(e.target)) return;
      if (e.target.closest?.("[data-menu-btn]")) return;
      close();
    };
    // pointerdown covers mouse + touch + pen
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, []);

  const getModuleIcon = (moduleKey) => {
    const key = (moduleKey || "").toLowerCase();
    if (key.includes("invoice")) return <InvoiceIcon size={14} color={ICON_COLOR} />;
    if (key.includes("customer")) return <CustomerIcon size={14} color={ICON_COLOR} />;
    if (key.includes("department")) return <DepartmentIcon size={14} color={ICON_COLOR} />;
    if (key.includes("auth")) return <Key size={14} strokeWidth={1.5} color={ICON_COLOR} />;
    if (key.includes("audit")) return <History size={14} strokeWidth={1.5} color={ICON_COLOR} />;
    return <AccessIcon size={14} color={ICON_COLOR} />;
  };

  const toggleMenu = (e, event) => {
    e.stopPropagation();
    if (menu?.event.audit_id === event.audit_id) return setMenu(null);
const r = e.currentTarget.getBoundingClientRect();
const openUp = window.innerHeight - r.bottom < menuH + 12;
    // keep the menu fully on-screen (important on phones / narrow tablets)
    const left = Math.min(
      Math.max(8, r.right - MENU_W),
      window.innerWidth - MENU_W - 8
    );
setMenu({
  event,
  top: openUp ? r.top - menuH - 6 : r.bottom + 6,
  left,
});
  };

  const onRowKey = (e, event) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelectEvent(event);
    }
  };

  return (
    <div className="al-table-container">
      <table className="al-table">
        <thead>
          <tr>
            <th className="al-th al-th--date">Date & Time</th>
            <th className="al-th al-th--user">Performed By</th>
            <th className="al-th al-th--action">Action</th>
            <th className="al-th al-th--module">Module</th>
            <th className="al-th al-th--desc">Description</th>
            <th className="al-th al-th--status">Status</th>
            <th className="al-th al-th--menu">Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => {
            const isFailed = event.status === "failed";
            const isOpen = menu?.event.audit_id === event.audit_id;
            return (
              <tr
                key={event.audit_id}
                className={`al-tr ${isFailed ? "al-tr--failed" : ""}`}
                onClick={() => onSelectEvent(event)}
                onKeyDown={(e) => onRowKey(e, event)}
                tabIndex={0}
                title="Click to view event details"
              >
                <td className="al-td al-td--date">
                  <span className="al-datetime-primary">{event.formatted_date}</span>
                </td>

                <td className="al-td al-td--user">
                  <div className="al-user-cell">
                    <div
                      className="al-avatar-circle"
                      style={{
                        background: event.performed_by_name === "Administrator" ? "#0f172a"
                          : event.performed_by_name === "Unknown Client" ? "#fee2e2" : "#e0f2fe",
                        color: event.performed_by_name === "Administrator" ? "#ffffff"
                          : event.performed_by_name === "Unknown Client" ? "#dc2626" : "#0284c7",
                      }}
                    >
                      {event.performed_by_avatar || "U"}
                    </div>
                    <div className="al-user-info">
                      <span className="al-user-name">{event.performed_by_name}</span>
                      <span className="al-user-sub">{event.performed_by_email} • {event.performed_by_role}</span>
                    </div>
                  </div>
                </td>

                <td className="al-td al-td--action">
                  {isLogout(event) ? (
                    <LogoutBadge label={event.action_label} />
                  ) : (
                    <AuditActionBadge action={event.action} />
                  )}
                </td>

                <td className="al-td al-td--module">
                  <span className="al-module-pill">
                    {getModuleIcon(event.module_key)}
                    <span className="al-module-name">{event.module_name}</span>
                  </span>
                </td>

                <td className="al-td al-td--desc">
                  <div className={`al-desc-text ${isFailed ? "error" : ""}`} title={event.description}>
                    {event.description}
                  </div>
                </td>

                <td className="al-td al-td--status">
                  <span className="al-status" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 600, fontSize: 12.5, color: isFailed ? "#dc2626" : "#16a34a" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: isFailed ? "#dc2626" : "#16a34a" }} />
                    {isFailed ? "Failed" : "Success"}
                  </span>
                </td>

                <td className="al-td al-td--menu" style={{ textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    data-menu-btn
                    className={`al-menu-btn ${isOpen ? "open" : ""}`}
                    onClick={(e) => toggleMenu(e, event)}
                    title="More actions"
                    aria-label="More actions"
                    aria-haspopup="menu"
                    aria-expanded={isOpen}
                  >
                    <MoreHorizontal size={18} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {menu &&
        createPortal(
          <div ref={menuRef} className="al-menu" style={{ top: menu.top, left: menu.left, width: MENU_W }}>
            <button type="button" className="al-menu-item" onClick={() => { const ev = menu.event; setMenu(null); onSelectEvent(ev); }}>
              <Eye size={14} color="#2563eb" /> View Details
            </button>
{canExport && (
  <button type="button" className="al-menu-item" onClick={() => { const ev = menu.event; setMenu(null); onDownloadEventPdf?.(ev); }}>
    <FileText size={14} color="#ea580c" /> Download PDF
  </button>
)}
          </div>,
          document.body
        )}
    </div>
  );
}