// src/Pages/PropertyManagementV2/components/V2CancelBookingModal.jsx
import React, { useState } from "react";
import { CalendarX, X, XCircle } from "lucide-react";
import { formatDisplayDate } from "../utils/dateUtils";

export default function V2CancelBookingModal({
  isOpen,
  room,
  onClose,
  onConfirmCancel,
}) {
  const [isCancelling, setIsCancelling] = useState(false);

  if (!isOpen || !room || !room.activeBooking) return null;

  const booking = room.activeBooking;

  const handleConfirm = () => {
    setIsCancelling(true);
    setTimeout(() => {
      onConfirmCancel(room.id);
      setIsCancelling(false);
      onClose();
    }, 200);
  };

  return (
    <div className="pmv2-modal-backdrop" onClick={onClose}>
      <div className="pmv2-modal sm" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="pmv2-modal-header" style={{ alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "#FFE4E6",
                color: "#E11D48",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <CalendarX size={22} />
            </div>
            <div>
              <h3 className="pmv2-modal-title">Cancel this booking?</h3>
              <p className="pmv2-modal-subtitle">
                Booking Folio: {booking.bookingFolio || booking.bookingId || "BK-001"}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="pmv2-btn-icon"
            onClick={onClose}
            style={{ width: 34, height: 34 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="pmv2-modal-body">
          {/* Summary Box */}
          <div
            style={{
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: 12,
              padding: "14px 16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#64748B",
                  textTransform: "uppercase",
                }}
              >
                BOOKING SUMMARY
              </span>
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: "#DC2626",
                  background: "#FEE2E2",
                  padding: "2px 8px",
                  borderRadius: 4,
                  textTransform: "uppercase",
                }}
              >
                CONFIRMED CANCELLATION
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748B" }}>Customer</span>
                <span style={{ fontWeight: 700, color: "#0F172A" }}>
                  {booking.customer?.name} ({booking.customer?.phone || "+91 98563 28653"})
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748B" }}>Property</span>
                <span style={{ fontWeight: 600, color: "#0F172A" }}>
                  {room.propertyName || "Valli Grand Regency (G1)"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748B" }}>Room</span>
                <span style={{ fontWeight: 600, color: "#0F172A" }}>
                  {room.roomNumber} ({room.roomId || `#RM-${room.roomNumber}`})
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748B" }}>Stay Dates</span>
                <span style={{ fontWeight: 700, color: "#0F172A" }}>
                  {formatDisplayDate(booking.checkIn)} – {formatDisplayDate(booking.checkOut)} ({booking.nights || 3} Nights)
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748B" }}>Booking ID</span>
                <span style={{ fontFamily: "monospace", color: "#2563EB", fontWeight: 700 }}>
                  {booking.bookingFolio || booking.bookingId || "BK-001"}
                </span>
              </div>
            </div>
          </div>

          <p style={{ margin: 0, fontSize: 13, color: "#4B5563", lineHeight: 1.5 }}>
            After cancellation, this room will become available again for these
            dates. The customer will be unassigned and the room status will reset
            to <strong style={{ color: "#059669" }}>Available</strong>.
          </p>
        </div>

        {/* Footer */}
        <div className="pmv2-modal-footer">
          <div className="pmv2-modal-footer-right">
            <button
              type="button"
              className="pmv2-btn pmv2-btn-secondary"
              onClick={onClose}
            >
              Keep Booking
            </button>
            <button
              type="button"
              className="pmv2-btn pmv2-btn-danger"
              disabled={isCancelling}
              onClick={handleConfirm}
            >
              <XCircle size={16} />
              <span>{isCancelling ? "Cancelling..." : "Cancel Booking"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
