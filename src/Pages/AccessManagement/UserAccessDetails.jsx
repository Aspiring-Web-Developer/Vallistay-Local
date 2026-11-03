// import React, { useState, useEffect } from "react";
// import { Link, useParams, useNavigate } from "react-router-dom";
// import {
//   ArrowLeft,
//   Pencil,
//   Trash2,
//   Receipt,
//   Contact2,
//   Building,
//   ShieldCheck,
//   Check,
//   X,
//   RotateCw,
//   AlertCircle,
//   History
// } from "lucide-react";
// import { useToast } from "../Stays/Rooms/Room_Shared";
// import "./AccessManagement.css";
// import { fetchUserById, deleteUser } from "./services/accessManagementApi";
// import ConfirmModal from "./ConfirmModal";
// import { useAccess } from "../../services/AccessContext";



// export default function UserAccessDetails() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { push: toast, ToastHost } = useToast();
// const { can } = useAccess();
// const canUpdate = can("access_management", "update");
// const canDelete = can("access_management", "delete");
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
// const [deleting, setDeleting] = useState(false);

//   const MODULE_CARDS = [
//   { key: "invoice", title: "Invoice Module", desc: "Billing & invoices", icon: Receipt, bg: "#fffbeb", fg: "#d97706" },
//   { key: "customers", title: "Customers Module", desc: "Directory management", icon: Contact2, bg: "#eff6ff", fg: "#2563eb" },
//   { key: "departments", title: "Departments", desc: "Department units", icon: Building, bg: "#f0fdf4", fg: "#16a34a" },
//   { key: "access_management", title: "Access Management", desc: "Users & permissions", icon: ShieldCheck, bg: "#f5f3ff", fg: "#7c3aed" },
//   { key: "audit_logs", title: "Audit Logs", desc: "Activity & compliance", icon: History, bg: "#fff1f2", fg: "#e11d48" },
// ];
// const ACTIONS = ["view", "create", "update", "delete", "export"];
//   const loadUserDetails = async () => {
//     if (!id) return;
//     setLoading(true);
//     setError(null);
//     try {
//       const data = await fetchUserById(id);
//       setUser(data);
//     } catch (err) {
//       console.error("Error loading user profile:", err);
//       setError(err?.message || "We couldn’t load this user’s details.");
//       toast("We couldn’t load this user’s details.", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadUserDetails();
//   }, [id]);

//   // const handleConfirmDelete = () => {
//   //   setShowDeleteModal(false);
//   //   toast(`User ${user?.full_name || "account"} has been removed.`, "success");
//   //   setTimeout(() => {
//   //     navigate("/access-management");
//   //   }, 1200);
//   // };


//   const handleConfirmDelete = async () => {
//   if (!user?.user_id || deleting) return;
//   setDeleting(true);
//   try {
//     await deleteUser(user.user_id);
//     setShowDeleteModal(false);
//     toast(`User ${user.full_name || "account"} has been removed.`, "success");
//     setTimeout(() => navigate("/access-management"), 1000);
//   } catch (err) {
//     console.error("Failed to delete user:", err);
//     setShowDeleteModal(false);
//     toast(err?.response?.data?.message || err?.message || "We couldn't delete this user. Please try again.", "error");
//   } finally {
//     setDeleting(false);
//   }
// };
//   // Modules map
//   const invoiceMod = user?.access_module_list?.find((m) => m.module_name === "invoice");
//   const customersMod = user?.access_module_list?.find((m) => m.module_name === "customers");
//   const departmentsMod = user?.access_module_list?.find((m) => m.module_name === "departments");
//   const accessMgmtMod = user?.access_module_list?.find((m) => m.module_name === "access_management");

//   // Assigned modules count & total grants count
//   const assignedModulesCount = (user?.access_module_list || []).filter(
//     (m) => m.view || m.create || m.update || m.delete || m.export
//   ).length;

//   let totalGrants = 0;
//   // (user?.access_module_list || []).forEach((m) => {
//   //   if (m.create) totalGrants++;
//   //   if (m.update) totalGrants++;
//   //   if (m.delete) totalGrants++;
//   //   if (m.export) totalGrants++;
//   // });
//   (user?.access_module_list || []).forEach((m) => {
//     if (m.view) totalGrants++;
//     if (m.create) totalGrants++;
//     if (m.update) totalGrants++;
//     if (m.delete) totalGrants++;
//     if (m.export) totalGrants++;
//   });
//   return (
//     <div className="am-container">
//       <ToastHost />

//       {/* Custom Confirmation Modal */}
//       <ConfirmModal
//         isOpen={showDeleteModal}
//         title="Delete User Account?"
//         message={`Are you sure you want to remove ${user?.full_name}? This will revoke all role privileges and cannot be undone.`}
//         onConfirm={handleConfirmDelete}
//         onCancel={() => setShowDeleteModal(false)}
//         confirmText="Yes, Delete User"
//       />

//       {/* Top Quick Navigation Pills */}
//       {/* <div className="am-top-pills">
//         <Link to="/access-management" className="am-top-pill">
//           List View
//         </Link>
//         <Link to="/access-management/create" className="am-top-pill">
//           Create User
//         </Link>
//         <Link
//           to={`/access-management/${id}`}
//           className="am-top-pill active"
//         >
//           User Profile
//         </Link>
//         <Link to="/audit-logs" className="am-top-pill">
//           Audit Trail
//         </Link>
//       </div> */}

//       {/* Breadcrumb */}
//       {/* <div className="am-breadcrumb">
//         <span style={{ color: "#334155" }}>ACCESS MANAGEMENT</span>
//         <span>/</span>
//         <Link to="/" className="am-breadcrumb-link">
//           Home
//         </Link>
//         <span>/</span>
//         <span>user-profile-{user?.name?.toLowerCase() || "user"}</span>
//       </div> */}

//       {/* Header */}
//       <div className="am-header">
//         <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
//           <button
//             type="button"
//             className="am-btn-outline"
//             style={{ padding: "8px 10px", marginTop: "2px" }}
//             onClick={() => navigate("/access-management")}
//             title="Back to list"
//           >
//             <ArrowLeft size={18} />
//           </button>
//           <div>
//             <h1 className="am-page-title">User Profile & Permissions</h1>
//             {/* <p className="am-page-subtitle">
//               Assigned scopes and module operational authorizations.
//             </p> */}
//           </div>
//         </div>

//         <div className="am-header-actions">
//           {user && canUpdate && (
//             <Link
//               to={`/access-management/edit/${user.user_id}`}
//               className="am-btn-outline"
//             >
//               <Pencil size={15} />
//               Edit Permissions
//             </Link>
//           )}
//           {canDelete && (
//         <button
//   type="button"
//   className="am-btn-danger-outline"
//   onClick={() => setShowDeleteModal(true)}
//   disabled={!user || deleting}
// >
//             <Trash2 size={15} />
//             Delete
//           </button>
//           )}
//         </div>
//       </div>

//       {loading ? (
//         <div className="am-profile-banner" style={{ textAlign: "center", padding: "60px 20px", display: "block" }}>
//           <div className="animate-spin" style={{ display: "inline-block", marginBottom: 12 }}>
//             <RotateCw size={26} color="#2563eb" />
//           </div>
//           <p style={{ margin: 0, color: "#64748b" }}>Loading user credentials and authorizations...</p>
//         </div>
//       ) : error || !user ? (
//         <div className="am-profile-banner" style={{ textAlign: "center", padding: "48px 20px", display: "block" }}>
//           <div
//             style={{
//               width: 44,
//               height: 44,
//               borderRadius: "50%",
//               background: "#fef2f2",
//               color: "#dc2626",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               margin: "0 auto 12px",
//             }}
//           >
//             <AlertCircle size={22} />
//           </div>
//           <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>
//             User Not Found
//           </h3>
//           <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 16px" }}>
//             {error || "The requested user profile could not be retrieved from the server."}
//           </p>
//           <button
//             type="button"
//             className="am-btn-primary"
//             onClick={loadUserDetails}
//           >
//             <RotateCw size={14} /> Retry
//           </button>
//         </div>
//       ) : (
//         <>
//           {/* User Banner Card */}
//           <div className="am-profile-banner">
//             <div className="am-profile-left">
//               <div
//                 style={{
//                   width: 64,
//                   height: 64,
//                   borderRadius: "16px",
//                   background: "#dbeafe",
//                   color: "#1d4ed8",
//                   fontSize: "22px",
//                   fontWeight: 800,
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   flexShrink: 0,
//                 }}
//               >
//                 {user.avatar || "U"}
//               </div>
//               <div className="am-profile-info">
//                 <div className="am-profile-name-row">
//                   <span className="am-profile-name">{user.full_name}</span>
//                   <span
//                     style={{
//                       background: user.status === "active" ? "#dcfce7" : "#f1f5f9",
//                       color: user.status === "active" ? "#15803d" : "#64748b",
//                       fontSize: "12px",
//                       fontWeight: 600,
//                       padding: "2px 10px",
//                       borderRadius: "9999px",
//                     }}
//                   >
//                     {user.status === "active" ? "Active" : "Inactive"}
//                   </span>
//                   <span
//                     style={{
//                       background: user.user_type === "admin" ? "#f3e8ff" : "#e0f2fe",
//                       color: user.user_type === "admin" ? "#9333ea" : "#0284c7",
//                       fontSize: "12px",
//                       fontWeight: 600,
//                       padding: "2px 10px",
//                       borderRadius: "9999px",
//                     }}
//                   >
//                     {user.role_title || "Operator User"}
//                   </span>
//                 </div>

//                 <div className="am-profile-meta-row" style={{ marginTop: 2 }}>
//                   <span>{user.email}</span>
//                   <span>•</span>
//                   <span>{user.mobile}</span>
//                 </div>

//                 <div className="am-profile-submeta" style={{ marginTop: 2 }}>
//                   {/* <span>User ID: {user.display_user_id}</span> */}
//                   <span>•</span>
//                   <span>Created: {user.created_at}</span>
//                 </div>
//               </div>
//             </div>

//             <div className="am-profile-stats">
//               <div className="am-stat-box">
//                 <span className="am-stat-label">Assigned Modules</span>
//                 <span className="am-stat-val">{assignedModulesCount} Modules</span>
//               </div>

//               <div className="am-stat-box">
//                 <span className="am-stat-label">Total Grants</span>
//                 <span className="am-stat-val primary">{totalGrants} Permissions</span>
//               </div>

//               <div className="am-stat-box">
//                 <span className="am-stat-label">Last Updated</span>
//                 <span className="am-stat-val" style={{ fontWeight: 600, color: "#334155" }}>
//                   {user.last_updated}
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* Granular Module Status Section (2x2 Grid) */}
//           <h2 className="am-section-title">Granular Module Status</h2>

// <div className="am-modules-grid">
//   {MODULE_CARDS.map(({ key, title, desc, icon: Icon, bg, fg }) => {
//     const mod = user.access_module_list?.find((m) => m.module_name === key);
//     return (
//       <div className="am-module-card" key={key}>
//         <div>
//           <div className="am-module-card-header">
//             <div className="am-module-card-title-group">
//               <div className="am-module-icon-box" style={{ background: bg, color: fg }}>
//                 <Icon size={18} />
//               </div>
//               <div>
//                 <div className="am-module-card-name">{title}</div>
//                 <div className="am-module-card-desc">{desc}</div>
//               </div>
//             </div>
//             <span style={{ color: mod?.view ? "#16a34a" : "#94a3b8", fontWeight: 600, fontSize: "12.5px" }}>
//               {mod?.view ? "Enabled" : "Disabled"}
//             </span>
//           </div>

//           <div className="am-module-actions-row">
//             {ACTIONS.map((a) => (
//               <span key={a} className={`am-action-chip ${mod?.[a] ? "am-chip-granted" : "am-chip-denied"}`}>
//                 {mod?.[a] ? <Check size={14} /> : <X size={14} />}{" "}
//                 {a.charAt(0).toUpperCase() + a.slice(1)}
//               </span>
//             ))}
//           </div>
//         </div>
//       </div>
//     );
//   })}
// </div>
//         </>
//       )}
//     </div>
//   );
// }





















// import React, { useState, useEffect } from "react";
// import { Link, useParams, useNavigate } from "react-router-dom";
// import {
//   ArrowLeft,
//   Pencil,
//   Trash2,
//   Receipt,
//   Contact2,
//   Building,
//   ShieldCheck,
//   Check,
//   X,
//   RotateCw,
//   AlertCircle,
//   History,
// } from "lucide-react";
// import { useToast } from "../Stays/Rooms/Room_Shared";
// import "./AccessManagement.css";
// import { fetchUserById, deleteUser } from "./services/accessManagementApi";
// import ConfirmModal from "./ConfirmModal";
// import { useAccess } from "../../services/AccessContext";
// import useBreakpoint from "./useBreakpoint";

// const MODULE_CARDS = [
//   { key: "invoice", title: "Invoice Module", desc: "Billing & invoices", icon: Receipt, bg: "#fffbeb", fg: "#d97706" },
//   { key: "customers", title: "Customers Module", desc: "Directory management", icon: Contact2, bg: "#eff6ff", fg: "#2563eb" },
//   { key: "departments", title: "Departments", desc: "Department units", icon: Building, bg: "#f0fdf4", fg: "#16a34a" },
//   { key: "access_management", title: "Access Management", desc: "Users & permissions", icon: ShieldCheck, bg: "#f5f3ff", fg: "#7c3aed" },
//   { key: "audit_logs", title: "Audit Logs", desc: "Activity & compliance", icon: History, bg: "#fff1f2", fg: "#e11d48" },
// ];
// const ACTIONS = ["view", "create", "update", "delete", "export"];
// const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// export default function UserAccessDetails() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { push: toast, ToastHost } = useToast();
//   const { can } = useAccess();
//   const canUpdate = can("access_management", "update");
//   const canDelete = can("access_management", "delete");
//   const bp = useBreakpoint();

//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [deleting, setDeleting] = useState(false);
//   const [activeKey, setActiveKey] = useState(MODULE_CARDS[0].key);

//   const loadUserDetails = async () => {
//     if (!id) return;
//     setLoading(true);
//     setError(null);
//     try {
//       const data = await fetchUserById(id);
//       setUser(data);
//     } catch (err) {
//       console.error("Error loading user profile:", err);
//       setError(err?.message || "We couldn’t load this user’s details.");
//       toast("We couldn’t load this user’s details.", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadUserDetails();
//     // eslint-disable-next-line
//   }, [id]);

//   const handleConfirmDelete = async () => {
//     if (!user?.user_id || deleting) return;
//     setDeleting(true);
//     try {
//       await deleteUser(user.user_id);
//       setShowDeleteModal(false);
//       toast(`User ${user.full_name || "account"} has been removed.`, "success");
//       setTimeout(() => navigate("/access-management"), 1000);
//     } catch (err) {
//       console.error("Failed to delete user:", err);
//       setShowDeleteModal(false);
//       toast(
//         err?.response?.data?.message || err?.message || "We couldn't delete this user. Please try again.",
//         "error"
//       );
//     } finally {
//       setDeleting(false);
//     }
//   };

//   const getMod = (key) => user?.access_module_list?.find((m) => m.module_name === key);

//   const assignedModulesCount = (user?.access_module_list || []).filter(
//     (m) => m.view || m.create || m.update || m.delete || m.export
//   ).length;

//   let totalGrants = 0;
//   (user?.access_module_list || []).forEach((m) => {
//     ACTIONS.forEach((a) => {
//       if (m[a]) totalGrants++;
//     });
//   });

//   const renderChips = (mod) =>
//     ACTIONS.map((a) => (
//       <span key={a} className={`am-action-chip ${mod?.[a] ? "am-chip-granted" : "am-chip-denied"}`}>
//         {mod?.[a] ? <Check size={14} /> : <X size={14} />} {cap(a)}
//       </span>
//     ));

//   const activeCard = MODULE_CARDS.find((c) => c.key === activeKey) || MODULE_CARDS[0];
//   const activeMod = getMod(activeCard.key);
//   const activeCount = ACTIONS.filter((a) => activeMod?.[a]).length;

//   return (
//     <div className="am-container">
//       <ToastHost />

//       <ConfirmModal
//         isOpen={showDeleteModal}
//         title="Delete User Account?"
//         message={`Are you sure you want to remove ${user?.full_name}? This will revoke all role privileges and cannot be undone.`}
//         onConfirm={handleConfirmDelete}
//         onCancel={() => setShowDeleteModal(false)}
//         confirmText="Yes, Delete User"
//       />

//       {/* Header */}
//       <div className="am-header">
//         <div className="am-header-back">
//           <button
//             type="button"
//             className="am-btn-outline"
//             style={{ padding: "8px 10px", marginTop: "2px" }}
//             onClick={() => navigate("/access-management")}
//             title="Back to list"
//           >
//             <ArrowLeft size={18} />
//           </button>
//           <div>
//             <h1 className="am-page-title">User Profile & Permissions</h1>
//           </div>
//         </div>

//         <div className="am-header-actions">
//           {user && canUpdate && (
//             <Link to={`/access-management/edit/${user.user_id}`} className="am-btn-outline">
//               <Pencil size={15} />
//               Edit Permissions
//             </Link>
//           )}
//           {canDelete && (
//             <button
//               type="button"
//               className="am-btn-danger-outline"
//               onClick={() => setShowDeleteModal(true)}
//               disabled={!user || deleting}
//             >
//               <Trash2 size={15} />
//               Delete
//             </button>
//           )}
//         </div>
//       </div>

//       {loading ? (
//         <div className="am-profile-banner" style={{ textAlign: "center", padding: "60px 20px", display: "block" }}>
//           <RotateCw size={26} color="#2563eb" className="am-spinner" style={{ marginBottom: 12 }} />
//           <p style={{ margin: 0, color: "#64748b" }}>Loading user credentials and authorizations...</p>
//         </div>
//       ) : error || !user ? (
//         <div className="am-profile-banner" style={{ textAlign: "center", padding: "48px 20px", display: "block" }}>
//           <div
//             style={{
//               width: 44,
//               height: 44,
//               borderRadius: "50%",
//               background: "#fef2f2",
//               color: "#dc2626",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               margin: "0 auto 12px",
//             }}
//           >
//             <AlertCircle size={22} />
//           </div>
//           <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>
//             User Not Found
//           </h3>
//           <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 16px" }}>
//             {error || "The requested user profile could not be retrieved from the server."}
//           </p>
//           <button type="button" className="am-btn-primary" onClick={loadUserDetails}>
//             <RotateCw size={14} /> Retry
//           </button>
//         </div>
//       ) : (
//         <>
//           {/* Banner */}
//           <div className="am-profile-banner">
//             <div className="am-profile-left">
//               <div
//                 className="am-profile-avatar-lg"
//                 style={{
//                   background: "#dbeafe",
//                   color: "#1d4ed8",
//                   fontWeight: 800,
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   flexShrink: 0,
//                 }}
//               >
//                 {user.avatar || "U"}
//               </div>
//               <div className="am-profile-info">
//                 <div className="am-profile-name-row">
//                   <span className="am-profile-name">{user.full_name}</span>
//                   <span
//                     style={{
//                       background: user.status === "active" ? "#dcfce7" : "#f1f5f9",
//                       color: user.status === "active" ? "#15803d" : "#64748b",
//                       fontSize: "12px",
//                       fontWeight: 600,
//                       padding: "2px 10px",
//                       borderRadius: "9999px",
//                     }}
//                   >
//                     {user.status === "active" ? "Active" : "Inactive"}
//                   </span>
//                   <span
//                     style={{
//                       background: user.user_type === "admin" ? "#f3e8ff" : "#e0f2fe",
//                       color: user.user_type === "admin" ? "#9333ea" : "#0284c7",
//                       fontSize: "12px",
//                       fontWeight: 600,
//                       padding: "2px 10px",
//                       borderRadius: "9999px",
//                     }}
//                   >
//                     {user.role_title || "Operator User"}
//                   </span>
//                 </div>

//                 <div className="am-profile-meta-row" style={{ marginTop: 2 }}>
//                   <span>{user.email}</span>
//                   <span className="am-dot-sep">•</span>
//                   <span>{user.mobile}</span>
//                 </div>

//                 <div className="am-profile-submeta" style={{ marginTop: 2 }}>
//                   <span>Created: {user.created_at}</span>
//                 </div>
//               </div>
//             </div>

//             <div className="am-profile-stats">
//               <div className="am-stat-box">
//                 <span className="am-stat-label">Assigned Modules</span>
//                 <span className="am-stat-val">{assignedModulesCount} Modules</span>
//               </div>
//               <div className="am-stat-box">
//                 <span className="am-stat-label">Total Grants</span>
//                 <span className="am-stat-val primary">{totalGrants} Permissions</span>
//               </div>
//               <div className="am-stat-box">
//                 <span className="am-stat-label">Last Updated</span>
//                 <span className="am-stat-val" style={{ fontWeight: 600, color: "#334155" }}>
//                   {user.last_updated}
//                 </span>
//               </div>
//             </div>
//           </div>

//           <h2 className="am-section-title">Granular Module Status</h2>

//           {bp === "tablet" ? (
//             /* ---------- TABLET: master-detail ---------- */
//             <div className="am-md">
//               <div className="am-md-list">
//                 {MODULE_CARDS.map(({ key, title, icon: Icon, bg, fg }) => {
//                   const mod = getMod(key);
//                   const count = ACTIONS.filter((a) => mod?.[a]).length;
//                   return (
//                     <button
//                       key={key}
//                       type="button"
//                       className={`am-md-item ${activeKey === key ? "active" : ""}`}
//                       onClick={() => setActiveKey(key)}
//                     >
//                       <span className="am-md-icon" style={{ background: bg, color: fg }}>
//                         <Icon size={16} />
//                       </span>
//                       <span className="am-md-item-name">{title}</span>
//                       <span className={`am-md-count ${count > 0 ? "on" : ""}`}>{count}/5</span>
//                     </button>
//                   );
//                 })}
//               </div>

//               <div className="am-md-panel">
//                 <div className="am-md-panel-head">
//                   <div className="am-module-card-title-group">
//                     <div
//                       className="am-module-icon-box"
//                       style={{ background: activeCard.bg, color: activeCard.fg }}
//                     >
//                       <activeCard.icon size={18} />
//                     </div>
//                     <div>
//                       <div className="am-module-card-name">{activeCard.title}</div>
//                       <div className="am-module-card-desc">{activeCard.desc}</div>
//                     </div>
//                   </div>
//                   <span
//                     style={{
//                       color: activeMod?.view ? "#16a34a" : "#94a3b8",
//                       fontWeight: 600,
//                       fontSize: "12.5px",
//                     }}
//                   >
//                     {activeMod?.view ? "Enabled" : "Disabled"}
//                   </span>
//                 </div>

//                 <div className="am-md-progress">
//                   <div className="am-md-progress-bar">
//                     <div style={{ width: `${(activeCount / 5) * 100}%` }} />
//                   </div>
//                   <span>{activeCount} of 5 permissions granted</span>
//                 </div>

//                 <div className="am-md-chips">{renderChips(activeMod)}</div>
//               </div>
//             </div>
//           ) : (
//             /* ---------- MOBILE + DESKTOP: cards ---------- */
//             <div className="am-modules-grid">
//               {MODULE_CARDS.map(({ key, title, desc, icon: Icon, bg, fg }) => {
//                 const mod = getMod(key);
//                 return (
//                   <div className="am-module-card" key={key}>
//                     <div>
//                       <div className="am-module-card-header">
//                         <div className="am-module-card-title-group">
//                           <div className="am-module-icon-box" style={{ background: bg, color: fg }}>
//                             <Icon size={18} />
//                           </div>
//                           <div>
//                             <div className="am-module-card-name">{title}</div>
//                             <div className="am-module-card-desc">{desc}</div>
//                           </div>
//                         </div>
//                         {/* <span
//                           style={{
//                             color: mod?.view ? "#16a34a" : "#94a3b8",
//                             fontWeight: 600,
//                             fontSize: "12.5px",
//                           }}
//                         >
//                           {mod?.view ? "Enabled" : "Disabled"}
//                         </span> */}
//                       </div>
//                       <div className="am-module-actions-row">{renderChips(mod)}</div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// }





























import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Buildings2 } from "iconsax-react";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Check,
  X,
  RotateCw,
  AlertCircle,
  History,
    Building2,
} from "lucide-react";
import { useToast } from "../Stays/Rooms/Room_Shared";
import "./AccessManagement.css";
import { fetchUserById, deleteUser } from "./services/accessManagementApi";
import ConfirmModal from "./ConfirmModal";
import { useAccess } from "../../services/AccessContext";
import useBreakpoint from "./useBreakpoint";

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

const MODULE_CARDS = [
  { key: "invoice", title: "Invoice Module", desc: "Billing & invoices", icon: InvoiceIcon },
  { key: "customers", title: "Guests Module", desc: "Directory management", icon: CustomerIcon },
{ key: "departments", title: "Departments", desc: "Department units", icon: Buildings2 },
  { key: "room_booking", title: "Room & Booking", desc: "Properties, rooms & bookings", icon: Building2 },
  { key: "access_management", title: "Access Management", desc: "Users & permissions", icon: AccessIcon },
  { key: "audit_logs", title: "Audit Logs", desc: "Activity & compliance", icon: History },
];
const ACTIONS = ["view", "create", "update", "delete", "export"];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function UserAccessDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { push: toast, ToastHost } = useToast();
  const { can } = useAccess();
  const canUpdate = can("access_management", "update");
  const canDelete = can("access_management", "delete");
  const bp = useBreakpoint();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeKey, setActiveKey] = useState(MODULE_CARDS[0].key);

  const loadUserDetails = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUserById(id);
      setUser(data);
    } catch (err) {
      console.error("Error loading user profile:", err);
      setError(err?.message || "We couldn’t load this user’s details.");
      toast("We couldn’t load this user’s details.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserDetails();
    // eslint-disable-next-line
  }, [id]);

  const handleConfirmDelete = async () => {
    if (!user?.user_id || deleting) return;
    setDeleting(true);
    try {
      await deleteUser(user.user_id);
      setShowDeleteModal(false);
      toast(`User ${user.full_name || "account"} has been removed.`, "success");
      setTimeout(() => navigate("/access-management"), 1000);
    } catch (err) {
      console.error("Failed to delete user:", err);
      setShowDeleteModal(false);
      toast(
        err?.response?.data?.message || err?.message || "We couldn't delete this user. Please try again.",
        "error"
      );
    } finally {
      setDeleting(false);
    }
  };

  const getMod = (key) => user?.access_module_list?.find((m) => m.module_name === key);

  const assignedModulesCount = (user?.access_module_list || []).filter(
    (m) => m.view || m.create || m.update || m.delete || m.export
  ).length;

  let totalGrants = 0;
  (user?.access_module_list || []).forEach((m) => {
    ACTIONS.forEach((a) => {
      if (m[a]) totalGrants++;
    });
  });

  const renderChips = (mod) =>
    ACTIONS.map((a) => (
      <span key={a} className={`am-action-chip ${mod?.[a] ? "am-chip-granted" : "am-chip-denied"}`}>
        {mod?.[a] ? <Check size={14} /> : <X size={14} />} {cap(a)}
      </span>
    ));

  const activeCard = MODULE_CARDS.find((c) => c.key === activeKey) || MODULE_CARDS[0];
  const activeMod = getMod(activeCard.key);
  const activeCount = ACTIONS.filter((a) => activeMod?.[a]).length;

  return (
    <div className="am-container">
      <ToastHost />

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete User Account?"
        message={`Are you sure you want to remove ${user?.full_name}? This will revoke all role privileges and cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
        confirmText="Yes, Delete User"
      />

      {/* Header */}
      <div className="am-header">
        <div className="am-header-back">
          <button
            type="button"
            className="am-btn-outline"
            style={{ padding: "8px 10px", marginTop: "2px" }}
            onClick={() => navigate("/access-management")}
            title="Back to list"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="am-page-title">User Profile & Permissions</h1>
          </div>
        </div>

        <div className="am-header-actions">
          {user && canUpdate && (
            <Link to={`/access-management/edit/${user.user_id}`} className="am-btn-outline">
              <Pencil size={15} />
              Edit Permissions
            </Link>
          )}
          {canDelete && (
            <button
              type="button"
              className="am-btn-danger-outline"
              onClick={() => setShowDeleteModal(true)}
              disabled={!user || deleting}
            >
              <Trash2 size={15} />
              Delete
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="am-profile-banner" style={{ textAlign: "center", padding: "60px 20px", display: "block" }}>
          <RotateCw size={26} color="#2563eb" className="am-spinner" style={{ marginBottom: 12 }} />
          <p style={{ margin: 0, color: "#64748b" }}>Loading user credentials and authorizations...</p>
        </div>
      ) : error || !user ? (
        <div className="am-profile-banner" style={{ textAlign: "center", padding: "48px 20px", display: "block" }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "#fef2f2",
              color: "#dc2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
            }}
          >
            <AlertCircle size={22} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>
            User Not Found
          </h3>
          <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 16px" }}>
            {error || "The requested user profile could not be retrieved from the server."}
          </p>
          <button type="button" className="am-btn-primary" onClick={loadUserDetails}>
            <RotateCw size={14} /> Retry
          </button>
        </div>
      ) : (
        <>
          {/* Banner */}
          <div className="am-profile-banner">
            <div className="am-profile-left">
              <div
                className="am-profile-avatar-lg"
                style={{
                  background: "#dbeafe",
                  color: "#1d4ed8",
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {user.avatar || "U"}
              </div>
              <div className="am-profile-info">
                <div className="am-profile-name-row">
                  <span className="am-profile-name">{user.full_name}</span>
                  <span
                    style={{
                      background: user.status === "active" ? "#dcfce7" : "#f1f5f9",
                      color: user.status === "active" ? "#15803d" : "#64748b",
                      fontSize: "12px",
                      fontWeight: 600,
                      padding: "2px 10px",
                      borderRadius: "9999px",
                    }}
                  >
                    {user.status === "active" ? "Active" : "Inactive"}
                  </span>
                  <span
                    style={{
                      background: user.user_type === "admin" ? "#f3e8ff" : "#e0f2fe",
                      color: user.user_type === "admin" ? "#9333ea" : "#0284c7",
                      fontSize: "12px",
                      fontWeight: 600,
                      padding: "2px 10px",
                      borderRadius: "9999px",
                    }}
                  >
                    {user.role_title || "Operator User"}
                  </span>
                </div>

                <div className="am-profile-meta-row" style={{ marginTop: 2 }}>
                  <span>{user.email}</span>
                  <span className="am-dot-sep">•</span>
                  <span>{user.mobile}</span>
                </div>

                <div className="am-profile-submeta" style={{ marginTop: 2 }}>
                  <span>Created: {user.created_at}</span>
                </div>
              </div>
            </div>

            <div className="am-profile-stats">
              <div className="am-stat-box">
                <span className="am-stat-label">Assigned Modules</span>
                <span className="am-stat-val">{assignedModulesCount} Modules</span>
              </div>
              <div className="am-stat-box">
                <span className="am-stat-label">Total Grants</span>
                <span className="am-stat-val primary">{totalGrants} Permissions</span>
              </div>
              <div className="am-stat-box">
                <span className="am-stat-label">Last Updated</span>
                <span className="am-stat-val" style={{ fontWeight: 600, color: "#334155" }}>
                  {user.last_updated}
                </span>
              </div>
            </div>
          </div>

          <h2 className="am-section-title">Granular Module Status</h2>

          {bp === "tablet" ? (
            /* ---------- TABLET: master-detail ---------- */
            <div className="am-md">
              <div className="am-md-list">
                {MODULE_CARDS.map(({ key, title, icon: Icon }) => {
                  const mod = getMod(key);
                  const count = ACTIONS.filter((a) => mod?.[a]).length;
                  return (
                    <button
                      key={key}
                      type="button"
                      className={`am-md-item ${activeKey === key ? "active" : ""}`}
                      onClick={() => setActiveKey(key)}
                    >
                      <span className="am-md-icon" style={{ background: ICON_BG }}>
                        <Icon size={16} strokeWidth={1.5} color={ICON_COLOR} />
                      </span>
                      <span className="am-md-item-name">{title}</span>
                      <span className={`am-md-count ${count > 0 ? "on" : ""}`}>{count}/5</span>
                    </button>
                  );
                })}
              </div>

              <div className="am-md-panel">
                <div className="am-md-panel-head">
                  <div className="am-module-card-title-group">
                    <div className="am-module-icon-box" style={{ background: ICON_BG }}>
                      <activeCard.icon size={18} strokeWidth={1.5} color={ICON_COLOR} />
                    </div>
                    <div>
                      <div className="am-module-card-name">{activeCard.title}</div>
                      <div className="am-module-card-desc">{activeCard.desc}</div>
                    </div>
                  </div>
                  <span
                    style={{
                      color: activeMod?.view ? "#16a34a" : "#94a3b8",
                      fontWeight: 600,
                      fontSize: "12.5px",
                    }}
                  >
                    {activeMod?.view ? "Enabled" : "Disabled"}
                  </span>
                </div>

                <div className="am-md-progress">
                  <div className="am-md-progress-bar">
                    <div style={{ width: `${(activeCount / 5) * 100}%` }} />
                  </div>
                  <span>{activeCount} of 5 permissions granted</span>
                </div>

                <div className="am-md-chips">{renderChips(activeMod)}</div>
              </div>
            </div>
          ) : (
            /* ---------- MOBILE + DESKTOP: cards ---------- */
            <div className="am-modules-grid">
              {MODULE_CARDS.map(({ key, title, desc, icon: Icon }) => {
                const mod = getMod(key);
                return (
                  <div className="am-module-card" key={key}>
                    <div>
                      <div className="am-module-card-header">
                        <div className="am-module-card-title-group">
                          <div className="am-module-icon-box" style={{ background: ICON_BG }}>
                            <Icon size={18} strokeWidth={1.5} color={ICON_COLOR} />
                          </div>
                          <div>
                            <div className="am-module-card-name">{title}</div>
                            <div className="am-module-card-desc">{desc}</div>
                          </div>
                        </div>
                      </div>
                      <div className="am-module-actions-row">{renderChips(mod)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}