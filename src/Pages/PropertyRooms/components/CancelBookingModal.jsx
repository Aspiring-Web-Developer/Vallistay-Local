// src/Pages/PropertyRooms/components/CancelBookingModal.jsx
import React, { useState } from "react";
import {
  CalendarX,
  X,
  CircleSlash,
  AlertTriangle,
  Loader2,
} from "lucide-react";

export default function CancelBookingModal({
  isOpen,
  onClose,
  room,
  property,
  onConfirmCancel,
}) {
  if (!isOpen || !room) return null;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const booking = room.currentBooking || {};
  const folio = booking.folio || booking.bookingId || "BK-001";

  const handleCancelClick = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onConfirmCancel(room);
      onClose();
    }, 600);
  };

  return (
    <div className="pr-modal-backdrop" onClick={onClose} style={{ zIndex: 10001 }}>
      <div
        className="pr-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 460 }}
      >
        {/* ── Modal Header with Red Calendar Icon ── */}
        <div
          style={{
            padding: "24px 24px 16px",
            display: "flex",
            alignItems: "flex-start",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "#fee2e2",
              color: "#dc2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <CalendarX size={22} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 19, fontWeight: 700, color: "#0f172a" }}>
              Cancel this booking?
            </div>
            <div style={{ fontSize: 13, color: "#64748b" }}>
              Booking Folio: <strong>{folio}</strong>
            </div>
          </div>

          <button className="pr-modal-close" onClick={onClose} disabled={isSubmitting}>
            <X size={18} />
          </button>
        </div>

        {/* ── Modal Content ── */}
        <div style={{ padding: "0 24px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Booking Summary Box (matching stitch screenshot 2) */}
          <div className="pr-cancel-summary-box">
            <div className="pr-cancel-summary-top">
              <span>BOOKING SUMMARY</span>
              <span className="pr-cancel-badge">CONFIRMED CANCELLATION</span>
            </div>

            <div className="pr-cancel-row">
              <span className="pr-cancel-label">Customer</span>
              <span className="pr-cancel-val">
                {booking.customerName || "Ram C"} ({booking.phone || "+91 98563 28653"})
              </span>
            </div>

            <div className="pr-cancel-row">
              <span className="pr-cancel-label">Property</span>
              <span className="pr-cancel-val">
                {property?.name || room.propertyName}
              </span>
            </div>

            <div className="pr-cancel-row">
              <span className="pr-cancel-label">Room</span>
              <span className="pr-cancel-val">
                {room.number} (#{room.id})
              </span>
            </div>

            <div className="pr-cancel-row">
              <span className="pr-cancel-label">Stay Dates</span>
              <span className="pr-cancel-val">
                {booking.checkIn || "05 Oct 2026"} – {booking.checkOut || "08 Oct 2026"} (
                {booking.nights || 3} Nights)
              </span>
            </div>

            <div className="pr-cancel-row">
              <span className="pr-cancel-label">Booking ID</span>
              <span className="pr-cancel-val" style={{ color: "#2563eb" }}>
                {folio}
              </span>
            </div>
          </div>

          {/* Explanation Text */}
          <p
            style={{
              fontSize: 12.5,
              color: "#475569",
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            After cancellation, this room will become available again for these dates.
            The customer will be unassigned and the room status will reset to{" "}
            <strong style={{ color: "#16a34a" }}>Available</strong>.
          </p>
        </div>

        {/* ── Footer ── */}
        <div className="pr-modal-footer">
          <button
            type="button"
            className="pr-btn pr-btn-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Keep Booking
          </button>
          <button
            type="button"
            className="pr-btn pr-btn-danger"
            onClick={handleCancelClick}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="pr-spin" />
                <span>Cancelling booking...</span>
              </>
            ) : (
              <>
                <CircleSlash size={16} />
                <span>Cancel Booking</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
