// src/Pages/PropertyManagementV2/components/V2RoomCard.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  DoorOpen,
  DoorClosed,
  Wrench,
  Zap,
  Eye,
  Calendar,
  User,
  MoreVertical,
  Edit2,
  Trash2,
  Star,
} from "lucide-react";
import V2StatusBadge from "./V2StatusBadge";
import { formatDisplayDate } from "../utils/dateUtils";

export default function V2RoomCard({
  room,
  isFilterApplied,
  onQuickBook,
  onViewDetails,
  onEditRoom,
  onDeleteRoom,
  canCreate = true,
  canUpdate = true,
  canDelete = true,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAvailable = isFilterApplied
    ? room.isAvailableForDates !== false
    : room.status === "available";

  const isMaintenance = room.status === "maintenance";
  const isOccupied = room.status === "occupied";
  const isBooked = room.status === "booked" || room.status === "due_out";

  // Card highlight / muted classes
  let cardClass = "pmv2-room-card";
  if (isFilterApplied) {
    if (isAvailable) {
      cardClass += " highlight-available";
    } else {
      cardClass += " muted-unavailable";
    }
  }

  // Icon
  const getIcon = () => {
    if (isMaintenance) return <Wrench size={20} />;
    if (room.status === "available") return <DoorOpen size={20} />;
    return <DoorClosed size={20} />;
  };

  const getIconClass = () => {
    if (isMaintenance) return "maintenance";
    if (room.status === "available") return "available";
    if (room.status === "due_out") return "due_out";
    return "occupied";
  };

  return (
    <div className={cardClass}>
      {/* Featured Banner */}
      {room.isFeatured && (
        <div className="pmv2-room-card-featured-badge">
          <Star size={11} fill="#FFFFFF" />
          <span>Featured Unit</span>
        </div>
      )}

      {/* Top Header */}
      <div className="pmv2-room-card-top">
        <div className="pmv2-room-card-title-group">
          <div className={`pmv2-room-card-icon ${getIconClass()}`}>
            {getIcon()}
          </div>
          <div>
            <h4 className="pmv2-room-card-name">
              {room.roomName || `Room ${room.roomNumber}`}
            </h4>
            {/* <div className="pmv2-room-card-subtitle">
              {room.roomType} • {room.floor || "Floor 1"}
            </div> */}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <V2StatusBadge status={room.status} />

          {/* More menu */}
          <div style={{ position: "relative" }} ref={menuRef}>
            <button
              type="button"
              className="pmv2-btn-icon"
              style={{ width: 28, height: 28 }}
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <MoreVertical size={15} />
            </button>

            {menuOpen && (
              <div
                className="pmv2-dropdown-menu"
                style={{ right: 0, left: "auto", minWidth: 150 }}
              >
                <div
                  className="pmv2-dropdown-item"
                  onClick={() => {
                    setMenuOpen(false);
                    onViewDetails(room);
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Eye size={14} /> View Details
                  </span>
                </div>
                   {canUpdate && (
                  <div
                    className="pmv2-dropdown-item"
                    onClick={() => {
                      setMenuOpen(false);
                      onEditRoom && onEditRoom(room);
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Edit2 size={14} /> Edit Room
                    </span>
                  </div>
                )}
                {canDelete && (
                  <div
                    className="pmv2-dropdown-item"
                    style={{ color: "#EF4444" }}
                    onClick={() => {
                      setMenuOpen(false);
                      onDeleteRoom && onDeleteRoom(room);
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Trash2 size={14} /> Delete Room
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Middle Content */}
      <div className="pmv2-room-card-middle">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* <span className="pmv2-room-id-badge"># Room ID {room.roomId || `#RM-${room.roomNumber}`}</span> */}
        </div>

        {/* If Active Booking Exists */}
        {room.activeBooking ? (
          <div className="pmv2-room-customer-info">
            <div className="pmv2-room-customer-row">
              <User size={13} style={{ color: "#2563EB" }} />
              <span>Guest: {room.activeBooking.customer?.name}</span>
            </div>
            <div className="pmv2-room-checkout-row">
              <Calendar size={12} style={{ color: "#6B7280" }} />
              <span>
                {room.checkoutNote || `Checkout: ${formatDisplayDate(room.activeBooking.checkOut)}`}
              </span>
            </div>
          </div>
        ) : 
        (
          <div className="pmv2-room-features">
            {room.features && room.features.map((feat, idx) => (
              <React.Fragment key={idx}>
                <span>{feat}</span>
                {idx < room.features.length - 1 && (
                  <span className="pmv2-room-feature-dot" />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Unavailable reason notice when filter applied */}
        {isFilterApplied && !isAvailable && room.unavailableReason && (
          <div
            style={{
              fontSize: 11.5,
              color: "#DC2626",
              fontWeight: 600,
              background: "#FEF2F2",
              padding: "4px 8px",
              borderRadius: 6,
            }}
          >
            {room.unavailableReason}
          </div>
        )}
      </div>

      {/* Footer Buttons */}
         {/* Footer Buttons */}
      <div className="pmv2-room-card-footer">
        <button
          type="button"
          className="pmv2-btn pmv2-btn-outline"
          onClick={() => onViewDetails(room)}
        >
          <span>View Details</span>
        </button>

        {isAvailable && !isMaintenance && canCreate && (
          <button
            type="button"
            className="pmv2-btn pmv2-btn-primary"
            onClick={() => onQuickBook(room)}
          >
            <Zap size={14} fill="#FFFFFF" />
            <span>Quick Book</span>
          </button>
        )}
      </div>
    </div>
  );
}
