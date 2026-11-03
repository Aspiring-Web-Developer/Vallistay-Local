import React from "react";
import { useNavigate } from "react-router-dom";
import { moduleLabel } from "./utils/moduleLabel";

export default function AccessUserCard({ user }) {
  const navigate = useNavigate();
  const isAdmin = user.user_type === "admin";

  const enabledModules = (user.access_module_list || [])
    .filter((m) => m.view || m.create || m.update || m.delete || m.export)
.map((m) => moduleLabel(m.name || m.module_name));

  // Count total scopes
  let scopeCount = 0;
  (user.access_module_list || []).forEach((m) => {
    if (m.view) scopeCount++;
    if (m.create) scopeCount++;
    if (m.update) scopeCount++;
    if (m.delete) scopeCount++;
    if (m.export) scopeCount++;
  });

  const getAvatarBg = () => {
    if (isAdmin) return { bg: "#f3e8ff", color: "#9333ea" };
    if (user.avatar === "AK" || user.avatar === "AP") return { bg: "#dcfce7", color: "#16a34a" };
    return { bg: "#e0f2fe", color: "#0284c7" };
  };

  const av = getAvatarBg();

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #eef2f6",
        borderRadius: "14px",
        padding: "20px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "220px",
      }}
    >
      <div>
        {/* Top Header Row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12,minWidth: 0  }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "12px",
                background: av.bg,
                color: av.color,
                fontSize: 15,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {user.avatar || (user.name ? user.name[0] : "U")}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
                {user.full_name || `${user.name} ${user.last_name || ""}`.trim()}
              </div>
      <div style={{ fontSize: 12.5, color: "#64748b", overflowWrap: "anywhere" }}>
  {user.email}
</div>
            </div>
          </div>

          <div>
            {isAdmin ? (
              <span
                style={{
                  background: "#f3e8ff",
                  color: "#9333ea",
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: "9999px",
                }}
              >
                Admin
              </span>
            ) : (
              <span
                style={{
                  background: "#dcfce7",
                  color: "#16a34a",
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: "9999px",
                }}
              >
                Active
              </span>
            )}
          </div>
        </div>

        {/* Middle Metadata Rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "#64748b", marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Type:</span>
            <span style={{ fontWeight: 600, color: "#0f172a" }}>
              {isAdmin ? "Admin" : "User"}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Modules:</span>
            <span style={{ fontWeight: 500, color: "#334155", textAlign: "right" }}>
              {isAdmin ? "All Modules" : enabledModules.length > 0 ? enabledModules.join(", ") : "None"}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Permissions:</span>
            <span
              style={{
                fontWeight: 700,
                color: isAdmin ? "#7c3aed" : "#2563eb",
                cursor: "pointer",
              }}
              onClick={() => navigate(`/access-management/${user.user_id}`)}
            >
              {isAdmin ? "Full 16 Scopes" : `${scopeCount || 4} Scopes`}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Actions Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, paddingTop: 14, borderTop: "1px solid #f1f5f9" }}>
        <button
          type="button"
          className="am-btn-outline"
          style={{ justifyContent: "center", padding: "7px 0", fontSize: 13 }}
          onClick={() => navigate(`/access-management/${user.user_id}`)}
        >
          View Details
        </button>

        <button
          type="button"
          className="am-btn-outline"
          style={{ justifyContent: "center", padding: "7px 0", fontSize: 13 }}
          onClick={() => navigate(`/access-management/edit/${user.user_id}`)}
        >
          Edit
        </button>
      </div>
    </div>
  );
}
