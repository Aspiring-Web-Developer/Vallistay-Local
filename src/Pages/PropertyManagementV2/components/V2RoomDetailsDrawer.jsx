// src/Pages/PropertyManagementV2/components/V2RoomDetailsDrawer.jsx
import React, { useState } from "react";
import {
  X,
  BedDouble,
  Building2,
  Calendar,
  Phone,
  Mail,
  MoreHorizontal,
  XCircle,
  Zap,
  CheckCircle2,
  Clock,
  ShieldCheck,
  UserCheck,
  LogOut,
  Wrench,
  Edit2,
  Check,
} from "lucide-react";
import V2StatusBadge from "./V2StatusBadge";
import { formatDisplayDate } from "../utils/dateUtils";
const localToday = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};
export default function V2RoomDetailsDrawer({
  isOpen,
  room,
  property,
  onClose,
  onOpenQuickBook,
  onOpenCancelBooking,
  onCheckInGuest,
  onCheckOutGuest,
  onToggleMaintenance,
  onUpdateDates,
  canCreate = true,
  canUpdate = true,
  canDelete = true,
}) {
  const [isEditingDates, setIsEditingDates] = useState(false);
  const [editCheckIn, setEditCheckIn] = useState("");
  const [editCheckOut, setEditCheckOut] = useState("");

  if (!isOpen || !room) return null;

  const booking = room.activeBooking;
  const isAvailable = room.status === "available";
  const isMaintenance = room.status === "maintenance";
  const isOccupied = room.status === "occupied";
  const isBooked = room.status === "booked";
const checkInOpen = booking
  ? String(booking.checkIn).slice(0, 10) <= localToday()
  : false;
  const handleStartEditDates = () => {
    if (booking) {
      setEditCheckIn(booking.checkIn);
      setEditCheckOut(booking.checkOut);
      setIsEditingDates(true);
    }
  };

  // const handleSaveDates = () => {
  //   if (onUpdateDates && editCheckIn && editCheckOut) {
  //     onUpdateDates(room.id, editCheckIn, editCheckOut);
  //   }
  //   setIsEditingDates(false);
  // };

    const handleSaveDates = async () => {
    if (!onUpdateDates || !editCheckIn || !editCheckOut) return;
    const ok = await onUpdateDates(room.id, editCheckIn, editCheckOut);
    if (ok !== false) setIsEditingDates(false);
  };
  return (
    <div className="pmv2-drawer-backdrop" onClick={onClose}>
      <div className="pmv2-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="pmv2-drawer-header">
          <div>
            <h3 className="pmv2-drawer-header-title">Room Details</h3>
            <div className="pmv2-drawer-header-sub">
              <Building2 size={13} style={{ color: "#2563EB" }} />
              <span>Property: {property?.name || room.propertyName}</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* <button
              type="button"
              className="pmv2-btn-icon"
              style={{ width: 32, height: 32 }}
            >
              <MoreHorizontal size={16} />
            </button> */}
            <button
              type="button"
              className="pmv2-btn-icon"
              style={{ width: 32, height: 32 }}
              onClick={onClose}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="pmv2-drawer-body">
          {/* Room Identity Card */}
          <div className="pmv2-drawer-identity-card">
            <div className="pmv2-drawer-identity-icon">
              <BedDouble size={22} />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 2,
                }}
              >
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#111827",
                  }}
                >
                  {room.roomNumber}
                </span>
                <V2StatusBadge status={room.status} />
              </div>
              <div style={{ fontSize: 13, color: "#6B7280" }}>
                {room.roomType} • {room.floor || "Floor 1"}
              </div>
            </div>
          </div>

          {/* Current Booking Section (if booked or occupied) */}
          {booking ? (
            <div className="pmv2-drawer-section">
              <div className="pmv2-drawer-section-header">
                <span className="pmv2-drawer-section-title">
                  <Calendar size={16} style={{ color: "#2563EB" }} />
                  Current Booking
                </span>
                <span className="pmv2-badge pmv2-badge-active">
                  <span className="pmv2-badge-dot" />
                  {isOccupied ? "CHECKED IN" : "CONFIRMED"}
                </span>
              </div>

              {/* Customer Information */}
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#6B7280",
                  textTransform: "uppercase",
                  marginBottom: 10,
                }}
              >
                GUEST INFORMATION
              </div>

              <div className="pmv2-drawer-guest-card">
                <div className="pmv2-drawer-avatar">
                  {booking.customer?.initials || "RC"}
                </div>
                <div>
                  <h5 className="pmv2-drawer-guest-name">
                    {booking.customer?.name}
                  </h5>
                  <span className="pmv2-drawer-guest-tag">PRIMARY GUEST</span>
                </div>
              </div>

              {/* Phone & Email */}
              <div className="pmv2-drawer-info-row">
                <Phone size={14} style={{ color: "#6B7280" }} />
                <span>{booking.customer?.phone || "+91 98563 28653"}</span>
              </div>
              <div className="pmv2-drawer-info-row">
                <Mail size={14} style={{ color: "#6B7280" }} />
                <span>{booking.customer?.email || "customer@example.com"}</span>
              </div>

              {/* Visual Stay Timeline or Editable Dates */}
              {!isEditingDates ? (
                <div
                  style={{
                    background: "#F9FAFB",
                    borderRadius: 8,
                    padding: "10px 12px",
                    margin: "12px 0",
                    border: "1px solid #F3F4F6",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#374151",
                    }}
                  >
                    <div>
                      <span style={{ color: "#6B7280", fontSize: 10 }}>CHECK-IN</span>
                      <div>{formatDisplayDate(booking.checkIn)}</div>
                    </div>
                    <div
                      style={{
                        height: 2,
                        flex: 1,
                        background: "#2563EB",
                        margin: "0 10px",
                        position: "relative",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          top: -14,
                          left: "50%",
                          transform: "translateX(-50%)",
                          fontSize: 9.5,
                          color: "#2563EB",
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {booking.nights} Nights
                      </span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ color: "#6B7280", fontSize: 10 }}>CHECK-OUT</span>
                      <div>{formatDisplayDate(booking.checkOut)}</div>
                    </div>
                  </div>
{canUpdate && (
                  <div style={{ textAlign: "right", marginTop: 8 }}>
                    <button
                      type="button"
                      style={{
                        background: "none",
                        border: "none",
                        color: "#2563EB",
                        fontSize: 11.5,
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                      onClick={handleStartEditDates}
                    >
                      <Edit2 size={12} /> Edit Dates
                    </button>
                  </div>
                      )}
                </div>
              ) : (
                <div
                  style={{
                    background: "#EFF6FF",
                    borderRadius: 8,
                    padding: "12px",
                    margin: "12px 0",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#1E40AF" }}>
                    EDIT STAY DATES
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div>
                      <span style={{ fontSize: 10, color: "#6B7280" }}>CHECK-IN</span>
                      <input
                        type="date"
                        className="pmv2-form-input"
                        style={{ height: 36, fontSize: 12 }}
                        value={editCheckIn}
                        onChange={(e) => setEditCheckIn(e.target.value)}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: 10, color: "#6B7280" }}>CHECK-OUT</span>
                      <input
                        type="date"
                        className="pmv2-form-input"
                        style={{ height: 36, fontSize: 12 }}
                        value={editCheckOut}
                        onChange={(e) => setEditCheckOut(e.target.value)}
                      />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", marginTop: 4 }}>
                    <button
                      type="button"
                      className="pmv2-btn pmv2-btn-secondary"
                      style={{ height: 30, fontSize: 11, padding: "0 8px" }}
                      onClick={() => setIsEditingDates(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="pmv2-btn pmv2-btn-primary"
                      style={{ height: 30, fontSize: 11, padding: "0 10px" }}
                      onClick={handleSaveDates}
                    >
                      <Check size={12} /> Save Dates
                    </button>
                  </div>
                </div>
              )}

              {/* Status Action Buttons: Check-In, Check-Out, Cancel */}
              <div className="pmv2-drawer-booking-actions" style={{ flexWrap: "wrap" }}>
                {/* Manual Check-In Button if not yet checked in */}
{canUpdate && !isOccupied && onCheckInGuest && (
  <button
    type="button"
    className="pmv2-btn pmv2-btn-primary"
    disabled={!checkInOpen}
    title={!checkInOpen ? `Check-in opens on ${formatDisplayDate(booking.checkIn)}` : ""}
    style={!checkInOpen ? { opacity: 0.4, cursor: "not-allowed" } : undefined}
    onClick={() => checkInOpen && onCheckInGuest(room.id)}
  >
    <UserCheck size={15} />
    <span>Check In Guest</span>
  </button>
)}

                {/* Manual Check-Out Button if occupied */}
                               {canUpdate && isOccupied && onCheckOutGuest && (
                  <button
                    type="button"
                    className="pmv2-btn pmv2-btn-primary"
                    onClick={() => onCheckOutGuest(room.id)}
                  >
                    <LogOut size={15} />
                    <span>Check Out (Set Available)</span>
                  </button>
                )}

                {/* Cancel Booking */}
                {canDelete && (
                  <button
                    type="button"
                    className="pmv2-btn pmv2-btn-danger-outline"
                    onClick={() => onOpenCancelBooking(room)}
                  >
                    <XCircle size={15} />
                    <span>Cancel Booking</span>
                  </button>
                )}
              </div>
            </div>
          ) : isAvailable ? (
            /* Available Section */
            <div className="pmv2-drawer-section">
              <div className="pmv2-drawer-section-header">
                <span className="pmv2-drawer-section-title">
                  <CheckCircle2 size={16} style={{ color: "#10B981" }} />
                  Room Available
                </span>
                <V2StatusBadge status="available" />
              </div>
              <p
                style={{
                  fontSize: 13.5,
                  color: "#4B5563",
                  margin: "0 0 16px",
                  lineHeight: 1.4,
                }}
              >
                This room is currently clean, inspected, and ready for a new
                guest reservation.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {canCreate && (
                  <button
                    type="button"
                    className="pmv2-btn pmv2-btn-primary"
                    style={{ width: "100%" }}
                    onClick={() => {
                      onClose();
                      onOpenQuickBook(room);
                    }}
                  >
                    <Zap size={16} fill="#FFFFFF" />
                    <span>Quick Book Room</span>
                  </button>
                )}

                {/* {onToggleMaintenance && (
                  <button
                    type="button"
                    className="pmv2-btn pmv2-btn-secondary"
                    style={{ width: "100%" }}
                    onClick={() => onToggleMaintenance(room.id, true)}
                  >
                    <Wrench size={15} />
                    <span>Set to Maintenance</span>
                  </button>
                )} */}
              </div>
            </div>
          ) : isMaintenance ? (
            /* Maintenance Section */
            <div className="pmv2-drawer-section">
              <div className="pmv2-drawer-section-header">
                <span className="pmv2-drawer-section-title">
                  <Clock size={16} style={{ color: "#D97706" }} />
                  Under Maintenance
                </span>
                <V2StatusBadge status="maintenance" />
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: "#6B7280",
                  margin: "0 0 14px",
                  lineHeight: 1.4,
                }}
              >
                This unit is currently withheld for scheduled servicing and
                cleaning.
              </p>
               {canUpdate && onToggleMaintenance && (
                <button
                  type="button"
                  className="pmv2-btn pmv2-btn-primary"
                  style={{ width: "100%" }}
                  onClick={() => onToggleMaintenance(room.id, false)}
                >
                  <CheckCircle2 size={16} />
                  <span>Return to Service (Make Available)</span>
                </button>
              )}
            </div>
          ) : null}

          {/* Room Specifications Table */}
          <div className="pmv2-drawer-section">
            <div className="pmv2-drawer-section-header">
              <span className="pmv2-drawer-section-title">
                ROOM SPECIFICATIONS
              </span>
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: "#059669",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <ShieldCheck size={13} />
                HARDWARE LINKED
              </span>
            </div>

            <div className="pmv2-drawer-specs-table">
              {/* <div className="pmv2-drawer-specs-row">
                <span className="pmv2-drawer-specs-key">Room ID</span>
                <span className="pmv2-drawer-specs-val" style={{ fontFamily: "monospace" }}>
                  {room.roomId || `#RM-${room.roomNumber}`}
                </span>
              </div> */}
              <div className="pmv2-drawer-specs-row">
                <span className="pmv2-drawer-specs-key">Room Number</span>
                <span className="pmv2-drawer-specs-val">{room.roomNumber}</span>
              </div>
              <div className="pmv2-drawer-specs-row">
                <span className="pmv2-drawer-specs-key">Price / Day</span>
                <span className="pmv2-drawer-specs-val">₹{room.pricePerDay || 2500}</span>
              </div>
              <div className="pmv2-drawer-specs-row">
                <span className="pmv2-drawer-specs-key">Max Adults</span>
                <span className="pmv2-drawer-specs-val">{room.maxAdults || 3}</span>
              </div>
              <div className="pmv2-drawer-specs-row">
                <span className="pmv2-drawer-specs-key">Max Children</span>
                <span className="pmv2-drawer-specs-val">{room.maxChildren || 2}</span>
              </div>
              <div className="pmv2-drawer-specs-row">
                <span className="pmv2-drawer-specs-key">Property</span>
                <span className="pmv2-drawer-specs-val">
                  {property?.name || room.propertyName}
                </span>
              </div>
              <div className="pmv2-drawer-specs-row">
                <span className="pmv2-drawer-specs-key">Current Status</span>
                <span
                  className="pmv2-drawer-specs-val"
                  style={{ textTransform: "uppercase", color: "#2563EB" }}
                >
                  {room.status}
                </span>
              </div>
              <div className="pmv2-drawer-specs-row">
                <span className="pmv2-drawer-specs-key">System Audit</span>
                <span
                  className="pmv2-drawer-specs-val"
                  style={{ fontSize: 11.5, color: "#6B7280" }}
                >
                  Created {room.createdAt || "12 Jan 2026"} • Updated{" "}
                  {room.updatedAt || "Just now"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="pmv2-drawer-footer">
          <button
            type="button"
            className="pmv2-btn pmv2-btn-secondary"
            style={{ width: "100%" }}
            onClick={onClose}
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
}
