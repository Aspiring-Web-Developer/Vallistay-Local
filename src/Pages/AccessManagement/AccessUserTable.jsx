// import React from "react";
// import { Eye } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import PermissionBadge from "./PermissionBadge";

// export default function AccessUserTable({ users, onViewUser }) {
//   const navigate = useNavigate();

//   const handleRowClick = (userId) => {
//     if (onViewUser) {
//       onViewUser(userId);
//     } else {
//       navigate(`/access-management/${userId}`);
//     }
//   };

//   return (
//     <div className="am-table-container">
//       <table className="am-table">
//         <thead>
//           <tr>
//             <th className="am-th">User</th>
//             <th className="am-th">Email</th>
//             {/* <th className="am-th">User Type</th> */}
//             <th className="am-th">Modules Assigned</th>
//             <th className="am-th">Permissions</th>
//             <th className="am-th">Status</th>
//             <th className="am-th">Last Updated</th>
//             <th className="am-th" style={{ textAlign: "right" }}></th>
//           </tr>
//         </thead>
//         <tbody>
//           {users.map((user) => {
//             const isAdmin = user.user_type === "admin";
//             // const enabledModules = (user.access_module_list || []).filter(
//             //   (m) => m.view || m.create || m.update || m.delete || m.export
//             // );

//               const enabledModules = (user.access_module_list || []).filter(
//               (m) => m.view || m.create || m.update || m.delete || m.export
//             );

//             const grantedActions = ["view", "create", "update", "delete", "export"].filter(
//               (action) => enabledModules.some((m) => m[action])
//             );

//             return (
//               <tr
//                 key={user.user_id}
//                 className="am-tr"
//                 style={{ cursor: "pointer" }}
//                 onClick={() => handleRowClick(user.user_id)}
//               >
//                 {/* User */}
//                 <td className="am-td">
//                   <div className="am-user-cell">
//                     <div className="am-avatar">
//                       {user.avatar || (user.name ? user.name[0] : "U")}
//                     </div>
//                     <div className="am-user-meta">
//                       <span className="am-user-name">{user.full_name || `${user.name} ${user.last_name || ""}`.trim()}</span>
//                       <span className="am-user-phone">{user.mobile}</span>
//                     </div>
//                   </div>
//                 </td>

//                 {/* Email */}
//                 <td className="am-td" style={{ color: "#475569" }}>
//                   {user.email}
//                 </td>

//                 {/* User Type */}
//                 {/* <td className="am-td">
//                   <span
//                     className={`am-role-badge ${
//                       isAdmin ? "am-role-admin" : "am-role-user"
//                     }`}
//                   >
//                     {isAdmin ? "Admin" : "User"}
//                   </span>
//                 </td> */}

//                 {/* Modules Assigned */}
//                 <td className="am-td">
//                   <div className="am-modules-stack">
//                     {isAdmin ? (
//                       <span className="am-module-pill all-modules">All 4 Modules</span>
//                     ) : (
//                       enabledModules.map((m) => (
//                         <span key={m.module_name} className="am-module-pill">
//                           {m.module_name.charAt(0).toUpperCase() + m.module_name.slice(1)}
//                         </span>
//                       ))
//                     )}
//                   </div>
//                 </td>

//                 {/* Permissions */}
//                 {/* <td className="am-td">
//                   <div className="am-permissions-stack">
//                     {isAdmin ? (
//                       <PermissionBadge type="all" />
//                     ) : (
//                       <>
//                         <PermissionBadge type="create" />
//                         <PermissionBadge type="update" />
//                         <PermissionBadge type="delete" />
//                         <PermissionBadge type="more" count={1} />
//                       </>
//                     )}
//                   </div>
//                 </td> */}



//                                 {/* Permissions */}
//                 <td className="am-td">
//                   <div className="am-permissions-stack">
//                     {isAdmin ? (
//                       <PermissionBadge type="all" />
//                     ) : grantedActions.length === 0 ? (
//                       <span style={{ color: "#94a3b8", fontSize: "12.5px" }}>
//                         No permissions
//                       </span>
//                     ) : (
//                       <>
//                         {grantedActions.slice(0, 3).map((action) => (
//                           <PermissionBadge key={action} type={action} />
//                         ))}
//                         {grantedActions.length > 3 && (
//                           <PermissionBadge
//                             type="more"
//                             count={grantedActions.length - 3}
//                           />
//                         )}
//                       </>
//                     )}
//                   </div>
//                 </td>

//                 {/* Status */}
//                 <td className="am-td">
//                   <span
//                     className={`am-status-badge ${
//                       user.status === "active"
//                         ? "am-status-active"
//                         : "am-status-inactive"
//                     }`}
//                   >
//                     <span className="am-status-dot" />
//                     {user.status === "active" ? "Active" : "Inactive"}
//                   </span>
//                 </td>

//                 {/* Last Updated */}
//                 <td className="am-td" style={{ color: "#64748b", fontSize: "12.5px" }}>
//                   {user.last_updated}
//                 </td>

//                 {/* Action */}
//                 <td className="am-td" style={{ textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
//                   <button
//                     type="button"
//                     className="am-action-btn"
//                     onClick={() => handleRowClick(user.user_id)}
//                     title="View user permissions"
//                   >
//                     <Eye size={17} />
//                   </button>
//                 </td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </div>
//   );
// }




















import React from "react";
import { Eye, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PermissionBadge from "./PermissionBadge";
import { useAccess } from "../../services/AccessContext";
import { moduleLabel } from "./utils/moduleLabel";


const ALL_ACTIONS = ["view", "create", "update", "delete", "export"];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function AccessUserTable({ users, onViewUser, bp = "desktop" }) {
  const navigate = useNavigate();
  const { can } = useAccess();
  const canUpdate = can("access_management", "update");
  const isTablet = bp === "tablet";

  const handleRowClick = (userId) => {
    if (onViewUser) onViewUser(userId);
    else navigate(`/access-management/${userId}`);
  };

  return (
    <div className="am-table-container">
      <table className={`am-table ${isTablet ? "am-table-tablet" : ""}`}>
        <thead>
          <tr>
            <th className="am-th">User</th>
            {!isTablet && <th className="am-th">Email</th>}
            <th className="am-th">Modules Assigned</th>
            <th className="am-th">Permissions</th>
            <th className="am-th">Status</th>
            {!isTablet && <th className="am-th">Last Updated</th>}
            <th className="am-th" style={{ textAlign: "right" }}>
              {isTablet ? "Actions" : ""}
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isAdmin = user.user_type === "admin";

            const enabledModules = (user.access_module_list || []).filter(
              (m) => m.view || m.create || m.update || m.delete || m.export
            );

            const grantedActions = ALL_ACTIONS.filter((action) =>
              enabledModules.some((m) => m[action])
            );

            const shownModules = isTablet ? enabledModules.slice(0, 2) : enabledModules;
            const hiddenModules = enabledModules.length - shownModules.length;

            return (
              <tr
                key={user.user_id}
                className="am-tr"
                style={{ cursor: "pointer" }}
                onClick={() => handleRowClick(user.user_id)}
              >
                {/* User */}
                <td className="am-td">
                  <div className="am-user-cell">
                    <div className="am-avatar">
                      {user.avatar || (user.name ? user.name[0] : "U")}
                    </div>
                    <div className="am-user-meta">
                      <span className="am-user-name">
                        {user.full_name || `${user.name} ${user.last_name || ""}`.trim()}
                      </span>
                      {isTablet && <span className="am-user-email">{user.email}</span>}
                      <span className="am-user-phone">{user.mobile}</span>
                    </div>
                  </div>
                </td>

                {/* Email (desktop) */}
                {!isTablet && (
                  <td className="am-td am-td-email" style={{ color: "#475569" }}>
                    {user.email}
                  </td>
                )}

                {/* Modules */}
                <td className="am-td">
                  <div className="am-modules-stack">
                    {isAdmin ? (
                      <span className="am-module-pill all-modules">All 4 Modules</span>
                    ) : (
                      <>
                   {shownModules.map((m) => (
  <span key={m.module_name} className="am-module-pill">
    {moduleLabel(m.module_name)}
  </span>
))}
                        {hiddenModules > 0 && (
                          <span className="am-module-pill">+{hiddenModules}</span>
                        )}
                      </>
                    )}
                  </div>
                </td>

                {/* Permissions */}
                <td className="am-td">
                  <div className="am-permissions-stack">
                    {isAdmin ? (
                      <PermissionBadge type="all" />
                    ) : grantedActions.length === 0 ? (
                      <span style={{ color: "#94a3b8", fontSize: "12.5px" }}>No permissions</span>
                    ) : (
                      <>
                        {grantedActions.slice(0, 3).map((action) => (
                          <PermissionBadge key={action} type={action} />
                        ))}
                        {grantedActions.length > 3 && (
                          <PermissionBadge type="more" count={grantedActions.length - 3} />
                        )}
                      </>
                    )}
                  </div>
                </td>

                {/* Status */}
                <td className="am-td">
                  <span
                    className={`am-status-badge ${
                      user.status === "active" ? "am-status-active" : "am-status-inactive"
                    }`}
                  >
                    <span className="am-status-dot" />
                    {user.status === "active" ? "Active" : "Inactive"}
                  </span>
                </td>

                {/* Last Updated (desktop) */}
                {!isTablet && (
                  <td className="am-td" style={{ color: "#64748b", fontSize: "12.5px" }}>
                    {user.last_updated}
                  </td>
                )}

                {/* Actions */}
                <td
                  className="am-td"
                  style={{ textAlign: "right" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {isTablet ? (
                    <div className="am-tablet-actions">
                      <button
                        type="button"
                        className="am-tab-btn"
                        onClick={() => handleRowClick(user.user_id)}
                      >
                        <Eye size={14} /> View
                      </button>
                      {canUpdate && (
                        <button
                          type="button"
                          className="am-tab-btn primary"
                          onClick={() => navigate(`/access-management/edit/${user.user_id}`)}
                        >
                          <Pencil size={14} /> Edit
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="am-action-btn"
                      onClick={() => handleRowClick(user.user_id)}
                      title="View user permissions"
                    >
                      <Eye size={17} />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}