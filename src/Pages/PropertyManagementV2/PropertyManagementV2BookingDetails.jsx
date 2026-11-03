// src/Pages/PropertyManagementV2/PropertyManagementV2BookingDetails.jsx
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ClipboardList,
  LogIn,
  LogOut,
  Users,
  Clock,
  Search,
  RotateCcw,
  Eye,
  XCircle,
  X,
  CalendarDays,
  Building2,
  BedDouble,
  Mail,
  Phone,
  CreditCard,
  ArrowLeft,
  ArrowRight,
  UserCheck,
  AlertTriangle,

  MapPin, CheckCircle2, Send, FileText
} from "lucide-react";
import api from "../../services/api";
import { bookingApi, BOOKING_STATUS } from "./services/propertyManagementV2Service";
import { ToastProvider, useToast } from "./components/V2ToastMessages";
import V2SummaryCard from "./components/V2SummaryCard";
import "./styles/propertyManagementV2.css";
import { useAccess } from "../../services/AccessContext";
import Pagination from "../AuditLogs/Pagination";

/* ─────────────────────────────────────────────────────────────
   HELPERS
   Booking dates are stored as naive date-times, so they are read
   with UTC getters (what was typed is what is shown).
───────────────────────────────────────────────────────────── */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const pad = (n) => String(n).padStart(2, "0");

const toDate = (v) => {
  if (!v) return null;
  const raw = typeof v === "object" && v.$date !== undefined ? v.$date : v;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
};
const dateKey = (d) =>
  d ? `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}` : "";
const fmtDate = (d) =>
  d ? `${pad(d.getUTCDate())} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}` : "—";
const fmtTime = (d) => {
  if (!d) return "";
  const h = d.getUTCHours();
  return `${pad(h % 12 || 12)}:${pad(d.getUTCMinutes())} ${h >= 12 ? "PM" : "AM"}`;
};
const fmtLocal = (d) =>
  d
    ? d.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
const fmtLocalDate = (d) =>
  d ? d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtLocalTime = (d) =>
  d ? d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "";
const localToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const dayStartUTC = (d) =>
  Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const initialsOf = (name) =>
  (name || "G")
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const CHECKED_IN = ["checkin", "checked_in"];
const CHECKED_OUT = ["checkout", "checked_out"];

const deriveStatus = (b) => {
  if (b.cancelled || b.status === "cancelled") return "cancelled";
  if (CHECKED_OUT.includes(b.status)) return "checked_out";
  if (CHECKED_IN.includes(b.status)) return "checked_in";
  if (b.status === "draft") return "draft";
  if (b.status === "pending") return "pending";
  return "booked";
};

const STATUS_META = {
  draft: { label: "Draft", bg: "#F5F3FF", color: "#7C3AED", dot: "#8B5CF6" },
  booked: { label: "Booked", bg: "#EFF6FF", color: "#2563EB", dot: "#3B82F6" },
  pending: { label: "Pending", bg: "#FFFBEB", color: "#B45309", dot: "#F59E0B" },
  checked_in: { label: "Checked In", bg: "#ECFDF5", color: "#059669", dot: "#10B981" },
  checked_out: { label: "Checked Out", bg: "#F3F4F6", color: "#4B5563", dot: "#9CA3AF" },
  cancelled: { label: "Cancelled", bg: "#FEF2F2", color: "#DC2626", dot: "#EF4444" },
};

const PAYMENT_META = {
  paid: { bg: "#ECFDF5", color: "#059669" },
  pending: { bg: "#FFFBEB", color: "#B45309" },
  partial: { bg: "#EFF6FF", color: "#2563EB" },
};

const canCheckIn = (b) => ["booked", "pending", "draft"].includes(b.status);
const canCheckOut = (b) => b.status === "checked_in";
const canCancel = (b) => ["booked", "pending", "draft"].includes(b.status);
const canMarkPaid = (b) => b.paymentStatus !== "paid" && b.status !== "cancelled";
// booking status draft + payment pending -> lock Confirm / Check-in / Cancel
// const isDraftPending = (b) => b.rawStatus === "draft" && b.paymentStatus === "pending";
const isDraftPending = (b) => b.paymentStatus === "pending";

const DRAFT_MESSAGE =
  "Payment is pending. Send the invoice to the customer and receive the payment first. After payment is done, Confirm, Check In and Cancel will be shown.";
// check-in is only allowed from the check-in date onwards
const beforeCheckInDate = (b) => b.checkInKey > localToday();

/** Backend record (with room_details + subroom_details) -> UI booking */
function normalize(b) {
  const checkIn = toDate(b.booking_check_in_date);
  const checkOut = toDate(b.booking_check_out_date);
  const initialOut = toDate(b.intial_booking_check_out_date);
  const nights =
    checkIn && checkOut
      ? Math.max(1, Math.round((dayStartUTC(checkOut) - dayStartUTC(checkIn)) / 86400000))
      : 1;
  const rate = b.subroom_details?.price_per_day || 0;
  const roomCount = b.room_count || 1;

  return {
    id: b.room_booking_id,
    number: b.booking_number || "—",
    status: deriveStatus(b),
    rawStatus: b.status || "booked",
    paymentStatus: (b.payment_status || "pending").toLowerCase(),
    guestName: b.name || "Guest",
    email: b.email || "",
    phone: b.phone || "",
    address: b.address || "",
    customerId: b.customer_id || "",
    adults: b.adults ?? 0,
    children: b.children ?? 0,
    roomCount,
    propertyId: b.room_id,
    propertyName: b.room_details?.room_name || "Property",
    propertyAddress: b.room_details?.address || "",
    roomId: b.sub_room_id,
    roomName: b.subroom_details?.sub_room_name || "Room",
    maxAdults: b.subroom_details?.max_adults,
    maxChildren: b.subroom_details?.max_children,
    rate,
    checkIn,
    checkOut,
    checkInKey: dateKey(checkIn),
    checkOutKey: dateKey(checkOut),
    initialCheckOut:
      initialOut && checkOut && dateKey(initialOut) !== dateKey(checkOut) ? initialOut : null,
    createdAt: toDate(b.created_time),
    nights,
    total: rate * nights * roomCount,
    invoiceCreated: b.invoice_created === true,
        invoiceStatus: (b.invoice_status || "").toLowerCase(),
    invoiceId: b.invoice_id || "",
    mailSent: b.confirmation_mail_sent === true,
  };
}

/* ─────────────────────────────────────────────────────────────
   SMALL UI PIECES
───────────────────────────────────────────────────────────── */
function StatusPill({ status }) {
  const m = STATUS_META[status] || STATUS_META.booked;
  return (
    <span className="pmv2-bk-pill" style={{ background: m.bg, color: m.color }}>
      <span className="pmv2-bk-dot" style={{ background: m.dot }} />
      {m.label}
    </span>
  );
}

function PaymentPill({ value }) {
  const m = PAYMENT_META[value] || { bg: "#F3F4F6", color: "#4B5563" };
  return (
    <span
      className="pmv2-bk-pill"
      style={{ background: m.bg, color: m.color, textTransform: "capitalize" }}
    >
      {value}
    </span>
  );
}

const Row = ({ label, children }) => (
  <div className="pmv2-drawer-specs-row">
    <span className="pmv2-drawer-specs-key">{label}</span>
    <span className="pmv2-drawer-specs-val" style={{ textAlign: "right" }}>
      {children}
    </span>
  </div>
);

const STYLES = `
.pmv2-bk-stats{display:grid;grid-template-columns:repeat(5,1fr);gap:16px;margin-bottom:22px}
@media(max-width:1200px){.pmv2-bk-stats{grid-template-columns:repeat(3,1fr)}}
@media(max-width:700px){.pmv2-bk-stats{grid-template-columns:repeat(2,1fr)}}
@media(max-width:480px){.pmv2-bk-stats{grid-template-columns:1fr}}

/* Filters */
.pmv2-bk-filters{background:#fff;border:1px solid #E5E7EB;border-radius:14px;padding:14px;margin-bottom:18px;display:flex;flex-direction:column;gap:12px}
.pmv2-bk-filter-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.pmv2-bk-select{height:42px;flex:1 1 170px;min-width:0;border:1px solid #E5E7EB;border-radius:10px;padding:0 12px;font-size:13px;background:#fff;color:#374151;font-family:inherit;outline:none;cursor:pointer;transition:border-color .15s,box-shadow .15s}
.pmv2-bk-select:hover{border-color:#CBD5E1}
.pmv2-bk-select:focus{border-color:#2563EB;box-shadow:0 0 0 3px rgba(37,99,235,.12)}
.pmv2-bk-datewrap{display:flex;align-items:center;gap:8px;border:1px solid #E5E7EB;border-radius:10px;padding:0 12px;height:42px;background:#fff;flex:0 1 auto}
.pmv2-bk-datewrap:focus-within{border-color:#2563EB;box-shadow:0 0 0 3px rgba(37,99,235,.12)}
.pmv2-bk-datewrap input{border:none;outline:none;font-size:13px;font-family:inherit;color:#374151;background:transparent;min-width:0}
@media(max-width:640px){.pmv2-bk-datewrap{flex:1 1 100%}.pmv2-bk-datewrap input{flex:1}}

/* Card shell (container query drives table <-> cards) */
.pmv2-bk-card{background:#fff;border:1px solid #E5E7EB;border-radius:14px;overflow:hidden;container-type:inline-size;box-shadow:0 1px 3px rgba(15,23,42,.04)}

/* Desktop table */
.pmv2-bk-tablewrap{overflow-x:auto}
.pmv2-bk-table{width:100%;min-width:1100px;table-layout:fixed;border-collapse:separate;border-spacing:0}
.pmv2-bk-table th{text-align:left;font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:.04em;padding:0 14px;height:46px;background:#F8FAFC;border-bottom:1px solid #E5E7EB;white-space:nowrap}
.pmv2-bk-table td{padding:12px 14px;height:78px;border-bottom:1px solid #F1F3F9;vertical-align:middle;font-size:13px;color:#111827;overflow:hidden}
.pmv2-bk-table tbody tr{cursor:pointer;transition:background .12s}
.pmv2-bk-table tbody tr:hover td{background:#F8FAFF}
.pmv2-bk-table tbody tr:last-child td{border-bottom:none}
.pmv2-bk-table th.pmv2-bk-right,.pmv2-bk-table td.pmv2-bk-right{text-align:right}

.pmv2-bk-id{font-weight:700;color:#2563EB;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;background:#EFF6FF;border:none;padding:4px 8px;border-radius:7px;cursor:pointer;font-size:12.5px}
.pmv2-bk-id:hover{background:#DBEAFE}
.pmv2-bk-main{font-weight:600;color:#111827;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pmv2-bk-sub{font-size:11.5px;color:#6B7280;margin-top:3px;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pmv2-bk-guest{display:flex;align-items:center;gap:10px;min-width:0}
.pmv2-bk-guest > div:last-child{min-width:0}
.pmv2-bk-avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#3B82F6,#6366F1);color:#fff;font-weight:700;font-size:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.pmv2-bk-pill{display:inline-flex;align-items:center;gap:6px;padding:4px 11px;border-radius:9999px;font-size:11.5px;font-weight:700;white-space:nowrap}
.pmv2-bk-dot{width:6px;height:6px;border-radius:50%}

/* Aligned action slots: every row has the same 3 slots */
.pmv2-bk-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px}
.pmv2-bk-slot{width:112px;display:flex;align-items:center}
.pmv2-bk-slot-icon{width:36px;display:flex;align-items:center;justify-content:center}

.pmv2-bk-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:36px;width:100%;padding:0 12px;border:none;border-radius:10px;font-family:inherit;font-size:12.5px;font-weight:700;color:#fff;cursor:pointer;white-space:nowrap;box-shadow:0 1px 2px rgba(15,23,42,.1);transition:transform .12s,box-shadow .15s,filter .15s}
.pmv2-bk-btn:hover:not(:disabled){transform:translateY(-1px);filter:brightness(1.06)}
.pmv2-bk-btn:active:not(:disabled){transform:translateY(0)}
.pmv2-bk-btn:disabled{opacity:.6;cursor:not-allowed}
.pmv2-bk-btn.primary{background:linear-gradient(135deg,#3B82F6,#2563EB)}
.pmv2-bk-btn.primary:hover:not(:disabled){box-shadow:0 8px 16px -6px rgba(37,99,235,.55)}
.pmv2-bk-btn.warm{background:linear-gradient(135deg,#F59E0B,#EA580C)}
.pmv2-bk-btn.warm:hover:not(:disabled){box-shadow:0 8px 16px -6px rgba(234,88,12,.55)}
.pmv2-bk-btn.ghost{background:#fff;color:#374151;border:1px solid #E5E7EB;box-shadow:none}
.pmv2-bk-btn.ghost:hover:not(:disabled){background:#F9FAFB;box-shadow:none}
.pmv2-bk-btn.ghost-danger{background:#FFF1F2;color:#E11D48;border:1px solid #FECDD3;box-shadow:none}
.pmv2-bk-btn.ghost-danger:hover:not(:disabled){background:#FFE4E6;box-shadow:none}
.pmv2-bk-btn.lg{height:44px;font-size:13.5px;flex:1 1 140px;width:auto}

.pmv2-bk-iconbtn{width:36px;height:36px;flex-shrink:0;border:1px solid #E5E7EB;background:#fff;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;color:#4B5563;transition:all .15s}
.pmv2-bk-iconbtn:hover:not(:disabled){background:#EFF6FF;color:#2563EB;border-color:#BFDBFE}
.pmv2-bk-iconbtn.danger{color:#E11D48;border-color:#FECDD3;background:#FFF1F2}
.pmv2-bk-iconbtn.danger:hover:not(:disabled){background:#E11D48;color:#fff;border-color:#E11D48}
.pmv2-bk-iconbtn:disabled{opacity:.5;cursor:not-allowed}

/* Mobile / tablet cards */
.pmv2-bk-cards{display:none}
.pmv2-bk-mcard{border:1px solid #E5E7EB;border-radius:14px;padding:14px;background:#fff;display:flex;flex-direction:column;gap:12px;box-shadow:0 1px 3px rgba(15,23,42,.04)}
.pmv2-bk-mcard-top{display:flex;align-items:center;justify-content:space-between;gap:8px}
.pmv2-bk-mgrid{display:grid;grid-template-columns:1fr 1fr;gap:12px 14px;background:#F8FAFC;border:1px solid #F1F3F9;border-radius:10px;padding:12px}
.pmv2-bk-mgrid > div{min-width:0}
.pmv2-bk-mgrid label{display:block;font-size:10.5px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:.03em;margin-bottom:3px}
.pmv2-bk-mactions{display:flex;gap:8px;align-items:center}
.pmv2-bk-mactions .pmv2-bk-btn{flex:1;width:auto}
@container (max-width: 1150px){
  .pmv2-bk-tablewrap{display:none}
  .pmv2-bk-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;padding:14px}
}
@container (max-width: 640px){
  .pmv2-bk-cards{grid-template-columns:1fr}
}

/* States */
.pmv2-bk-empty{padding:56px 20px;text-align:center;color:#6B7280}
.pmv2-bk-empty h4{margin:10px 0 4px;color:#111827;font-size:16px}
.pmv2-bk-error{background:#FEF2F2;border:1px solid #FECDD3;color:#B91C1C;border-radius:12px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:13.5px}

/* Drawer */
.pmv2-bk-timeline{background:#F9FAFB;border:1px solid #F3F4F6;border-radius:10px;padding:16px 14px 12px;margin:4px 0 12px}
.pmv2-bk-timeline-row{display:flex;align-items:center;justify-content:space-between;gap:10px}
.pmv2-bk-timeline-line{flex:1;height:2px;background:#2563EB;position:relative;margin:0 6px}
.pmv2-bk-timeline-line span{position:absolute;top:-17px;left:50%;transform:translateX(-50%);font-size:10.5px;font-weight:700;color:#2563EB;white-space:nowrap}
.pmv2-bk-total{background:#EFF6FF;border:1px solid #DBEAFE;border-radius:10px;padding:12px 14px;display:flex;align-items:center;justify-content:space-between;margin-top:10px}
@media(max-width:560px){.pmv2-drawer{width:100vw !important}}
`;

/* ─────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────── */
const PAGE_SIZE = 8;

function BookingsContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { can } = useAccess();
  const canUpdate = can("room_booking", "update");
  const canDelete = can("room_booking", "delete");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const invoiceViewPath = (id) => `/invoices/${id}`;
const createRoomInvoicePath = (bookingId) =>
  `/invoices/room-create?booking_id=${bookingId}`;


  // Filters
  const [search, setSearch] = useState("");
  const [propertyFilter, setPropertyFilter] = useState(searchParams.get("property") || "all");
  const [roomFilter, setRoomFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  // UI state
  const [selectedId, setSelectedId] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [payTarget, setPayTarget] = useState(null);
  const [busyId, setBusyId] = useState(null);


  const [mailBusyId, setMailBusyId] = useState(null);
  const [resendTarget, setResendTarget] = useState(null);

  // First time: send directly. Already sent: ask the user first.
  const requestSend = (b) => {
    if (b.mailSent) setResendTarget(b);
    else sendConfirmMail(b);
  };

  const sendConfirmMail = async (b) => {
    if (!b.invoiceCreated) {
      toast.error("Please create the invoice for this booking first.");
      setResendTarget(null);
      return;
    }
    if (!b.email) {
      toast.error("This guest has no email address.");
      setResendTarget(null);
      return;
    }
    setMailBusyId(b.id);
    try {
      await bookingApi.sendConfirmationMail(b.id);
      toast.success(
        b.mailSent
          ? `Confirmation email sent again to ${b.guestName} at ${b.email}.`
          : `Confirmation email sent! ${b.guestName} has received the booking details at ${b.email}.`
      );
      await load(true); // refresh so the button changes to "Resend"
    } catch (err) {
      toast.error(err.message || "Could not send the email. Please try again.");
    } finally {
      setMailBusyId(null);
      setResendTarget(null);
    }
  };
  /* ── Load all bookings (every date) ── */
  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      const res = await api.get("/room_booking/list_booking");
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      setBookings(list.map(normalize));
    } catch (err) {
      // Backend answers 404 when there are no bookings yet
      if (err?.response?.status === 404) {
        setBookings([]);
      } else {
        setError(err?.response?.data?.message || err.message || "Could not load bookings.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* ── Stats ── */
  const stats = useMemo(() => {
    const today = localToday();
    const live = bookings.filter((b) => b.status !== "cancelled");
    return {
      total: bookings.length,
      cancelled: bookings.length - live.length,
      checkInsToday: live.filter((b) => b.checkInKey === today).length,
      checkOutsToday: live.filter((b) => b.checkOutKey === today).length,
      active: bookings.filter((b) => b.status === "checked_in").length,
      upcoming: bookings.filter((b) => b.status === "booked" || b.status === "pending").length,
    };
  }, [bookings]);

  /* ── Filter options (built from the data) ── */
  const propertyOptions = useMemo(() => {
    const map = new Map();
    bookings.forEach((b) => map.set(b.propertyId, b.propertyName));
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [bookings]);

  const roomOptions = useMemo(() => {
    const map = new Map();
    bookings
      .filter((b) => propertyFilter === "all" || b.propertyId === propertyFilter)
      .forEach((b) => map.set(b.roomId, b.roomName));
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [bookings, propertyFilter]);

  const paymentOptions = useMemo(() => {
    const set = new Set(["pending", "paid", "partial"]);
    bookings.forEach((b) => set.add(b.paymentStatus));
    return [...set];
  }, [bookings]);

  /* ── Filtering + sorting ── */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bookings
      .filter((b) => {
        if (q) {
          const hay = [
            b.number,
            b.guestName,
            b.email,
            b.phone,
            b.propertyName,
            b.roomName,
          ]
            .join(" ")
            .toLowerCase();
          if (!hay.includes(q)) return false;
        }
        if (propertyFilter !== "all" && b.propertyId !== propertyFilter) return false;
        if (roomFilter !== "all" && b.roomId !== roomFilter) return false;
        if (statusFilter !== "all" && b.status !== statusFilter) return false;
        if (paymentFilter !== "all" && b.paymentStatus !== paymentFilter) return false;
        if (dateFrom && b.checkOutKey < dateFrom) return false; // stay overlaps range
        if (dateTo && b.checkInKey > dateTo) return false;
        return true;
      })
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }, [bookings, search, propertyFilter, roomFilter, statusFilter, paymentFilter, dateFrom, dateTo]);

  useEffect(() => {
    setPage(1);
  }, [search, propertyFilter, roomFilter, statusFilter, paymentFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const startIndex = (page - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  const hasFilters =
    search || propertyFilter !== "all" || roomFilter !== "all" || statusFilter !== "all" ||
    paymentFilter !== "all" || dateFrom || dateTo;

  const clearFilters = () => {
    setSearch("");
    setPropertyFilter("all");
    setRoomFilter("all");
    setStatusFilter("all");
    setPaymentFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  /* ── Actions (check in / check out / cancel) ── */
const runAction = async (b, type) => {
  if ((type === "checkin" || type === "cancel") && isDraftPending(b)) {
toast.error(DRAFT_MESSAGE);
    return;
  }
  if (type === "checkin" && beforeCheckInDate(b)) {
    toast.error(`Check-in opens on ${fmtDate(b.checkIn)}.`);
    return;
  }
  setBusyId(b.id);
  try {
      if (type === "checkin") {
        await bookingApi.changeStatus(b.id, BOOKING_STATUS.CHECKED_IN);
        toast.success(`${b.guestName} checked in to ${b.roomName}.`);
      } else if (type === "checkout") {
        await bookingApi.changeStatus(b.id, BOOKING_STATUS.CHECKED_OUT);
        toast.success(`${b.guestName} checked out of ${b.roomName}.`);
      } else if (type === "cancel") {
        await bookingApi.cancelBooking(b.id);
        toast.success(`Booking ${b.number} cancelled.`);
        setCancelTarget(null);
      
            } else if (type === "paid") {
        await bookingApi.markPaid(b.id);
        toast.success(`Payment for ${b.number} marked as paid.`);
        setPayTarget(null);
      }
      await load(true);
    } catch (err) {
      toast.error(err.message || "Action failed. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const selected = bookings.find((b) => b.id === selectedId) || null;

  /* ── Action buttons: modes "row" (table), "card" (mobile), "drawer" ── */
  const renderActions = (b, mode = "row") => {
    const busy = busyId === b.id;
    const mailBusy = mailBusyId === b.id;

    const checkInLocked = isDraftPending(b) || beforeCheckInDate(b);
    const checkInTitle = isDraftPending(b)
      ? DRAFT_MESSAGE
      : beforeCheckInDate(b)
      ? `Check-in opens on ${fmtDate(b.checkIn)}`
      : "";

const checkInBtn = canUpdate && canCheckIn(b) && !isDraftPending(b) && (
      <button
        type="button"
        className={`pmv2-bk-btn primary ${mode === "drawer" ? "lg" : ""}`}
        disabled={busy || checkInLocked}
        title={checkInTitle}
        style={checkInLocked ? { opacity: 0.4, cursor: "not-allowed" } : undefined}
        onClick={() => runAction(b, "checkin")}
      >
        <UserCheck size={15} />
        <span>{busy ? "Checking in…" : "Check In"}</span>
      </button>
    );

    const checkOutBtn = canUpdate && canCheckOut(b) && (
      <button
        type="button"
        className={`pmv2-bk-btn warm ${mode === "drawer" ? "lg" : ""}`}
        disabled={busy}
        onClick={() => runAction(b, "checkout")}
      >
        <LogOut size={15} />
        <span>{busy ? "Checking out…" : "Check Out"}</span>
      </button>
    );

    /* Drawer: Check In / Check Out / Cancel live here only */
    if (mode === "drawer") {
      return (
        <>
          {checkInBtn}
          {checkOutBtn}
         {canDelete && canCancel(b) && !isDraftPending(b) && (
                <button
              type="button"
              className="pmv2-bk-btn ghost-danger lg"
              disabled={busy || isDraftPending(b)}
              title={isDraftPending(b) ? DRAFT_MESSAGE : ""}
              style={isDraftPending(b) ? { opacity: 0.4, cursor: "not-allowed" } : undefined}
              onClick={() => setCancelTarget(b)}
            >
              <XCircle size={15} />
              <span>Cancel Booking</span>
            </button>
          )}
        </>
      );
    }

    /* List (row + card): Confirm shows only when the invoice is created */
       const confirmBtn = b.invoiceCreated && b.status !== "cancelled" && !isDraftPending(b) && (
      <button
        type="button"
        className={`pmv2-bk-btn ${b.mailSent ? "ghost" : "primary"}`}
        title={b.mailSent ? "Confirmation mail already sent. Click to send again" : "Send confirmation mail to the guest"}
        disabled={mailBusy}
        onClick={() => requestSend(b)}
      >
        {b.mailSent ? <RotateCcw size={15} /> : <Send size={15} />}
        <span>{mailBusy ? "Sending…" : b.mailSent ? "Resend" : "Confirm"}</span>
      </button>
    );

    const eyeBtn = (
      <button
        type="button"
        className="pmv2-bk-iconbtn"
        title="View full details"
        onClick={() => setSelectedId(b.id)}
      >
        <Eye size={16} />
      </button>
    );

    if (mode === "card") {
      return (
        <div className="pmv2-bk-mactions">
          <button type="button" className="pmv2-bk-btn ghost" onClick={() => setSelectedId(b.id)}>
            <Eye size={15} />
            <span>Details</span>
          </button>
          {confirmBtn}
{isDraftPending(b) && b.status !== "cancelled" && (
  <span
    title={DRAFT_MESSAGE}
    style={{ fontSize: 11.5, color: "#7C3AED", fontWeight: 600 }}
  >
   Awaiting payment 
  </span>
)}
        </div>
      );
    }

    // row
    return (
      <div className="pmv2-bk-actions" onClick={(e) => e.stopPropagation()}>
        {eyeBtn}
<div className="pmv2-bk-slot">
  {confirmBtn}
  {isDraftPending(b) && b.status !== "cancelled" && (
    <span
      title={DRAFT_MESSAGE}
      style={{ fontSize: 11, color: "#7C3AED", fontWeight: 600, lineHeight: 1.3 }}
    >
       Awaiting payment
    </span>
  )}
</div>
      </div>
    );
  };

  return (
    <div className="pmv2-container">
      <style>{STYLES}</style>

      {/* Header */}
      <div className="pmv2-header-wrap">
        <div className="pmv2-header-top">
          <div className="pmv2-header-title-wrap">
            <h1 className="pmv2-header-title">Bookings</h1>
            <p className="pmv2-header-subtitle">
              Manage bookings across properties and rooms.
            </p>
          </div>
          <div className="pmv2-header-actions">
            <button
              type="button"
              className="pmv2-btn pmv2-btn-secondary"
              onClick={() => navigate("/property-management-v2")}
            >
              <ArrowLeft size={15} />
              <span>Properties</span>
            </button>
            <button
              type="button"
              className="pmv2-btn pmv2-btn-secondary"
              onClick={() => load()}
            >
              <RotateCcw size={15} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="pmv2-bk-stats">
        <V2SummaryCard
          label="Total Bookings"
          value={stats.total}
          tag="All"
          subtext={`${stats.cancelled} cancelled`}
          icon={ClipboardList}
          colorScheme="blue"
        />
        <V2SummaryCard
          label="Today's Check-ins"
          value={stats.checkInsToday}
          tag="Arrivals"
          subtext="Arrivals expected today"
          icon={LogIn}
          colorScheme="green"
        />
        <V2SummaryCard
          label="Today's Check-outs"
          value={stats.checkOutsToday}
          tag="Departures"
          subtext="Departures scheduled today"
          icon={LogOut}
          colorScheme="orange"
        />
        <V2SummaryCard
          label="Active Bookings"
          value={stats.active}
          tag="Checked-in"
          subtext="Guests currently staying"
          icon={Users}
          colorScheme="purple"
        />
        <V2SummaryCard
          label="Upcoming"
          value={stats.upcoming}
          tag="Booked"
          subtext="Awaiting check-in"
          icon={Clock}
          colorScheme="blue"
        />
      </div>

      {error && (
        <div className="pmv2-bk-error">
          <span>{error}</span>
          <button type="button" className="pmv2-btn pmv2-btn-secondary" onClick={() => load()}>
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="pmv2-bk-filters">
        <div className="pmv2-bk-filter-row">
          <div className="pmv2-search-input-wrap" style={{ flex: 1, minWidth: 260 }}>
            <Search size={16} className="pmv2-search-icon" />
            <input
              type="text"
              className="pmv2-search-input"
              placeholder="Search by booking ID, guest name, email, phone, property or room..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="pmv2-bk-datewrap" title="Show bookings whose stay falls in this range">
            <CalendarDays size={15} style={{ color: "#6B7280" }} />
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            <span style={{ color: "#9CA3AF" }}>→</span>
            <input type="date" value={dateTo} min={dateFrom || undefined} onChange={(e) => setDateTo(e.target.value)} />
          </div>
        </div>

        <div className="pmv2-bk-filter-row">
          <select
            className="pmv2-bk-select"
            value={propertyFilter}
            onChange={(e) => {
              setPropertyFilter(e.target.value);
              setRoomFilter("all");
            }}
          >
            <option value="all">All Properties</option>
            {propertyOptions.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <select className="pmv2-bk-select" value={roomFilter} onChange={(e) => setRoomFilter(e.target.value)}>
            <option value="all">All Rooms</option>
            {roomOptions.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>

          <select className="pmv2-bk-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            {Object.entries(STATUS_META).map(([key, m]) => (
              <option key={key} value={key}>{m.label}</option>
            ))}
          </select>

          <select className="pmv2-bk-select" value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
            <option value="all">All Payment Statuses</option>
            {paymentOptions.map((p) => (
              <option key={p} value={p} style={{ textTransform: "capitalize" }}>{p}</option>
            ))}
          </select>

          {hasFilters && (
            <button type="button" className="pmv2-btn pmv2-btn-secondary" style={{ height: 40 }} onClick={clearFilters}>
              <X size={14} />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="pmv2-bk-card">
        {loading ? (
          <div className="pmv2-bk-empty">Loading bookings...</div>
        ) : filtered.length === 0 ? (
          <div className="pmv2-bk-empty">
            <ClipboardList size={34} style={{ color: "#9CA3AF" }} />
            <h4>{bookings.length === 0 ? "No bookings yet" : "No bookings match your filters"}</h4>
            <p style={{ margin: 0, fontSize: 13 }}>
              {bookings.length === 0
                ? "Bookings made from the rooms board will appear here."
                : "Try a different guest name, email or date range."}
            </p>
            {hasFilters && (
              <button type="button" className="pmv2-btn pmv2-btn-secondary" style={{ marginTop: 14 }} onClick={clearFilters}>
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="pmv2-bk-tablewrap">
              <table className="pmv2-bk-table">
                <colgroup>
                  <col style={{ width: 112 }} />
                  <col />
                  <col />
                  <col />
                  <col style={{ width: 110 }} />
                  <col style={{ width: 110 }} />
                  <col style={{ width: 110 }} />
                  <col style={{ width: 132 }} />
                 <col style={{ width: 170 }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Guest</th>
                    <th>Property</th>
                    <th>Room</th>
                    <th>Booked On</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Status</th>
                    <th className="pmv2-bk-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((b) => (
                    <tr key={b.id} onClick={() => setSelectedId(b.id)}>
                      <td>
                        <button type="button" className="pmv2-bk-id" onClick={() => setSelectedId(b.id)}>
                          {b.number}
                        </button>
                      </td>
                      <td>
                        <div className="pmv2-bk-guest">
                          <div className="pmv2-bk-avatar">{initialsOf(b.guestName)}</div>
                          <div>
                            <span className="pmv2-bk-main">{b.guestName}</span>
                            <span className="pmv2-bk-sub">{b.email || b.phone || "—"}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="pmv2-bk-main">{b.propertyName}</span>
                        <span className="pmv2-bk-sub">{b.propertyAddress || "—"}</span>
                      </td>
                      <td>
                        <span className="pmv2-bk-main">{b.roomName}</span>
                        <span className="pmv2-bk-sub">
                          {b.adults} Adults · {b.children} Children
                        </span>
                      </td>
                      <td>
                        <span className="pmv2-bk-main">{fmtLocalDate(b.createdAt)}</span>
                        <span className="pmv2-bk-sub">{fmtLocalTime(b.createdAt)}</span>
                      </td>
                      <td>
                        <span className="pmv2-bk-main">{fmtDate(b.checkIn)}</span>
                        <span className="pmv2-bk-sub">{fmtTime(b.checkIn)}</span>
                      </td>
                      <td>
                        <span className="pmv2-bk-main">{fmtDate(b.checkOut)}</span>
                        <span className="pmv2-bk-sub">{fmtTime(b.checkOut)}</span>
                      </td>
                      <td>
                        <StatusPill status={b.status} />
                        <span className="pmv2-bk-sub">
                          Payment:{" "}
                          <b
                            style={{
                              color: (PAYMENT_META[b.paymentStatus] || {}).color || "#4B5563",
                              textTransform: "capitalize",
                            }}
                          >
                            {b.paymentStatus}
                          </b>
                        </span>
                      </td>
                      <td className="pmv2-bk-right">{renderActions(b)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Card layout for narrow screens */}
            <div className="pmv2-bk-cards">
              {pageRows.map((b) => (
                <div className="pmv2-bk-mcard" key={b.id}>
                  <div className="pmv2-bk-mcard-top">
                    <button type="button" className="pmv2-bk-id" onClick={() => setSelectedId(b.id)}>
                      {b.number}
                    </button>
                    <StatusPill status={b.status} />
                  </div>

                  <div className="pmv2-bk-guest">
                    <div className="pmv2-bk-avatar">{initialsOf(b.guestName)}</div>
                    <div>
                      <span className="pmv2-bk-main">{b.guestName}</span>
                      <span className="pmv2-bk-sub">{b.email || b.phone || "—"}</span>
                    </div>
                  </div>

                  <div className="pmv2-bk-mgrid">
                    <div>
                      <label>Property</label>
                      <span className="pmv2-bk-main">{b.propertyName}</span>
                    </div>
                    <div>
                      <label>Room</label>
                      <span className="pmv2-bk-main">{b.roomName}</span>
                    </div>
                    <div>
                      <label>Check-in</label>
                      <span className="pmv2-bk-main">{fmtDate(b.checkIn)}</span>
                      <span className="pmv2-bk-sub">{fmtTime(b.checkIn)}</span>
                    </div>
                    <div>
                      <label>Check-out</label>
                      <span className="pmv2-bk-main">{fmtDate(b.checkOut)}</span>
                      <span className="pmv2-bk-sub">{fmtTime(b.checkOut)}</span>
                    </div>
                    <div>
                      <label>Booked on</label>
                      <span className="pmv2-bk-main">{fmtLocalDate(b.createdAt)}</span>
                    </div>
                    <div>
                      <label>Payment</label>
                      <span
                        className="pmv2-bk-main"
                        style={{
                          color: (PAYMENT_META[b.paymentStatus] || {}).color || "#4B5563",
                          textTransform: "capitalize",
                        }}
                      >
                        {b.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {renderActions(b, "card")}
                </div>
              ))}
            </div>
          </>
        )}

{/* Pagination */}
{!loading && filtered.length > 0 && (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "14px 18px",
      borderTop: "1px solid #E5E7EB",
      fontSize: 13,
      color: "#6B7280",
      flexWrap: "wrap",
      gap: 10,
    }}
  >
    <span>
      Showing {startIndex + 1} to {Math.min(startIndex + PAGE_SIZE, filtered.length)} of{" "}
      {filtered.length} bookings
    </span>
    {totalPages > 1 && (
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onChange={setPage}
        windowSize={3}
      />
    )}
  </div>
)}
      </div>

      {/* ───────────── Full details drawer ───────────── */}
      {selected && (
        <div className="pmv2-drawer-backdrop" onClick={() => setSelectedId(null)}>
          <div className="pmv2-drawer" style={{ width: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="pmv2-drawer-header">
              <div>
                <h3 className="pmv2-drawer-header-title">Booking Details</h3>
                <div className="pmv2-drawer-header-sub">
                  <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#2563EB" }}>
                    {selected.number}
                  </span>
                  <StatusPill status={selected.status} />
                </div>
              </div>
              <button
                type="button"
                className="pmv2-btn-icon"
                style={{ width: 32, height: 32 }}
                onClick={() => setSelectedId(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="pmv2-drawer-body">
              {/* Invoice & confirmation mail */}
              {selected.status !== "cancelled" && (
                
                <div className="pmv2-drawer-section">
                  <div className="pmv2-drawer-section-header">
                    <span className="pmv2-drawer-section-title">
                      <FileText size={16} style={{ color: "#2563EB" }} />
                      Invoice & Confirmation
                    </span>
                  </div>

                  {selected.invoiceCreated ? (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                 {!isDraftPending(selected) && (
                        <button
                          type="button"
                          className="pmv2-btn pmv2-btn-primary"
                          style={{ flex: 1 }}
                          disabled={mailBusyId === selected.id}
                          onClick={() => sendConfirmMail(selected)}
                        >
                          <Send size={15} />
                          <span>
                            {mailBusyId === selected.id
                              ? "Sending..."
                              : selected.mailSent
                              ? "Resend Confirmation Mail"
                              : "Send Confirmation Mail"}
                          </span>
                        </button>
                      )}
                      <button
                        type="button"
                        className="pmv2-btn pmv2-btn-secondary"
                        style={{ flex: 1 }}
                        onClick={() => navigate(invoiceViewPath(selected.invoiceId))}
                      >
                        <FileText size={15} />
                        <span>View Invoice</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      <div
                        style={{
                          padding: "12px 14px",
                          borderRadius: 10,
                          background: "#FFFBEB",
                          border: "1px solid #FDE68A",
                          color: "#92400E",
                          fontSize: 13,
                          lineHeight: 1.5,
                          display: "flex",
                          gap: 8,
                        }}
                      >
                        <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                        <span>
                          To send the confirmation mail, you need to create the invoice for this
                          booking first.
                        </span>
                      </div>
                      <button
                        type="button"
                        className="pmv2-btn pmv2-btn-primary"
                        style={{ width: "100%", marginTop: 12 }}
                        onClick={() => navigate(createRoomInvoicePath(selected.id))}
                      >
                        <FileText size={15} />
                        <span>Create Invoice</span>
                      </button>
                    </>
                  )}
                </div>
              )}

              {isDraftPending(selected) && selected.status !== "cancelled" && (
  <div
    style={{
      padding: "12px 14px",
      borderRadius: 10,
      background: "#F5F3FF",
      border: "1px solid #DDD6FE",
      color: "#5B21B6",
      fontSize: 13,
      lineHeight: 1.5,
      display: "flex",
      gap: 8,
      marginBottom: 14,
    }}
  >
    <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
    <span>
      <b>Payment is pending.</b> {DRAFT_MESSAGE}
    </span>
  </div>
)}
              {/* Guest */}
              <div className="pmv2-drawer-section">
                <div className="pmv2-drawer-section-header">
                  <span className="pmv2-drawer-section-title">Guest Information</span>
                </div>
                <div className="pmv2-drawer-guest-card">
                  <div className="pmv2-drawer-avatar">{initialsOf(selected.guestName)}</div>
                  <div>
                    <h5 className="pmv2-drawer-guest-name">{selected.guestName}</h5>
                    <span className="pmv2-drawer-guest-tag">Primary Guest</span>
                  </div>
                </div>
                <div className="pmv2-drawer-info-row">
                  <Mail size={14} style={{ color: "#6B7280" }} />
                  {selected.email ? (
                    <a href={`mailto:${selected.email}`} style={{ color: "#2563EB", textDecoration: "none" }}>
                      {selected.email}
                    </a>
                  ) : (
                    <span>—</span>
                  )}
                </div>
                <div className="pmv2-drawer-info-row">
                  <Phone size={14} style={{ color: "#6B7280" }} />
                  {selected.phone ? (
                    <a href={`tel:${selected.phone}`} style={{ color: "#2563EB", textDecoration: "none" }}>
                      {selected.phone}
                    </a>
                  ) : (
                    <span>—</span>
                  )}
                </div>
                {selected.address && (
                  <div className="pmv2-drawer-info-row">
                    <MapPin size={14} style={{ color: "#6B7280" }} />
                    <span>{selected.address}</span>
                  </div>
                )}
              </div>

              {/* Stay */}
              <div className="pmv2-drawer-section">
                <div className="pmv2-drawer-section-header">
                  <span className="pmv2-drawer-section-title">
                    <CalendarDays size={16} style={{ color: "#2563EB" }} />
                    Stay Details
                  </span>
                </div>
                <div className="pmv2-bk-timeline">
                  <div className="pmv2-bk-timeline-row">
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#6B7280" }}>CHECK-IN</div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{fmtDate(selected.checkIn)}</div>
                      <div className="pmv2-bk-sub">{fmtTime(selected.checkIn)}</div>
                    </div>
                    <div className="pmv2-bk-timeline-line">
                      <span>
                        {selected.nights} Night{selected.nights > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#6B7280" }}>CHECK-OUT</div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{fmtDate(selected.checkOut)}</div>
                      <div className="pmv2-bk-sub">{fmtTime(selected.checkOut)}</div>
                    </div>
                  </div>
                </div>
                <Row label="Guests">
                  {selected.adults} Adults, {selected.children} Children
                </Row>
                <Row label="Rooms booked">{selected.roomCount}</Row>
                {selected.initialCheckOut && (
                  <Row label="Originally checking out">{fmtDate(selected.initialCheckOut)} (extended)</Row>
                )}
              </div>

              {/* Property & room */}
              <div className="pmv2-drawer-section">
                <div className="pmv2-drawer-section-header">
                  <span className="pmv2-drawer-section-title">
                    <Building2 size={16} style={{ color: "#2563EB" }} />
                    Property & Room
                  </span>
                </div>
                <Row label="Property">{selected.propertyName}</Row>
                <Row label="Location">{selected.propertyAddress || "—"}</Row>
                <Row label="Room">
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <BedDouble size={14} style={{ color: "#2563EB" }} />
                    {selected.roomName}
                  </span>
                </Row>
                <Row label="Room capacity">
                  {selected.maxAdults ?? "—"} Adults, {selected.maxChildren ?? "—"} Children
                </Row>
              </div>

              {/* Payment */}
              {/* <div className="pmv2-drawer-section">
                <div className="pmv2-drawer-section-header">
                  <span className="pmv2-drawer-section-title">
                    <CreditCard size={16} style={{ color: "#2563EB" }} />
                    Payment
                  </span>
                  <PaymentPill value={selected.paymentStatus} />
                </div>
                <Row label="Rate / night">{money(selected.rate)}</Row>
                <Row label="Nights × rooms">
                  {selected.nights} × {selected.roomCount}
                </Row>
                <div className="pmv2-bk-total">
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1E40AF" }}>Estimated total</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: "#1E3A8A" }}>{money(selected.total)}</span>
                </div>
                                               {canUpdate && canMarkPaid(selected) ? (
                  <button
                    type="button"
                    className="pmv2-btn pmv2-btn-primary"
                    style={{ width: "100%", marginTop: 12 }}
                    onClick={() => setPayTarget(selected)}
                  >
                    <CheckCircle2 size={16} />
                    <span>Mark as Paid</span>
                  </button>
                ) : selected.paymentStatus === "paid" ? (
                  <div
                    style={{
                      marginTop: 12,
                      padding: "10px 14px",
                      borderRadius: 10,
                      background: "#ECFDF5",
                      border: "1px solid #A7F3D0",
                      color: "#059669",
                      fontSize: 13,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <CheckCircle2 size={16} />
                    Payment received. This can't be changed.
                  </div>
                ) : null}
              </div> */}

              {/* Booking info */}
              <div className="pmv2-drawer-section">
                <div className="pmv2-drawer-section-header">
                  <span className="pmv2-drawer-section-title">Booking Information</span>
                </div>
                <Row label="Booking number">
                  <span style={{ fontFamily: "monospace" }}>{selected.number}</span>
                </Row>
                <Row label="Booked on">{fmtLocal(selected.createdAt)}</Row>
                <Row label="Status">
                  <StatusPill status={selected.status} />
                </Row>
                {selected.customerId && (
                  <Row label="Customer ID">
                    <span style={{ fontFamily: "monospace", fontSize: 11.5 }}>
                      {selected.customerId.slice(0, 8)}…
                    </span>
                  </Row>
                )}
              </div>
            </div>

            <div className="pmv2-drawer-footer" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {renderActions(selected, "drawer")}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className="pmv2-btn pmv2-btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() =>
                    navigate(`/property-management-v2/property/${selected.propertyId}/rooms`)
                  }
                >
                  <span>Open Rooms Board</span>
                  <ArrowRight size={14} />
                </button>
                <button
                  type="button"
                  className="pmv2-btn pmv2-btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setSelectedId(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────── Cancel confirmation ───────────── */}
      {cancelTarget && (
        <div className="pmv2-modal-backdrop" style={{ zIndex: 10001 }} onClick={() => setCancelTarget(null)}>
          <div className="pmv2-modal sm" onClick={(e) => e.stopPropagation()}>
            <div className="pmv2-modal-header">
              <div>
                <h3 className="pmv2-modal-title">Cancel this booking?</h3>
                <p className="pmv2-modal-subtitle">Booking {cancelTarget.number}</p>
              </div>
              <button
                type="button"
                className="pmv2-btn-icon"
                style={{ width: 34, height: 34 }}
                onClick={() => setCancelTarget(null)}
              >
                <X size={16} />
              </button>
            </div>
            <div className="pmv2-modal-body">
              <div className="pmv2-stay-summary-box">
                <div className="pmv2-drawer-specs-row">
                  <span className="pmv2-drawer-specs-key">Guest</span>
                  <span className="pmv2-drawer-specs-val">{cancelTarget.guestName}</span>
                </div>
                <div className="pmv2-drawer-specs-row">
                  <span className="pmv2-drawer-specs-key">Property / Room</span>
                  <span className="pmv2-drawer-specs-val">
                    {cancelTarget.propertyName} · {cancelTarget.roomName}
                  </span>
                </div>
                <div className="pmv2-drawer-specs-row">
                  <span className="pmv2-drawer-specs-key">Stay</span>
                  <span className="pmv2-drawer-specs-val">
                    {fmtDate(cancelTarget.checkIn)} – {fmtDate(cancelTarget.checkOut)}
                  </span>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: "#4B5563", lineHeight: 1.5 }}>
                The room will become available again for these dates. This action cannot be undone.
              </p>
            </div>
            <div className="pmv2-modal-footer">
              <div className="pmv2-modal-footer-right">
                <button type="button" className="pmv2-btn pmv2-btn-secondary" onClick={() => setCancelTarget(null)}>
                  Keep Booking
                </button>
                <button
                  type="button"
                  className="pmv2-btn pmv2-btn-danger"
                  disabled={busyId === cancelTarget.id}
                  onClick={() => runAction(cancelTarget, "cancel")}
                >
                  <XCircle size={16} />
                  <span>{busyId === cancelTarget.id ? "Cancelling..." : "Cancel Booking"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

            {/* ───────────── Resend confirmation mail ───────────── */}
      {resendTarget && (
        <div className="pmv2-modal-backdrop" style={{ zIndex: 10001 }} onClick={() => setResendTarget(null)}>
          <div className="pmv2-modal sm" onClick={(e) => e.stopPropagation()}>
            <div className="pmv2-modal-header">
              <div>
                <h3 className="pmv2-modal-title">Send confirmation again?</h3>
                <p className="pmv2-modal-subtitle">Booking {resendTarget.number}</p>
              </div>
              <button
                type="button"
                className="pmv2-btn-icon"
                style={{ width: 34, height: 34 }}
                onClick={() => setResendTarget(null)}
              >
                <X size={16} />
              </button>
            </div>
            <div className="pmv2-modal-body">
              <div className="pmv2-stay-summary-box">
                <div className="pmv2-drawer-specs-row">
                  <span className="pmv2-drawer-specs-key">Guest</span>
                  <span className="pmv2-drawer-specs-val">{resendTarget.guestName}</span>
                </div>
                <div className="pmv2-drawer-specs-row">
                  <span className="pmv2-drawer-specs-key">Email</span>
                  <span className="pmv2-drawer-specs-val">{resendTarget.email || "—"}</span>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: "#B45309", lineHeight: 1.5 }}>
                This customer has already received the confirmation email. Do you want to send it again?
              </p>
            </div>
            <div className="pmv2-modal-footer">
              <div className="pmv2-modal-footer-right">
                <button type="button" className="pmv2-btn pmv2-btn-secondary" onClick={() => setResendTarget(null)}>
                  No, Cancel
                </button>
                <button
                  type="button"
                  className="pmv2-btn pmv2-btn-primary"
                  disabled={mailBusyId === resendTarget.id}
                  onClick={() => sendConfirmMail(resendTarget)}
                >
                  <Send size={16} />
                  <span>{mailBusyId === resendTarget.id ? "Sending..." : "Yes, Send Again"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

            {payTarget && (
        <div className="pmv2-modal-backdrop" style={{ zIndex: 10001 }} onClick={() => setPayTarget(null)}>
          <div className="pmv2-modal sm" onClick={(e) => e.stopPropagation()}>
            <div className="pmv2-modal-header">
              <div>
                <h3 className="pmv2-modal-title">Mark as paid?</h3>
                <p className="pmv2-modal-subtitle">Booking {payTarget.number}</p>
              </div>
              <button
                type="button"
                className="pmv2-btn-icon"
                style={{ width: 34, height: 34 }}
                onClick={() => setPayTarget(null)}
              >
                <X size={16} />
              </button>
            </div>
            <div className="pmv2-modal-body">
              <div className="pmv2-stay-summary-box">
                <div className="pmv2-drawer-specs-row">
                  <span className="pmv2-drawer-specs-key">Guest</span>
                  <span className="pmv2-drawer-specs-val">{payTarget.guestName}</span>
                </div>
                <div className="pmv2-drawer-specs-row">
                  <span className="pmv2-drawer-specs-key">Amount</span>
                  <span className="pmv2-drawer-specs-val">{money(payTarget.total)}</span>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: "#B45309", lineHeight: 1.5 }}>
                Are you sure? Once marked as paid, the payment status cannot be changed again.
              </p>
            </div>
            <div className="pmv2-modal-footer">
              <div className="pmv2-modal-footer-right">
                <button type="button" className="pmv2-btn pmv2-btn-secondary" onClick={() => setPayTarget(null)}>
                  Not Yet
                </button>
                <button
                  type="button"
                  className="pmv2-btn pmv2-btn-primary"
                  disabled={busyId === payTarget.id}
                  onClick={() => runAction(payTarget, "paid")}
                >
                  <CheckCircle2 size={16} />
                  <span>{busyId === payTarget.id ? "Updating..." : "Yes, Mark Paid"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PropertyManagementV2BookingDetails() {
  return (
    <ToastProvider>
      <BookingsContent />
    </ToastProvider>
  );
}