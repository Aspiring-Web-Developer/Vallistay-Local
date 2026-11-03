// src/Pages/PropertyRooms/components/QuickBookingModal.jsx
import React, { useState } from "react";
import {
  BedDouble,
  X,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import CustomerSelector from "./CustomerSelector";
import { calculateNights } from "../data/mockRoomBookingData";

export default function QuickBookingModal({
  isOpen,
  onClose,
  room,
  property,
  initialDates,
  onConfirmBooking,
}) {
  if (!isOpen || !room) return null;

  const [customerMode, setCustomerMode] = useState("existing");
  // Default to Ram C if available for easy 1-click test
  const [selectedCustomer, setSelectedCustomer] = useState({
    id: "CUST-1001",
    name: "Ram C",
    phone: "+91 98563 28653",
    email: "ram.c@example.com",
    avatar: "RC",
    tag: "PRIMARY GUEST",
  });
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const [checkIn, setCheckIn] = useState(initialDates?.checkIn || "2026-10-05");
  const [checkOut, setCheckOut] = useState(initialDates?.checkOut || "2026-10-08");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [conflictError, setConflictError] = useState("");

  const nights = calculateNights(checkIn, checkOut);

  const getCustomerData = () => {
    if (customerMode === "existing") {
      return selectedCustomer;
    }
    return {
      id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newCustomer.name.trim(),
      phone: newCustomer.phone.trim(),
      email: newCustomer.email.trim() || `${newCustomer.name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      avatar: newCustomer.name.slice(0, 2).toUpperCase() || "GU",
      tag: "NEW GUEST",
    };
  };

  const validate = () => {
    const errs = {};
    if (customerMode === "existing" && !selectedCustomer) {
      errs.customer = "Please select a customer from the search list.";
    }
    if (customerMode === "new") {
      if (!newCustomer.name.trim()) errs.name = "Full name is required.";
      if (!newCustomer.phone.trim()) errs.phone = "Mobile number is required.";
    }
    if (!checkIn || !checkOut) {
      errs.dates = "Please select both check-in and check-out dates.";
    } else {
      const d1 = new Date(checkIn);
      const d2 = new Date(checkOut);
      if (d2 <= d1) {
        errs.dates = "Check-out date must be after check-in date.";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleConfirm = () => {
    setConflictError("");
    if (!validate()) return;

    setIsSubmitting(true);
    // Simulate PMS quick booking response
    setTimeout(() => {
      setIsSubmitting(false);
      const customer = getCustomerData();
      onConfirmBooking(room, customer, {
        checkIn,
        checkOut,
        nights,
      });
      onClose();
    }, 600);
  };

  const activeCustomer = customerMode === "existing" ? selectedCustomer : newCustomer;
  const isReadyForReview =
    (customerMode === "existing" ? Boolean(selectedCustomer?.name) : Boolean(newCustomer?.name && newCustomer?.phone)) &&
    nights > 0;

  return (
    <div className="pr-modal-backdrop" onClick={onClose}>
      <div className="pr-modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* ── Modal Header ── */}
        <div className="pr-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: "#eff6ff",
                color: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BedDouble size={22} />
            </div>
            <div>
              <div className="pr-modal-title">Quick Booking</div>
              <div className="pr-modal-subtitle">
                Reserve Room {room.number} for a guest
              </div>
            </div>
          </div>
          <button className="pr-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* ── Modal Body ── */}
        <div className="pr-modal-body">
          {/* Selected Room Summary Strip */}
          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                {room.number} • {room.type}
              </div>
              <div style={{ fontSize: 12, color: "#64748b" }}>
                {property?.name || room.propertyName} • #{room.id} • {room.floor}
              </div>
            </div>
            <span
              style={{
                background: "#dcfce7",
                color: "#15803d",
                fontSize: 11,
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: 9999,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#16a34a",
                }}
              />
              AVAILABLE
            </span>
          </div>

          {/* Section 1: Customer Details */}
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#0f172a",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                marginBottom: 10,
              }}
            >
              1. Customer Details
            </div>
            <CustomerSelector
              customerMode={customerMode}
              setCustomerMode={setCustomerMode}
              selectedCustomer={selectedCustomer}
              setSelectedCustomer={setSelectedCustomer}
              newCustomer={newCustomer}
              setNewCustomer={setNewCustomer}
              errors={errors}
            />
          </div>

          {/* Section 2: Stay Details */}
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#0f172a",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                marginBottom: 10,
              }}
            >
              2. Stay Details
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div className="pr-field-group">
                <label className="pr-field-label">Check-in Date *</label>
                <div className="pr-input-wrap">
                  <CalendarDays size={16} color="#2563eb" />
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                  />
                </div>
              </div>

              <div className="pr-field-group">
                <label className="pr-field-label">Check-out Date *</label>
                <div className="pr-input-wrap">
                  <CalendarDays size={16} color="#2563eb" />
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                  />
                </div>
              </div>
            </div>
            {errors.dates && (
              <div style={{ color: "#dc2626", fontSize: 12, marginTop: 6 }}>
                {errors.dates}
              </div>
            )}
            {conflictError && (
              <div
                style={{
                  background: "#fee2e2",
                  color: "#991b1b",
                  padding: "10px 14px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  marginTop: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <AlertCircle size={16} />
                {conflictError}
              </div>
            )}
          </div>

          {/* Booking Review Strip */}
          {isReadyForReview && (
            <div
              style={{
                background: "#f0fdf4",
                border: "1px dashed #86efac",
                borderRadius: 12,
                padding: "14px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#166534",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Booking Summary & Review
              </div>
              <div style={{ fontSize: 13, color: "#14532d" }}>
                <strong>Customer:</strong> {activeCustomer.name} (
                {activeCustomer.phone})
              </div>
              <div style={{ fontSize: 13, color: "#14532d" }}>
                <strong>Room:</strong> {room.number} ({room.type})
              </div>
              <div style={{ fontSize: 13, color: "#14532d" }}>
                <strong>Stay Period:</strong> {checkIn} to {checkOut} ({nights}{" "}
                {nights === 1 ? "Night" : "Nights"})
              </div>
            </div>
          )}
        </div>

        {/* ── Modal Footer ── */}
        <div className="pr-modal-footer">
          <button
            type="button"
            className="pr-btn pr-btn-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="pr-btn pr-btn-primary"
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="pr-spin" />
                <span>Confirming booking...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>Confirm Booking</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
