// src/Pages/PropertyRooms/components/RoomDetailsDrawer.jsx
import React from "react";
import {
  BedDouble,
  X,
  Building2,
  Calendar,
  Phone,
  Mail,
  CircleSlash,
  Zap,
  CheckCircle2,
  Cpu,
  Edit2,
  ArrowRight,
  Clock,
} from "lucide-react";
import RoomStatusBadge from "./RoomStatusBadge";

export default function RoomDetailsDrawer({
  isOpen,
  onClose,
  room,
  property,
  onOpenCancelModal,
  onQuickBookFromDrawer,
  onEditRoomFromDrawer,
}) {
  if (!isOpen || !room) return null;

  const isBookedOrOccupied =
    Boolean(room.currentBooking) ||
    room.status === "OCCUPIED" ||
    room.status === "BOOKED" ||
    room.status === "DUE_OUT";

  const booking = room.currentBooking;

  return (
    <div className="pr-drawer-backdrop" onClick={onClose}>
      <div className="pr-drawer" onClick={(e) => e.stopPropagation()}>
        {/* ── Header ── */}
        <div className="pr-drawer-header">
          <div>
            <div
              style={{
                fontSize: 12,
                color: "#64748b",
                display: "flex",
                alignItems: "center",
                gap: 5,
                marginBottom: 2,
              }}
            >
              <Building2 size={13} color="#2563eb" />
              Property: {property?.name || room.propertyName}
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>
              Room Details
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              className="pr-btn-icon-only"
              style={{ width: 34, height: 34 }}
              title="Edit Room"
              onClick={() => onEditRoomFromDrawer(room)}
            >
              <Edit2 size={15} color="#2563eb" />
            </button>
            <button
              onClick={onClose}
              className="pr-btn-icon-only"
              style={{ width: 34, height: 34 }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="pr-drawer-body">
          {/* Room Hero Box */}
          <div className="pr-room-hero">
            <div className="pr-hero-icon-box">
              <BedDouble size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 2,
                }}
              >
                <span style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
                  {room.number}
                </span>
                <RoomStatusBadge status={room.status} />
              </div>
              <div style={{ fontSize: 13, color: "#475569" }}>
                {room.type} • {room.floor}
              </div>
            </div>
          </div>

          {/* Current Booking Section (if occupied/booked) */}
          {isBookedOrOccupied && booking ? (
            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: 16,
                background: "#ffffff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                  paddingBottom: 10,
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  <Calendar size={16} color="#2563eb" />
                  Current Booking
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    background: "#dcfce7",
                    color: "#15803d",
                    padding: "3px 8px",
                    borderRadius: 9999,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: "#16a34a",
                    }}
                  />
                  CONFIRMED
                </span>
              </div>

              {/* Stay Timeline Summary (Check-in → Current Stay → Check-out) */}
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #f1f5f9",
                  borderRadius: 10,
                  padding: "10px 12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 11.5,
                  fontWeight: 600,
                  marginBottom: 14,
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ color: "#64748b" }}>Check-in</div>
                  <div style={{ color: "#0f172a", fontWeight: 700 }}>
                    {booking.checkIn}
                  </div>
                </div>
                <ArrowRight size={14} color="#94a3b8" />
                <div style={{ textAlign: "center", color: "#2563eb" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <Clock size={12} />
                    <span>Current Stay</span>
                  </div>
                  <div style={{ fontSize: 11 }}>{booking.nights || 3} Nights</div>
                </div>
                <ArrowRight size={14} color="#94a3b8" />
                <div style={{ textAlign: "center" }}>
                  <div style={{ color: "#64748b" }}>Check-out</div>
                  <div style={{ color: "#0f172a", fontWeight: 700 }}>
                    {booking.checkOut}
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div style={{ marginBottom: 14 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: 8,
                  }}
                >
                  CUSTOMER INFORMATION
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "#2563eb",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 14,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {booking.customerName
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase() || "RC"}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                      {booking.customerName}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#2563eb",
                        fontWeight: 700,
                        textTransform: "uppercase",
                      }}
                    >
                      PRIMARY GUEST
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 10,
                    display: "flex",
                    flexDirection: "column",
                    gap: 5,
                    fontSize: 12.5,
                    color: "#475569",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Phone size={13} color="#64748b" />
                    <span>{booking.phone || "+91 98563 28653"}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Mail size={13} color="#64748b" />
                    <span>{booking.email || "customer@example.com"}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#64748b" }}>Folio ID:</span>
                    <strong style={{ color: "#2563eb" }}>
                      {booking.folio || booking.bookingId || "BK-001"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons inside Drawer */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  paddingTop: 12,
                  borderTop: "1px solid #f1f5f9",
                }}
              >
                <button
                  type="button"
                  className="pr-btn pr-btn-secondary"
                  onClick={() => onEditRoomFromDrawer(room)}
                >
                  <Edit2 size={14} color="#2563eb" />
                  <span>Edit Room</span>
                </button>

                <button
                  type="button"
                  className="pr-btn pr-btn-danger-soft"
                  onClick={() => onOpenCancelModal(room)}
                >
                  <CircleSlash size={14} />
                  <span>Cancel Booking</span>
                </button>
              </div>
            </div>
          ) : (
            /* Available State in Drawer */
            <div
              style={{
                border: "1px dashed #86efac",
                background: "#f0fdf4",
                borderRadius: 12,
                padding: 20,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "#dcfce7",
                  color: "#16a34a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 10px",
                }}
              >
                <CheckCircle2 size={24} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#14532d", marginBottom: 4 }}>
                Room Available
              </div>
              <div style={{ fontSize: 13, color: "#15803d", marginBottom: 16 }}>
                This room is currently available for booking.
              </div>
              <button
                type="button"
                className="pr-btn pr-btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={() => {
                  onClose();
                  onQuickBookFromDrawer(room);
                }}
              >
                <Zap size={15} />
                <span>Quick Book This Room</span>
              </button>
            </div>
          )}

          {/* ROOM SPECIFICATIONS section */}
          <div className="pr-spec-card">
            <div className="pr-spec-header">
              <span>ROOM SPECIFICATIONS</span>
              <span
                style={{
                  color: "#16a34a",
                  fontWeight: 700,
                  fontSize: 10.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Cpu size={12} />
                HARDWARE LINKED
              </span>
            </div>

            <div className="pr-spec-row">
              <span className="pr-spec-label">Room ID</span>
              <span className="pr-spec-val">#{room.id}</span>
            </div>

            <div className="pr-spec-row">
              <span className="pr-spec-label">Room Number</span>
              <span className="pr-spec-val">{room.number}</span>
            </div>

            <div className="pr-spec-row">
              <span className="pr-spec-label">Property</span>
              <span className="pr-spec-val">{property?.name || room.propertyName}</span>
            </div>

            <div className="pr-spec-row">
              <span className="pr-spec-label">Floor / Wing</span>
              <span className="pr-spec-val">
                {room.floor} • {room.wing || "Main Wing"}
              </span>
            </div>

            <div className="pr-spec-row">
              <span className="pr-spec-label">Current Status</span>
              <span
                className="pr-spec-val"
                style={{
                  color:
                    room.status === "AVAILABLE"
                      ? "#16a34a"
                      : room.status === "BOOKED"
                      ? "#1d4ed8"
                      : room.status === "OCCUPIED"
                      ? "#2563eb"
                      : "#d97706",
                }}
              >
                {room.status}
              </span>
            </div>

            <div className="pr-spec-row">
              <span className="pr-spec-label">System Audit</span>
              <span
                className="pr-spec-val"
                style={{ fontSize: 11.5, color: "#64748b", fontFamily: "ui-monospace, monospace" }}
              >
                {room.systemAudit || "Created 12 Jan 2026 • Ready"}
              </span>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="pr-drawer-footer">
          <button
            type="button"
            className="pr-btn pr-btn-secondary"
            style={{ width: "100%", justifyContent: "center" }}
            onClick={onClose}
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
}
