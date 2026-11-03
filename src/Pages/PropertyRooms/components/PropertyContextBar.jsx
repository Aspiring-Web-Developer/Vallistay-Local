// src/Pages/PropertyRooms/components/PropertyContextBar.jsx
import React from "react";
import {
  Building2,
  MapPin,
  DoorClosed,
  CheckCircle2,
  UserRound,
  BedDouble,
  Sparkles,
  Wrench,
} from "lucide-react";

export default function PropertyContextBar({ property, rooms = [] }) {
  if (!property) return null;

  // Compute live stats from rooms
  const totalRooms = rooms.length > 0 ? rooms.length : property.totalUnits || 48;
  const availableCount = rooms.filter((r) => r.status === "AVAILABLE").length;
  const occupiedCount = rooms.filter((r) => r.status === "OCCUPIED").length;
  const reservedCount = rooms.filter((r) => r.status === "RESERVED" || r.status === "DUE_OUT").length;

  return (
    <>
      {/* ── Main Property Summary Card ── */}
      <div className="pr-property-card">
        <div className="pr-prop-left">
          <div className="pr-prop-icon-box">
            <Building2 size={26} strokeWidth={1.8} />
          </div>
          <div>
            <div className="pr-prop-name">
              <span>{property.name}</span>
              {property.liveSync && (
                <span className="pr-badge-live">
                  <span className="pr-live-dot" />
                  LIVE SYNC
                </span>
              )}
            </div>
            <div className="pr-prop-location">
              <MapPin size={14} color="#64748b" />
              <span>{property.location}</span>
            </div>
          </div>
        </div>

        <div className="pr-prop-metrics">
          <div className="pr-metric-col">
            <span className="pr-metric-col-label">INVENTORY</span>
            <span className="pr-metric-col-val">{totalRooms} Total Units</span>
          </div>

          <div className="pr-metric-col">
            <span className="pr-metric-col-label">VACANT</span>
            <span className="pr-metric-col-val" style={{ color: "#16a34a" }}>
              {availableCount} Ready
            </span>
          </div>

          <div className="pr-metric-col">
            <span className="pr-metric-col-label">OCCUPIED</span>
            <span className="pr-metric-col-val" style={{ color: "#2563eb" }}>
              {occupiedCount} Active
            </span>
          </div>

          <div className="pr-metric-col">
            <span className="pr-metric-col-label">RESERVED</span>
            <span className="pr-metric-col-val" style={{ color: "#d97706" }}>
              {reservedCount} Blocked
            </span>
          </div>
        </div>
      </div>

      {/* ── 6 Stat Metric Cards ── */}
      <div className="pr-stats-grid">
        {/* Total Rooms */}
        <div className="pr-stat-card">
          <div className="pr-stat-info">
            <span className="pr-stat-label">TOTAL ROOMS</span>
            <span className="pr-stat-num">{totalRooms}</span>
          </div>
          <div className="pr-stat-icon-wrap" style={{ background: "#f1f5f9", color: "#475569" }}>
            <DoorClosed size={20} />
          </div>
        </div>

        {/* Available */}
        <div className="pr-stat-card">
          <div className="pr-stat-info">
            <span className="pr-stat-label">AVAILABLE</span>
            <span className="pr-stat-num" style={{ color: "#16a34a" }}>
              {availableCount}
            </span>
          </div>
          <div className="pr-stat-icon-wrap" style={{ background: "#dcfce7", color: "#16a34a" }}>
            <CheckCircle2 size={20} />
          </div>
        </div>

        {/* Occupied */}
        <div className="pr-stat-card">
          <div className="pr-stat-info">
            <span className="pr-stat-label">OCCUPIED</span>
            <span className="pr-stat-num" style={{ color: "#2563eb" }}>
              {occupiedCount}
            </span>
          </div>
          <div className="pr-stat-icon-wrap" style={{ background: "#eff6ff", color: "#2563eb" }}>
            <UserRound size={20} />
          </div>
        </div>

        {/* Reserved */}
        <div className="pr-stat-card">
          <div className="pr-stat-info">
            <span className="pr-stat-label">RESERVED</span>
            <span className="pr-stat-num" style={{ color: "#d97706" }}>
              {reservedCount}
            </span>
          </div>
          <div className="pr-stat-icon-wrap" style={{ background: "#fef3c7", color: "#d97706" }}>
            <BedDouble size={20} />
          </div>
        </div>

        {/* Housekeeping */}
        <div className="pr-stat-card">
          <div className="pr-stat-info">
            <span className="pr-stat-label">HOUSEKEEPING</span>
            <span className="pr-stat-num" style={{ color: "#7e22ce" }}>
              {property.housekeeping ?? 2}
            </span>
          </div>
          <div className="pr-stat-icon-wrap" style={{ background: "#f3e8ff", color: "#7e22ce" }}>
            <Sparkles size={20} />
          </div>
        </div>

        {/* Maintenance */}
        <div className="pr-stat-card">
          <div className="pr-stat-info">
            <span className="pr-stat-label">MAINTENANCE</span>
            <span className="pr-stat-num" style={{ color: "#64748b" }}>
              {property.maintenance ?? 0}
            </span>
          </div>
          <div className="pr-stat-icon-wrap" style={{ background: "#f1f5f9", color: "#64748b" }}>
            <Wrench size={20} />
          </div>
        </div>
      </div>
    </>
  );
}
