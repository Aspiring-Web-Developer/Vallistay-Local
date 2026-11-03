// src/Pages/PropertyRooms/RoomBookingsBoard.jsx
import React, { useState } from "react";
import {
  Building2,
  ChevronDown,
  RefreshCw,
  Search,
  BedDouble,
  Check,
} from "lucide-react";
import { MOCK_PROPERTIES } from "./data/mockRoomBookingData";
import PropertyRoomsBoard from "./PropertyRoomsBoard";
import "./styles/propertyRooms.css";

export default function RoomBookingsBoard() {
  const [selectedPropertyId, setSelectedPropertyId] = useState("G1");
  const [isPropDropdownOpen, setIsPropDropdownOpen] = useState(false);
  const [propSearch, setPropSearch] = useState("");

  const activeProperty =
    MOCK_PROPERTIES.find((p) => p.id === selectedPropertyId) ||
    MOCK_PROPERTIES[0];

  const filteredProperties = MOCK_PROPERTIES.filter(
    (p) =>
      p.name.toLowerCase().includes(propSearch.toLowerCase()) ||
      p.location.toLowerCase().includes(propSearch.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* ── Top Bar: Property Switcher Header ── */}
      <div
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              marginBottom: 4,
            }}
          >
            GLOBAL MANAGEMENT
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>
            Room & Bookings Board
          </div>
        </div>

        {/* Custom Searchable Property Selector */}
        <div style={{ position: "relative", minWidth: 280 }}>
          <div
            onClick={() => setIsPropDropdownOpen(!isPropDropdownOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              background: "#f8fafc",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              padding: "8px 14px",
              cursor: "pointer",
              transition: "border-color 0.15s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Building2 size={18} color="#2563eb" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                  {activeProperty.name}
                </div>
                <div style={{ fontSize: 11, color: "#64748b" }}>
                  {activeProperty.location}
                </div>
              </div>
            </div>
            <ChevronDown size={16} color="#64748b" />
          </div>

          {/* Property Dropdown */}
          {isPropDropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                right: 0,
                width: 320,
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                zIndex: 1000,
                padding: "8px 0",
              }}
            >
              <div style={{ padding: "6px 12px 10px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "#f1f5f9",
                    borderRadius: "8px",
                    padding: "6px 10px",
                  }}
                >
                  <Search size={14} color="#94a3b8" />
                  <input
                    type="text"
                    placeholder="Filter properties..."
                    value={propSearch}
                    onChange={(e) => setPropSearch(e.target.value)}
                    style={{
                      border: "none",
                      background: "transparent",
                      outline: "none",
                      fontSize: 12.5,
                      width: "100%",
                    }}
                  />
                </div>
              </div>

              {filteredProperties.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedPropertyId(p.id);
                    setIsPropDropdownOpen(false);
                  }}
                  style={{
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    background:
                      selectedPropertyId === p.id ? "#eff6ff" : "transparent",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      selectedPropertyId === p.id ? "#eff6ff" : "transparent")
                  }
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>
                      {p.totalUnits} Units • {p.location}
                    </div>
                  </div>
                  {selectedPropertyId === p.id && (
                    <Check size={16} color="#2563eb" strokeWidth={2.5} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Main Rooms Board for Active Property ── */}
      <PropertyRoomsBoard key={selectedPropertyId} />
    </div>
  );
}
