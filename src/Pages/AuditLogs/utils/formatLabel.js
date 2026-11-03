// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { X, User, Clock, ExternalLink } from "lucide-react";
// import AuditActionBadge from "./AuditActionBadge";
// import BeforeAfterTable from "./BeforeAfterTable";
// import { formatLabel } from "./utils/formatLabel";

// export default function AuditEventDrawer({ event, isOpen, onClose }) {
//   const navigate = useNavigate();
//   if (!isOpen || !event) return null;

//   const failed = event.status === "failed";
//   const userPath = event.performed_by_user_id
//     ? `/audit-logs/user/${event.performed_by_user_id}` // ⚠️ change to your real route
//     : null;

//   const goToUser = () => {
//     onClose();
//     if (userPath) navigate(userPath);
//   };

//   // "Update operation performed on sub_rooms." -> "... on Sub Rooms."
//   const description = event.description
//     ? event.description.replace(/\b[a-z]+(?:_[a-z]+)+\b/g, (m) => formatLabel(m))
//     : "";

//   return (
//     <>
//       <div className="al-drawer-backdrop" onClick={onClose} />
//       <aside className="al-drawer">
//         <div className="al-drawer-header">
//           <div className="al-drawer-title-group">
//             <h2 className="al-drawer-title">Audit Event Details</h2>
//           </div>
//           <button type="button" className="al-drawer-close" onClick={onClose}>
//             <X size={18} />
//           </button>
//         </div>

//         <div className="al-drawer-content">
//           {/* Status row */}
//           <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
//             <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
//               <span
//                 style={{
//                   padding: "3px 10px", borderRadius: 9999, fontSize: 12, fontWeight: 600,
//                   background: failed ? "#fef2f2" : "#ecfdf5", color: failed ? "#dc2626" : "#059669",
//                 }}
//               >
//                 {failed ? "Failed" : "Success"}
//               </span>
//               <AuditActionBadge action={event.action} />
//               <span className="al-module-pill">{formatLabel(event.module_name)}</span>
//             </div>
//             <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "#64748b" }}>
//               <Clock size={14} /> {event.formatted_date}
//             </span>
//           </div>

//           {/* Description */}
//           <div className="al-drawer-card" style={{ fontSize: 14, color: "#0f172a" }}>
//             {description}
//           </div>

//           {/* Actor */}
//           <div className="al-drawer-card">
//             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
//               <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.05em" }}>
//                 ACTOR / PERFORMED BY
//               </span>
//               {userPath && (
//                 <button
//                   type="button" onClick={goToUser}
//                   style={{ background: "none", border: "none", color: "#2563eb", fontWeight: 600, fontSize: 12.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
//                 >
//                   View User Activity <ExternalLink size={13} />
//                 </button>
//               )}
//             </div>
//             <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//               <div className="al-avatar-circle" style={{ width: 46, height: 46, fontSize: 15 }}>
//                 {event.performed_by_avatar || "U"}
//               </div>
//               <div>
//                 <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 15 }}>{event.performed_by_name}</div>
//                 <div style={{ fontSize: 12.5, color: "#64748b" }}>
//                   {event.performed_by_email} • {event.performed_by_role}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Changes */}
//           <div>
//             <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>
//               {event.action === "create" ? "Created Values" : "Changes (Before & After)"}
//             </div>
//             <BeforeAfterTable
//               action={event.action}
//               changedFields={event.changed_fields}
//               oldValue={event.old_value}
//               newValue={event.new_value}
//             />
//           </div>
//         </div>

//         <div className="al-drawer-footer">
//           {userPath ? (
//             <button type="button" className="al-btn-action" onClick={goToUser}>
//               <User size={15} /> User Audit Trail
//             </button>
//           ) : <span />}
//           <button
//             type="button" className="al-btn-action" onClick={onClose}
//             style={{ background: "#2563eb", color: "#fff", borderColor: "#2563eb" }}
//           >
//             Close Details
//           </button>
//         </div>
//       </aside>
//     </>
//   );
// }



















// src/Pages/AuditLogs/utils/formatLabel.js
const ACRONYMS = {
  id: "ID",
  uuid: "UUID",
  url: "URL",
  pdf: "PDF",
  gst: "GST",
  ip: "IP",
  api: "API",
};

// "sub_rooms" -> "Sub Rooms", "updated_by_user_id" -> "Updated By User ID"
export const formatLabel = (value) => {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((w) => {
      const lower = w.toLowerCase();
      return ACRONYMS[lower] || lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
};