


import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  ChevronDown,
  ChevronUp,
  ChevronsLeft,
  ChevronsRight,
  BedDouble,
  Building2,
} from "lucide-react";
import { TbHistory } from "react-icons/tb";
import { useAccess } from "../services/AccessContext";
import { Buildings2 } from "iconsax-react";


/* ─────────────────────────────────────────────────
   🎨 THEME
───────────────────────────────────────────────── */
const THEME = {
  bg: "#ffffff",
  border: "#ebebeb",
  activeBg: "#4584E5",
  activeText: "#FFFFFF",
  hoverBg: "#2e355009",
  textPrimary: "#FFFFFF",
  textMuted: "#8a909c",
  textFaint: "#7C87A8",
};

const FONT = `'Lato', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;

/* ─────────────────────────────────────────────────
   ICONSAX ICONS
───────────────────────────────────────────────── */
const DashboardIcon = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_4418_7497)">
      <path d="M19 10.75H17C14.58 10.75 13.25 9.42 13.25 7V5C13.25 2.58 14.58 1.25 17 1.25H19C21.42 1.25 22.75 2.58 22.75 5V7C22.75 9.42 21.42 10.75 19 10.75ZM17 2.75C15.42 2.75 14.75 3.42 14.75 5V7C14.75 8.58 15.42 9.25 17 9.25H19C20.58 9.25 21.25 8.58 21.25 7V5C21.25 3.42 20.58 2.75 19 2.75H17Z" />
      <path d="M7 22.75H5C2.58 22.75 1.25 21.42 1.25 19V17C1.25 14.58 2.58 13.25 5 13.25H7C9.42 13.25 10.75 14.58 10.75 17V19C10.75 21.42 9.42 22.75 7 22.75ZM5 14.75C3.42 14.75 2.75 15.42 2.75 17V19C2.75 20.58 3.42 21.25 5 21.25H7C8.58 21.25 9.25 20.58 9.25 19V17C9.25 15.42 8.58 14.75 7 14.75H5Z" />
      <path d="M6 10.75C3.38 10.75 1.25 8.62 1.25 6C1.25 3.38 3.38 1.25 6 1.25C8.62 1.25 10.75 3.38 10.75 6C10.75 8.62 8.62 10.75 6 10.75ZM6 2.75C4.21 2.75 2.75 4.21 2.75 6C2.75 7.79 4.21 9.25 6 9.25C7.79 9.25 9.25 7.79 9.25 6C9.25 4.21 7.79 2.75 6 2.75Z" />
      <path d="M18 22.75C15.38 22.75 13.25 20.62 13.25 18C13.25 15.38 15.38 13.25 18 13.25C20.62 13.25 22.75 15.38 22.75 18C22.75 20.62 20.62 22.75 18 22.75ZM18 14.75C16.21 14.75 14.75 16.21 14.75 18C14.75 19.79 16.21 21.25 18 21.25C19.79 21.25 21.25 19.79 21.25 18C21.25 16.21 19.79 14.75 18 14.75Z" />
    </g>
    <defs>
      <clipPath id="clip0_4418_7497">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const CustomerIcon = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_3111_32754)">
      <path d="M9.16006 10.87C9.06006 10.86 8.94006 10.86 8.83006 10.87C6.45006 10.79 4.56006 8.84 4.56006 6.44C4.56006 3.99 6.54006 2 9.00006 2C11.4501 2 13.4401 3.99 13.4401 6.44C13.4301 8.84 11.5401 10.79 9.16006 10.87Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.4098 4C18.3498 4 19.9098 5.57 19.9098 7.5C19.9098 9.39 18.4098 10.93 16.5398 11C16.4598 10.99 16.3698 10.99 16.2798 11" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.16021 14.56C1.74021 16.18 1.74021 18.82 4.16021 20.43C6.91021 22.27 11.4202 22.27 14.1702 20.43C16.5902 18.81 16.5902 16.17 14.1702 14.56C11.4302 12.73 6.92021 12.73 4.16021 14.56Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.3398 20C19.0598 19.85 19.7398 19.56 20.2998 19.13C21.8598 17.96 21.8598 16.03 20.2998 14.86C19.7498 14.44 19.0798 14.16 18.3698 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <defs>
      <clipPath id="clip0_3111_32754">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const InvoiceIcon = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_4418_9709)">
      <path d="M22 10V15C22 20 20 22 15 22H9C4 22 2 20 2 15V9C2 4 4 2 9 2H14" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 10H18C15 10 14 9 14 6V2L22 10Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 13H13" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 17H11" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <defs>
      <clipPath id="clip0_4418_9709">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const DepartmentIcon = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_4418_3640)">
      <path d="M2 13.02V15C2 20 4 22 9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.7998 13.7996V9.59961" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.95001 17.9996C9.02697 17.9996 9.90002 17.1265 9.90002 16.0496C9.90002 14.9726 9.02697 14.0996 7.95001 14.0996C6.87306 14.0996 6 14.9726 6 16.0496C6 17.1265 6.87306 17.9996 7.95001 17.9996Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79999 9.60001C8.7941 9.60001 9.59998 8.7941 9.59998 7.79999C9.59998 6.80588 8.7941 6 7.79999 6C6.80588 6 6 6.80588 6 7.79999C6 8.7941 6.80588 9.60001 7.79999 9.60001Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.1999 9.60001C17.194 9.60001 17.9999 8.7941 17.9999 7.79999C17.9999 6.80588 17.194 6 16.1999 6C15.2058 6 14.3999 6.80588 14.3999 7.79999C14.3999 8.7941 15.2058 9.60001 16.1999 9.60001Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.87988 13.8001C8.14988 12.7501 9.10987 11.9701 10.2399 11.9801L12.2999 11.9901C13.8699 12.0001 15.2099 10.9901 15.6999 9.58008" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <defs>
      <clipPath id="clip0_4418_3640">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const AccessIcon = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_4418_3420)">
      <path d="M3.08984 6.73028C3.08984 5.91028 3.70986 4.98028 4.47986 4.67028L10.0498 2.39031C11.2998 1.88031 12.7098 1.88031 13.9598 2.39031L19.5298 4.67028C20.2898 4.98028 20.9199 5.91028 20.9199 6.73028V11.1203C20.9199 16.0103 17.3698 20.5903 12.5198 21.9303C12.1898 22.0203 11.8298 22.0203 11.4998 21.9303C6.64985 20.5903 3.09985 16.0103 3.09985 11.1203" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 12.5C13.1046 12.5 14 11.6046 14 10.5C14 9.39543 13.1046 8.5 12 8.5C10.8954 8.5 10 9.39543 10 10.5C10 11.6046 10.8954 12.5 12 12.5Z" stroke={color} strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 12.5V15.5" stroke={color} strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <defs>
      <clipPath id="clip0_4418_3420">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

/* ─────────────────────────────────────────────────
   STYLE TOKENS
───────────────────────────────────────────────── */
const S = {
  sidebar: (collapsed) => ({
    boxSizing: "border-box",
    width: collapsed ? 65 : 216,
    height: "100vh",
    background: THEME.bg,
    borderRight: `1px solid ${THEME.border}`,
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 1000,
    transition: "width 0.3s cubic-bezier(0.4,0,0.2,1), transform 0.3s ease",
    overflowX: "hidden",
    overflowY: "auto",
    fontFamily: FONT,
    scrollbarWidth: "none",
  }),

  header: {
    display: "flex",
    alignItems: "center",
    padding: "16px 16px 14px",
    gap: 10,
    borderBottom: `1px solid ${THEME.border}`,
    position: "sticky",
    top: 0,
    background: THEME.bg,
    zIndex: 10,
    minHeight: 60,
  },

  logoImg: {
    height: 84,
    width: "auto",
    maxWidth: 180,
    objectFit: "contain",
    flexShrink: 0,
    marginLeft: "40px",
  },

  logoImgCollapsed: {
    height: 35,
    width: 46,
    objectFit: "contain",
    flexShrink: 0,
  },

  collapseBtn: {
    marginLeft: "auto",
    width: 26,
    height: 26,
    borderRadius: 6,
    border: `1px solid ${THEME.border}`,
    background: "transparent",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: THEME.textFaint,
    flexShrink: 0,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.06em",
    color: THEME.textFaint,
    textTransform: "uppercase",
    padding: "18px 18px 6px",
    whiteSpace: "nowrap",
    overflow: "hidden",
  },

  navItem: (active) => ({
    display: "flex",
    alignItems: "center",
    gap: 12,
    height: 39,
    boxSizing: "border-box",
    padding: "0 11px",
    margin: "2px 10px",
    borderRadius: 8,
    cursor: "pointer",
    background: active ? THEME.activeBg : "transparent",
    color: active ? THEME.activeText : THEME.textMuted,
    fontWeight: active ? 600 : 500,
    fontSize: 14,
    textDecoration: "none",
    transition: "background 0.15s, color 0.15s",
    whiteSpace: "nowrap",
    overflow: "hidden",
    border: "none",
    width: "calc(100% - 20px)",
    textAlign: "left",
  }),

  iconWrap: (active) => ({
    width: 20,
    height: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    color: active ? THEME.activeText : THEME.textFaint,
  }),

  submenuWrap: {
    overflow: "hidden",
    transition: "max-height 0.28s ease, opacity 0.28s ease",
  },

  subLink: (active) => ({
    display: "flex",
    alignItems: "center",
    boxSizing: "border-box",
    gap: 8,
    height: 38,
    padding: "0 14px 0 34px",
    marginLeft: "23px",
    marginTop: "2px",
    borderRadius: 8,
    fontSize: 13.5,
    fontWeight: active ? 600 : 400,
    color: active ? THEME.activeText : THEME.textFaint,
    background: active ? THEME.hoverBg : "transparent",
    textDecoration: "none",
    whiteSpace: "nowrap",
    transition: "color 0.15s, background 0.15s",
    cursor: "pointer",
  }),

  tooltip: {
    position: "absolute",
    left: "calc(100% + 10px)",
    top: "50%",
    transform: "translateY(-50%)",
    background: "#111827",
    color: "#fff",
    fontSize: 12,
    fontWeight: 500,
    padding: "5px 10px",
    borderRadius: 6,
    whiteSpace: "nowrap",
    pointerEvents: "none",
    zIndex: 9999,
    boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
  },
};

/* ─────────────────────────────────────────────────
   NAV ITEM (with tooltip when collapsed + hover)
───────────────────────────────────────────────── */
function NavItem({ to, icon, label, collapsed, onClick, exact }) {
  const [tip, setTip] = useState(false);
  const [hover, setHover] = useState(false);
  const location = useLocation();
  const isActive = exact
    ? location.pathname === to
    : location.pathname.startsWith(to);

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => {
        collapsed && setTip(true);
        setHover(true);
      }}
      onMouseLeave={() => {
        setTip(false);
        setHover(false);
      }}
    >
      <NavLink
        to={to}
        onClick={onClick}
        style={{
          ...S.navItem(isActive),
          background: isActive
            ? THEME.activeBg
            : hover
            ? THEME.hoverBg
            : "transparent",
        }}
      >
        <span style={S.iconWrap(isActive)}>{icon}</span>
        {!collapsed && <span>{label}</span>}
      </NavLink>
      {collapsed && tip && <div style={S.tooltip}>{label}</div>}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   ACCORDION SECTION
───────────────────────────────────────────────── */
function AccordionSection({ icon, label, collapsed, setCollapsed, defaultOpen, children, matchPath }) {
  const location = useLocation();
  const isPathActive = location.pathname.startsWith(matchPath);
  const [open, setOpen] = useState(defaultOpen || isPathActive);
  const [tip, setTip] = useState(false);
  const [hover, setHover] = useState(false);

  return (
    <div>
      <div
        style={{ position: "relative" }}
        onMouseEnter={() => {
          collapsed && setTip(true);
          setHover(true);
        }}
        onMouseLeave={() => {
          setTip(false);
          setHover(false);
        }}
      >
        <button
          onClick={() => {
            if (collapsed) {
              setCollapsed(false);
              setTimeout(() => setOpen(true), 200);
              return;
            }
            setOpen((p) => !p);
          }}
          style={{
            ...S.navItem(isPathActive),
            background: isPathActive
              ? THEME.activeBg
              : hover
              ? THEME.hoverBg
              : "transparent",
            justifyContent: "flex-start",
            width: "calc(100% - 20px)",
          }}
        >
          <span style={S.iconWrap(isPathActive)}>{icon}</span>
          {!collapsed && (
            <>
              <span style={{ flex: 1 }}>{label}</span>
              <span style={{ color: THEME.textFaint, flexShrink: 0 }}>
                {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </span>
            </>
          )}
        </button>
        {collapsed && tip && <div style={S.tooltip}>{label}</div>}
      </div>

      {!collapsed && (
        <div style={{ ...S.submenuWrap, maxHeight: open ? 400 : 0, opacity: open ? 1 : 0 }}>
          {children}
        </div>
      )}
    </div>
  );
}

function SubLink({ to, label, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <NavLink
      to={to}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={({ isActive }) => ({
        ...S.subLink(isActive),
        background: isActive ? THEME.hoverBg : hover ? THEME.hoverBg : "transparent",
      })}
    >
      {label}
    </NavLink>
  );
}

function SectionLabel({ label, collapsed }) {
  if (collapsed) return <div style={{ height: 16 }} />;
  return <div style={S.sectionLabel}>{label}</div>;
}

/* ─────────────────────────────────────────────────
   MENU CONFIG
───────────────────────────────────────────────── */
const MENU = [
  { to: "/", label: "Dashboard", icon: DashboardIcon, exact: true },
  { to: "/customers", label: "Guest", icon: CustomerIcon, module: "customers" },
  { to: "/invoices", label: "Invoices", icon: InvoiceIcon, module: "invoice" },
  { to: "/departments", label: "Departments", icon: Buildings2, module: "departments" },
  { to: "/property-management-v2", label: "Room & Booking", icon: Building2, module: "room_booking" },
  { to: "/access-management", label: "Access Management", icon: AccessIcon, module: "access_management" },
  { to: "/audit-logs", label: "Audit Logs", icon: TbHistory, module: "audit_logs" },
];

/* ═══════════════════════════════════════════════
   MAIN SIDEBAR
═══════════════════════════════════════════════ */
export default function Sidebar({ isOpen, collapsed, setCollapsed, setIsOpen }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 992);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 992);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const { canView, loading } = useAccess();
  const visibleMenu = MENU.filter((item) =>
    !item.module ? true : loading ? false : canView(item.module)
  );

  const handleMobileClose = () => {
    if (isMobile) setIsOpen(false);
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Lato:wght@400;500;600;700&display=swap"
      />

      <div
        style={{
          ...S.sidebar(collapsed),
          transform: isOpen || !isMobile ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        {/* ══ HEADER ══ */}
        <div style={S.header}>
          <img
            src={collapsed ? "/Logo_16X16 px.png" : "/Logo_32F32 px .png"}
            alt="Logo"
            style={collapsed ? S.logoImgCollapsed : S.logoImg}
          />
          {!isMobile && (
            <button
              style={S.collapseBtn}
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? "Expand" : "Collapse"}
            >
              {collapsed ? (
                <ChevronsRight size={13} strokeWidth={2.2} />
              ) : (
                <ChevronsLeft size={13} strokeWidth={2.2} />
              )}
            </button>
          )}
        </div>

        {/* ══ MENU ══ */}
        <div style={{ flex: 1, paddingBottom: 24, paddingTop: 6 }}>
          {visibleMenu.map((item) => {
            const Icon = item.icon;
            return (
              <NavItem
                key={item.to}
                to={item.to}
                exact={item.exact}
                icon={<Icon size={19} color="currentColor" strokeWidth={1.7} />}
                label={item.label}
                collapsed={collapsed}
                onClick={handleMobileClose}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}