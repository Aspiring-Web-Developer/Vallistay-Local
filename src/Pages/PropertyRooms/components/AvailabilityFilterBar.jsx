// src/Pages/PropertyRooms/components/AvailabilityFilterBar.jsx
// Premium custom date range availability filter with empty initial state

import React, { useState } from "react";
import {
  CalendarDays,
  Search,
  X,
  AlertCircle,
  Filter,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { calculateNights } from "../data/mockRoomBookingData";

export default function AvailabilityFilterBar({
  filterDates,
  onApplyDateFilter,
  onClearDateFilter,
  selectedStatus,
  setSelectedStatus,
  statusCounts = {},
  availableCount = 0,
}) {
  // Check-in and check-out MUST start empty as strictly requested
  const [checkIn, setCheckIn] = useState(filterDates?.checkIn || "");
  const [checkOut, setCheckOut] = useState(filterDates?.checkOut || "");
  const [validationError, setValidationError] = useState("");

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "";
    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return d.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const handleSearch = () => {
    setValidationError("");
    if (!checkIn || !checkOut) {
      setValidationError("Select both check-in and check-out dates.");
      return;
    }
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    if (d2 < d1) {
      setValidationError("Check-out must be after check-in.");
      return;
    }
    if (d2.getTime() === d1.getTime()) {
      setValidationError("Select at least one night.");
      return;
    }
    onApplyDateFilter(checkIn, checkOut);
  };

  const handleClear = () => {
    setCheckIn("");
    setCheckOut("");
    setValidationError("");
    onClearDateFilter();
  };

  const applyPreset = (inDate, outDate) => {
    setCheckIn(inDate);
    setCheckOut(outDate);
    setValidationError("");
    onApplyDateFilter(inDate, outDate);
  };

  const isFilterActive = Boolean(filterDates?.checkIn && filterDates?.checkOut);
  const isSearchDisabled = !checkIn || !checkOut;
  const isClearDisabled = !checkIn && !checkOut && !isFilterActive;

  return (
    <div className="pr-avail-filter-container">
      {/* ── Title & Subtitle ── */}
      <h3 className="pr-filter-title">Check Room Availability</h3>
      <p className="pr-filter-sub">
        Choose a check-in and check-out date to find rooms available for that stay.
      </p>

      {/* ── Date Inputs Row (Desktop side-by-side, mobile stacked) ── */}
      <div className="pr-date-controls-row">
        {/* Check-in custom control */}
        <div className="pr-date-input-field">
          <label className="pr-date-label">Check-in</label>
          <div className={`pr-date-click-box ${checkIn ? "active" : ""}`}>
            <CalendarDays size={18} color="#2563eb" />
            {checkIn ? (
              <span className="pr-date-val-text">{formatDateDisplay(checkIn)}</span>
            ) : (
              <span className="pr-date-placeholder">Select check-in date</span>
            )}
            <input
              type="date"
              className="pr-native-date-input"
              value={checkIn}
              onChange={(e) => {
                setCheckIn(e.target.value);
                setValidationError("");
              }}
            />
          </div>
        </div>

        {/* Check-out custom control */}
        <div className="pr-date-input-field">
          <label className="pr-date-label">Check-out</label>
          <div className={`pr-date-click-box ${checkOut ? "active" : ""}`}>
            <CalendarDays size={18} color="#2563eb" />
            {checkOut ? (
              <span className="pr-date-val-text">{formatDateDisplay(checkOut)}</span>
            ) : (
              <span className="pr-date-placeholder">Select check-out date</span>
            )}
            <input
              type="date"
              className="pr-native-date-input"
              min={checkIn || undefined}
              value={checkOut}
              onChange={(e) => {
                setCheckOut(e.target.value);
                setValidationError("");
              }}
            />
          </div>
        </div>

        {/* Action Buttons (Strict standard 40px-44px high) */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            className="pr-btn pr-btn-primary"
            onClick={handleSearch}
            disabled={isSearchDisabled}
          >
            <Search size={15} />
            <span>Search Availability</span>
          </button>

          <button
            type="button"
            className="pr-btn pr-btn-secondary"
            onClick={handleClear}
            disabled={isClearDisabled}
          >
            <RotateCcw size={14} />
            <span>Clear Dates</span>
          </button>
        </div>
      </div>

      {/* ── Validation Error Notice ── */}
      {validationError && (
        <div className="pr-validation-error" style={{ marginTop: 12 }}>
          <AlertCircle size={16} />
          <span>{validationError}</span>
        </div>
      )}

      {/* ── Active Date Range Result Strip ── */}
      {isFilterActive && (
        <div
          style={{
            marginTop: 14,
            paddingTop: 12,
            borderTop: "1px dashed #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div className="pr-date-alert-pill">
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#16a34a",
              }}
            />
            <span>
              Availability for {formatDateDisplay(filterDates.checkIn)} –{" "}
              {formatDateDisplay(filterDates.checkOut)} ({calculateNights(filterDates.checkIn, filterDates.checkOut)} Nights)
            </span>
            <span
              style={{
                marginLeft: 6,
                fontWeight: 700,
                background: "#ffffff",
                padding: "2px 8px",
                borderRadius: 9999,
                fontSize: 11.5,
              }}
            >
              {availableCount} Available
            </span>
          </div>

          {/* Quick presets */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>
              Try:
            </span>
            <button
              type="button"
              className="pr-preset-btn"
              onClick={() => applyPreset("2026-10-05", "2026-10-08")}
            >
              05 Oct – 08 Oct
            </button>
            <button
              type="button"
              className="pr-preset-btn"
              onClick={() => applyPreset("2026-10-09", "2026-10-12")}
            >
              09 Oct – 12 Oct
            </button>
          </div>
        </div>
      )}

      {/* ── Status Chip Filters (All / Available / Unavailable / Occupied / Maintenance) ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginTop: 14,
          flexWrap: "wrap",
        }}
      >
        {[
          { id: "ALL", label: "All Rooms", count: statusCounts.all },
          { id: "AVAILABLE", label: "Available", count: statusCounts.available },
          { id: "UNAVAILABLE", label: "Unavailable", count: statusCounts.unavailable },
          { id: "OCCUPIED", label: "Occupied", count: statusCounts.occupied },
          { id: "MAINTENANCE", label: "Maintenance", count: statusCounts.maintenance },
        ].map((tab) => {
          const isActive = selectedStatus === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedStatus(tab.id)}
              style={{
                padding: "6px 12px",
                borderRadius: 9999,
                fontSize: 12.5,
                fontWeight: 600,
                border: `1px solid ${isActive ? "#0f172a" : "#e2e8f0"}`,
                background: isActive ? "#0f172a" : "#ffffff",
                color: isActive ? "#ffffff" : "#475569",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {tab.label} {tab.count !== undefined && `(${tab.count})`}
            </button>
          );
        })}
      </div>
    </div>
  );
}
