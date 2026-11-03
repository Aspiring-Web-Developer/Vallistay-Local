





import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { X, Info, AlertTriangle, Plus, ChevronDown, ChevronUp, BedDouble, CalendarDays, Globe2, Home } from "lucide-react";
import api from "../../services/api";
import { useToast } from "../Stays/Rooms/Room_Shared";
import {
  CSS, SendInvoiceModal, SelectDropdown, getErrorMessage,
  AutoTextarea, fmt, fmtFull, MAX_RATE, MAX_INVOICE_TOTAL,
} from "./Create_Invoice";

const pad = (n) => String(n).padStart(2, "0");
const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const msOf = (raw) => (raw && typeof raw === "object" && raw.$date !== undefined ? raw.$date : raw);
const toYMD = (raw) => {
  const d = new Date(msOf(raw));
  if (isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const toYMDUTC = (raw) => {
  const d = new Date(msOf(raw));
  if (isNaN(d.getTime())) return "";
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
};
const fmtDate = (raw) => {
  const d = new Date(msOf(raw));
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const EXTRA_CSS = `
.zr-hd, .zr-row { grid-template-columns: 20px minmax(0,1fr) minmax(150px,220px) 36px !important; }
.zr-hd { padding-left: 0 !important; }
.zr-del { display: flex; justify-content: center; }
.zr-cust { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px 18px; padding: 14px; border: 1px solid #e5e7eb; border-radius: 10px; background: #f8fafc; margin-top: 14px; }
.zr-cust-item { min-width: 0; }
.zr-cust-item span { display: block; font-size: 10.5px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: .04em; margin-bottom: 3px; background: none; }
.zr-cust-item b { font-size: 13px; color: #111; font-weight: 600; word-break: break-word; }
.zr-stay { display: flex; align-items: center; gap: 6px; white-space: nowrap; flex-wrap: wrap; }
.zr-stay svg { flex-shrink: 0; }
.zr-room-chip { display: inline-flex; align-items: center; gap: 6px; background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; border-radius: 999px; padding: 3px 10px; font-size: 11.5px; font-weight: 700; }
.zr-ro { background: #f9fafb !important; color: #6b7280 !important; cursor: not-allowed; }
@media (max-width: 768px) { .zr-del { justify-content: flex-end; } }
`;

export default function CreateRoomInvoice() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const bookingId = params.get("booking_id");
  const { push, ToastHost } = useToast();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [booking, setBooking] = useState(null);
  const [existing, setExisting] = useState(null); // invoice already linked to this booking
  const [departments, setDepartments] = useState([]);
  const [profile, setProfile] = useState(null);

  const [invoicePrefix, setInvoicePrefix] = useState("");
  const [originalPrefix, setOriginalPrefix] = useState("");
  const [invoiceNumberPart, setInvoiceNumberPart] = useState("");
  const [changeUpcomingPrefix, setChangeUpcomingPrefix] = useState(false);

  const [invoiceDate, setInvoiceDate] = useState(todayStr());
  const [dueDate, setDueDate] = useState(todayStr());
  const [departmentId, setDepartmentId] = useState("");
  const [items, setItems] = useState([{ product_name: "", amount: "" }]);

  const [discountEnabled, setDiscountEnabled] = useState(false);
  const [discount, setDiscount] = useState("");
  const [taxEnabled, setTaxEnabled] = useState(false);
  const [gst, setGst] = useState("");
  const [advanceEnabled, setAdvanceEnabled] = useState(false);
  const [advance, setAdvance] = useState("");
  const [platformFeePct, setPlatformFeePct] = useState("");
  const [platformFeeTouched, setPlatformFeeTouched] = useState(false);
  const [notes, setNotes] = useState("Your comfort is our priority.");
  const [terms, setTerms] = useState("");
  const [showTerms, setShowTerms] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);

  /* ── load booking (+ departments, profile) ── */
  useEffect(() => {
    api.get("/departments/list_departments")
      .then(r => setDepartments((r.data?.data || []).filter(d => d.is_active)))
      .catch(() => {});
    api.get("/profile/get_profile").then(r => setProfile(r.data?.data || null)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!bookingId) { setLoadError("Booking id is missing in the URL."); setLoading(false); return; }
    let off = false;
    (async () => {
      try {
        const r = await api.get(`/room_booking/get_booking?room_booking_id=${bookingId}`);
        const b = r.data?.data;
        if (!b) throw new Error("Booking not found");
        if (off) return;

        const inD = new Date(msOf(b.booking_check_in_date));
        const outD = new Date(msOf(b.booking_check_out_date));
        const nights = Math.max(1, Math.round((outD - inD) / 86400000));
        const rate = Number(b.subroom_details?.price_per_day || 0);
        const roomLabel = [b.subroom_details?.sub_room_name, b.room_details?.room_name].filter(Boolean).join(" - ") || "Room";

        setBooking(b);
        setItems([{
          product_name: `${roomLabel} (${nights} night${nights > 1 ? "s" : ""})`,
          amount: rate ? String(rate * nights) : "",
        }]);
        setDueDate(toYMD(b.booking_check_in_date) || todayStr());

        let ex = null;
        if (b.invoice_id) {
          try {
            const ir = await api.get(`/invoices/get_invoice?invoice_id=${b.invoice_id}`);
            const inv = ir.data?.data || ir.data;
            ex = { id: b.invoice_id, number: inv?.invoice_number || "" };

            // ── prefill the form with the SAVED invoice values ──
            if (inv?.items?.length) {
              setItems(inv.items.map(i => ({
                product_name: i.product_name || "",
                amount: String(i.amount ?? ""),
              })));
            }
            if (inv?.invoice_date) setInvoiceDate(toYMDUTC(inv.invoice_date) || todayStr());
            if (inv?.due_date) setDueDate(toYMDUTC(inv.due_date) || todayStr());
            if (inv?.department_id) setDepartmentId(inv.department_id);

            if (parseFloat(inv?.discount_percentage || 0) > 0) {
              setDiscountEnabled(true);
              setDiscount(String(inv.discount_percentage));
            }
            if (inv?.tax_enabled) {
              setTaxEnabled(true);
              setGst(String(inv.tax_percentage || ""));
            }
            if (parseFloat(inv?.advance_amount || 0) > 0) {
              setAdvanceEnabled(true);
              setAdvance(String(inv.advance_amount));
            }
            if (inv?.platform_fee_percentage !== undefined && inv?.platform_fee_percentage !== null) {
              setPlatformFeePct(String(inv.platform_fee_percentage));
              setPlatformFeeTouched(true); // don't let the profile default overwrite it
            }
            if (inv?.notes !== undefined && inv?.notes !== null) setNotes(inv.notes);
            if (inv?.terms_and_conditions) {
              setTerms(inv.terms_and_conditions);
              setShowTerms(true);
            }
            setShowSummary(true);
          } catch { ex = null; }
        }
        if (off) return;
        setExisting(ex);
        if (!ex) {
          try {
            const nr = await api.get("/invoices/generate_invoice_number");
            const d = nr.data?.data || {};
            setInvoicePrefix(d.invoice_prefix || "");
            setOriginalPrefix(d.invoice_prefix || "");
            setInvoiceNumberPart(d.invoice_number ?? "");
          } catch {}
        }
      } catch (err) {
        if (!off) setLoadError(getErrorMessage(err, "Could not load booking"));
      } finally {
        if (!off) setLoading(false);
      }
    })();
    return () => { off = true; };
  }, [bookingId]);

  const customerType = booking?.customer_details?.customer_type || "domestic";

  useEffect(() => {
    if (!profile || platformFeeTouched) return;
    const p = customerType === "international"
      ? profile.international_platform_fee_percentage
      : profile.domestic_platform_fee_percentage;
    setPlatformFeePct(p !== undefined && p !== null ? String(p) : "0");
  }, [profile, customerType, platformFeeTouched]);

  /* ── calculations ── */
  const subtotal = items.reduce((s, i) => s + parseFloat(i.amount || 0), 0);
  const discountAmt = discountEnabled ? subtotal * (parseFloat(discount || 0) / 100) : 0;
  const taxAmt = taxEnabled ? (subtotal - discountAmt) * (parseFloat(gst || 0) / 100) : 0;
  const preFeeTotal = subtotal - discountAmt + taxAmt;
  const advanceAmt = advanceEnabled ? parseFloat(advance || 0) || 0 : 0;
  const feePct = Math.min(parseFloat(platformFeePct || 0) || 0, 100);
  const platformFeeAmt = Math.max(preFeeTotal - advanceAmt, 0) * feePct / 100;
  const grandTotal = preFeeTotal + platformFeeAmt;
  const balanceDue = grandTotal - advanceAmt;

  /* ── input handlers ── */
  const percentHandler = (setter, label) => (e) => {
    const v = e.target.value;
    if (v === "") return setter("");
    if (!/^\d{0,3}(\.\d{0,2})?$/.test(v)) return;
    if (Number(v) > 100) { setter("100"); push(`${label} can't be more than 100%`, "error"); return; }
    setter(v);
  };
  const handleAdvance = (e) => {
    const v = e.target.value;
    if (v === "") return setAdvance("");
    if (!/^\d*(\.\d{0,2})?$/.test(v)) return;
    if (Number(v) > preFeeTotal) {
      setAdvance(String(parseFloat(preFeeTotal.toFixed(2))));
      push(`Advance can't be more than the invoice total (₹${fmt(preFeeTotal)})`, "error");
      return;
    }
    setAdvance(v);
  };
  const setItem = (idx, field, val) => setItems(list => list.map((it, i) => (i === idx ? { ...it, [field]: val } : it)));

  const handleAmount = (idx) => (e) => {
    const v = e.target.value;
    if (v === "") return setItem(idx, "amount", "");
    if (!/^\d*(\.\d{0,2})?$/.test(v)) return;
    if (Number(v) > MAX_RATE) {
      setItem(idx, "amount", String(MAX_RATE));
      push(`Amount can't be more than ${fmtFull(MAX_RATE)}`, "error");
      return;
    }
    setItem(idx, "amount", v);
  };

  /* ── validation (send only) ── */
  const validate = () => {
    const e = {};
    if (!invoiceDate) e.invoice_date = "Invoice date is required";
    if (!dueDate) e.due_date = "Due date is required";
    if (dueDate && invoiceDate && dueDate < invoiceDate) e.due_date = "Due date can't be before the invoice date";
    if (items.some(i => !i.product_name || !i.amount)) e.items = "Fill item name and amount";
    if (!existing && !invoicePrefix.trim()) e.invoice_prefix = "Invoice prefix is required";
    if (advanceEnabled && advanceAmt > preFeeTotal) e.advance = "Advance can't exceed the invoice total";
    if (preFeeTotal > MAX_INVOICE_TOTAL)
      e.items = `Invoice total can't exceed ${fmtFull(MAX_INVOICE_TOTAL)}`;
    setErrors(e);
    if (Object.keys(e).length) { push(`Please fix: ${Object.values(e).join(", ")}`, "error"); return false; }
    return true;
  };

  /* ── save (draft or send) ── */
  const handleSave = async (asDraft = false, currency = null) => {
    if (asDraft) setErrors({});
    else if (!validate()) return;

    setSaving(true);
    try {
      const cleanItems = items
        .filter(i => !asDraft || i.product_name || i.amount)
        .map(i => ({ product_name: i.product_name, description: "", quantity: 1, amount: i.amount }));

      const payload = {
        customer_id: booking.customer_id,
        department_id: departmentId,
        invoice_date: invoiceDate,
        due_date: dueDate,
        currency: "INR",
        items: cleanItems,
        tax_enabled: taxEnabled,
        tax_percentage: taxEnabled ? parseFloat(gst || 0) : 0,
        discount_percentage: discountEnabled ? parseFloat(discount || 0) : 0,
        total_amount: parseFloat(subtotal.toFixed(2)),
        grand_total_amount: parseFloat(grandTotal.toFixed(2)),
        tax_amount: parseFloat(taxAmt.toFixed(2)),
        discount_amount: parseFloat(discountAmt.toFixed(2)),
        customer_type: customerType,
        platform_fee_percentage: parseFloat(feePct.toFixed(2)),
        platform_fee_amount: parseFloat(platformFeeAmt.toFixed(2)),
        notes,
        terms_and_conditions: terms,
        status: asDraft ? "draft" : "sent",
        room_booking: true,
        room_booking_id: bookingId,
      };
      if (!payload.department_id) delete payload.department_id;
      if (currency) payload.invoice_currency = currency;
      if (advanceEnabled && advanceAmt > 0) payload.advance_amount = advanceAmt;

      if (existing) {
        await api.put("/invoices/update_invoice", { ...payload, invoice_id: existing.id });
      } else {
        await api.post("/invoices/", {
          ...payload,
          invoice_prefix: invoicePrefix,
          invoice_number: `${invoicePrefix}-${invoiceNumberPart}`,
          change_upcoming_invoice_prefix: changeUpcomingPrefix,
        });
      }
      push(asDraft ? "Draft saved" : "Room invoice sent", "success");
      setShowSendModal(false);
      setTimeout(() => navigate("/property-management-v2/bookings"), 700);
    } catch (err) {
      push(getErrorMessage(err, "Failed to save invoice"), "error");
    } finally {
      setSaving(false);
    }
  };

  /* ── states ── */
  if (loading) {
    return (
      <div className="z-page">
        <style>{CSS}</style>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
          {[220, 400, 300].map((w, i) => (
            <div key={i} className="z-skel" style={{ width: w, height: i === 0 ? 20 : 80, marginBottom: 16 }} />
          ))}
        </div>
      </div>
    );
  }
  if (loadError || !booking) {
    return (
      <div className="z-page">
        <style>{CSS}</style>
        <div style={{ padding: 40, textAlign: "center" }}>
          <p style={{ color: "#ef4444", fontWeight: 600, marginBottom: 14 }}>{loadError || "Booking not found"}</p>
          <button className="z-btn-ghost" onClick={() => navigate("/property-management-v2")}>Back to Rooms</button>
        </div>
      </div>
    );
  }

  const cust = booking.customer_details || {};
  const isPrefixEdited = invoicePrefix.trim() !== originalPrefix.trim();

  return (
    <>
      <style>{CSS}</style>
      <style>{EXTRA_CSS}</style>
      <div className="z-page">
        <div className="z-page-hd">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1 className="z-page-title">Room Invoice</h1>
            <span className="zr-room-chip"><BedDouble size={12} /> Room</span>
          </div>
          <button className="z-btn-icon" onClick={() => navigate("/invoices")} title="Close"><X size={18} /></button>
        </div>

        <div className="z-body">
          {/* Customer + booking details (read only, from booking) */}
          <div className="zr-cust">
            <div className="zr-cust-item"><span>Guest</span><b>{cust.name || booking.name}</b></div>
            <div className="zr-cust-item"><span>Email</span><b>{cust.email || booking.email || "—"}</b></div>
            <div className="zr-cust-item"><span>Phone</span><b>+{cust.mobile_country_code || "91"} {cust.mobile || booking.phone}</b></div>
            <div className="zr-cust-item">
              <span>Type</span>
              <b style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                {customerType === "international" ? <Globe2 size={13} /> : <Home size={13} />}
                {customerType === "international" ? "International" : "Domestic"}
              </b>
            </div>
            <div className="zr-cust-item"><span>Booking #</span><b>{booking.booking_number}</b></div>
            <div className="zr-cust-item">
              <span>Room</span>
              <b>{booking.subroom_details?.sub_room_name} · {booking.room_details?.room_name}</b>
            </div>
            <div className="zr-cust-item">
              <span>Stay</span>
              <b className="zr-stay">
                <CalendarDays size={13} />
                <span style={{ display: "inline", margin: 0, background: "none", color: "#111", fontSize: 13, fontWeight: 600, textTransform: "none", letterSpacing: 0 }}>
                  {fmtDate(booking.booking_check_in_date)} → {fmtDate(booking.booking_check_out_date)}
                </span>
              </b>
            </div>
          </div>

          {/* Invoice # */}
          <div className="z-form-row">
            <label className="z-field-label z-required-label">Invoice#</label>
            {existing ? (
              <input className="z-input zr-ro" style={{ maxWidth: 340 }} value={existing.number || "Linked to booking"} disabled />
            ) : (
              <div style={{ display: "flex", alignItems: "center", maxWidth: 560, flexWrap: "wrap" }}>
                <input
                  className="z-input"
                  style={{ width: 100, borderRadius: "4px 0 0 4px", textAlign: "center", fontWeight: 600 }}
                  value={invoicePrefix}
                  placeholder="PREFIX"
                  onChange={e => {
                    const val = e.target.value.toUpperCase();
                    setInvoicePrefix(val);
                    if (val.trim() === originalPrefix.trim()) setChangeUpcomingPrefix(false);
                  }}
                />
                <span style={{ height: 32, display: "flex", alignItems: "center", padding: "0 8px", color: "#6b7280", fontWeight: 600 }}>-</span>
                <input className="z-input zr-ro" disabled style={{ width: 120, borderRadius: "0 4px 4px 0" }} value={invoiceNumberPart} />
                {isPrefixEdited && (
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6b7280", cursor: "pointer", marginLeft: 12 }}>
                    <input type="checkbox" className="z-checkbox" checked={changeUpcomingPrefix} onChange={e => setChangeUpcomingPrefix(e.target.checked)} />
                    Apply this prefix to all upcoming invoices
                  </label>
                )}
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="z-form-row z-dates-row">
            <label className="z-field-label z-required-label">Invoice Date</label>
            <input className="z-input z-date-input" type="date" value={invoiceDate}
              onChange={e => { setInvoiceDate(e.target.value); if (dueDate < e.target.value) setDueDate(e.target.value); }} />
            <label className="z-field-label z-mid-label">Due Date</label>
            <input className="z-input z-date-input" type="date" min={invoiceDate || undefined} value={dueDate}
              onChange={e => setDueDate(e.target.value)} />
          </div>

          {/* Items (no quantity) */}
          <div className="z-item-table">
            <div className="z-item-table-hd"><span className="z-item-table-title">Item Table</span></div>
            <div className="z-col-hd zr-hd">
              <div />
              <div className="z-col-details">ITEM DETAILS</div>
              <div className="z-col-amt">AMOUNT</div>
              <div />
            </div>

            {items.map((item, idx) => (
              <div className="z-item-row zr-row" key={idx}>
                <div className="z-drag-handle">⠿</div>
                <div className="z-col-details z-item-details-cell">
                  <span className="z-mobile-label">Item Details</span>
                  <AutoTextarea
                    className="z-item-name-inp"
                    placeholder="Item name"
                    value={item.product_name}
                    onChange={e => setItem(idx, "product_name", e.target.value)}
                  />
                </div>
                <div className="z-col-rate z-item-num-cell">
                  <span className="z-mobile-label">Amount</span>
                  <input type="text" inputMode="decimal" placeholder="0.00" className="z-item-num-inp"
                    title={fmtFull(parseFloat(item.amount || 0))}
                    value={item.amount}
                    onChange={handleAmount(idx)} />
                </div>
                <div className="zr-del">
                  {items.length > 1 && (
                    <button className="z-del-row-btn" onClick={() => setItems(l => l.filter((_, i) => i !== idx))} title="Remove">
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            <div className="z-table-footer">
              <button className="z-add-row-btn" onClick={() => setItems(l => [...l, { product_name: "", amount: "" }])}>
                <span className="z-plus-circle"><Plus size={9} color="#fff" /></span> Add New Row
              </button>
            </div>
          </div>

          {/* Bottom */}
          <div className="z-bottom">
            <div className="z-notes-col">
              <div className="z-notes-block">
                <label className="z-section-label"> Notes for Guest </label>
                <textarea className="z-textarea" value={notes} onChange={e => setNotes(e.target.value)} />
                <span className="z-helper">Will be displayed on the invoice</span>
              </div>
              {!showTerms ? (
                <button className="z-add-row-btn" onClick={() => setShowTerms(true)}>
                  <span className="z-plus-circle"><Plus size={9} color="#fff" /></span> Add Terms and conditions
                </button>
              ) : (
                <div className="z-notes-block">
                  <label className="z-section-label">Terms &amp; Conditions</label>
                  <textarea className="z-textarea" value={terms} onChange={e => setTerms(e.target.value)} />
                </div>
              )}
            </div>

            <div className="z-summary-col">
              <div className={`z-summary-panel${showSummary ? " open" : ""}`}>
                <div className="z-sum-row">
                  <span className="z-sum-label-bold">Sub Total</span>
                  <span className="z-sum-val-bold" title={fmtFull(subtotal)}>{fmt(subtotal)}</span>
                </div>

                <div className="z-sum-row">
                  <div className="z-sum-label-wrap">
                    <button className={`z-toggle-sm ${discountEnabled ? "on" : "off"}`}
                      onClick={() => { setDiscountEnabled(v => !v); if (discountEnabled) setDiscount(""); }} />
                    <span className="z-sum-label">Discount</span>
                  </div>
                  <div className="z-sum-right">
                    {discountEnabled && (
                      <div className="z-disc-group">
                        <input className="z-disc-inp" type="number" min="0" max="100" value={discount}
                          onChange={percentHandler(setDiscount, "Discount")} />
                        <span className="z-disc-pct">%</span>
                      </div>
                    )}
                    <span className="z-sum-val" title={fmtFull(discountAmt)}>{fmt(discountAmt)}</span>
                  </div>
                </div>

                <div className="z-sum-row">
                  <div className="z-sum-label-wrap">
                    <button className={`z-toggle-sm ${taxEnabled ? "on" : "off"}`}
                      onClick={() => { setTaxEnabled(v => !v); if (taxEnabled) setGst(""); }} />
                    <span className="z-sum-label">GST / Tax</span>
                  </div>
                  <div className="z-sum-right">
                    {taxEnabled && (
                      <div className="z-disc-group">
                        <input className="z-disc-inp" type="number" min="0" max="100" value={gst}
                          onChange={percentHandler(setGst, "GST")} />
                        <span className="z-disc-pct">%</span>
                      </div>
                    )}
                    <span className="z-sum-val" title={fmtFull(taxAmt)}>{fmt(taxAmt)}</span>
                  </div>
                </div>

                <div className="z-sum-row">
                  <div className="z-sum-label-wrap">
                    <span className={`z-fee-dot ${customerType === "international" ? "z-fee-dot-intl" : "z-fee-dot-dom"}`} />
                    <span className="z-sum-label">
                      Platform Fee
                      <span className="z-fee-sub">{customerType === "international" ? "International rate" : "Domestic rate"}</span>
                    </span>
                  </div>
                  <div className="z-sum-right">
                    <div className="z-disc-group">
                      <input className="z-disc-inp" type="number" min="0" max="100" value={platformFeePct}
                        onChange={(e) => { setPlatformFeeTouched(true); percentHandler(setPlatformFeePct, "Platform fee")(e); }} />
                      <span className="z-disc-pct">%</span>
                    </div>
                    <span className="z-sum-val" title={fmtFull(platformFeeAmt)}>{fmt(platformFeeAmt)}</span>
                  </div>
                </div>

                <div className="z-advance-block">
                  <div className="z-advance-top">
                    <div className="z-sum-label-wrap">
                      <button type="button" className={`z-toggle-sm ${advanceEnabled ? "on" : "off"}`}
                        onClick={() => { setAdvanceEnabled(v => !v); if (advanceEnabled) setAdvance(""); }} />
                      <span className="z-sum-label">Advance Amount</span>
                    </div>
                    {advanceEnabled && <span className="z-sum-val">{fmt(advanceAmt)}</span>}
                  </div>
                  {advanceEnabled && (
                    <div className="z-advance-card">
                      <div className={`z-advance-field${advanceAmt > preFeeTotal ? " err" : ""}`}>
                        <span className="z-advance-cur">₹</span>
                        <input type="number" min="0" placeholder="Enter advance amount" value={advance} onChange={handleAdvance} />
                        <button type="button" className="z-advance-max"
                          onClick={() => setAdvance(String(parseFloat(preFeeTotal.toFixed(2))))}>Max</button>
                      </div>
                      <div className="z-advance-meta">
                        <span>Invoice total <b>₹{fmt(preFeeTotal)}</b></span>
                        <span>Remaining <b>₹{fmt(Math.max(preFeeTotal - advanceAmt, 0))}</b></span>
                      </div>
                      {advanceAmt > preFeeTotal && (
                        <div className="z-advance-warn"><AlertTriangle size={12} /> Advance is more than the invoice total</div>
                      )}
                      <div className="z-advance-note"><Info size={11} /> Can only be set once. Double-check the amount before saving.</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="z-total-line">
                <span className="z-total-label">Total ( ₹ )</span>
                <span className="z-total-val" title={fmtFull(grandTotal)}>{fmt(grandTotal)}</span>
              </div>

              <div className="z-summary-toggle-row">
                <button className="z-summary-toggle" onClick={() => setShowSummary(s => !s)}>
                  {showSummary ? "Hide Total Summary" : "Show Total Summary"}
                  {showSummary ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>
              </div>

              {showSummary && advanceAmt > 0 && (
                <div className="z-balance-row">
                  <span className="z-sum-label-bold">Balance Due</span>
                  <span className="z-sum-val-bold">₹{fmt(balanceDue)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="z-footer">
          <button className="z-btn-ghost" onClick={() => handleSave(true)} disabled={saving}>Save as Draft</button>
          <button className="z-btn-blue z-send-btn" onClick={() => { if (validate()) setShowSendModal(true); }} disabled={saving}>
            Save and Send <ChevronDown size={13} />
          </button>
          <button className="z-btn-ghost" onClick={() => navigate("/invoices")} disabled={saving}>Cancel</button>
        </div>
      </div>

      {showSendModal && (
        <SendInvoiceModal
          open={showSendModal}
          onClose={() => setShowSendModal(false)}
          onConfirm={(currency) => handleSave(false, currency)}
          sending={saving}
        />
      )}
      <ToastHost />
    </>
  );
}