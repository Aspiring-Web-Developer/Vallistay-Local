// import React, { useState, useEffect, useMemo } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { History, UserPlus, Users, ChevronLeft, ChevronRight, AlertCircle, RotateCw } from "lucide-react";
// import { useToast } from "../Stays/Rooms/Room_Shared";
// import "./AccessManagement.css";
// import { fetchUsers } from "./services/accessManagementApi";
// import AccessSummaryCards from "./AccessSummaryCards";
// import AccessFilters from "./AccessFilters";
// import AccessUserTable from "./AccessUserTable";
// import AccessUserCard from "./AccessUserCard";
// import { useAccess } from "../../services/AccessContext";


// export default function AccessManagementPage() {
//   const navigate = useNavigate();
//   const { push: toast, ToastHost } = useToast();
//   const { can } = useAccess();
// const canCreate = can("access_management", "create");
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // const [searchTerm, setSearchTerm] = useState("");
//   // const [roleFilter, setRoleFilter] = useState("all");
//   // const [statusFilter, setStatusFilter] = useState("all");
//   // const [viewMode, setViewMode] = useState("list"); // 'list' | 'grid'


//   const [searchTerm, setSearchTerm] = useState("");
// const [selectedModules, setSelectedModules] = useState([]);
// const [selectedPermissions, setSelectedPermissions] = useState([]);
// const [matchMode, setMatchMode] = useState("any"); // 'any' | 'all'
// const [viewMode, setViewMode] = useState("list");
//   // Pagination state
//   const [currentPage, setCurrentPage] = useState(1);
//   const pageSize = 5;

//   const loadUsers = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const data = await fetchUsers();
//       setUsers(data);
//     } catch (err) {
//       console.error("Failed to fetch users:", err);
//       setError(err?.message || "We couldn’t load users. Please try again.");
//       toast("We couldn’t load users. Please try again.", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadUsers();
//   }, []);

//   useEffect(() => {
//   setCurrentPage(1);
// }, [searchTerm, selectedModules, selectedPermissions, matchMode]);
//   // Filtering
// const filteredUsers = useMemo(() => {
//   const term = searchTerm.toLowerCase();

//   return users.filter((user) => {
//     const matchesSearch =
//       term === "" ||
//       user.full_name?.toLowerCase().includes(term) ||
//       user.email?.toLowerCase().includes(term) ||
//       user.mobile?.includes(searchTerm);
//     if (!matchesSearch) return false;

//     if (selectedModules.length === 0 && selectedPermissions.length === 0) return true;

//     const modules = user.access_module_list || [];

//     // Does this module satisfy the selected permissions?
//     const moduleMatches = (mod) => {
//       if (!mod) return false;
//       if (selectedPermissions.length === 0) {
//         return ["view", "create", "update", "delete", "export"].some((a) => mod[a]);
//       }
//       return matchMode === "all"
//         ? selectedPermissions.every((p) => mod[p])
//         : selectedPermissions.some((p) => mod[p]);
//     };

//     // Permissions are checked only on the selected modules (or every module if none selected)
//     if (selectedModules.length === 0) {
//       return modules.some(moduleMatches);
//     }

//     const picked = selectedModules.map((name) => modules.find((m) => m.module_name === name));
//     return matchMode === "all" ? picked.every(moduleMatches) : picked.some(moduleMatches);
//   });
// }, [users, searchTerm, selectedModules, selectedPermissions, matchMode]);

//   // Paginated records
//   const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
//   const paginatedUsers = useMemo(() => {
//     const startIndex = (currentPage - 1) * pageSize;
//     return filteredUsers.slice(startIndex, startIndex + pageSize);
//   }, [filteredUsers, currentPage, pageSize]);

//   const startRecord = filteredUsers.length > 0 ? (currentPage - 1) * pageSize + 1 : 0;
//   const endRecord = Math.min(currentPage * pageSize, filteredUsers.length);

//   // Dynamic summary stats from loaded users
//   // const summaryStats = useMemo(() => {
//   //   const totalUsers = users.length;
//   //   const activeUsers = users.filter((u) => u.status === "active").length;
//   //   const adminUsers = users.filter((u) => u.user_type === "admin").length;
//   //   const invoiceAccess = users.filter((u) =>
//   //     u.access_module_list?.some((m) => m.module_name === "invoice" && (m.view || m.create || m.update || m.delete || m.export))
//   //   ).length;

//   //   return {
//   //     totalUsers,
//   //     activeUsers,
//   //     adminUsers,
//   //     invoiceAccess,
//   //   };
//   // }, [users]);


//   const summaryStats = useMemo(() => {
//   const totalUsers = users.length;
//   const activeUsers = users.filter((u) => u.status === "active").length;
//   const hasAccess = (u, moduleName) =>
//     u.access_module_list?.some(
//       (m) =>
//         m.module_name === moduleName &&
//         (m.view || m.create || m.update || m.delete || m.export)
//     );

//   const customerAccess = users.filter((u) => hasAccess(u, "customers")).length;
//   const invoiceAccess = users.filter((u) => hasAccess(u, "invoice")).length;

//   return {
//     totalUsers,
//     activeUsers,
//     customerAccess, // replaces adminUsers
//     invoiceAccess,
//   };
// }, [users]);
//   return (
//     <div className="am-container">
//       <ToastHost />

//       {/* Top Quick Navigation Pills */}
//       {/* <div className="am-top-pills">
//         <Link to="/access-management" className="am-top-pill active">
//           List View
//         </Link>
//         <Link to="/access-management/create" className="am-top-pill">
//           Create User
//         </Link>
//         <Link
//           to={users[0] ? `/access-management/${users[0].user_id}` : "/access-management"}
//           className="am-top-pill"
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
//         <span>users-and-permissions</span>
//       </div> */}

//       {/* Page Header */}
//       <div className="am-header">
//         <div className="am-header-left">
//           <div className="am-title-row">
//             <h1 className="am-page-title">All Users & Permissions</h1>
//             <span className="am-count-badge">{filteredUsers.length}</span>
//           </div>
//           {/* <p className="am-page-subtitle">
//             Manage staff credentials, assigned module permissions, and granular access scopes.
//           </p> */}
//         </div>

//         <div className="am-header-actions">
//           <Link to="/audit-logs" className="am-btn-outline">
//             <History size={16} />
//             Permission History
//           </Link>
// {canCreate && (
//   <Link to="/access-management/create" className="am-btn-primary">
//     <UserPlus size={16} />
//     + New User
//   </Link>
// )}
//         </div>
//       </div>

//       {/* Summary Cards */}
//       <AccessSummaryCards stats={summaryStats} />

//       {/* Toolbar (Search & Filters) */}
//       {/* <AccessFilters
//         searchTerm={searchTerm}
//         setSearchTerm={setSearchTerm}
//         roleFilter={roleFilter}
//         setRoleFilter={setRoleFilter}
//         statusFilter={statusFilter}
//         setStatusFilter={setStatusFilter}
//         viewMode={viewMode}
//         setViewMode={setViewMode}
//       /> */}

//       <AccessFilters
//   searchTerm={searchTerm}
//   setSearchTerm={setSearchTerm}
//   selectedModules={selectedModules}
//   setSelectedModules={setSelectedModules}
//   selectedPermissions={selectedPermissions}
//   setSelectedPermissions={setSelectedPermissions}
//   matchMode={matchMode}
//   setMatchMode={setMatchMode}
//   viewMode={viewMode}
//   setViewMode={setViewMode}
// />

//       {/* Loading Skeleton */}
//      {loading ? (
//   <div
//     className="am-table-container"
//     style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}
//   >
//     <RotateCw size={28} color="#2563eb" className="am-spinner" style={{ marginBottom: 12 }} />
//     <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>
//       Loading staff members and permissions...
//     </p>
//   </div>
// ) : error ? (
//         /* Error State with Retry Button */
//         <div
//           className="am-table-container"
//           style={{ textAlign: "center", padding: "48px 20px" }}
//         >
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
//             Failed to Load Users
//           </h3>
//           <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 16px" }}>
//             {error}
//           </p>
//           <button
//             type="button"
//             className="am-btn-primary"
//             onClick={loadUsers}
//           >
//             <RotateCw size={14} /> Retry
//           </button>
//         </div>
//       ) : filteredUsers.length === 0 ? (
//         /* Empty State */
//         <div
//           className="am-table-container"
//           style={{ textAlign: "center", padding: "60px 20px" }}
//         >
//           <div
//             style={{
//               width: 48,
//               height: 48,
//               borderRadius: "50%",
//               background: "#eff6ff",
//               color: "#2563eb",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               margin: "0 auto 12px",
//             }}
//           >
//             <Users size={24} />
//           </div>
//           <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>
//             No users found
//           </h3>
//           <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
//             Try adjusting your search criteria or role filters.
//           </p>
//         </div>
//       ) : viewMode === "list" ? (
//         /* Table View */
//         <AccessUserTable users={paginatedUsers} />
//       ) : (
//         /* Grid View (Matching 3-column layout) */
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
//             gap: 18,
//           }}
//         >
//           {paginatedUsers.map((user) => (
//             <AccessUserCard key={user.user_id} user={user} />
//           ))}
//         </div>
//       )}

//       {/* Pagination Footer */}
//       {!loading && !error && filteredUsers.length > 0 && (
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             marginTop: 20,
//             padding: "8px 4px",
//             fontSize: "13px",
//             color: "#64748b",
//             flexWrap: "wrap",
//             gap: 12,
//           }}
//         >
//           <div>
//             Showing <strong>{startRecord}-{endRecord}</strong> of <strong>{filteredUsers.length}</strong> users
//           </div>

//           <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
//             <button
//               type="button"
//               style={{
//                 width: 32,
//                 height: 32,
//                 borderRadius: 8,
//                 border: "1px solid #e2e8f0",
//                 background: "#ffffff",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 cursor: currentPage === 1 ? "not-allowed" : "pointer",
//                 color: currentPage === 1 ? "#cbd5e1" : "#475569",
//               }}
//               disabled={currentPage === 1}
//               onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//             >
//               <ChevronLeft size={16} />
//             </button>

//             {Array.from({ length: totalPages }).map((_, idx) => {
//               const pageNum = idx + 1;
//               const isActive = currentPage === pageNum;
//               return (
//                 <button
//                   key={pageNum}
//                   type="button"
//                   style={{
//                     width: 32,
//                     height: 32,
//                     borderRadius: 8,
//                     border: isActive ? "1px solid #2563eb" : "1px solid #e2e8f0",
//                     background: isActive ? "#2563eb" : "#ffffff",
//                     color: isActive ? "#ffffff" : "#475569",
//                     fontWeight: 600,
//                     cursor: "pointer",
//                     fontSize: 13,
//                   }}
//                   onClick={() => setCurrentPage(pageNum)}
//                 >
//                   {pageNum}
//                 </button>
//               );
//             })}

//             <button
//               type="button"
//               style={{
//                 width: 32,
//                 height: 32,
//                 borderRadius: 8,
//                 border: "1px solid #e2e8f0",
//                 background: "#ffffff",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 cursor: currentPage === totalPages ? "not-allowed" : "pointer",
//                 color: currentPage === totalPages ? "#cbd5e1" : "#475569",
//               }}
//               disabled={currentPage === totalPages}
//               onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
//             >
//               <ChevronRight size={16} />
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

























import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { History, UserPlus, Users, ChevronLeft, ChevronRight, AlertCircle, RotateCw } from "lucide-react";
import { useToast } from "../Stays/Rooms/Room_Shared";
import "./AccessManagement.css";
import { fetchUsers } from "./services/accessManagementApi";
import AccessSummaryCards from "./AccessSummaryCards";
// import AccessFilters from "./AccessFilters";
import AccessUserTable from "./AccessUserTable";
import AccessUserCard from "./AccessUserCard";
import { useAccess } from "../../services/AccessContext";
import useBreakpoint from "./useBreakpoint";
import AccessFilters, { filterByCreatedDate } from "./AccessFilters";
const PAGE_SIZE = { mobile: 5, tablet: 8, desktop: 10 };
import Pagination from "../AuditLogs/Pagination";



const getPages = (current, total) => {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("…l");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("…r");
  pages.push(total);
  return pages;
};

export default function AccessManagementPage() {
  const { push: toast, ToastHost } = useToast();
  const { can } = useAccess();
  const canCreate = can("access_management", "create");
  const bp = useBreakpoint();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModules, setSelectedModules] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [matchMode, setMatchMode] = useState("any");
  const [viewMode, setViewMode] = useState("list");
const [dateFrom, setDateFrom] = useState("");
const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = PAGE_SIZE[bp];

  // mobile always uses cards
  const effectiveView = bp === "mobile" ? "grid" : viewMode;

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError(err?.message || "We couldn’t load users. Please try again.");
      toast("We couldn’t load users. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line
  }, []);

  // useEffect(() => {
  //   setCurrentPage(1);
  // }, [searchTerm, selectedModules, selectedPermissions, matchMode, pageSize]);

  useEffect(() => {
  setCurrentPage(1);
}, [searchTerm, selectedModules, selectedPermissions, matchMode, pageSize, dateFrom, dateTo]);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase();

    // return users.filter((user) => {
       return filterByCreatedDate(users, dateFrom, dateTo).filter((user) => {
      const matchesSearch =
        term === "" ||
        user.full_name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.mobile?.includes(searchTerm);
      if (!matchesSearch) return false;

      if (selectedModules.length === 0 && selectedPermissions.length === 0) return true;

      const modules = user.access_module_list || [];

      const moduleMatches = (mod) => {
        if (!mod) return false;
        if (selectedPermissions.length === 0) {
          return ["view", "create", "update", "delete", "export"].some((a) => mod[a]);
        }
        return matchMode === "all"
          ? selectedPermissions.every((p) => mod[p])
          : selectedPermissions.some((p) => mod[p]);
      };

      if (selectedModules.length === 0) return modules.some(moduleMatches);

      const picked = selectedModules.map((name) => modules.find((m) => m.module_name === name));
      return matchMode === "all" ? picked.every(moduleMatches) : picked.some(moduleMatches);
    });
}, [users, searchTerm, selectedModules, selectedPermissions, matchMode, dateFrom, dateTo]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredUsers.slice(startIndex, startIndex + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const startRecord = filteredUsers.length > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endRecord = Math.min(currentPage * pageSize, filteredUsers.length);

  const summaryStats = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.status === "active").length;
    const hasAccess = (u, moduleName) =>
      u.access_module_list?.some(
        (m) =>
          m.module_name === moduleName &&
          (m.view || m.create || m.update || m.delete || m.export)
      );
    const customerAccess = users.filter((u) => hasAccess(u, "customers")).length;
    const invoiceAccess = users.filter((u) => hasAccess(u, "invoice")).length;
    return { totalUsers, activeUsers, customerAccess, invoiceAccess };
  }, [users]);

  return (
    <div className="am-container">
      <ToastHost />

      {/* Header */}
      <div className="am-header">
        <div className="am-header-left">
          <div className="am-title-row">
            <h1 className="am-page-title">All Users & Permissions</h1>
            <span className="am-count-badge">{filteredUsers.length}</span>
          </div>
        </div>

        <div className="am-header-actions">
          <Link to="/audit-logs" className="am-btn-outline">
            <History size={16} />
            Permission History
          </Link>
          {canCreate && (
            <Link to="/access-management/create" className="am-btn-primary">
              <UserPlus size={16} />
              New User
            </Link>
          )}
        </div>
      </div>

      <AccessSummaryCards stats={summaryStats} />

      {/* <AccessFilters
        bp={bp}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedModules={selectedModules}
        setSelectedModules={setSelectedModules}
        selectedPermissions={selectedPermissions}
        setSelectedPermissions={setSelectedPermissions}
        matchMode={matchMode}
        setMatchMode={setMatchMode}
        viewMode={viewMode}
        setViewMode={setViewMode}
      /> */}

<AccessFilters
  bp={bp}
  searchTerm={searchTerm}
  setSearchTerm={setSearchTerm}
  selectedModules={selectedModules}
  setSelectedModules={setSelectedModules}
  selectedPermissions={selectedPermissions}
  setSelectedPermissions={setSelectedPermissions}
  dateFrom={dateFrom}
  setDateFrom={setDateFrom}
  dateTo={dateTo}
  setDateTo={setDateTo}
  matchMode={matchMode}
  setMatchMode={setMatchMode}
  viewMode={viewMode}
  setViewMode={setViewMode}
/>
      {loading ? (
        <div
          className="am-table-container"
          style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}
        >
          <RotateCw size={28} color="#2563eb" className="am-spinner" style={{ marginBottom: 12 }} />
          <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>
            Loading staff members and permissions...
          </p>
        </div>
      ) : error ? (
        <div className="am-table-container" style={{ textAlign: "center", padding: "48px 20px" }}>
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
            Failed to Load Users
          </h3>
          <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 16px" }}>{error}</p>
          <button type="button" className="am-btn-primary" onClick={loadUsers}>
            <RotateCw size={14} /> Retry
          </button>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="am-table-container" style={{ textAlign: "center", padding: "60px 20px" }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "#eff6ff",
              color: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
            }}
          >
            <Users size={24} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>
            No users found
          </h3>
          <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
            Try adjusting your search criteria or filters.
          </p>
        </div>
      ) : effectiveView === "list" ? (
        <AccessUserTable users={paginatedUsers} bp={bp} />
      ) : (
        <div className="am-cards-grid">
          {paginatedUsers.map((user) => (
            <AccessUserCard key={user.user_id} user={user} />
          ))}
        </div>
      )}

{/* Pagination */}
{!loading && !error && filteredUsers.length > 0 && (
  <div className="am-pagination">
    <div>
      Showing <strong>{startRecord}-{endRecord}</strong> of <strong>{filteredUsers.length}</strong> users
    </div>

    {totalPages > 1 && (
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onChange={setCurrentPage}
        windowSize={3}
      />
    )}
  </div>
)}
    </div>
  );
}



