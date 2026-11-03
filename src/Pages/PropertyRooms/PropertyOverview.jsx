// src/Pages/PropertyRooms/PropertyOverview.jsx
// Phase 1: Room & Bookings Property Overview

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Plus,
  RefreshCw,
  Search,
  LayoutGrid,
  List,
  MapPin,
  MoreHorizontal,
  DoorClosed,
  CheckCircle2,
  CalendarCheck2,
  Hotel,
} from "lucide-react";
import { useRoomToast } from "./components/useRoomToast";
import "./styles/roomBookingsOverview.css";

// Static local UI state for Phase 1
const PHASE_1_PROPERTIES = [
  {
    id: "G1",
    code: "#G1-101",
    name: "Valli Grand Regency (G1)",
    location: "Panjim, Goa",
    status: "ACTIVE",
    totalRooms: 48,
    availableRooms: 32,
    activeBookings: 16,
  },
  {
    id: "G2",
    code: "#G2-201",
    name: "Valli Heritage Stay (G2)",
    location: "Jaipur, Rajasthan",
    status: "ACTIVE",
    totalRooms: 36,
    availableRooms: 18,
    activeBookings: 18,
  },
  {
    id: "G3",
    code: "#G3-301",
    name: "Valli Luxury Villa (G3)",
    location: "Ooty, Nilgiris",
    status: "MAINTENANCE",
    totalRooms: 24,
    availableRooms: 14,
    activeBookings: 8,
  },
];

export default function PropertyOverview() {
  const navigate = useNavigate();
  const { push: pushToast, ToastContainer } = useRoomToast();

  const [properties, setProperties] = useState(PHASE_1_PROPERTIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("grid");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [activeCardMenuId, setActiveCardMenuId] = useState(null);

  // Compute 4 Summary Values
  const totalPropertiesCount = properties.length;
  const totalRoomsCount = properties.reduce((acc, p) => acc + p.totalRooms, 0);
  const availableRoomsCount = properties.reduce(
    (acc, p) => acc + p.availableRooms,
    0
  );
  const activeBookingsCount = properties.reduce(
    (acc, p) => acc + p.activeBookings,
    0
  );

  // Handle Refresh simulation
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setProperties([...PHASE_1_PROPERTIES]);
      setIsRefreshing(false);
      pushToast("Properties data refreshed successfully.", "info");
    }, 400);
  };

  // Filter Properties
  const filteredProperties = properties.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchCode = p.code.toLowerCase().includes(q);
      const matchLoc = p.location.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchLoc) return false;
    }
    if (statusFilter === "ACTIVE" && p.status !== "ACTIVE") return false;
    if (
      statusFilter === "INACTIVE" &&
      p.status !== "MAINTENANCE" &&
      p.status !== "INACTIVE"
    )
      return false;
    return true;
  });

  return (
    <div className="rb-overview-container">
      {/* ── 1. Breadcrumb ── */}
      <div className="rb-overview-breadcrumb">
        <span>Home</span>
        <span>/</span>
        <span className="rb-overview-breadcrumb-active">Room &amp; Bookings</span>
      </div>

      {/* ── 2. Page Header ── */}
      <div className="rb-overview-header">
        <div>
          <h1 className="rb-overview-title">Room &amp; Bookings</h1>
          <p className="rb-overview-subtitle">
            Select a property to manage rooms and bookings.
          </p>
        </div>

        <div className="rb-overview-actions">
          {/* Refresh Button */}
          <button
            type="button"
            className="rb-btn-icon"
            onClick={handleRefresh}
            title="Refresh Properties"
            disabled={isRefreshing}
          >
            <RefreshCw
              size={17}
              className={isRefreshing ? "spin-icon" : ""}
            />
          </button>

          {/* Add Property Button */}
          <button
            type="button"
            className="rb-btn-primary"
            onClick={() =>
              pushToast("Add Property UI will be added in Phase 2.", "info")
            }
          >
            <Plus size={16} />
            <span>Add Property</span>
          </button>

          {/* More Actions Dropdown */}
          <div style={{ position: "relative" }}>
            <button
              type="button"
              className="rb-btn-icon"
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              title="More Options"
            >
              <MoreHorizontal size={18} />
            </button>

            {showMoreMenu && (
              <div
                className="rb-dropdown-menu"
                onMouseLeave={() => setShowMoreMenu(false)}
              >
                <button
                  type="button"
                  className="rb-dropdown-item"
                  onClick={() => {
                    setShowMoreMenu(false);
                    handleRefresh();
                  }}
                >
                  <RefreshCw size={14} color="#2563eb" />
                  <span>Refresh properties</span>
                </button>
                <button
                  type="button"
                  className="rb-dropdown-item"
                  onClick={() => {
                    setShowMoreMenu(false);
                    pushToast("Export options available in next phase.", "info");
                  }}
                >
                  <span>View options</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 3. Four Compact Summary Cards ── */}
      <div className="rb-summary-grid">
        {/* Total Properties */}
        <div className="rb-summary-card">
          <div className="rb-summary-info">
            <span className="rb-summary-label">Total Properties</span>
            <span className="rb-summary-val">{totalPropertiesCount}</span>
            <span className="rb-summary-sub">Portfolios active</span>
          </div>
          <div
            className="rb-summary-icon-box"
            style={{ background: "#eff6ff", color: "#2563eb" }}
          >
            <Building2 size={20} />
          </div>
        </div>

        {/* Total Rooms */}
        <div className="rb-summary-card">
          <div className="rb-summary-info">
            <span className="rb-summary-label">Total Rooms</span>
            <span className="rb-summary-val">{totalRoomsCount}</span>
            <span className="rb-summary-sub">Across all locations</span>
          </div>
          <div
            className="rb-summary-icon-box"
            style={{ background: "#eff6ff", color: "#2563eb" }}
          >
            <DoorClosed size={20} />
          </div>
        </div>

        {/* Available Rooms */}
        <div className="rb-summary-card">
          <div className="rb-summary-info">
            <span className="rb-summary-label">Available Rooms</span>
            <span className="rb-summary-val" style={{ color: "#16a34a" }}>
              {availableRoomsCount}
            </span>
            <span className="rb-summary-sub">Ready for check-in</span>
          </div>
          <div
            className="rb-summary-icon-box"
            style={{ background: "#dcfce7", color: "#16a34a" }}
          >
            <CheckCircle2 size={20} />
          </div>
        </div>

        {/* Active Bookings */}
        <div className="rb-summary-card">
          <div className="rb-summary-info">
            <span className="rb-summary-label">Active Bookings</span>
            <span className="rb-summary-val" style={{ color: "#d97706" }}>
              {activeBookingsCount}
            </span>
            <span className="rb-summary-sub">In-house guests</span>
          </div>
          <div
            className="rb-summary-icon-box"
            style={{ background: "#fef3c7", color: "#d97706" }}
          >
            <CalendarCheck2 size={20} />
          </div>
        </div>
      </div>

      {/* ── 4. Properties Section ── */}
      <div className="rb-property-section">
        {/* Section Header with Controls */}
        <div className="rb-property-section-header">
          <h2 className="rb-property-section-title">Properties</h2>

          <div className="rb-property-controls">
            {/* Search Input */}
            <div className="rb-search-wrap">
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                className="rb-search-input"
                placeholder="Search by property name or property ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <select
              className="rb-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive / Maintenance</option>
            </select>

            {/* Grid / List View Toggle */}
            <div style={{ display: "flex", gap: 4 }}>
              <button
                type="button"
                className={`rb-btn-icon ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
                title="Grid View"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                type="button"
                className={`rb-btn-icon ${viewMode === "list" ? "active" : ""}`}
                onClick={() => setViewMode("list")}
                title="List View"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* ── 5. Property Grid (3 Columns) ── */}
        <div
          className="rb-property-grid"
          style={{
            gridTemplateColumns: viewMode === "list" ? "1fr" : undefined,
          }}
        >
          {filteredProperties.length === 0 ? (
            <div
              style={{
                gridColumn: "1 / -1",
                padding: "36px 20px",
                textAlign: "center",
                color: "#64748b",
              }}
            >
              No properties match your filter.
            </div>
          ) : (
            filteredProperties.map((prop) => {
              const isActive = prop.status === "ACTIVE";

              return (
                <div key={prop.id} className="rb-property-card">
                  {/* Card Top */}
                  <div>
                    <div className="rb-property-card-top">
                      <div className="rb-property-icon-box">
                        <Hotel size={22} />
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <span
                          className={`rb-property-status-chip ${
                            isActive ? "active" : "maintenance"
                          }`}
                        >
                          ● {prop.status}
                        </span>

                        <span className="rb-property-code">{prop.code}</span>

                        <div style={{ position: "relative" }}>
                          <button
                            type="button"
                            style={{
                              border: "none",
                              background: "transparent",
                              cursor: "pointer",
                              color: "#94a3b8",
                              padding: 4,
                              display: "flex",
                              alignItems: "center",
                            }}
                            onClick={() =>
                              setActiveCardMenuId(
                                activeCardMenuId === prop.id ? null : prop.id
                              )
                            }
                          >
                            <MoreHorizontal size={16} />
                          </button>

                          {activeCardMenuId === prop.id && (
                            <div
                              className="rb-dropdown-menu"
                              onMouseLeave={() => setActiveCardMenuId(null)}
                            >
                              <button
                                type="button"
                                className="rb-dropdown-item"
                                onClick={() => {
                                  setActiveCardMenuId(null);
                                  navigate(
                                    `/rooms-bookings/property/${prop.id}`
                                  );
                                }}
                              >
                                View Property Details
                              </button>
                              <button
                                type="button"
                                className="rb-dropdown-item"
                                onClick={() => {
                                  setActiveCardMenuId(null);
                                  navigate(
                                    `/rooms-bookings/property/${prop.id}/rooms`
                                  );
                                }}
                              >
                                Manage Room Board
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="rb-property-name">{prop.name}</div>
                    <div className="rb-property-location">
                      <MapPin size={13} color="#64748b" />
                      <span>{prop.location}</span>
                    </div>

                    {/* Middle Metrics Box */}
                    <div className="rb-property-metrics-box">
                      <div className="rb-property-metric-item">
                        <span className="rb-property-metric-lbl">Rooms</span>
                        <span className="rb-property-metric-val">
                          {prop.totalRooms}
                        </span>
                      </div>

                      <div className="rb-property-metric-item">
                        <span className="rb-property-metric-lbl">Available</span>
                        <span
                          className="rb-property-metric-val"
                          style={{ color: "#16a34a" }}
                        >
                          {prop.availableRooms}
                        </span>
                      </div>

                      <div className="rb-property-metric-item">
                        <span className="rb-property-metric-lbl">
                          Active Bookings
                        </span>
                        <span
                          className="rb-property-metric-val"
                          style={{ color: "#2563eb" }}
                        >
                          {prop.activeBookings}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Actions - Balanced Side-by-Side 40px Buttons */}
                  <div className="rb-property-actions">
                    <button
                      type="button"
                      className="rb-btn-secondary"
                      onClick={() =>
                        navigate(`/rooms-bookings/property/${prop.id}`)
                      }
                    >
                      <span>View Property</span>
                    </button>

                    <button
                      type="button"
                      className="rb-btn-primary"
                      onClick={() =>
                        navigate(`/rooms-bookings/property/${prop.id}/rooms`)
                      }
                    >
                      <DoorClosed size={15} />
                      <span>Manage Rooms</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}
