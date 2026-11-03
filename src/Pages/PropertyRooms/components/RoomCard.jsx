// src/Pages/PropertyRooms/components/RoomCard.jsx
import React, { useState } from "react";
import {
  BedDouble,
  DoorOpen,
  DoorClosed,
  Zap,
  Calendar,
  UserRound,
  Wrench,
  Eye,
  MoreVertical,
  Edit2,
  AlertTriangle,
} from "lucide-react";
import RoomStatusBadge from "./RoomStatusBadge";

export default function RoomCard({
  room,
  isDateFilterActive,
  isDateAvailable,
  unavailableReason,
  onQuickBook,
  onViewDetails,
  onEditRoom,
}) {
  const [showMenu, setShowMenu] = useState(false);

  const isAvailable = isDateFilterActive
    ? isDateAvailable
    : room.status === "AVAILABLE";

  const isMaintenance = room.status === "MAINTENANCE";
  const isOccupied = room.status === "OCCUPIED" || room.status === "DUE_OUT";
  const isBooked = room.status === "BOOKED";

  const renderIcon = () => {
    if (isMaintenance) {
      return (
        <div
          className="pr-room-icon-box"
          style={{ background: "#fef3c7", color: "#d97706" }}
        >
          <Wrench size={20} />
        </div>
      );
    }
    if (isAvailable) {
      return (
        <div className="pr-room-icon-box available">
          <BedDouble size={20} />
        </div>
      );
    }
    return (
      <div className="pr-room-icon-box occupied">
        <DoorClosed size={20} />
      </div>
    );
  };

  const cardClass = isDateFilterActive
    ? isAvailable
      ? "pr-room-card is-available-highlight"
      : "pr-room-card is-unavailable-muted"
    : "pr-room-card";

  return (
    <div className={cardClass}>
      {/* ── Card Top Row ── */}
      <div>
        <div className="pr-card-header">
          <div className="pr-card-header-left">
            {renderIcon()}
            <div>
              <div className="pr-room-title">{room.number}</div>
              <div className="pr-room-sub">
                {room.type} • {room.floor}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <RoomStatusBadge status={room.status} />

            <div style={{ position: "relative" }}>
              <button
                type="button"
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#94a3b8",
                  padding: 4,
                  cursor: "pointer",
                }}
                onClick={() => setShowMenu(!showMenu)}
              >
                <MoreVertical size={16} />
              </button>

              {showMenu && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
                    zIndex: 50,
                    minWidth: 120,
                    padding: "4px 0",
                  }}
                >
                  <button
                    type="button"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "none",
                      background: "transparent",
                      textAlign: "left",
                      fontSize: 12.5,
                      color: "#0f172a",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setShowMenu(false);
                      onEditRoom(room);
                    }}
                  >
                    <Edit2 size={13} color="#2563eb" />
                    <span>Edit Room</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Middle Details ── */}
        <div className="pr-card-middle">
          <div className="pr-room-id-row">
            <span>Property: {room.propertyName}</span>
            <span className="pr-room-id-code">#{room.id}</span>
          </div>

          {/* Maintenance Notice */}
          {isMaintenance && (
            <div
              style={{
                fontSize: 12.5,
                color: "#b45309",
                background: "#fef3c7",
                padding: "8px 10px",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Wrench size={14} />
              <span>This room is unavailable while under maintenance.</span>
            </div>
          )}

          {/* Unavailable Reason during Date Filter */}
          {isDateFilterActive && !isAvailable && !isMaintenance && (
            <div
              style={{
                fontSize: 12,
                color: "#991b1b",
                background: "#fee2e2",
                padding: "6px 10px",
                borderRadius: 6,
              }}
            >
              ⚠️ {unavailableReason || "Unavailable for selected dates"}
            </div>
          )}

          {/* Current Booking Info */}
          {room.currentBooking && !isMaintenance && (
            <>
              <div className="pr-guest-row">
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: "#64748b",
                  }}
                >
                  <UserRound size={14} />
                  Customer
                </span>
                <span className="pr-guest-name">
                  {room.currentBooking.customerName}
                </span>
              </div>

              <div className="pr-checkout-tag">
                <Calendar size={14} color="#64748b" />
                <span>
                  Stay: {room.currentBooking.checkIn} –{" "}
                  {room.currentBooking.checkOut}
                </span>
              </div>
            </>
          )}

          {/* Ready status text when available */}
          {isAvailable && !room.currentBooking && !isMaintenance && (
            <div style={{ fontSize: 12.5, color: "#15803d", fontWeight: 600 }}>
              Ready for a new booking.
            </div>
          )}
        </div>
      </div>

      {/* ── Actions Row (Standard 40px-44px Buttons) ── */}
      <div className="pr-card-actions">
        <button
          type="button"
          className="pr-btn pr-btn-secondary"
          onClick={() => onViewDetails(room)}
        >
          <Eye size={14} />
          <span>View Details</span>
        </button>

        {isAvailable && !isMaintenance ? (
          <button
            type="button"
            className="pr-btn pr-btn-primary"
            onClick={() => onQuickBook(room)}
          >
            <Zap size={14} />
            <span>Quick Book</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
