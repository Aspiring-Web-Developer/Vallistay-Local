// src/Pages/PropertyRooms/PropertyRoomsBoard.jsx
// SCREEN 5: PROPERTY ROOM BOARD

import React, { useState, useSyncExternalStore } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Building2,
  ArrowLeft,
  Plus,
  RefreshCw,
  MoreVertical,
  DoorClosed,
  Zap,
  Calendar,
  CheckCircle2,
  X,
  Hotel,
} from "lucide-react";
import { propertyStore } from "./data/propertyState";
import AvailabilityFilterBar from "./components/AvailabilityFilterBar";
import RoomCard from "./components/RoomCard";
import QuickBookingModal from "./components/QuickBookingModal";
import RoomDetailsDrawer from "./components/RoomDetailsDrawer";
import CancelBookingModal from "./components/CancelBookingModal";
import AddRoomModal from "./components/AddRoomModal";
import AvailabilityEmptyState from "./components/AvailabilityEmptyState";
import { useRoomToast } from "./components/useRoomToast";
import "./styles/propertyRooms.css";

export default function PropertyRoomsBoard() {
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

  // Subscribe to room list
  const rooms = propertyStore.getRooms(property?.id);

  // Availability filter state starts completely empty as strictly instructed
  const [filterDates, setFilterDates] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Modals & Drawers
  const [quickBookRoom, setQuickBookRoom] = useState(null);
  const [detailsDrawerRoom, setDetailsDrawerRoom] = useState(null);
  const [cancelModalRoom, setCancelModalRoom] = useState(null);
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  // Top banner alert
  const [topBanner, setTopBanner] = useState(null);

  // Apply Date Filter
  const handleApplyDateFilter = (checkIn, checkOut) => {
    setFilterDates({ checkIn, checkOut });
    pushToast(`Availability calculated for ${checkIn} to ${checkOut}`, "info");
  };

  const handleClearDateFilter = () => {
    setFilterDates(null);
    setSelectedStatus("ALL");
    pushToast("Date filter cleared. Showing all room live statuses.", "info");
  };

  // Helper to determine if a room is available for selected dates
  const checkRoomAvailability = (room) => {
    if (room.status === "MAINTENANCE") {
      return { available: false, reason: "Room under scheduled maintenance" };
    }
    if (!filterDates) {
      return {
        available: room.status === "AVAILABLE",
        reason: room.status === "BOOKED" ? "Active booking" : room.status,
      };
    }

    // When date range is specified
    if (room.currentBooking) {
      const bIn = new Date(room.currentBooking.checkIn);
      const bOut = new Date(room.currentBooking.checkOut);
      const reqIn = new Date(filterDates.checkIn);
      const reqOut = new Date(filterDates.checkOut);

      // Overlap check
      if (reqIn < bOut && reqOut > bIn) {
        return {
          available: false,
          reason: `Booked for these dates (${room.currentBooking.customerName})`,
        };
      }
    }

    return {
      available: room.status === "AVAILABLE",
      reason: room.status !== "AVAILABLE" ? `Currently ${room.status}` : "",
    };
  };

  // Available room count
  const availableRoomsList = rooms.filter((r) => checkRoomAvailability(r).available);
  const availableCount = availableRoomsList.length;

  // Filter rooms based on status tab and dates
  const displayedRooms = rooms.filter((room) => {
    const { available } = checkRoomAvailability(room);

    if (selectedStatus === "AVAILABLE") return available;
    if (selectedStatus === "UNAVAILABLE") return !available;
    if (selectedStatus === "OCCUPIED")
      return room.status === "OCCUPIED" || room.status === "DUE_OUT";
    if (selectedStatus === "MAINTENANCE") return room.status === "MAINTENANCE";

    return true;
  });

  // Status counts for filter chips
  const statusCounts = {
    all: rooms.length,
    available: availableCount,
    unavailable: rooms.length - availableCount,
    occupied: rooms.filter((r) => r.status === "OCCUPIED" || r.status === "DUE_OUT").length,
    maintenance: rooms.filter((r) => r.status === "MAINTENANCE").length,
  };

  // Confirm Quick Booking
  const handleConfirmBooking = (room, customer, stayInfo) => {
    const bookingFolio = `BK-${Math.floor(100 + Math.random() * 900)}`;
    const bookingRecord = {
      bookingId: bookingFolio,
      folio: bookingFolio,
      customerName: customer.name,
      phone: customer.phone,
      email: customer.email,
      checkIn: stayInfo.checkIn,
      checkOut: stayInfo.checkOut,
      checkoutLabel: `${stayInfo.checkOut} (${stayInfo.nights} Nights)`,
      status: "CONFIRMED",
      nights: stayInfo.nights,
    };

    propertyStore.setRoomBooking(property.id, room.id, bookingRecord);

    setTopBanner({
      type: "success",
      title: "Booking Confirmed",
      desc: `Booking confirmed successfully for ${customer.name} in Room ${room.number} (${stayInfo.checkIn} – ${stayInfo.checkOut}).`,
    });

    pushToast(
      `Booking confirmed successfully for ${customer.name} in Room ${room.number}.`,
      "success"
    );
  };

  // Confirm Cancellation
  const handleConfirmCancel = (room) => {
    const custName = room.currentBooking?.customerName || "Customer";
    propertyStore.cancelRoomBooking(property.id, room.id);

    setTopBanner({
      type: "info",
      title: "Booking Cancelled",
      desc: `Booking for ${custName} in Room ${room.number} has been cancelled. The room is available again.`,
    });

    pushToast(
      "Booking cancelled successfully. The room is available again.",
      "info"
    );

    // Update open drawer room state
    if (detailsDrawerRoom?.id === room.id) {
      setDetailsDrawerRoom({
        ...detailsDrawerRoom,
        status: "AVAILABLE",
        currentBooking: null,
      });
    }
  };

  return (
    <div className="pr-page-container">
      {/* ── Breadcrumb & Navigation ── */}
      <div className="pr-breadcrumb">
        <span
          style={{ cursor: "pointer", color: "#2563eb" }}
          onClick={() => navigate("/rooms-bookings")}
        >
          Room &amp; Bookings
        </span>
        <span>/</span>
        <span
          style={{ cursor: "pointer", color: "#2563eb" }}
          onClick={() => navigate(`/rooms-bookings/property/${property?.id}`)}
        >
          {property?.name}
        </span>
        <span>/</span>
        <span style={{ color: "#0f172a" }}>Rooms</span>
      </div>

      {/* ── Header Row ── */}
      <div className="pr-header-row">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            type="button"
            className="pr-btn-icon-only"
            onClick={() =>
              navigate(`/rooms-bookings/property/${property?.id}`)
            }
            title="Back to Property Details"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="pr-header-title">{property?.name} Rooms</h1>
            <p className="pr-header-subtitle">
              Manage room availability and guest bookings.
            </p>
          </div>
        </div>

        <div className="pr-header-actions">
          <button
            type="button"
            className="pr-btn pr-btn-secondary"
            onClick={() => pushToast("Refreshed room statuses.", "info")}
          >
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            className="pr-btn pr-btn-primary"
            onClick={() => {
              setEditingRoom(null);
              setIsAddRoomModalOpen(true);
            }}
          >
            <Plus size={16} />
            <span>Add Room</span>
          </button>

          <button
            type="button"
            className="pr-btn-icon-only"
            title="More Options"
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      {/* ── Top Notification Banner (Confirmation / Cancellation) ── */}
      {topBanner && (
        <div className="pr-top-banner">
          <div className="pr-top-banner-content">
            <div className="pr-top-banner-icon">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <div className="pr-top-banner-title">{topBanner.title}</div>
              <div className="pr-top-banner-desc">{topBanner.desc}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setTopBanner(null)}
            style={{
              border: "none",
              background: "transparent",
              color: "#166534",
              cursor: "pointer",
              padding: 4,
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── Compact Property Context Strip ── */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          padding: "12px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 18,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "#eff6ff",
              color: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Building2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
              {property?.fullName || property?.name}
            </div>
            <div style={{ fontSize: 12, color: "#64748b" }}>
              {property?.code} • {property?.location || property?.address}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span
            style={{
              fontSize: 11.5,
              fontWeight: 700,
              background:
                property?.status === "ACTIVE" ? "#dcfce7" : "#fef3c7",
              color:
                property?.status === "ACTIVE" ? "#15803d" : "#b45309",
              padding: "3px 10px",
              borderRadius: 9999,
            }}
          >
            ● {property?.status}
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>
            Total Rooms: <strong>{rooms.length}</strong>
          </span>
        </div>
      </div>

      {/* ── Date Range Availability Filter (Starts Empty!) ── */}
      <AvailabilityFilterBar
        filterDates={filterDates}
        onApplyDateFilter={handleApplyDateFilter}
        onClearDateFilter={handleClearDateFilter}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        statusCounts={statusCounts}
        availableCount={availableCount}
      />

      {/* ── Room Cards Grid / Empty States ── */}
      {displayedRooms.length === 0 ? (
        <AvailabilityEmptyState
          allRooms={rooms}
          filterDates={filterDates}
          onClearDates={handleClearDateFilter}
          onApplySuggestedDates={(inD, outD) => handleApplyDateFilter(inD, outD)}
        />
      ) : (
        <div className="pr-rooms-grid">
          {displayedRooms.map((room) => {
            const availInfo = checkRoomAvailability(room);
            return (
              <RoomCard
                key={room.id}
                room={room}
                isDateFilterActive={Boolean(filterDates)}
                isDateAvailable={availInfo.available}
                unavailableReason={availInfo.reason}
                onQuickBook={(r) => setQuickBookRoom(r)}
                onViewDetails={(r) => setDetailsDrawerRoom(r)}
                onEditRoom={(r) => {
                  setEditingRoom(r);
                  setIsAddRoomModalOpen(true);
                }}
              />
            );
          })}
        </div>
      )}

      {/* ── Quick Booking Modal ── */}
      <QuickBookingModal
        isOpen={Boolean(quickBookRoom)}
        room={quickBookRoom}
        property={property}
        initialDates={filterDates}
        onClose={() => setQuickBookRoom(null)}
        onConfirmBooking={handleConfirmBooking}
      />

      {/* ── Room Details Drawer ── */}
      <RoomDetailsDrawer
        isOpen={Boolean(detailsDrawerRoom)}
        room={detailsDrawerRoom}
        property={property}
        onClose={() => setDetailsDrawerRoom(null)}
        onOpenCancelModal={(r) => setCancelModalRoom(r)}
        onQuickBookFromDrawer={(r) => {
          setDetailsDrawerRoom(null);
          setQuickBookRoom(r);
        }}
        onEditRoomFromDrawer={(r) => {
          setDetailsDrawerRoom(null);
          setEditingRoom(r);
          setIsAddRoomModalOpen(true);
        }}
      />

      {/* ── Cancel Booking Modal ── */}
      <CancelBookingModal
        isOpen={Boolean(cancelModalRoom)}
        room={cancelModalRoom}
        property={property}
        onClose={() => setCancelModalRoom(null)}
        onConfirmCancel={handleConfirmCancel}
      />

      {/* ── Add / Edit Room Modal ── */}
      <AddRoomModal
        isOpen={isAddRoomModalOpen}
        property={property}
        initialRoom={editingRoom}
        onClose={() => {
          setIsAddRoomModalOpen(false);
          setEditingRoom(null);
        }}
        onSaved={(msg) => pushToast(msg, "success")}
      />

      <ToastContainer />
    </div>
  );
}
