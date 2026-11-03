

import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, LogOut,Globe } from "lucide-react";
import axios from "axios";
import Profile from "../Pages/Profile";
import api from "../services/api";
import UserProfile from "./UserProfile";
import { fetchUserById } from "../Pages/AccessManagement/services/accessManagementApi";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const T = {
  bg: "#FFFFFF",
  searchBg: "#F5F6F9",
  border: "#EDEEF3",
  text: "#1F2937",
  muted: "#8A93A6",
  accent: "#4584E5",
  danger: "#EF4444",
  ocean: "#0D9488", 
  font: "'Inter','Segoe UI',sans-serif",
};

const S = {
  navbar: {
    height: 56,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 16px",
    background: T.bg,
    borderBottom: `1px solid ${T.border}`,
    position: "sticky",
    top: 0,
    zIndex: 100,
    fontFamily: T.font,
    gap: 16,
  },
  left: { display: "flex", alignItems: "center", gap: 12, flexShrink: 0 },
  menuBtn: {
    width: 30, height: 30, borderRadius: 6, border: "none",
    background: "transparent", cursor: "pointer", display: "flex",
    alignItems: "center", justifyContent: "center", color: T.muted, flexShrink: 0,
  },
  breadcrumb: { display: "flex", flexDirection: "column", lineHeight: 1.15 },
  navTitle: { fontWeight: 700, fontSize: 13.5, color: T.text, letterSpacing: "0.02em" },
  navSub: { fontSize: 11, color: T.muted },
  right: { display: "flex", alignItems: "center", gap: 6, flexShrink: 0 },
  avatarBtn: {
    width: 36, height: 36, borderRadius: "50%",
    border: "1.5px solid #3d5346", background: T.bg,
    padding: 0, display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", flexShrink: 0, marginLeft: 4,
    transition: "box-shadow 0.15s",
  },
  avatarCircle: {
    width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden",
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "#fff",
  },
  avatarImg: { width: "100%", height: "100%", objectFit: "contain", padding: 2 },
  
  avatarFallback: {
    width: "100%", height: "100%", display: "flex", alignItems: "center",
    justifyContent: "center", background: T.accent, color: "#fff", fontSize: 13, fontWeight: 700,
  },
  dropdown: {
    position: "absolute", top: 44, right: 0, background: "#fff",
    borderRadius: 10, border: `1px solid ${T.border}`,
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)", minWidth: 160, padding: 6, zIndex: 200,
  },
  dropdownItem: {
    display: "flex", alignItems: "center", gap: 8, width: "100%",
    padding: "9px 10px", borderRadius: 6, border: "none", background: "transparent",
    cursor: "pointer", fontSize: 13, fontWeight: 500, color: T.text,
    fontFamily: T.font, textAlign: "left",
  },
  siteBtn: {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 14px",
  borderRadius: 54,
  border: `1.5px solid #3d5346`,
  background: T.bg,          // matches navbar bg
  color: "#3d5346",
  fontSize: 13,
  fontWeight: 600,
  fontFamily: T.font,
  cursor: "pointer",
  textDecoration: "none",
  transition: "background 0.15s, color 0.15s",
  flexShrink: 0,
},

};
const PATH_LABELS = {
  customers: "guests",
};
const labelOf = (p) => PATH_LABELS[p] || p;

function initialsOf(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

/* ── Logout Modal ── */
function LogoutConfirmModal({ visible, onConfirm, onCancel }) {
  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes logoutBackdropIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes logoutBoxIn {
          from { opacity: 0; scale: 0.85; translate: 0 16px; }
          to   { opacity: 1; scale: 1;    translate: 0 0; }
        }
        .logout-backdrop {
          animation: logoutBackdropIn 0.2s ease forwards;
        }
        .logout-box {
          animation: logoutBoxIn 0.3s cubic-bezier(0.34,1.36,0.64,1) forwards;
        }
        .logout-confirm-btn {
          transition: filter 0.15s, transform 0.12s, box-shadow 0.15s;
        }
        .logout-confirm-btn:hover {
          filter: brightness(1.08);
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(239,68,68,0.38) !important;
        }
        .logout-confirm-btn:active { transform: translateY(0); }
        .logout-cancel-btn {
          transition: background 0.15s, transform 0.12s;
        }
        .logout-cancel-btn:hover {
          background: #F3F4F6 !important;
          transform: translateY(-1px);
        }
        .logout-cancel-btn:active { transform: translateY(0); }




        .navbar-site-btn:hover {
  background: ${T.ocean} !important;
  color: #fff !important;
}


      `}</style>

      {/* Backdrop */}
      <div
        className="logout-backdrop"
        onClick={onCancel}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99998,
          background: "rgba(15,23,42,0.5)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        }}
      />

      {/* Modal — dead center via margin auto trick, NOT transform */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <div
          className="logout-box"
          style={{
            pointerEvents: "all",
            background: "#fff",
            borderRadius: 20,
            boxShadow: "0 32px 80px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.08)",
            padding: "40px 36px 32px",
            width: 360,
            maxWidth: "calc(100vw - 40px)",
            textAlign: "center",
            fontFamily: T.font,
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: 68, height: 68, borderRadius: "50%",
              background: "linear-gradient(135deg,#fee2e2,#fecaca)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: "0 4px 16px rgba(239,68,68,0.2)",
            }}
          >
            <LogOut size={28} color="#EF4444" strokeWidth={2} />
          </div>

          <p style={{ fontSize: 19, fontWeight: 700, color: "#111827", margin: "0 0 8px" }}>
            Leaving so soon?
          </p>

          <p style={{ fontSize: 13.5, color: T.muted, margin: "0 0 28px", lineHeight: 1.65 }}>
            Are You Sure You Want To Leave?<br />
      
          </p>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="logout-cancel-btn"
              onClick={onCancel}
              style={{
                flex: 1, padding: "11px 0", borderRadius: 10,
                border: `1.5px solid ${T.border}`, background: "#fff",
                fontSize: 13.5, fontWeight: 600, color: T.text,
                cursor: "pointer", fontFamily: T.font,
              }}
            >
              Stay
            </button>

            <button
              className="logout-confirm-btn"
              onClick={onConfirm}
              style={{
                flex: 1, padding: "11px 0", borderRadius: 10,
                border: "none", background: "#EF4444",
                fontSize: 13.5, fontWeight: 600, color: "#fff",
                cursor: "pointer", fontFamily: T.font,
                boxShadow: "0 4px 12px rgba(239,68,68,0.3)",
              }}
            >
              Yes, Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Navbar ── */
export default function Navbar({ toggleSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const menuRef = useRef(null);
const isAdmin = localStorage.getItem("user_type") === "admin";
const [navProfile, setNavProfile] = useState(null); // admin profile
const [navUser, setNavUser] = useState(null);       // normal user
const [profileLoading, setProfileLoading] = useState(true);

useEffect(() => {
  if (isAdmin) {
    api.get("/profile/get_profile")
      .then((r) => setNavProfile(r.data?.data || null))
      .catch(() => setNavProfile(null));
  } else {
    const uid = localStorage.getItem("user_id");
    if (!uid) return;
    fetchUserById(uid)
      .then(setNavUser)
      .catch(() => setNavUser(null));
  }
}, [isAdmin]);
  useEffect(() => {
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);




  useEffect(() => {
  const done = () => setProfileLoading(false);
  if (isAdmin) {
    api.get("/profile/get_profile")
      .then((r) => setNavProfile(r.data?.data || null))
      .catch(() => setNavProfile(null))
      .finally(done);
  } else {
    const uid = localStorage.getItem("user_id");
    if (!uid) return done();
    fetchUserById(uid).then(setNavUser).catch(() => setNavUser(null)).finally(done);
  }
}, [isAdmin]);

  const isUUID = (v) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

  const paths = location.pathname.split("/").filter(Boolean);
  const visiblePaths = paths.filter((p) => !isUUID(p));

  const handleLogout = () => {
    setMenuOpen(false);
    setProfileOpen(false);
    setLogoutModalOpen(true);
  };

  const confirmLogout = async () => {
    setLogoutModalOpen(false);
    const token = localStorage.getItem("access_token");
    try {
      await axios.post(
        `${API_BASE_URL}/auth/logout`, {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (e) {
      console.error(e);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_id");
      localStorage.removeItem("user_type");
      navigate("/login", { replace: true });
    }
  };

  return (
    <>
      <style>{`
        .navbar-icon-btn:hover { background: #F0F1F5 !important; color: #1F2937 !important; }
        .navbar-dropdown-item:hover { background: #F5F6F9 !important; }
         .navbar-site-btn:hover {
  background: #3d5346 !important;
  color: #fff !important;
}
      `}</style>

      <nav style={S.navbar}>
        {/* LEFT */}
        <div style={S.left}>
          <button className="navbar-icon-btn" onClick={toggleSidebar} style={S.menuBtn}>
            <Menu size={16} />
          </button>
          <div style={S.breadcrumb}>
            <span style={S.navTitle}>
              {visiblePaths.length > 0
                ? labelOf(visiblePaths[visiblePaths.length - 1]).replace(/-/g, " ").toUpperCase()
                : "DASHBOARD"}
            </span>
            <span style={S.navSub}>
              Home{visiblePaths.map((p, i) => <span key={i}> / {labelOf(p)}</span>)}
            </span>
          </div>
        </div>

        {/* RIGHT */}
        <div style={S.right}>
        <a
            href="https://vallistay.com/"
    target="_blank"
    rel="noopener noreferrer"
    className="navbar-site-btn"
    style={S.siteBtn}
  >
    <Globe size={14} />
    Site
  </a>
          <div style={{ position: "relative" }} ref={menuRef}>
            <button
              className="navbar-avatar-btn"
              style={S.avatarBtn}
              onClick={() => setProfileOpen(true)}
              title="My Profile"
            >
              <span style={S.avatarCircle}>
                {profileLoading ? (
                  <div style={{ ...S.avatarFallback, background: "#E5E7EB" }} />
                ) : isAdmin ? (
                  navProfile?.logo
                    ? <img src={navProfile.logo} alt="" style={S.avatarImg} />
                    : <div style={S.avatarFallback}>{initialsOf(navProfile?.name)}</div>
                ) : (
                  <div style={S.avatarFallback}>{navUser?.avatar || "U"}</div>
                )}
              </span>
          
            </button>

            {menuOpen && (
              <div style={S.dropdown}>
                <button
                  className="navbar-dropdown-item"
                  style={S.dropdownItem}
                  onClick={handleLogout}
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* <Profile
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        onLogout={handleLogout}
      /> */}

{isAdmin ? (
  <Profile isOpen={profileOpen} onClose={() => setProfileOpen(false)} onLogout={handleLogout} />
) : (
  <UserProfile isOpen={profileOpen} onClose={() => setProfileOpen(false)} onLogout={handleLogout} user={navUser} />
)}
      <LogoutConfirmModal
        visible={logoutModalOpen}
        onConfirm={confirmLogout}
        onCancel={() => setLogoutModalOpen(false)}
      />
    </>
  );
}