import { useEffect, useState, useRef } from "react";
import api from "../../../services/api";
import ViewBookingDrawer from "./view_Booking";
import { RT, getRoomType, Spinner, useToast } from "../Rooms/Room_Shared";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ITEMS_PER_PAGE = 8;

/* ─── date helpers (mongo extended json {$date: ms}) ─────────────── */
export function toDate(v) {
  if (!v) return null;
  if (typeof v === "object" && v.$date) return new Date(v.$date);
  return new Date(v);
}
export function fmtDate(v) {
  const d = toDate(v);
  if (!d || isNaN(d)) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/* ─── status color map ────────────────────────────────────────────── */
// export const STATUS_MAP = {
//   pending:   { bg: "#fff7e6", fg: "#b45309", dot: "#f59e0b", label: "Pending" },
//   confirmed: { bg: RT.greenLight, fg: "#15803d", dot: "#22c55e", label: "Confirmed" },
//   cancelled: { bg: RT.redLight, fg: RT.red, dot: RT.red, label: "Cancelled" },
//   completed: { bg: RT.secondaryLight, fg: RT.primaryDark, dot: RT.primary, label: "Completed" },
// };
// const STATUS_KEYS = Object.keys(STATUS_MAP);
export const STATUS_MAP = {
  pending:   { bg: "#fff7e6", fg: "#b45309", dot: "#f59e0b", label: "Pending" },
  booked:    { bg: RT.greenLight, fg: "#15803d", dot: "#22c55e", label: "Booked" },
  checkin:   { bg: "#e0f2fe", fg: "#0369a1", dot: "#0ea5e9", label: "Check In" },
  checkout:  { bg: RT.secondaryLight, fg: RT.primaryDark, dot: RT.primary, label: "Checkout" },
  cancelled: { bg: RT.redLight, fg: RT.red, dot: RT.red, label: "Cancelled" },
};
const STATUS_KEYS = Object.keys(STATUS_MAP);
/* ─── inline status dropdown (colored pill + custom menu) ───────────
   Menu uses position:fixed anchored to the button's own bounding rect,
   so it always renders above the table regardless of any parent
   overflow:hidden / border-radius clipping. ─────────────────────── */
export function StatusDropdown({ status, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const btnRef = useRef(null);
  const s = STATUS_MAP[status] || STATUS_MAP.pending;

  const openMenu = () => {
    if (disabled) return;
    const rect = btnRef.current.getBoundingClientRect();
    const menuWidth = 160;
    // flip to the left edge if menu would overflow the viewport on the right
    const left = rect.right + menuWidth > window.innerWidth
      ? rect.right - menuWidth
      : rect.left;
    setCoords({ top: rect.bottom + 6, left, width: menuWidth });
    setOpen((o) => !o);
  };

  useEffect(() => {
    if (!open) return;
    const reposition = () => {
      if (!btnRef.current) return;
      const rect = btnRef.current.getBoundingClientRect();
      const menuWidth = 160;
      const left = rect.right + menuWidth > window.innerWidth ? rect.right - menuWidth : rect.left;
      setCoords({ top: rect.bottom + 6, left, width: menuWidth });
    };
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open]);

  return (
    <div style={{ position: "relative" }}>
      <button
        ref={btnRef}
        disabled={disabled}
        onClick={openMenu}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: "6px 11px",
          borderRadius: 999,
          border: "none",
          background: s.bg,
          color: s.fg,
          fontSize: 12,
          fontWeight: 700,
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1,
          transition: "transform .12s",
        }}
      >
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
        {s.label}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={s.fg} strokeWidth="3" strokeLinecap="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 9998 }} />
          <div
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              width: coords.width,
              background: RT.white,
              border: `1px solid ${RT.border}`,
              borderRadius: RT.radiusMd,
              boxShadow: RT.shadowMd,
              padding: 6,
              zIndex: 9999,
              animation: "statusMenuIn .15s ease",
            }}
          >
            {STATUS_KEYS.map((key) => {
              const opt = STATUS_MAP[key];
              const active = key === status;
              return (
                <div
                  key={key}
                  onClick={() => {
                    setOpen(false);
                    if (!active) onChange(key);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 10px",
                    borderRadius: RT.radius,
                    fontSize: 12.5,
                    fontWeight: active ? 700 : 500,
                    color: active ? opt.fg : RT.text,
                    background: active ? opt.bg : "transparent",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => !active && (e.currentTarget.style.background = RT.bg)}
                  onMouseLeave={(e) => !active && (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: opt.dot }} />
                  {opt.label}
                </div>
              );
            })}
          </div>
          <style>{`@keyframes statusMenuIn { from { opacity:0; transform: translateY(-4px); } to { opacity:1; transform: translateY(0); } }`}</style>
        </>
      )}
    </div>
  );
}

/* ─── Pagination (same pattern as customers) ─────────────────────── */
function Pagination({ current, total, count, start, end, onChange }) {
  if (total <= 1) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginTop: 18, fontSize: 13, color: RT.textSec }}>
      <span>Showing <b style={{ color: RT.text }}>{start}–{end}</b> of <b style={{ color: RT.text }}>{count}</b></span>
      <div style={{ display: "flex", gap: 4, background: RT.white, border: `1px solid ${RT.border}`, borderRadius: RT.radiusMd, padding: 4 }}>
        <button onClick={() => onChange(current - 1)} disabled={current === 1}
          style={{ padding: "5px 11px", borderRadius: RT.radius, border: "none", background: "transparent", cursor: current === 1 ? "not-allowed" : "pointer", opacity: current === 1 ? 0.35 : 1, fontSize: 13, fontWeight: 600, color: RT.text }}>‹</button>
        {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
          <button key={p} onClick={() => onChange(p)}
            style={{
              width: 30, height: 30, borderRadius: RT.radius, border: "none",
              background: p === current ? RT.primary : "transparent",
              color: p === current ? "#fff" : RT.text,
              cursor: "pointer", fontWeight: p === current ? 700 : 500, fontSize: 13,
            }}>{p}</button>
        ))}
        <button onClick={() => onChange(current + 1)} disabled={current === total}
          style={{ padding: "5px 11px", borderRadius: RT.radius, border: "none", background: "transparent", cursor: current === total ? "not-allowed" : "pointer", opacity: current === total ? 0.35 : 1, fontSize: 13, fontWeight: 600, color: RT.text }}>›</button>
      </div>
    </div>
  );
}

/* ─── Table row ───────────────────────────────────────────────────── */
function BookingRow({ b, isLast, onView, onStatusChange, updatingId }) {
  const [h, setH] = useState(false);
  const type = getRoomType(b.room_details?.room_type);
  const Icon = type.icon;

  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "1.6fr 1.6fr 1.4fr 1.3fr 1.3fr 0.8fr 1.3fr 70px",
        alignItems: "center",
        padding: "13px 20px",
        borderBottom: isLast ? "none" : `1px solid ${RT.border}`,
        background: h ? RT.secondaryLight : RT.white,
        borderLeft: h ? `3px solid ${RT.primary}` : "3px solid transparent",
        transition: "background .15s",
      }}
    >
      <div>
        <div style={{ fontWeight: 700, fontSize: 13.5, color: RT.text }}>{b.name || "—"}</div>
        <div style={{ fontSize: 11.5, color: RT.textSec }}>{b.room_booking_id?.slice(0, 8)}…</div>
      </div>
      <div>
        <div style={{ fontSize: 12.5, color: RT.text }}>{b.email || "—"}</div>
        <div style={{ fontSize: 11.5, color: RT.textSec }}>{b.phone || "—"}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 26, height: 26, borderRadius: "50%", background: RT.secondaryLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={15} />
        </div>
        <span style={{ fontSize: 12.5, fontWeight: 600 }}>{type.label}</span>
      </div>
      <div style={{ fontSize: 12.5, color: RT.text }}>{fmtDate(b.booking_check_in_date)}</div>
      <div style={{ fontSize: 12.5, color: RT.text }}>{fmtDate(b.booking_check_out_date)}</div>
      <div style={{ fontSize: 12.5, color: RT.text }}>{b.adults}A · {b.children}C</div>
      <div>
        <StatusDropdown
          status={b.status}
          disabled={updatingId === b.room_booking_id}
          onChange={(newStatus) => onStatusChange(b.room_booking_id, newStatus)}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          title="View"
          onClick={() => onView(b.room_booking_id)}
          style={{ width: 30, height: 30, borderRadius: RT.radius, border: "none", background: h ? RT.white : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ─── Main ────────────────────────────────────────────────────────── */
export default function ListBookings() {
  const { push, ToastHost } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingId, setViewingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchBookings = () => {
    setLoading(true);
    api
      .get(`${API_BASE_URL}/room_booking/list_booking`)
      .then((res) => setBookings(res.data?.data || []))
      .catch(() => push("Failed to load bookings", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, []);
  useEffect(() => { setCurrentPage(1); }, [search, statusFilter]);

  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (b.name || "").toLowerCase().includes(q) ||
      (b.email || "").toLowerCase().includes(q) ||
      (b.phone || "").includes(q) ||
      (b.room_booking_id || "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleStatusChange = async (room_booking_id, status) => {
    setUpdatingId(room_booking_id);
    // optimistic update
    setBookings((prev) => prev.map((b) => (b.room_booking_id === room_booking_id ? { ...b, status } : b)));
    try {
      await api.put(`${API_BASE_URL}/room_booking/update_booking`, { room_booking_id, status });
      push(`Status updated to ${STATUS_MAP[status]?.label || status}`);
    } catch (err) {
      push(err.response?.data?.message || "Failed to update status", "error");
      fetchBookings(); // revert on failure
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',Arial,sans-serif", color: RT.text }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
        marginTop: 30, marginBottom: 18, background: RT.white, border: `1px solid ${RT.border}`,
        borderRadius: RT.radiusLg, padding: "16px 20px", boxShadow: RT.shadow,
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Reservations</h3>
          <div style={{ fontSize: 12.5, color: RT.textSec, marginTop: 3 }}>
            <span style={{ color: RT.primary, fontWeight: 700 }}>{bookings.length}</span> total bookings
          </div>
        </div>
      </div>

      {/* Search + status filter */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
        background: RT.white, border: `1px solid ${RT.border}`, borderRadius: RT.radiusLg,
        padding: "14px 16px", boxShadow: RT.shadow, marginBottom: 18,
      }}>
        <div style={{ position: "relative", flex: "1 1 240px", minWidth: 200 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, booking id..."
            style={{
              width: "100%", boxSizing: "border-box", padding: "9px 12px 9px 34px",
              border: `1.5px solid ${RT.border}`, borderRadius: RT.radiusMd,
              fontSize: 13, color: RT.text, outline: "none", background: RT.bg,
            }}
            onFocus={(e) => (e.target.style.borderColor = RT.primary)}
            onBlur={(e) => (e.target.style.borderColor = RT.border)}
          />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={RT.textTer} strokeWidth="2" strokeLinecap="round"
            style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }}>
            <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
          </svg>
        </div>

        <div style={{ display: "flex", gap: 6, background: RT.bg, border: `1px solid ${RT.border}`, borderRadius: RT.radiusMd, padding: 4, flexWrap: "wrap" }}>
          <button
            onClick={() => setStatusFilter("all")}
            style={{
              padding: "6px 12px", borderRadius: RT.radius, border: "none", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
              background: statusFilter === "all" ? RT.primary : "transparent",
              color: statusFilter === "all" ? "#fff" : RT.textSec,
            }}
          >All</button>
          {STATUS_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              style={{
                padding: "6px 12px", borderRadius: RT.radius, border: "none", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                background: statusFilter === key ? RT.primary : "transparent",
                color: statusFilter === key ? "#fff" : RT.textSec,
              }}
            >{STATUS_MAP[key].label}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ minHeight: 280, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10, background: RT.white, border: `1px solid ${RT.border}`, borderRadius: RT.radiusLg }}>
          <Spinner />
          <span style={{ fontSize: 13, color: RT.textSec }}>Loading bookings…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ minHeight: 280, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, color: RT.textSec, background: RT.white, border: `1px solid ${RT.border}`, borderRadius: RT.radiusLg }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: RT.text }}>No bookings found</div>
          <div style={{ fontSize: 12.5 }}>Try adjusting your search or filter</div>
        </div>
      ) : (
        <div style={{ background: RT.white, border: `1px solid ${RT.border}`, borderRadius: RT.radiusLg, overflow: "hidden", boxShadow: RT.shadow }}>
          <div style={{
            display: "grid", gridTemplateColumns: "1.6fr 1.6fr 1.4fr 1.3fr 1.3fr 0.8fr 1.3fr 70px",
            padding: "11px 20px", background: RT.secondaryLight, borderBottom: `1px solid ${RT.border}`,
            fontSize: 11, fontWeight: 700, color: RT.primaryDark, letterSpacing: ".05em", textTransform: "uppercase",
          }}>
            <span>Guest</span><span>Contact</span><span>Room</span><span>Check-in</span><span>Check-out</span><span>Guests</span><span>Status</span>
            <span style={{ textAlign: "right" }}>View</span>
          </div>
          {paginated.map((b, i) => (
            <BookingRow
              key={b.room_booking_id}
              b={b}
              isLast={i === paginated.length - 1}
              onView={setViewingId}
              onStatusChange={handleStatusChange}
              updatingId={updatingId}
            />
          ))}
        </div>
      )}

      {filtered.length > 0 && (
        <Pagination
          current={currentPage}
          total={totalPages}
          count={filtered.length}
          start={startIndex + 1}
          end={Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)}
          onChange={setCurrentPage}
        />
      )}

      {viewingId && (
        <ViewBookingDrawer
          bookingId={viewingId}
          onClose={() => setViewingId(null)}
          onStatusChanged={fetchBookings}
        />
      )}

      <ToastHost />
    </div>
  );
}