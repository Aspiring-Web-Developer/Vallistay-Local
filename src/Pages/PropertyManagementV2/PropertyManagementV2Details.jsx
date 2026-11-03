// src/Pages/PropertyManagementV2/PropertyManagementV2Details.jsx
import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Building2,
  ArrowLeft,
  Edit2,
  BedDouble,
  Plus,
  DoorOpen,
  CheckCircle2,
  CalendarDays,
  UserCheck,
  MoreVertical,
  Trash2,
} from "lucide-react";
import {
  usePropertyManagementV2,
  PropertyManagementV2Provider,
} from "./context/PropertyManagementV2Context";
import V2PageHeader from "./components/V2PageHeader";
import V2StatusBadge from "./components/V2StatusBadge";
import V2SummaryCard from "./components/V2SummaryCard";
import V2AddRoomModal from "./components/V2AddRoomModal";
import V2EditPropertyModal from "./components/V2EditPropertyModal";
import V2DeletePropertyModal from "./components/V2DeletePropertyModal";
import "./styles/propertyManagementV2.css";

function DetailsContent() {
  const { propertyId } = useParams();
  const navigate = useNavigate();

  const {
    properties,
    rooms,
    isLoadingProperties,
    isLoadingRooms,
    editProperty,
    deleteProperty,
    addRoom,
    fetchRoomsForProperty,
  } = usePropertyManagementV2();

  const property = properties.find((p) => p.id === propertyId) || (properties.length > 0 ? properties[0] : null);

  // Fetch live sub-rooms for this property
  React.useEffect(() => {
    if (property?.id) {
      fetchRoomsForProperty(property.id, null, null, property.name);
    }
  }, [property?.id, property?.name, fetchRoomsForProperty]);

  const propertyRooms = rooms.filter((r) => r.propertyId === property?.id);

  // Room status counts for this property
  const total = propertyRooms.length;
  const available = propertyRooms.filter((r) => r.status === "available").length;
  const booked = propertyRooms.filter((r) => r.status === "booked" || r.status === "due_out").length;
  const occupied = propertyRooms.filter((r) => r.status === "occupied").length;

  // Modals
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isEditPropOpen, setIsEditPropOpen] = useState(false);
  const [isDeletePropOpen, setIsDeletePropOpen] = useState(false);

  if (isLoadingProperties && !property) {
    return (
      <div className="pmv2-container" style={{ padding: "60px 0", textAlign: "center" }}>
        <div style={{ display: "inline-block", width: 36, height: 36, border: "3px solid #E5E7EB", borderTopColor: "#4F46E5", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ marginTop: 12, color: "#6B7280", fontSize: 14 }}>Loading property details...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="pmv2-container" style={{ padding: "40px 0", textAlign: "center" }}>
        <h3 style={{ fontSize: 18, color: "#111827", marginBottom: 8 }}>Property Not Found</h3>
        <p style={{ color: "#6B7280", marginBottom: 16 }}>The requested property could not be found or has been removed.</p>
        <Link to="/property-management-v2" className="pmv2-btn pmv2-btn-secondary" style={{ display: "inline-flex" }}>
          Back to Properties
        </Link>
      </div>
    );
  }

  return (
    <div className="pmv2-container">
      {/* Header */}
      <V2PageHeader
        // breadcrumbs={[
        //   { label: "Home", to: "/" },
        //   { label: "Property Management", to: "/property-management-v2" },
        //   { label: property.name },
        // ]}
        title={property.name}
        // subtitle="Manage property configuration, specifications, and rooms."
        primaryActionText="Add Room"
        onPrimaryAction={() => setIsAddRoomOpen(true)}
        showExport={true}
        onRefresh={() => {}}
      />

      {/* Property Hero Information Card */}
      <div className="pmv2-details-hero">
        <div className="pmv2-details-hero-top">
          <div className="pmv2-details-hero-main">
            <div className="pmv2-details-hero-icon">
              <Building2 size={28} />
            </div>
            <div className="pmv2-details-hero-title-box">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h2 className="pmv2-details-hero-title">{property.name}</h2>
                <V2StatusBadge status={property.status} />
              </div>
              <span style={{ fontSize: 13, color: "#6B7280" }}>
                Code: {property.code} • {property.location}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              type="button"
              className="pmv2-btn pmv2-btn-secondary"
              onClick={() => setIsEditPropOpen(true)}
            >
              <Edit2 size={15} />
              <span>Edit Property</span>
            </button>

            <button
              type="button"
              className="pmv2-btn pmv2-btn-primary"
              onClick={() =>
                navigate(`/property-management-v2/property/${property.id}/rooms`)
              }
            >
              <DoorOpen size={16} />
              <span>Manage Rooms</span>
            </button>
          </div>
        </div>

        {/* Specifications Grid */}
        <div className="pmv2-details-info-grid">
          <div className="pmv2-details-info-item">
            <span className="pmv2-details-info-label">Property Name</span>
            <span className="pmv2-details-info-val">{property.name}</span>
          </div>
          <div className="pmv2-details-info-item">
            <span className="pmv2-details-info-label">Property Code</span>
            <span className="pmv2-details-info-val">{property.code}</span>
          </div>
          <div className="pmv2-details-info-item">
            <span className="pmv2-details-info-label">Property Type</span>
            <span className="pmv2-details-info-val">{property.type}</span>
          </div>
          <div className="pmv2-details-info-item">
            <span className="pmv2-details-info-label">Address / Location</span>
            <span className="pmv2-details-info-val">{property.location}</span>
          </div>
          <div className="pmv2-details-info-item">
            <span className="pmv2-details-info-label">Status</span>
            <span className="pmv2-details-info-val">{property.status}</span>
          </div>
          <div className="pmv2-details-info-item">
            <span className="pmv2-details-info-label">Created Date</span>
            <span className="pmv2-details-info-val">{property.createdAt || "12 Jan 2026"}</span>
          </div>
          <div className="pmv2-details-info-item">
            <span className="pmv2-details-info-label">Last Updated</span>
            <span className="pmv2-details-info-val">{property.updatedAt || "Just now"}</span>
          </div>
          <div className="pmv2-details-info-item">
            <span className="pmv2-details-info-label">Sync Status</span>
            <span className="pmv2-details-info-val" style={{ color: "#059669" }}>
              • Live Synced
            </span>
          </div>
        </div>
      </div>

      {/* Small Room Status Summary Cards */}
      <div style={{ marginBottom: 14 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 12px", color: "#111827" }}>
          Room Inventory Status
        </h3>
      </div>
      <div className="pmv2-summary-grid">
        <V2SummaryCard
          label="Total Rooms"
          value={total}
          tag="Units"
          subtext="Configured inventory"
          icon={BedDouble}
          colorScheme="blue"
        />
        <V2SummaryCard
          label="Available"
          value={available}
          tag="Vacant"
          subtext="Ready for check-in"
          icon={CheckCircle2}
          colorScheme="green"
        />
        <V2SummaryCard
          label="Booked"
          value={booked}
          tag="Reserved"
          subtext="Upcoming reservations"
          icon={CalendarDays}
          colorScheme="orange"
        />
        <V2SummaryCard
          label="Occupied"
          value={occupied}
          tag="Checked-In"
          subtext="Currently hosted guests"
          icon={UserCheck}
          colorScheme="purple"
        />
      </div>

      {/* Quick Action Navigation Strip */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: 14,
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 20,
        }}
      >
        <div>
          <h4 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#111827" }}>
            Ready to view rooms and check availability?
          </h4>
          <p style={{ margin: 0, fontSize: 13, color: "#6B7280" }}>
            Open the live inventory board to check dates and perform quick front-desk bookings.
          </p>
        </div>
        <button
          type="button"
          className="pmv2-btn pmv2-btn-primary"
          onClick={() =>
            navigate(`/property-management-v2/property/${property.id}/rooms`)
          }
        >
          <DoorOpen size={16} />
          <span>Open Rooms Board</span>
        </button>
      </div>

      {/* Modals */}
      <V2AddRoomModal
        isOpen={isAddRoomOpen}
        property={property}
        onClose={() => setIsAddRoomOpen(false)}
        onSubmit={addRoom}
      />

      <V2EditPropertyModal
        isOpen={isEditPropOpen}
        property={property}
        onClose={() => setIsEditPropOpen(false)}
        onSubmit={editProperty}
      />

      <V2DeletePropertyModal
        isOpen={isDeletePropOpen}
        property={property}
        onClose={() => setIsDeletePropOpen(false)}
        onConfirm={(propId) => {
          const ok = deleteProperty(propId);
          if (ok) {
            setIsDeletePropOpen(false);
            navigate("/property-management-v2");
          }
        }}
      />
    </div>
  );
}

export default function PropertyManagementV2Details() {
  return (
    <PropertyManagementV2Provider>
      <DetailsContent />
    </PropertyManagementV2Provider>
  );
}
