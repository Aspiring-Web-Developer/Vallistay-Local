



import React, { useEffect, useState, useMemo } from "react";
import { Trash, AddCircle, Eye } from "iconsax-react";
import api from "../../services/api";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
import { useNavigate } from "react-router-dom";
import CustomerDrawer from "./Each_Customer";
import { T, Avatar, Btn, IconBtn, Pill } from "./shared";
import { useToast } from "../Stays/Rooms/Room_Shared";
import { useAccess } from "../../services/AccessContext";
import pagination from "../AuditLogs/Pagination";

function getErrorMessage(err, fallback = "Something went wrong") {
  const data = err?.response?.data;
  if (!data) return err?.message || fallback;
  if (typeof data === "string") return data;
  if (data.message) return data.message;
  if (data.error) return typeof data.error === "string" ? data.error : fallback;
  const firstKey = Object.keys(data)[0];
  if (firstKey) {
    const val = data[firstKey];
    return Array.isArray(val) ? val[0] : String(val);
  }
  return fallback;
}

/* ─── Global Styles & Responsive Tablet/Mobile Switch ─────────────── */
const STYLE_ID = "cust-list-styles";
if (typeof document !== "undefined" && !document.getElementById(STYLE_ID)) {
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .cust-wrap {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
      color: ${T.text};
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
    }
      .al-pg {
  display: flex;
  align-items: center;
  gap: 4px;
}

    .cust-name-link {
      color: ${T.purple};
      font-weight: 600;
      font-size: 13px;
      text-decoration: none;
      cursor: pointer;
    }
    .cust-name-link:hover { text-decoration: underline; }

    .cust-sort-th {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
      user-select: none;
    }

    .cust-more-menu-item:hover { background: ${T.bg} !important; }
    .cust-view-toggle-btn:hover { background: ${T.purpleLight} !important; }

    @keyframes cust-spin { to { transform: rotate(360deg); } }

    /* ── Single-line ellipsis cell ── */
    .cust-cell-ellipsis {
      display: block;
      max-width: 100%;
      min-width: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .cust-cell-ellipsis:hover {
      overflow-x: auto;
      text-overflow: clip;
      scrollbar-width: thin;
    }
    .cust-cell-ellipsis::-webkit-scrollbar { height: 3px; }
    .cust-cell-ellipsis::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 3px; }
    .cust-cell-ellipsis::-webkit-scrollbar-track { background: transparent; }

    /* ── Responsive table scroll wrapper ── */
    .cust-table-scroll {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      position: relative;
    }
    .cust-table-scroll::-webkit-scrollbar { height: 6px; }
    .cust-table-scroll::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 4px; }
    .cust-table-scroll::-webkit-scrollbar-track { background: transparent; }

    /* ── Frozen Name column in desktop table ── */
    .cust-col-frozen {
      position: sticky;
      left: 0;
      z-index: 2;
      box-shadow: 2px 0 4px -2px rgba(0,0,0,0.08);
    }

    /* ── Compact Tab/Mobile Card List View ── */
    .cust-card-list {
      display: none;
      padding: 8px;
      gap: 8px;
      flex-direction: column;
    }
    .cust-card-item {
      background: #fff;
      border: 1px solid ${T.border};
      border-radius: 10px;
      padding: 10px 12px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.03);
      cursor: pointer;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .cust-card-item:hover {
      border-color: #CBD5E1;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    .cust-card-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 7px;
      gap: 8px;
    }
    .cust-card-person {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      flex: 1;
    }
    .cust-card-title {
      font-size: 13.5px;
      font-weight: 700;
      color: #111827;
      line-height: 1.25;
    }
    .cust-card-sub {
      font-size: 11.5px;
      color: ${T.textSec};
      line-height: 1.2;
    }
    .cust-card-badges {
      display: flex;
      gap: 5px;
      align-items: center;
      flex-shrink: 0;
    }

    /* ── Compact Tab Micro Grid (Smaller than invoice page) ── */
    .cust-card-mid-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
      background: #F8F9FC;
      border-radius: 7px;
      padding: 6px 10px;
      margin-bottom: 7px;
    }
    .cust-card-mid-cell {
      display: flex;
      flex-direction: column;
      gap: 1px;
      min-width: 0;
    }
    .cust-card-mid-label {
      font-size: 9px;
      font-weight: 700;
      color: #9AA1AF;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .cust-card-mid-val {
      font-size: 11.5px;
      font-weight: 600;
      color: #1F2937;
    }

    .cust-card-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 6px;
      border-top: 1px solid #F1F2F6;
      font-size: 11px;
      color: ${T.textSec};
    }
    .cust-card-action-btns {
      display: flex;
      gap: 6px;
      align-items: center;
    }
    .cust-card-view-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px;
      border-radius: 5px;
      background: ${T.purpleLight};
      color: ${T.purpleDark};
      border: 1px solid #D8B4FE;
      font-size: 11.5px;
      font-weight: 700;
      cursor: pointer;
    }

    /* ── Responsive breakpoint switch (860px and down) ── */
    @media (max-width: 860px) {
      .cust-table-scroll { display: none; }
      .cust-card-list { display: flex; }
      .cust-header-actions {
        width: 100%;
        justify-content: space-between;
      }
    }

    @media (max-width: 580px) {
      .cust-card-mid-grid {
        grid-template-columns: 1fr 1fr;
      }
    }
  `;
  document.head.appendChild(style);
}

/* ─── Responsive helper ──────────────────────────────────────────── */
const useBreakpoint = () => {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const handler = () => setW(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return {
    isMobile: w < 640,
    isTablet: w >= 640 && w < 1024,
    isCardMode: w <= 860,
  };
};

function GridIcon({ active }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" fill={active ? "#fff" : T.textSec} />
      <rect x="9" y="1" width="6" height="6" rx="1.5" fill={active ? "#fff" : T.textSec} />
      <rect x="1" y="9" width="6" height="6" rx="1.5" fill={active ? "#fff" : T.textSec} />
      <rect x="9" y="9" width="6" height="6" rx="1.5" fill={active ? "#fff" : T.textSec} />
    </svg>
  );
}
function ListIcon({ active }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="2" width="14" height="2.5" rx="1.25" fill={active ? "#fff" : T.textSec} />
      <rect x="1" y="6.75" width="14" height="2.5" rx="1.25" fill={active ? "#fff" : T.textSec} />
      <rect x="1" y="11.5" width="14" height="2.5" rx="1.25" fill={active ? "#fff" : T.textSec} />
    </svg>
  );
}
function MoreIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.text} strokeWidth="2.2" strokeLinecap="round">
      <circle cx="5" cy="12" r="1.4" fill={T.text} stroke="none" />
      <circle cx="12" cy="12" r="1.4" fill={T.text} stroke="none" />
      <circle cx="19" cy="12" r="1.4" fill={T.text} stroke="none" />
    </svg>
  );
}

/* ─── Tiny inline confirm popover ────────────────────────────────── */
/* ─── Delete confirm popover (with warning + consequences) ───────── */
function ConfirmPopover({ title, text, onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 10001, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={onCancel} style={{ position: "absolute", inset: 0, background: "rgba(17,24,39,0.55)", backdropFilter: "blur(2px)" }} />
      <div style={{
        position: "relative", background: T.white, borderRadius: 18, padding: "26px 24px 20px",
        width: "min(380px, 100%)", boxShadow: "0 24px 60px rgba(0,0,0,0.28)",
        textAlign: "center",
      }}>
        <div style={{
          width: 54, height: 54, borderRadius: "50%",
          background: "#FEF2F2", border: "1px solid #FECACA",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 14px",
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={T.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
          </svg>
        </div>

        <div style={{ fontWeight: 800, fontSize: 16.5, color: T.text, marginBottom: 6 }}>
          {title}
        </div>
        <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.55, marginBottom: 8 }}>
          {text}
        </div>

        <div style={{
          background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 10,
          padding: "10px 12px", fontSize: 12, color: "#92400E", textAlign: "left",
          display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 18,
        }}>
          <span style={{ fontSize: 14, lineHeight: 1 }}>⚠️</span>
          <span>
            Once deleted, you won't be able to view this guest's{" "}
            <b>payment history</b>, or any other saved details.
          </span>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: "10px 14px", borderRadius: T.radius, border: `1px solid ${T.border}`,
            background: T.white, color: T.text, fontSize: 13.5, fontWeight: 700, cursor: "pointer",
          }}>Cancel</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: "10px 14px", borderRadius: T.radius, border: "none",
            background: T.red, color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: "pointer",
            boxShadow: "0 2px 8px rgba(220,38,38,0.3)",
          }}>Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Avatar Image helper ────────────────────────────────────────── */
function CustomerAvatar({ c, size = 32 }) {
  const imageUrl = c.customer_image || c.image;
  const fullAvatarUrl = imageUrl
    ? (imageUrl.startsWith("http") || imageUrl.startsWith("blob:") ? imageUrl : `${API_BASE_URL}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`)
    : null;

  if (fullAvatarUrl) {
    return (
      <div style={{
        width: size, height: size, borderRadius: "50%", overflow: "hidden",
        border: `1.5px solid ${T.white}`, boxShadow: `0 0 0 1px ${T.border}`,
        flexShrink: 0, background: T.bg,
      }}>
        <img
          src={fullAvatarUrl}
          alt={c.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      </div>
    );
  }
  return <Avatar name={c.name} size={size} />;
}

/* ─── Grid View Card (For Desktop grid mode) ─────────────────────── */
function CustomerCard({ c, onDelete, onView }) {
  const { can } = useAccess();
const canDelete = can("customers", "delete");
  const [h, setH] = useState(false);

  return (
    <div
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: T.white, border: `1px solid ${h ? T.purple : T.border}`,
        borderRadius: T.radiusLg, padding: 0, overflow: "hidden",
        display: "flex", flexDirection: "column",
        boxShadow: h ? T.shadowMd : T.shadow,
        transform: h ? "translateY(-2px)" : "none",
        transition: "all .2s ease",
      }}
    >
      <div style={{
        background: `linear-gradient(135deg, ${T.purpleLight} 0%, #fff 100%)`,
        padding: "16px 16px 14px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
          <CustomerAvatar c={c} size={42} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="cust-cell-ellipsis" style={{ fontWeight: 700, fontSize: 14, color: T.text }}>
              {c.name} {c.last_name || ""}
            </div>
            <div className="cust-cell-ellipsis" style={{ fontSize: 11.5, color: T.textSec, marginTop: 2 }}>{c.email}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
          <IconBtn title="View"   onClick={() => onView(c.id, c)}><Eye  size={13} color={T.blue} /></IconBtn>
          {canDelete && (
  <IconBtn title="Delete" onClick={() => onDelete(c.id)}><Trash size={13} color={T.red} /></IconBtn>
)}

        </div>
      </div>

      <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <Pill color={c.customer_type === "international" ? "blue" : "purple"}>
            {c.customer_type === "international" ? "International" : "Domestic"}
          </Pill>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 10px", paddingTop: 10, borderTop: `1px dashed ${T.border}` }}>
          {[
            { label: "Mobile",    value: c.mobile ? `+${c.mobile_country_code || ""} ${c.mobile}` : "" },
            { label: "Country",   value: c.country },
            { label: "Address",   value: c.address },
            { label: "Last Name", value: c.last_name },
          ].map(({ label, value }) => (
            <div key={label} style={{ minWidth: 0 }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: T.textTer, textTransform: "uppercase", letterSpacing: ".05em" }}>{label}</div>
              <div className="cust-cell-ellipsis" style={{ fontSize: 12.5, color: T.text, fontWeight: 500, marginTop: 2 }}>{value || "—"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Compact Tablet/Mobile Card Item (Low Row Height) ────────────── */
function CustomerTabCard({ c, onDelete, onView }) {
  const { can } = useAccess();
const canDelete = can("customers", "delete");
  return (
    <div className="cust-card-item" onClick={onView}>
      <div className="cust-card-head">
        <div className="cust-card-person">
          <CustomerAvatar c={c} size={30} />
          <div style={{ minWidth: 0 }}>
            <div className="cust-card-title cust-cell-ellipsis">
              {c.name} {c.last_name || ""}
            </div>
            <div className="cust-card-sub cust-cell-ellipsis">
              {c.email || "No email"}
            </div>
          </div>
        </div>

        <div className="cust-card-badges">
          <Pill color={c.customer_type === "international" ? "blue" : "purple"}>
            {c.customer_type === "international" ? "Intl" : "Domestic"}
          </Pill>
        </div>
      </div>

      {/* Low-height compact details micro grid */}
      <div className="cust-card-mid-grid">
        <div className="cust-card-mid-cell">
          <span className="cust-card-mid-label">Phone</span>
          <span className="cust-card-mid-val cust-cell-ellipsis">
            {c.mobile ? `+${c.mobile_country_code || ""} ${c.mobile}` : "—"}
          </span>
        </div>
        <div className="cust-card-mid-cell">
          <span className="cust-card-mid-label">Country</span>
          <span className="cust-card-mid-val cust-cell-ellipsis">{c.country || "—"}</span>
        </div>
        <div className="cust-card-mid-cell">
          <span className="cust-card-mid-label">Address</span>
          <span className="cust-card-mid-val cust-cell-ellipsis">{c.address || "—"}</span>
        </div>
      </div>

      <div className="cust-card-bottom" onClick={e => e.stopPropagation()}>
        <span className="cust-cell-ellipsis" style={{ maxWidth: "55%" }}>
          ID: #{String(c.id).slice(0, 8)}
        </span>
        <div className="cust-card-action-btns">
          <button type="button" className="cust-card-view-btn" onClick={onView}>
            <Eye size={12} color="currentColor" />
            View
          </button>
{canDelete && (
  <button
    type="button"
    onClick={onDelete}
    style={{ background: "none", border: "none", padding: "3px 6px", cursor: "pointer", color: T.red, display: "flex", alignItems: "center" }}
    title="Delete guest"
  >
    <Trash size={13} color={T.red} />
  </button>
)}
        </div>
      </div>
    </div>
  );
}

/* ─── Filter bar with Customer Type ──────────────────────────────── */
function FilterBar({ filters, onChange }) {
  const fields = [
    { key: "name",    placeholder: "Name" },
    { key: "email",   placeholder: "Email" },
    { key: "mobile",  placeholder: "Mobile" },
    { key: "country", placeholder: "Country" },
  ];
  return (
    <div style={{
      background: T.white, border: `1px solid ${T.border}`, borderRadius: T.radiusMd,
      padding: "10px 14px", display: "flex", gap: 14,
      alignItems: "center", flexWrap: "wrap", marginBottom: 14,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, color: T.textSec, fontSize: 11.5, fontWeight: 700, flexShrink: 0 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T.purple} strokeWidth="2" strokeLinecap="round">
          <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
        </svg>
        FILTER
      </div>
      {fields.map(({ key, placeholder }) => (
        <div key={key} style={{ flex: "1 1 110px", minWidth: 90 }}>
          <input
            value={filters[key]}
            onChange={e => onChange({ ...filters, [key]: e.target.value })}
            placeholder={placeholder}
            style={{
              width: "100%", boxSizing: "border-box", padding: "5px 2px",
              border: "none", borderBottom: `1.5px solid ${T.border}`,
              fontSize: 12.5, color: T.text, outline: "none", background: "transparent",
              transition: "border-color .15s", borderRadius: 0,
            }}
            onFocus={e => e.target.style.borderBottomColor = T.purple}
            onBlur={e => e.target.style.borderBottomColor = T.border}
          />
        </div>
      ))}
      <div style={{ flex: "1 1 120px", minWidth: 100 }}>
        <select
          value={filters.customer_type || "all"}
          onChange={e => onChange({ ...filters, customer_type: e.target.value })}
          style={{
            width: "100%", boxSizing: "border-box", padding: "5px 2px",
            border: "none", borderBottom: `1.5px solid ${T.border}`,
            fontSize: 12.5, color: filters.customer_type && filters.customer_type !== "all" ? T.text : T.textSec,
            outline: "none", background: "transparent", cursor: "pointer",
          }}
          onFocus={e => e.target.style.borderBottomColor = T.purple}
          onBlur={e => e.target.style.borderBottomColor = T.border}
        >
          <option value="all">All Types</option>
          <option value="domestic">Domestic</option>
          <option value="international">International</option>
        </select>
      </div>
      <button
        onClick={() => onChange({ name: "", email: "", mobile: "", country: "", customer_type: "all" })}
        style={{
          padding: "5px 10px", borderRadius: T.radius, border: "none",
          background: "transparent", color: T.purple, fontSize: 12, fontWeight: 700,
          cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
        }}
      >Clear</button>
    </div>
  );
}

/* ─── Pagination ─────────────────────────────────────────────────── */
function Pagination({ current, total, count, start, end, onChange, isMobile }) {
  if (total <= 1) return null;
  const getPages = () => {
    if (isMobile) {
      const pages = [];
      if (current > 1) pages.push(1);
      if (current > 2) pages.push("...");
      pages.push(current);
      if (current < total - 1) pages.push("...");
      if (current < total) pages.push(total);
      return pages;
    }
    return Array.from({ length: total }, (_, i) => i + 1);
  };
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: isMobile ? "center" : "space-between",
      flexWrap: "wrap", gap: 10, marginTop: 14, padding: "0 4px", fontSize: 12.5, color: T.textSec,
    }}>
      {!isMobile && <span>Showing <b style={{ color: T.text }}>{start}–{end}</b> of <b style={{ color: T.text }}>{count}</b></span>}
      <div style={{ display: "flex", gap: 3, flexWrap: "wrap", justifyContent: "center" }}>
        <button onClick={() => onChange(current - 1)} disabled={current === 1}
          style={{ padding: "4px 9px", borderRadius: T.radius, border: `1px solid ${T.border}`, background: T.white,
            cursor: current === 1 ? "not-allowed" : "pointer", opacity: current === 1 ? 0.4 : 1, fontSize: 13, fontWeight: 600, color: T.text }}>‹</button>
        {getPages().map((p, idx) => p === "..." ? (
          <span key={`dots-${idx}`} style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>…</span>
        ) : (
          <button key={p} onClick={() => onChange(p)}
            style={{
              width: 28, height: 28, borderRadius: T.radius, border: `1px solid ${p === current ? T.purple : T.border}`,
              background: p === current ? T.purple : T.white,
              color: p === current ? "#fff" : T.text,
              cursor: "pointer", fontWeight: p === current ? 700 : 500, fontSize: 12,
              transition: "all .15s",
            }}>{p}</button>
        ))}
        <button onClick={() => onChange(current + 1)} disabled={current === total}
          style={{ padding: "4px 9px", borderRadius: T.radius, border: `1px solid ${T.border}`, background: T.white,
            cursor: current === total ? "not-allowed" : "pointer", opacity: current === total ? 0.4 : 1, fontSize: 13, fontWeight: 600, color: T.text }}>›</button>
      </div>
      {isMobile && <span style={{ width: "100%", textAlign: "center", fontSize: 11.5 }}>{start}–{end} of {count}</span>}
    </div>
  );
}

/* ─── List rows — Desktop flat table row ─────────────────────────── */
const LIST_COLS = "minmax(150px,2fr) minmax(170px,2fr) minmax(120px,1.2fr) minmax(140px,1.3fr) minmax(130px,1fr) 76px";
const LIST_MIN_WIDTH = 840;

function ListRow({ c, isLast, onDelete, onView }) {
  const { can } = useAccess();
const canDelete = can("customers", "delete");
  const [h, setH] = useState(false);
  return (
    <div
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        display: "grid", gridTemplateColumns: LIST_COLS,
        alignItems: "center", padding: "10px 16px", gap: 10,
        borderBottom: isLast ? "none" : `1px solid ${T.border}`,
        background: h ? T.rowHover : T.white, transition: "background .12s",
      }}
    >
      <span
        className="cust-name-link cust-cell-ellipsis cust-col-frozen"
        onClick={onView}
        style={{ background: h ? T.rowHover : T.white, padding: "10px 8px 10px 16px", margin: "-10px 0 -10px -16px" }}
      >{c.name} {c.last_name || ""}</span>
      <span className="cust-cell-ellipsis" style={{ fontSize: 13, color: T.textSec }}>{c.email}</span>
      <div style={{ minWidth: 0 }}>
        <Pill color={c.customer_type === "international" ? "blue" : "purple"}>
          {c.customer_type === "international" ? "International" : "Domestic"}
        </Pill>
      </div>
      <div style={{ minWidth: 0, overflow: "hidden" }}>
        <div className="cust-cell-ellipsis" style={{ fontSize: 13, color: T.text, fontWeight: 500 }}>{c.country || "—"}</div>
        {c.address && (
          <div className="cust-cell-ellipsis" style={{ fontSize: 11, color: T.textSec }}>{c.address}</div>
        )}
      </div>
      <div className="cust-cell-ellipsis" style={{ fontSize: 13, color: T.text, fontWeight: 500 }}>{c.mobile ? `+${c.mobile_country_code || ""} ${c.mobile}` : "—"}</div>
      <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
        <IconBtn title="View"   onClick={onView}  ><Eye   size={14} color={T.blue}  /></IconBtn>
       {canDelete && (
  <IconBtn title="Delete" onClick={onDelete}><Trash size={14} color={T.red} /></IconBtn>
)}
      </div>
    </div>
  );
}

function ListView({ paginated, onDelete, onView }) {
  return (
    <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: T.radiusMd, overflow: "hidden" }}>
      {/* Desktop wide table scroll */}
      <div className="cust-table-scroll">
        <div style={{ minWidth: LIST_MIN_WIDTH }}>
          <div style={{
            display: "grid", gridTemplateColumns: LIST_COLS,
            padding: "9px 16px", background: T.bg, borderBottom: `1px solid ${T.border}`,
            fontSize: 10.5, fontWeight: 700, color: T.textSec, letterSpacing: ".04em", textTransform: "uppercase",
            alignItems: "center", gap: 10,
          }}>
            <span
              className="cust-sort-th cust-col-frozen"
              style={{ background: T.bg, padding: "9px 8px 9px 16px", margin: "-9px 0 -9px -16px" }}
            >Name</span>
            <span>Email</span><span>Guest Type</span><span>Country</span><span>Mobile</span>
            <span style={{ textAlign: "right" }}>Actions</span>
          </div>
          {paginated.map((c, i) => (
            <ListRow key={c.id} c={c} isLast={i === paginated.length - 1}
              onDelete={() => onDelete(c.id)}
              onView={() => onView(c.id, c)} />
          ))}
        </div>
      </div>

      {/* Tablet & Mobile responsive card view (with smaller row height) */}
      <div className="cust-card-list">
        {paginated.map(c => (
          <CustomerTabCard
            key={c.id}
            c={c}
            onDelete={() => onDelete(c.id)}
            onView={() => onView(c.id, c)}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────── */
const ITEMS_PER_PAGE = 8;

export default function ListCustomer() {
  const { can } = useAccess();
const canCreate = can("customers", "create");
  const { isMobile, isTablet, isCardMode } = useBreakpoint();
  const token = localStorage.getItem("access_token");
  const navigate = useNavigate();
  const { push, ToastHost } = useToast();

  const [view, setView] = useState("list");
  const [showFilter, setShowFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [customers, setCustomers] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [viewingId, setViewingId] = useState(null);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [filters, setFilters] = useState({ name: "", email: "", mobile: "", country: "", customer_type: "all" });
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const fetchCustomers = () => {
    setFetchLoading(true);
    api.get(`${API_BASE_URL}/customers/`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const rows = res.data?.data || [];
        setCustomers(rows.map(c => ({
          id: c.customer_id,
          name: c.name,
          last_name: c.last_name,
          email: c.email,
          mobile: c.mobile,
          mobile_country_code: c.mobile_country_code,
          address: c.address,
          country: c.country,
          customer_type: c.customer_type || "domestic",
          customer_image: c.customer_image || c.image || null,
          is_active: c.is_active,
        })));
      })
      .catch(() => {})
      .finally(() => setFetchLoading(false));
  };

  useEffect(() => { fetchCustomers(); }, []);
  useEffect(() => { setCurrentPage(1); }, [filters]);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchName    = !filters.name    || (c.name || "").toLowerCase().includes(filters.name.toLowerCase()) || (c.last_name || "").toLowerCase().includes(filters.name.toLowerCase());
      const matchEmail   = !filters.email   || (c.email || "").toLowerCase().includes(filters.email.toLowerCase());
      const matchMobile  = !filters.mobile  || (c.mobile || "").toString().includes(filters.mobile);
      const matchCountry = !filters.country || (c.country || "").toLowerCase().includes(filters.country.toLowerCase());
      const matchType    = !filters.customer_type || filters.customer_type === "all" || (c.customer_type || "domestic").toLowerCase() === filters.customer_type.toLowerCase();
      return matchName && matchEmail && matchMobile && matchCountry && matchType;
    });
  }, [customers, filters]);

  const confirmDelete = async () => {
    const id = pendingDeleteId;
    setPendingDeleteId(null);
    if (!id) return;
    try {
      await api.delete(`${API_BASE_URL}/customers/delete_customer?customer_id=${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchCustomers();
      push("Deleted!", "success");
    } catch (err) {
      push(getErrorMessage(err, "Could not delete customer"), "error");
    }
  };

  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = filteredCustomers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const activeFiltersCount = Object.entries(filters).filter(([k, v]) => Boolean(v) && (k !== "customer_type" || v !== "all")).length;

  const gridCols = isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(280px, 1fr))";

  return (
    <div className="cust-wrap">
      {/* Header — flat Zoho style with responsive layout */}
{/* Header — flat Zoho style with responsive layout */}
<div style={{
  display: "flex", flexWrap: "wrap",
  alignItems: "center", justifyContent: "space-between",
  marginBottom: 14, gap: 12,
  background: T.white, borderBottom: `1px solid ${T.border}`,
  padding: "12px 4px",
}}>
  <div style={{
    display: "flex", alignItems: "center", gap: 8,
    flexShrink: 0, whiteSpace: "nowrap",
  }}>
    <h3 style={{ margin: 0, fontSize: isMobile ? 18 : 21, fontWeight: 700, color: T.text }}>All Guests</h3>
    <span style={{
      background: "#F1F5F9", color: "#64748B", fontWeight: 700,
      fontSize: 12, padding: "2px 7px", borderRadius: 999
    }}>{filteredCustomers.length}</span>
  </div>

  <div className="cust-header-actions" style={{
    display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
    justifyContent: "flex-end",
    flex: isMobile ? "1 1 100%" : "0 1 auto",
  }}>
    <button
      onClick={() => { setShowFilter(f => !f); setCurrentPage(1); }}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: T.radiusMd,
        border: `1px solid ${showFilter ? T.purple : T.border}`,
        background: showFilter ? T.purpleLight : T.white, color: showFilter ? T.purpleDark : T.text,
        fontSize: 12.5, fontWeight: 600, cursor: "pointer", transition: "all .15s",
      }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
      </svg>
      Filter
      {activeFiltersCount > 0 && (
        <span style={{ background: T.purple, color: "#fff", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 999 }}>{activeFiltersCount}</span>
      )}
    </button>

    {!isCardMode && (
      <div style={{ display: "flex", background: T.bg, border: `1px solid ${T.border}`, borderRadius: T.radiusMd, padding: 3, gap: 2 }}>
        {[{ key: "list", icon: ListIcon }, { key: "grid", icon: GridIcon }].map(({ key, icon: Icon }) => (
          <button key={key} className="cust-view-toggle-btn" onClick={() => setView(key)}
            style={{
              width: 28, height: 26, display: "flex", alignItems: "center", justifyContent: "center",
              background: view === key ? T.purple : "transparent", borderRadius: T.radius,
              border: "none", cursor: "pointer", transition: "all .15s",
            }}><Icon active={view === key} /></button>
        ))}
      </div>
    )}

{canCreate && (
  <Btn onClick={() => navigate("/customers/create")} style={{ padding: "7px 14px", height: 34 }}>
    <AddCircle size={14} color="#fff" />
    New
  </Btn>
)}

    <div style={{ position: "relative" }}>
      {/* <button
        onClick={() => setMoreMenuOpen(o => !o)}
        style={{
          width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: T.radiusMd, border: `1px solid ${T.border}`, background: T.white, cursor: "pointer",
        }}
      ><MoreIcon /></button> */}
      {moreMenuOpen && (
        <>
          <div onClick={() => setMoreMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 199 }} />
          <div style={{
            position: "absolute", top: 38, right: 0, background: T.white, border: `1px solid ${T.border}`,
            borderRadius: T.radiusMd, boxShadow: T.shadowMd, minWidth: 140, padding: 4, zIndex: 200,
          }}>
            {["Refresh list"].map(label => (
              <div key={label} className="cust-more-menu-item"
                onClick={() => { setMoreMenuOpen(false); if (label === "Refresh list") fetchCustomers(); }}
                style={{ padding: "7px 10px", fontSize: 12.5, fontWeight: 500, color: T.text, borderRadius: T.radius, cursor: "pointer" }}
              >{label}</div>
            ))}
          </div>
        </>
      )}
    </div>
  </div>
</div>

      {showFilter && <FilterBar filters={filters} onChange={(f) => { setFilters(f); setCurrentPage(1); }} />}

      {fetchLoading ? (
        <div style={{
          minHeight: 240, display: "flex", alignItems: "center", justifyContent: "center", color: T.textSec,
          background: T.white, border: `1px solid ${T.border}`, borderRadius: T.radiusMd,
        }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 24, height: 24, borderRadius: "50%",
              border: `3px solid ${T.purpleLight}`, borderTopColor: T.purple,
              animation: "cust-spin 0.8s linear infinite",
            }} />
            <span style={{ fontSize: 12.5 }}>Loading guests…</span>
          </div>
        </div>
      ) : (
        <>
          {!fetchLoading && filteredCustomers.length === 0 && (
            <div style={{
              minHeight: 280, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 10,
            }}>
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" stroke="#D1D5DB" strokeWidth="1.5"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#9CA3AF" }}>No guests found</div>
              <div style={{ fontSize: 12.5, color: "#C4C9D4" }}>Adjust your filters or add a new guest</div>
            </div>
          )}

          {/* Desktop Grid View */}
          {view === "grid" && !isCardMode && filteredCustomers.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: 12 }}>
              {paginated.map(c => (
                <CustomerCard key={c.id} c={c}
                  onDelete={(id) => setPendingDeleteId(id)}
                  onView={(id) => navigate(`/customers/${id}`, { state: { customer: c } })}
                />
              ))}
            </div>
          )}

          {/* Desktop Table View & Tablet/Mobile Card List View */}
          {(view === "list" || isCardMode) && filteredCustomers.length > 0 && (
            <ListView
              paginated={paginated}
              onDelete={(id) => setPendingDeleteId(id)}
              onView={(id, c) => navigate(`/customers/${id}`, { state: { customer: c } })}
            />
          )}

{filteredCustomers.length > 0 && totalPages > 1 && (
  <Pagination
    current={currentPage}
    total={totalPages}
    count={filteredCustomers.length}
    start={startIndex + 1}
    end={Math.min(startIndex + ITEMS_PER_PAGE, filteredCustomers.length)}
    onChange={setCurrentPage}
    isMobile={isMobile}
  />
)}
        </>
      )}

      {viewingId && (
        <CustomerDrawer
          customerId={viewingId}
          onClose={() => setViewingId(null)}
          onSaved={() => { fetchCustomers(); }}
          onDeleted={() => { setViewingId(null); fetchCustomers(); }}
        />
      )}

{pendingDeleteId && (
  <ConfirmPopover
    title="Delete this guest?"
    text="This action is permanent and cannot be undone."
    onConfirm={confirmDelete}
    onCancel={() => setPendingDeleteId(null)}
  />
)}

      <ToastHost />
    </div>
  );
}