import React from "react";
import { X, Mail, Phone, ShieldCheck, CalendarDays, LogOut } from "lucide-react";

const Row = ({ icon: Icon, label, value }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
    <div style={{ width: 34, height: 34, borderRadius: 8, background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon size={16} />
    </div>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0f172a", wordBreak: "break-word" }}>{value || "—"}</div>
    </div>
  </div>
);

export default function UserProfile({ isOpen, onClose, onLogout, user }) {
  if (!isOpen) return null;

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", zIndex: 1050 }} />
      <aside
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, width: 380, maxWidth: "100vw",
          background: "#fff", zIndex: 1060, display: "flex", flexDirection: "column",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.15)", fontFamily: "'Inter','Segoe UI',sans-serif",
        }}
      >
        <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eef2f6" }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>My Profile</span>
          <button type="button" onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: 20, flex: 1, overflowY: "auto" }}>
          {!user ? (
            <div style={{ textAlign: "center", color: "#64748b", padding: "40px 0", fontSize: 13 }}>Loading profile...</div>
          ) : (
            <>
              <div style={{ textAlign: "center", marginBottom: 18 }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#dbeafe", color: "#1d4ed8", fontSize: 24, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
                  {user.avatar}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>{user.full_name}</div>
                <span style={{ display: "inline-block", marginTop: 6, padding: "3px 12px", borderRadius: 9999, fontSize: 12, fontWeight: 600, background: user.status === "active" ? "#dcfce7" : "#f1f5f9", color: user.status === "active" ? "#15803d" : "#64748b" }}>
                  {user.status === "active" ? "Active" : "Inactive"}
                </span>
              </div>

              <Row icon={Mail} label="Email" value={user.email} />
              <Row icon={Phone} label="Mobile" value={user.mobile} />
              {/* <Row icon={ShieldCheck} label="Role" value={user.role_title} /> */}
              <Row icon={CalendarDays} label="Member since" value={user.created_at} />
            </>
          )}
        </div>

        <div style={{ padding: 16, borderTop: "1px solid #eef2f6" }}>
          <button
            type="button" onClick={onLogout}
            style={{ width: "100%", padding: "11px 0", borderRadius: 10, border: "none", background: "#EF4444", color: "#fff", fontSize: 13.5, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            <LogOut size={15} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}