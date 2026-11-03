// src/Pages/PropertyRooms/PropertyDetailsView.jsx
// SCREEN 3: PROPERTY DETAILS

import React, { useState, useSyncExternalStore } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Building2,
  ArrowLeft,
  Edit,
  DoorClosed,
  Plus,
  ArrowRight,
  MapPin,
  User,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  Star,
  Hotel,
} from "lucide-react";
import { propertyStore } from "./data/propertyState";
import AddPropertyModal from "./components/AddPropertyModal";
import AddRoomModal from "./components/AddRoomModal";
import { useRoomToast } from "./components/useRoomToast";
import "./styles/propertyRooms.css";

export default function PropertyDetailsView() {
  const { propertyId = "G1" } = useParams();
  const navigate = useNavigate();
  const { push: pushToast, ToastContainer } = useRoomToast();

  const properties = useSyncExternalStore(
    propertyStore.subscribe,
    propertyStore.getProperties
  );

  const property =
    properties.find(
      (p) =>
        p.id.toUpperCase() === propertyId.toUpperCase() ||
        p.shortCode?.toUpperCase() === propertyId.toUpperCase()
    ) || properties[0];

  const rooms = propertyStore.getRooms(property?.id);

  const [isEditPropModalOpen, setIsEditPropModalOpen] = useState(false);
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);

  // Compute live room numbers
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((r) => r.status === "AVAILABLE").length;
  const bookedRooms = rooms.filter((r) => r.status === "BOOKED").length;
  const occupiedRooms = rooms.filter((r) => r.status === "OCCUPIED" || r.status === "DUE_OUT").length;

  return (
    <div className="pr-page-container">
      {/* ── Breadcrumb & Back Action ── */}
      <div className="pr-breadcrumb">
        <span
          style={{ cursor: "pointer", color: "#2563eb" }}
          onClick={() => navigate("/rooms-bookings")}
        >
          Room &amp; Bookings
        </span>
        <span>/</span>
        <span style={{ color: "#0f172a" }}>{property?.name}</span>
        <span>/</span>
        <span>Overview</span>
      </div>

      {/* ── Header ── */}
      <div className="pr-header-row">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            type="button"
            className="pr-btn-icon-only"
            onClick={() => navigate("/rooms-bookings")}
            title="Back to Properties"
          >
            <ArrowLeft size={18} />
          </button>

          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              background: "#eff6ff",
              color: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Hotel size={24} />
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h1 className="pr-header-title" style={{ margin: 0 }}>
                {property?.fullName || property?.name}
              </h1>
              <span
                style={{
                  padding: "3px 10px",
                  borderRadius: 9999,
                  fontSize: 11.5,
                  fontWeight: 700,
                  background:
                    property?.status === "ACTIVE" ? "#dcfce7" : "#fef3c7",
                  color:
                    property?.status === "ACTIVE" ? "#15803d" : "#b45309",
                }}
              >
                ● {property?.status}
              </span>
            </div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
              Code: <strong style={{ color: "#0f172a" }}>{property?.code}</strong> •{" "}
              {property?.location || property?.address}
            </div>
          </div>
        </div>

        <div className="pr-header-actions">
          <button
            type="button"
            className="pr-btn pr-btn-secondary"
            onClick={() => setIsEditPropModalOpen(true)}
          >
            <Edit size={15} color="#2563eb" />
            <span>Edit Property</span>
          </button>

          <button
            type="button"
            className="pr-btn pr-btn-primary"
            onClick={() =>
              navigate(`/rooms-bookings/property/${property.id}/rooms`)
            }
          >
            <DoorClosed size={16} />
            <span>Manage Rooms</span>
          </button>
        </div>
      </div>

      {/* ── 4 Small Professional Summary Cards (Screen 3) ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
          marginBottom: 22,
        }}
      >
        <div className="pr-stat-card">
          <div className="pr-stat-info">
            <span className="pr-stat-label">Total Rooms</span>
            <span className="pr-stat-num">{totalRooms}</span>
          </div>
          <div
            className="pr-stat-icon-wrap"
            style={{ background: "#f1f5f9", color: "#475569" }}
          >
            <DoorClosed size={20} />
          </div>
        </div>

        <div className="pr-stat-card">
          <div className="pr-stat-info">
            <span className="pr-stat-label">Available</span>
            <span className="pr-stat-num" style={{ color: "#16a34a" }}>
              {availableRooms}
            </span>
          </div>
          <div
            className="pr-stat-icon-wrap"
            style={{ background: "#dcfce7", color: "#16a34a" }}
          >
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="pr-stat-card">
          <div className="pr-stat-info">
            <span className="pr-stat-label">Booked</span>
            <span className="pr-stat-num" style={{ color: "#2563eb" }}>
              {bookedRooms}
            </span>
          </div>
          <div
            className="pr-stat-icon-wrap"
            style={{ background: "#eff6ff", color: "#2563eb" }}
          >
            <Calendar size={20} />
          </div>
        </div>

        <div className="pr-stat-card">
          <div className="pr-stat-info">
            <span className="pr-stat-label">Occupied / Due Out</span>
            <span className="pr-stat-num" style={{ color: "#d97706" }}>
              {occupiedRooms}
            </span>
          </div>
          <div
            className="pr-stat-icon-wrap"
            style={{ background: "#fef3c7", color: "#d97706" }}
          >
            <User size={20} />
          </div>
        </div>
      </div>

      {/* ── Main Layout: Quick Actions & Property Info ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 2fr",
          gap: 20,
          marginBottom: 24,
        }}
      >
        {/* Quick Actions Card */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 14,
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
            Operational Actions
          </div>
          <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
            Provision additional inventory or navigate to the real-time availability room board.
          </p>

          <button
            type="button"
            className="pr-btn pr-btn-primary"
            style={{ width: "100%", justifyContent: "center" }}
            onClick={() =>
              navigate(`/rooms-bookings/property/${property.id}/rooms`)
            }
          >
            <DoorClosed size={16} />
            <span>Open Room Board</span>
            <ArrowRight size={15} />
          </button>

          <button
            type="button"
            className="pr-btn pr-btn-secondary"
            style={{ width: "100%", justifyContent: "center" }}
            onClick={() => setIsAddRoomModalOpen(true)}
          >
            <Plus size={16} color="#2563eb" />
            <span>+ Add Room to {property?.name}</span>
          </button>
        </div>

        {/* Property Specs Card */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 14,
            padding: 20,
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#0f172a",
              marginBottom: 14,
            }}
          >
            Property Specifications &amp; Campus
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <span className="pr-spec-label">Classification</span>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a" }}>
                {property?.classification || "Boutique"} (
                {property?.rating || "4 Star"})
              </div>
            </div>

            <div>
              <span className="pr-spec-label">Assigned Campus</span>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a" }}>
                {property?.campus || "Coastal Zone"}
              </div>
            </div>

            <div>
              <span className="pr-spec-label">Operations Lead</span>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a" }}>
                {property?.manager || "Elena R. (Ops Lead)"}
              </div>
            </div>

            <div>
              <span className="pr-spec-label">PMS System Audit</span>
              <div style={{ fontSize: 13, color: "#64748b" }}>
                {property?.updatedAt || "Updated today"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Property Rooms Preview List ── */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 14,
          padding: 20,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
              Registered Rooms ({rooms.length})
            </div>
            <div style={{ fontSize: 12.5, color: "#64748b" }}>
              Room inventory configured under {property?.name}.
            </div>
          </div>

          <button
            type="button"
            className="pr-btn pr-btn-secondary"
            onClick={() =>
              navigate(`/rooms-bookings/property/${property.id}/rooms`)
            }
          >
            <span>View Full Room Board →</span>
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          {rooms.map((r) => (
            <div
              key={r.id}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 10,
                padding: "12px 14px",
                background: "#f8fafc",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <strong style={{ fontSize: 14, color: "#0f172a" }}>
                  {r.number}
                </strong>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: 4,
                    background:
                      r.status === "AVAILABLE"
                        ? "#dcfce7"
                        : r.status === "BOOKED"
                        ? "#dbeafe"
                        : r.status === "OCCUPIED"
                        ? "#eff6ff"
                        : "#fef3c7",
                    color:
                      r.status === "AVAILABLE"
                        ? "#15803d"
                        : r.status === "BOOKED"
                        ? "#1d4ed8"
                        : r.status === "OCCUPIED"
                        ? "#2563eb"
                        : "#b45309",
                  }}
                >
                  {r.status}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "#64748b" }}>
                {r.type} • {r.floor}
              </div>
              {r.currentBooking && (
                <div style={{ fontSize: 11.5, color: "#2563eb", marginTop: 4 }}>
                  👤 {r.currentBooking.customerName}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Edit Property Modal */}
      <AddPropertyModal
        isOpen={isEditPropModalOpen}
        initialProperty={property}
        onClose={() => setIsEditPropModalOpen(false)}
        onSaved={(msg) => pushToast(msg, "success")}
      />

      {/* Add Room Modal */}
      <AddRoomModal
        isOpen={isAddRoomModalOpen}
        property={property}
        onClose={() => setIsAddRoomModalOpen(false)}
        onSaved={(msg) => pushToast(msg, "success")}
      />

      <ToastContainer />
    </div>
  );
}
