// src/Pages/PropertyManagementV2/components/V2DeleteRoomModal.jsx
import React, { useState, useEffect } from "react";
import { AlertTriangle, X, CalendarDays } from "lucide-react";
import { formatDisplayDate } from "../utils/dateUtils";

export default function V2DeleteRoomModal({
  isOpen,
  room,
  onClose,
  onConfirm,
}) {
  const [deleting, setDeleting] = useState(false);
  const [checked, setChecked] = useState(false);

  // reset the checkbox every time the modal opens or the room changes
  useEffect(() => {
    setChecked(false);
    setDeleting(false);
  }, [isOpen, room?.id]);

  if (!isOpen || !room) return null;

  // room.bookings = every live booking (checked-in + upcoming), any date
  const liveBookings = (
    room.bookings && room.bookings.length
      ? room.bookings
      : room.activeBooking
      ? [room.activeBooking]
      : []
  )
    .slice()
    .sort((a, b) => (a.checkIn || "").localeCompare(b.checkIn || ""));

  const hasActiveBooking = liveBookings.length > 0;
  const shown = liveBookings.slice(0, 3);
  const extra = liveBookings.length - shown.length;

  const handleConfirm = async () => {
    if (hasActiveBooking || deleting || !checked) return;
    setDeleting(true);
    try {
      await onConfirm(room.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="pmv2-modal-backdrop" onClick={deleting ? undefined : onClose}>
      <div className="pmv2-modal sm" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="pmv2-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "#FEE2E2",
                color: "#DC2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="pmv2-modal-title">
                {hasActiveBooking ? "Can't delete this room" : "Delete this room?"}
              </h3>
              <p className="pmv2-modal-subtitle">
                {room.roomNumber} ({room.roomType})
              </p>
            </div>
          </div>
          <button
            type="button"
            className="pmv2-btn-icon"
            onClick={onClose}
            disabled={deleting}
            style={{ width: 34, height: 34 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="pmv2-modal-body">
          {hasActiveBooking ? (
            <div
              style={{
                background: "#FEF2F2",
                border: "1px solid #FECDD3",
                borderRadius: 8,
                padding: "12px 14px",
                fontSize: 13,
                color: "#991B1B",
                lineHeight: 1.5,
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 8 }}>
                ⚠️ Room <strong>{room.roomNumber}</strong> has{" "}
                {liveBookings.length === 1
                  ? "a booking"
                  : `${liveBookings.length} bookings`}
                . Cancel {liveBookings.length === 1 ? "it" : "them"} before deleting
                this room.
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {shown.map((b, i) => (
                  <div
                    key={b.roomBookingId || b.bookingId || i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 12.5,
                      fontWeight: 500,
                    }}
                  >
                    <CalendarDays size={13} style={{ flexShrink: 0 }} />
                    <span>
                      {b.customer?.name || "Guest"} · {formatDisplayDate(b.checkIn)} →{" "}
                      {formatDisplayDate(b.checkOut)}
                    </span>
                  </div>
                ))}
                {extra > 0 && (
                  <div style={{ fontSize: 12, fontWeight: 600 }}>
                    + {extra} more booking{extra > 1 ? "s" : ""}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <p style={{ margin: 0, fontSize: 14, color: "#4B5563", lineHeight: 1.5 }}>
                Are you sure you want to delete room{" "}
                <strong style={{ color: "#111827" }}>{room.roomNumber}</strong>?
              </p>

              <div
                style={{
                  background: "#FEF2F2",
                  border: "1px solid #FECDD3",
                  borderRadius: 8,
                  padding: "12px 14px",
                  fontSize: 13,
                  color: "#991B1B",
                  lineHeight: 1.5,
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 8 }}>
                  ⚠️ Please double-check: has anyone booked this room, now or in the
                  future?
                </div>
                <label
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                    cursor: "pointer",
                    fontSize: 12.5,
                    fontWeight: 500,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => setChecked(e.target.checked)}
                    style={{ marginTop: 2, accentColor: "#DC2626" }}
                  />
                  <span>I've checked, no one has booked this room.</span>
                </label>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="pmv2-modal-footer">
          <div className="pmv2-modal-footer-right">
            <button
              type="button"
              className="pmv2-btn pmv2-btn-secondary"
              onClick={onClose}
              disabled={deleting}
            >
              {hasActiveBooking ? "Close" : "Cancel"}
            </button>
            {!hasActiveBooking && (
              <button
                type="button"
                className="pmv2-btn pmv2-btn-danger"
                disabled={deleting || !checked}
                onClick={handleConfirm}
              >
                {deleting ? "Deleting..." : "Delete Room"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}