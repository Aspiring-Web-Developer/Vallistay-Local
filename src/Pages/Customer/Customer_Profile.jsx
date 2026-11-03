








import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
import api from "../../services/api";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
import { T, Avatar, Btn, Pill } from "./shared";
import { useToast } from "../Stays/Rooms/Room_Shared";
import { Eye, Download, ExternalLink, X, FileText, ShieldCheck, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useAccess } from "../../services/AccessContext";

/* ─── Clean Vector Icons ─────────────────────────────────────────── */
function IconMail({ size = 14, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );
}

function IconPhone({ size = 14, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
}

function IconDownload({ size = 15, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function IconClose({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

const DOC_LABELS = {
  aadhar_card: "Aadhaar Card",
  pan_card: "PAN Card",
  driving_license: "Driving License",
  passport: "Passport",
  visa: "Visa",
};
const LATO = `'Lato', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
// const LATO = `'Lato', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;

/* ─── Lightbox Document Viewer Modal ─────────────────────────────── */
// function DocPreviewModal({ isOpen, onClose, fileUrl, fileName }) {
//   if (!isOpen || !fileUrl) return null;
//   const isPdf = fileUrl.toLowerCase().endsWith(".pdf");

//   return createPortal(
//     <div style={{
//       position: "fixed", inset: 0, zIndex: 10005,
//       background: "rgba(17, 24, 39, 0.82)", backdropFilter: "blur(6px)",
//       display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
//       fontFamily: LATO,
//     }}>
//       {/* Load Lato (skip if it's already in index.html) */}
//       <link
//         rel="stylesheet"
//         href="https://fonts.googleapis.com/css2?family=Lato:wght@400;500;600;700&display=swap"
//       />

//       <div style={{
//         background: T.white, borderRadius: T.radiusLg, width: "100%", maxWidth: 900,
//         height: "88vh", display: "flex", flexDirection: "column", overflow: "hidden",
//         boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
//         fontFamily: LATO,
//       }}>
//         <div style={{
//           padding: "14px 20px", borderBottom: `1px solid ${T.border}`,
//           display: "flex", alignItems: "center", justifyContent: "space-between", background: T.bg,
//         }}>
//           <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
//             <FileText size={18} color={T.purple} />
//             <span style={{ fontSize: 14, fontWeight: 700, color: T.text, fontFamily: LATO, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//               {fileName || "Document Preview"}
//             </span>
//           </div>
//           <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//             <a
//               href={fileUrl}
//               target="_blank"
//               rel="noreferrer"
//               title="Open in new tab"
//               style={{
//                 display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 10px",
//                 borderRadius: T.radius, border: `1px solid ${T.border}`, background: T.white,
//                 color: T.text, fontSize: 12, fontWeight: 600, textDecoration: "none",
//                 fontFamily: LATO,
//               }}
//             >
//               <ExternalLink size={13} /> Open
//             </a>
//             <button
//               onClick={onClose}
//               style={{
//                 border: "none", background: "#e5e7eb", borderRadius: "50%", width: 28, height: 28,
//                 cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
//                 color: T.textSec, fontFamily: LATO,
//               }}
//             >
//               <X size={16} />
//             </button>
//           </div>
//         </div>

//         <div style={{ flex: 1, background: "#1f2937", display: "flex", alignItems: "center", justifyContent: "center", overflow: "auto", padding: 16 }}>
//           {isPdf ? (
//             <iframe
//               src={`${fileUrl}#toolbar=0`}
//               title="PDF Preview"
//               style={{ width: "100%", height: "100%", border: "none", borderRadius: T.radius, background: "#fff" }}
//             />
//           ) : (
//             <img
//               src={fileUrl}
//               alt="Document"
//               style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 4 }}
//             />
//           )}
//         </div>
//       </div>
//     </div>,
//     document.body
//   );
// }


/* ─── URL helpers ────────────────────────────────────────────────── */
const IMG_RE = /\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i;
const PDF_RE = /\.pdf(\?.*)?$/i;
const toFullUrl = (raw) =>
  !raw ? null : /^(https?:|blob:|data:)/.test(raw) ? raw : `${API_BASE_URL}${raw.startsWith("/") ? "" : "/"}${raw}`;
const isPdfUrl = (u) => PDF_RE.test(u || "");
const isImgUrl = (u) => IMG_RE.test(u || "") || /^(data:image|blob:)/.test(u || "");

/* ─── Full Preview Modal (prev / next, keyboard, smooth) ─────────── */
function DocPreviewModal({ isOpen, onClose, items = [], index = 0, onIndex }) {
  const total = items.length;
  const cur = items[index];

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && index < total - 1) onIndex(index + 1);
      if (e.key === "ArrowLeft" && index > 0) onIndex(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, index, total]);

  if (!isOpen || !cur?.url) return null;
  const pdf = isPdfUrl(cur.url);

  const navBtn = (side, disabled, onClick, Icon) => (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        position: "absolute", top: "50%", [side]: 14, transform: "translateY(-50%)",
        width: 40, height: 40, borderRadius: "50%", border: "none",
        background: "rgba(255,255,255,0.92)", boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
        display: disabled ? "none" : "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", zIndex: 2,
      }}
    >
      <Icon size={20} color="#111827" />
    </button>
  );

  return createPortal(
    <div
      onClick={onClose}
      className="pv-backdrop"
      style={{
        position: "fixed", inset: 0, zIndex: 10005,
        background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        fontFamily: LATO,
      }}
    >
      <style>{`
        @keyframes pvFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes pvPop { from { opacity: 0; transform: scale(.95) translateY(12px) } to { opacity: 1; transform: none } }
        .pv-backdrop { animation: pvFade .2s ease }
        .pv-box { animation: pvPop .28s cubic-bezier(.34,1.3,.64,1) }
        .pv-media { animation: pvFade .25s ease }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        className="pv-box"
        style={{
          background: "#fff", borderRadius: 18, width: "100%", maxWidth: 940, height: "90vh",
          display: "flex", flexDirection: "column", overflow: "hidden",
          boxShadow: "0 30px 70px rgba(0,0,0,0.4)",
        }}
      >
        {/* header */}
        <div style={{ padding: "12px 18px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: T.purpleLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <FileText size={16} color={T.purple} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {cur.name || "Document Preview"}
              </div>
              {total > 1 && <div style={{ fontSize: 11, color: T.textSec }}>{index + 1} of {total}</div>}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <a href={cur.url} target="_blank" rel="noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 8, border: `1px solid ${T.border}`, color: T.text, fontSize: 12, fontWeight: 600, textDecoration: "none", fontFamily: LATO }}>
              <ExternalLink size={13} /> Open
            </a>
            <a href={cur.url} download={cur.name || "document"}
              style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 8, background: T.purple, color: "#fff", fontSize: 12, fontWeight: 600, textDecoration: "none", fontFamily: LATO }}>
              <Download size={13} /> Download
            </a>
            <button onClick={onClose}
              style={{ border: "none", background: "#f3f4f6", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X size={16} color={T.textSec} />
            </button>
          </div>
        </div>

        {/* viewer */}
        <div style={{ position: "relative", flex: 1, background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", overflow: "auto", padding: 12 }}>
          {navBtn("left", index === 0, () => onIndex(index - 1), ChevronLeft)}
          {navBtn("right", index >= total - 1, () => onIndex(index + 1), ChevronRight)}

          {pdf ? (
            <iframe key={cur.url} className="pv-media" src={`${cur.url}#toolbar=0`} title="PDF Preview"
              style={{ width: "100%", height: "100%", border: "none", borderRadius: 8, background: "#fff" }} />
          ) : (
            <img key={cur.url} className="pv-media" src={cur.url} alt={cur.name}
              style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 6 }} />
          )}
        </div>

        {/* thumbnail strip */}
        {total > 1 && (
          <div style={{ display: "flex", gap: 8, padding: "10px 14px", borderTop: `1px solid ${T.border}`, overflowX: "auto", background: "#fff" }}>
            {items.map((it, i) => (
              <button key={i} type="button" onClick={() => onIndex(i)} title={it.name}
                style={{
                  width: 54, height: 54, flexShrink: 0, borderRadius: 8, padding: 0, overflow: "hidden", cursor: "pointer",
                  border: i === index ? `2px solid ${T.purple}` : `1px solid ${T.border}`,
                  opacity: i === index ? 1 : 0.65, background: T.bg, transition: "all .15s",
                }}>
                {isImgUrl(it.url)
                  ? <img src={it.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  : <FileText size={20} color={T.purple} />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

/* ─── Documents dropdown (slide down / slide up) ─────────────────── */
function DocumentsAccordion({ docs, onOpen, isMobile }) {
  const [open, setOpen] = useState(false); // change to true if you want it open by default

  return (
    <div style={{
      background: T.white, border: `1px solid ${T.border}`, borderRadius: T.radiusLg,
      marginBottom: 20, boxShadow: T.shadow, overflow: "hidden",
    }}>
      {/* header / toggle */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: isMobile ? "14px 16px" : "16px 24px", background: open ? T.purpleLight : T.white,
          border: "none", cursor: "pointer", transition: "background .25s ease", fontFamily: "inherit",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ShieldCheck size={17} color={T.purple} />
          <span style={{ fontSize: 13, fontWeight: 800, color: T.purple, letterSpacing: ".04em" }}>DOCUMENTS</span>
          <span style={{ background: T.purple, color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 999 }}>
            {docs.length}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: T.textSec, fontWeight: 600 }}>{open ? "Hide" : "Show"}</span>
          <ChevronDown size={18} color={T.purple}
            style={{ transition: "transform .35s ease", transform: open ? "rotate(180deg)" : "rotate(0deg)" }} />
        </div>
      </button>

      {/* animated body: 0fr -> 1fr gives smooth height with no fixed px */}
      <div style={{
        display: "grid", gridTemplateRows: open ? "1fr" : "0fr",
        transition: "grid-template-rows .4s cubic-bezier(.4,0,.2,1)",
      }}>
        <div style={{ overflow: "hidden", minHeight: 0, visibility: open ? "visible" : "hidden", transition: "visibility .4s" }}>
          <div style={{
            padding: isMobile ? "6px 16px 18px" : "8px 24px 22px",
            borderTop: `1px solid ${T.border}`,
          }}>
            <div style={{
              display: "grid", gap: 14, marginTop: 14,
              gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fill, minmax(170px, 1fr))",
            }}>
              {docs.map((d, i) => {
                const img = isImgUrl(d.url);
                const pdf = isPdfUrl(d.url);
                return (
                  <button
                    key={i}
                    type="button"
                    className="doc-card"
                    onClick={() => onOpen(i)}
                    style={{
                      padding: 0, textAlign: "left", cursor: "pointer", background: T.white,
                      border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden",
                      fontFamily: "inherit",
                      opacity: open ? 1 : 0, transform: open ? "translateY(0)" : "translateY(-10px)",
                      transition: `opacity .35s ease ${open ? i * 60 : 0}ms, transform .35s ease ${open ? i * 60 : 0}ms, box-shadow .2s, border-color .2s`,
                    }}
                  >
                    {/* small preview */}
                    <div className="doc-thumb" style={{ position: "relative", height: 110, background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                      {img ? (
                        <img src={d.url} alt={d.label} loading="lazy"
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform .3s ease" }} />
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                          <FileText size={30} color={T.purple} />
                          <span style={{ fontSize: 10.5, fontWeight: 800, color: T.purple }}>{pdf ? "PDF" : "FILE"}</span>
                        </div>
                      )}
                      <div className="doc-hover" style={{
                        position: "absolute", inset: 0, background: "rgba(15,23,42,0.45)",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        color: "#fff", fontSize: 12, fontWeight: 700, opacity: 0, transition: "opacity .2s",
                      }}>
                        <Eye size={16} /> View
                      </div>
                    </div>
                    {/* name */}
                    <div style={{ padding: "10px 12px" }}>
                      <div title={d.label} style={{ fontSize: 13, fontWeight: 700, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {d.label}
                      </div>
      <div style={{ fontSize: 11, color: T.textSec, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
  {d.fileName}
</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .doc-card:hover { box-shadow: 0 8px 20px rgba(17,24,39,0.10); border-color: ${T.purple} !important; }
        .doc-card:hover .doc-hover { opacity: 1 !important; }
        .doc-card:hover .doc-thumb img { transform: scale(1.06); }
      `}</style>
    </div>
  );
}



/* ─── Helpers ────────────────────────────────────────────────────── */
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

const useBreakpoint = () => {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const handler = () => setW(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return { isMobile: w < 640, isTablet: w >= 640 && w < 1024 };
};

const fmtDate = (ms) => {
  if (!ms) return "—";
  const d = new Date(ms);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) +
    " · " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
};

const fmtAmount = (amount, currency = "INR") => {
  const symbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency === "EUR" ? "€" : (currency || "");
  return `${symbol}${Number(amount || 0).toLocaleString("en-IN")}`;
};

function StatusBadge({ status }) {
  const s = (status || "").toLowerCase();
  const map = {
    success:   { bg: T.greenLight, fg: T.green },
    completed: { bg: T.greenLight, fg: T.green },
    paid:      { bg: T.greenLight, fg: T.green },
    failed:    { bg: T.redLight,   fg: T.red },
    declined:  { bg: T.redLight,   fg: T.red },
    cancelled: { bg: T.redLight,   fg: T.red },
    pending:   { bg: T.blueLight,  fg: T.blue },
    processing:{ bg: T.blueLight,  fg: T.blue },
  };
  const { bg, fg } = map[s] || { bg: "#f3f4f6", fg: T.textSec };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, background: bg, color: fg,
      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, textTransform: "capitalize",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: fg }} />
      {status || "unknown"}
    </span>
  );
}

function StatPill({ label, value }) {
  return (
    <div style={{
      background: T.purple, color: "#fff", borderRadius: T.radiusLg,
      padding: "12px 18px", minWidth: 120, textAlign: "center", flex: "1 1 120px",
    }}>
      <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.2 }}>{value}</div>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".06em", opacity: 0.85, marginTop: 3, textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

function EmptyHistory({ filtered }) {
  return (
    <div style={{
      minHeight: 260, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 10, color: T.textSec, padding: "40px 20px",
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: "50%", background: T.purpleLight,
        display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4,
      }}>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={T.purple} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2h9l3 3v17a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" />
          <path d="M9 9h6M9 13h6M9 17h3" />
        </svg>
      </div>
      <div style={{ fontWeight: 700, fontSize: 16, color: T.text }}>
        {filtered ? "No transactions match this filter" : "No payment history yet"}
      </div>
    </div>
  );
}

function TransactionRow({ tx, isLast, isMobile }) {
  const [h, setH] = useState(false);
  if (isMobile) {
    return (
      <div style={{
        padding: "14px 16px", borderBottom: isLast ? "none" : `1px solid ${T.border}`,
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: T.text }}>{fmtAmount(tx.amount, tx.currency)}</span>
          <StatusBadge status={tx.payment_status} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.textSec }}>
          <span>{tx.reference_id || "—"}</span>
          <span>{tx.payment_method || "—"}</span>
        </div>
        <div style={{ fontSize: 11, color: T.textTer }}>{fmtDate(tx.created_date_time?.$date)}</div>
      </div>
    );
  }
  return (
    <div
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr 1fr 1fr",
        alignItems: "center", padding: "13px 20px",
        borderBottom: isLast ? "none" : `1px solid ${T.border}`,
        background: h ? T.rowHover : T.white, transition: "background .15s",
        borderLeft: h ? `3px solid ${T.purple}` : "3px solid transparent",
      }}
    >
      <div>
        <div style={{ fontWeight: 700, fontSize: 13, color: T.text }}>{tx.reference_id || "—"}</div>
        <div style={{ fontSize: 11, color: T.textTer, textTransform: "capitalize" }}>{tx.history_type || "—"}</div>
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{fmtAmount(tx.amount, tx.currency)}</div>
      <div style={{ fontSize: 13, color: T.text }}>{tx.payment_method || "—"}</div>
      <div><StatusBadge status={tx.payment_status} /></div>
      <div style={{ fontSize: 12.5, color: T.textSec }}>{fmtDate(tx.created_date_time?.$date)}</div>
    </div>
  );
}

/* ─── PDF Modal ──────────────────────────────────────────────────── */
const loadHtml2Pdf = () => {
  return new Promise((resolve, reject) => {
    if (window.html2pdf) { resolve(window.html2pdf); return; }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    script.onload = () => resolve(window.html2pdf);
    script.onerror = () => reject(new Error("Could not load HTML2PDF"));
    document.body.appendChild(script);
  });
};

function generatePDFHTML(customer, historyList, totalPaid) {
  const currency = "INR";
  const nowStr = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const tableRowsHTML = historyList.map((tx, idx) => `
    <tr style="background: ${idx % 2 === 0 ? "#ffffff" : "#f8fafc"};">
      <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 11px;">${idx + 1}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #0b0f17; font-size: 12px;">${tx.reference_id || "—"}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #475569; text-transform: capitalize; font-size: 11.5px;">${tx.history_type || "Payment"}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #475569; font-size: 11.5px; text-transform: uppercase;">${tx.payment_method || "—"}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 11px;">${fmtDate(tx.created_date_time?.$date)}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 700; text-align: right; color: #0f172a; font-size: 12.5px;">${fmtAmount(tx.amount, tx.currency || currency)}</td>
    </tr>
  `).join("");

  return `
    <div style="font-family: 'Inter', sans-serif; color: #1e293b; background: #ffffff; width: 680px; margin: 0 auto; padding: 28px; box-sizing: border-box;">
      <div style="font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">Payment Statement</div>
      <div style="font-size: 12px; color: #64748b; margin-bottom: 20px;">Official Financial Record · Date: ${nowStr}</div>
      <table style="width:100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background: #f1f5f9; text-align: left; font-size: 11px; text-transform: uppercase;">
            <th style="padding: 10px 12px;">#</th>
            <th style="padding: 10px 12px;">Reference ID</th>
            <th style="padding: 10px 12px;">Type</th>
            <th style="padding: 10px 12px;">Method</th>
            <th style="padding: 10px 12px;">Date</th>
            <th style="padding: 10px 12px; text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>${tableRowsHTML}</tbody>
      </table>
      <div style="text-align: right; font-size: 18px; font-weight: 800;">Total Paid: ${fmtAmount(totalPaid, currency)}</div>
    </div>
  `;
}

function PDFModal({ isOpen, onClose, customer, history, totalPaid, pushToast }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const previewHTML = useMemo(() => generatePDFHTML(customer, history, totalPaid), [customer, history, totalPaid]);

  if (!isOpen) return null;

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      const html2pdf = await loadHtml2Pdf();
      const element = document.createElement("div");
      element.innerHTML = previewHTML;
      document.body.appendChild(element);

      await html2pdf().set({
        margin: [6, 6, 6, 6],
        filename: `Statement_${customer.name}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      }).from(element).save();

      document.body.removeChild(element);
      if (pushToast) pushToast("PDF downloaded!", "success");
    } catch (err) {
      if (pushToast) pushToast(getErrorMessage(err, "Failed to download PDF"), "error");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(17,26,47,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 16, maxWidth: 800, width: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "16px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Statement PDF Preview</div>
          <button onClick={onClose} style={{ border: "none", background: "transparent", cursor: "pointer" }}><IconClose /></button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", background: "#f3f4f6", padding: 24, display: "flex", justifyContent: "center" }}>
          <div style={{ background: "#fff", padding: 16, borderRadius: 4, width: 680, maxWidth: "100%" }} dangerouslySetInnerHTML={{ __html: previewHTML }} />
        </div>
        <div style={{ padding: "14px 24px", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <Btn variant="ghost" onClick={onClose}>Close</Btn>
          <Btn onClick={handleDownloadPDF} disabled={isDownloading}>{isDownloading ? "Downloading…" : "Download PDF"}</Btn>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Customer Profile Component ────────────────────────────── */
/* ─── Main Customer Profile Component ────────────────────────────── */
export default function CustomerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useBreakpoint();
  const token = localStorage.getItem("access_token");
  const { push, ToastHost } = useToast();
  const { can } = useAccess();
  const canUpdate = can("customers", "update");
  const canExport = can("customers", "export");

  const [customer, setCustomer] = useState(location.state?.customer || null);
  const [customerLoading, setCustomerLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [methodFilter, setMethodFilter] = useState("all");
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState({ open: false, items: [], index: 0 });

  /* Always fetch fresh data directly from GET API (/customers/) */
  useEffect(() => {
    setCustomerLoading(true);
    api.get(`${API_BASE_URL}/customers/`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const rows = res.data?.data || [];
        const found = rows.find(c => c.customer_id === id);
        if (found) {
          setCustomer({
            id: found.customer_id,
            name: found.name,
            last_name: found.last_name,
            email: found.email,
            mobile: found.mobile,
            mobile_country_code: found.mobile_country_code,
            address: found.address,
            state: found.state,
            country: found.country,
            customer_type: found.customer_type || "domestic",
            proof_type: found.proof_type || "",
            customer_image: found.customer_image || found.image || null,
            domestic_customer_proof: found.domestic_customer_proof || null,
            passport: found.passport || null,
            visa: found.visa || null,
            is_active: found.is_active,
            additional_document_name: found.additional_document_name || "",
            additional_document: found.additional_document || null,
            additional_documents: Array.isArray(found.additional_documents)
              ? found.additional_documents.map(d => ({
                  id: d.additional_document_id,
                  name: d.name || "",
                  file: d.file || null,
                }))
              : [],
          });
        }
      })
      .catch(err => push(getErrorMessage(err, "Could not load customer"), "error"))
      .finally(() => setCustomerLoading(false));
  }, [id]);

  useEffect(() => {
    setHistoryLoading(true);
    api.get(`${API_BASE_URL}/payment_history/list_payment_history`, {
      params: { customer_id: id },
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => setHistory(res.data?.data || []))
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }, [id]);

  const methods = useMemo(() => Array.from(new Set(history.map(h => h.payment_method).filter(Boolean))), [history]);
  const filteredHistory = useMemo(() => methodFilter === "all" ? history : history.filter(h => h.payment_method === methodFilter), [history, methodFilter]);
  const totalPaid = useMemo(() => history.filter(h => (h.payment_status || "").toLowerCase() === "success").reduce((s, h) => s + Number(h.amount || 0), 0), [history]);

  if (customerLoading) {
    return (
      <div style={{ minHeight: 300, display: "flex", alignItems: "center", justifyContent: "center", color: T.textSec }}>
        <div style={{ width: 26, height: 26, borderRadius: "50%", border: `3px solid ${T.purpleLight}`, borderTopColor: T.purple, animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!customer) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: T.textSec }}>
        Guest not found.
        <div style={{ marginTop: 14 }}><Btn onClick={() => navigate("/customers")}>Back to guest</Btn></div>
      </div>
    );
  }

  const fullAvatarUrl = toFullUrl(customer.customer_image || customer.image);

  /* ─── Build KYC documents (single source, no duplicates) ─── */
  const kycDocs = [];

  const pushDoc = (label, raw) => {
    if (!raw) return;
    kycDocs.push({
      label,
      url: toFullUrl(raw),
      fileName: decodeURIComponent(raw.split("?")[0].split("/").pop() || ""),
    });
  };

  const isIntl = customer.customer_type === "international";

  if (!isIntl) {
    pushDoc(DOC_LABELS[customer.proof_type] || "Domestic ID Proof", customer.domestic_customer_proof);
  } else {
    pushDoc("Passport", customer.passport);
    pushDoc("Visa Document", customer.visa);
  }

  if (customer.additional_documents?.length) {
    customer.additional_documents.forEach(d => pushDoc(d.name || "Additional Document", d.file));
  } else {
    pushDoc(customer.additional_document_name || "Additional Document", customer.additional_document);
  }

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',Arial,sans-serif", color: T.text, marginTop: 30, paddingBottom: 30 }}>

      {/* Header bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => navigate("/customers")}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px",
              borderRadius: T.radiusMd, border: `1px solid ${T.border}`, background: T.white,
              color: T.text, fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            ‹ Back
          </button>
          <span style={{ fontSize: 13, color: T.textTer }}>
            Guests › <span style={{ color: T.text, fontWeight: 700 }}>{customer.name}</span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {canExport && (
            <Btn variant="ghost" onClick={() => setIsPdfModalOpen(true)} disabled={historyLoading || history.length === 0}>
              <IconDownload size={15} color={T.textSec} />
              Download PDF
            </Btn>
          )}
          {canUpdate && (
            <Btn onClick={() => navigate(`/customers/edit/${customer.id}`, { state: { customer } })} style={{ padding: "9px 23px", fontSize: 14 }}>
              Edit Profile
            </Btn>
          )}
        </div>
      </div>

      {/* Top Profile Card */}
      <div style={{
        background: T.white, border: `1px solid ${T.border}`, borderRadius: T.radiusLg,
        boxShadow: T.shadow, padding: isMobile ? "18px 16px" : "24px 26px", marginBottom: 20,
      }}>
        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
            {fullAvatarUrl ? (
              <div
                onClick={() => setPreviewDoc({ open: true, index: 0, items: [{ url: fullAvatarUrl, name: `${customer.name} Photo` }] })}
                style={{
                  width: 64, height: 64, borderRadius: "50%", overflow: "hidden",
                  border: `2px solid ${T.white}`, boxShadow: `0 0 0 2px ${T.border}`,
                  flexShrink: 0, background: T.bg, cursor: "pointer",
                }}
                title="Click to view photo"
              >
                <img src={fullAvatarUrl} alt={customer.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ) : (
              <Avatar name={customer.name} size={64} />
            )}

            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: T.text }}>{customer.name} {customer.last_name || ""}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", marginTop: 6, fontSize: 13, color: T.textSec }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><IconMail size={13} /> {customer.email || "—"}</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><IconPhone size={13} /> {customer.mobile ? `+${customer.mobile_country_code || ""} ${customer.mobile}` : "—"}</span>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                <Pill color={customer.is_active ? "green" : "gray"}>{customer.is_active ? "Active" : "Inactive"}</Pill>
                <Pill color={isIntl ? "blue" : "purple"}>
                  {isIntl ? "International" : "Domestic"}
                </Pill>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: "17px" }}>
            <StatPill label="Total Paid" value={fmtAmount(totalPaid)} />
            <StatPill label="Transactions" value={history.length} />
          </div>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(5, 1fr)",
          gap: "16px 16px", paddingTop: 18, marginTop: 18, borderTop: `1px dashed ${T.border}`,
        }}>
          {[
            { label: "Guest Type", value: isIntl ? "International" : "Domestic" },
            { label: "Country", value: customer.country },
            { label: "State", value: customer.state },
            { label: "Address", value: customer.address },
            { label: "Last Name", value: customer.last_name },
          ].map(({ label, value }) => (
            <div key={label} style={{ minWidth: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.textTer, textTransform: "uppercase", letterSpacing: ".05em" }}>{label}</div>
              <div style={{ fontSize: 13.5, color: T.text, fontWeight: 500, marginTop: 3 }}>{value || "—"}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Documents */}
      {kycDocs.length > 0 && (
        <DocumentsAccordion
          docs={kycDocs}
          isMobile={isMobile}
          onOpen={(i) =>
            setPreviewDoc({
              open: true,
              index: i,
              items: kycDocs.map(d => ({ url: d.url, name: d.label })),
            })
          }
        />
      )}

      {/* Payment history card */}
      <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: T.radiusLg, boxShadow: T.shadow, overflow: "hidden" }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10,
          padding: "16px 20px", borderBottom: `1px solid ${T.border}`,
        }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: T.text }}>Payment History</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {methods.length > 0 && (
              <select
                value={methodFilter}
                onChange={e => setMethodFilter(e.target.value)}
                style={{
                  padding: "8px 12px", borderRadius: T.radiusMd, border: `1.5px solid ${T.border}`,
                  fontSize: 13, color: T.text, background: T.bg, outline: "none", cursor: "pointer",
                }}
              >
                <option value="all">All Methods</option>
                {methods.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            )}
          </div>
        </div>

        {historyLoading ? (
          <div style={{ minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center", color: T.textSec }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", border: `3px solid ${T.purpleLight}`, borderTopColor: T.purple, animation: "spin 0.8s linear infinite" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filteredHistory.length === 0 ? (
          <EmptyHistory filtered={history.length > 0} />
        ) : (
          <>
            {!isMobile && (
              <div style={{
                display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr 1fr 1fr",
                padding: "11px 20px", background: T.purpleLight,
                fontSize: 11, fontWeight: 700, color: T.purpleDark, letterSpacing: ".05em", textTransform: "uppercase",
              }}>
                <span>Reference</span><span>Amount</span><span>Method</span><span>Status</span><span>Date</span>
              </div>
            )}
            {filteredHistory.map((tx, i) => (
              <TransactionRow key={tx.payment_history_id || tx._id?.$oid || i} tx={tx} isLast={i === filteredHistory.length - 1} isMobile={isMobile} />
            ))}
          </>
        )}
      </div>

      {/* Lightbox Document Viewer Modal */}
      <DocPreviewModal
        isOpen={previewDoc.open}
        items={previewDoc.items}
        index={previewDoc.index}
        onIndex={(i) => setPreviewDoc(p => ({ ...p, index: i }))}
        onClose={() => setPreviewDoc({ open: false, items: [], index: 0 })}
      />

      {/* PDF Statement Modal */}
      <PDFModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        customer={customer}
        history={filteredHistory}
        totalPaid={totalPaid}
        pushToast={push}
      />

      <ToastHost />
    </div>
  );
}