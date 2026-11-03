








// src/Pages/PropertyManagementV2/PropertyManagementV2Rooms.jsx
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Building2, MapPin, DoorClosed, CheckCircle2, User, BedDouble, Wrench,
  Search, LayoutGrid, List, SearchX, ArrowLeft, RefreshCw, Info,
} from "lucide-react";
import {
  usePropertyManagementV2,
  PropertyManagementV2Provider,
    scopeRoom,
  getTodayRange,
} from "./context/PropertyManagementV2Context";
import V2PageHeader from "./components/V2PageHeader";
import V2AvailabilityFilter from "./components/V2AvailabilityFilter";
import V2RoomGrid from "./components/V2RoomGrid";
import V2QuickBookingModal from "./components/V2QuickBookingModal";
import V2RoomDetailsDrawer from "./components/V2RoomDetailsDrawer";
import V2CancelBookingModal from "./components/V2CancelBookingModal";
import V2AddRoomModal from "./components/V2AddRoomModal";
import V2EditRoomModal from "./components/V2EditRoomModal";
import V2DeleteRoomModal from "./components/V2DeleteRoomModal";
import V2LoadingSkeleton from "./components/V2LoadingSkeleton";
import { evaluateRoomsAvailability } from "./utils/availabilityUtils";
import "./styles/propertyManagementV2.css";
import { useAccess } from "../../services/AccessContext";
import { useToast } from "../Stays/Rooms/Room_Shared";
import Pagination from "../AuditLogs/Pagination";


const fmtDMY = (s) => {
  if (!s) return "";
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
};

const localToday = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};
function RoomsContent() {
  const { propertyId } = useParams();
  const { can } = useAccess();
  const canCreate = can("room_booking", "create");
  const canUpdate = can("room_booking", "update");
  const canDelete = can("room_booking", "delete");
  const {
    properties,
    rooms,
    customers,
    dateFilter,
    isCheckingAvailability,
    isLoadingRooms,
    fetchRoomsForProperty,
    addRoom,
    editRoom,
    deleteRoom,
    checkInGuest,
    checkOutGuest,
    toggleRoomMaintenance,
    addCustomer,
    quickBookRoom,
    cancelBooking,
    checkRoomAvailability,
    updateBookingDates,
    searchAvailability,
    clearAvailabilityDates,
        isLoadingProperties,
    fetchProperties,
  } = usePropertyManagementV2();


  const { push, ToastHost } = useToast();
const searchedRef = useRef(false);
const sawCheckingRef = useRef(false);


  const property =
    properties.find(
      (p) =>
        p.id === propertyId ||
        p.code?.toLowerCase() === propertyId?.toLowerCase()
    ) || properties[0];

  // Fetch rooms for this property from backend on mount or property change
  useEffect(() => {
    if (property?.id) {
      fetchRoomsForProperty(property.id, null, null, property.name);
    }
  }, [property?.id, fetchRoomsForProperty]);

  // Search & Status Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

  // Interaction Modals & Drawer
  const [quickBookRoomTarget, setQuickBookRoomTarget] = useState(null);
  const [drawerRoomTarget, setDrawerRoomTarget] = useState(null);
  const [cancelBookingTarget, setCancelBookingTarget] = useState(null);
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [editRoomTarget, setEditRoomTarget] = useState(null);
  const [deleteRoomTarget, setDeleteRoomTarget] = useState(null);

  const isDateFiltered = Boolean(
    dateFilter.isApplied && dateFilter.checkIn && dateFilter.checkOut
  );

  // Date range the page is "looking at": selected dates, else today
  // const viewRange = useMemo(() => {
  //   if (isDateFiltered) {
  //     return { from: dateFilter.checkIn, to: dateFilter.checkOut };
  //   }
  //   const today = new Date();
  //   const tomorrow = new Date(today);
  //   tomorrow.setDate(today.getDate() + 1);
  //   return { from: toYMD(today), to: toYMD(tomorrow) };
  // }, [dateFilter, isDateFiltered]);

  const viewRange = useMemo(
  () =>
    isDateFiltered
      ? { from: dateFilter.checkIn, to: dateFilter.checkOut }
      : getTodayRange(),
  [dateFilter, isDateFiltered]
);

  // Rooms with status + booking resolved ONLY for the view range
  // const propertyRooms = useMemo(() => {
  //   return rooms
  //     .filter((r) => r.propertyId === property?.id)
  //     .map((room) => {
  //       const inRange = (room.bookings || []).filter(
  //         (b) =>
  //           bookingOverlaps(b, viewRange.from, viewRange.to) ||
  //           // guest still checked in past planned checkout (today view only)
  //           (!isDateFiltered &&
  //             b.status === "checked_in" &&
  //             b.checkIn < viewRange.to)
  //       );

  //       // checked-in guest wins, otherwise earliest booking
  //       const hit =
  //         inRange.find((b) => b.status === "checked_in") || inRange[0] || null;

  //       let status = "available";
  //       if (room.raw?.is_maintenance) status = "maintenance";
  //       else if (hit) status = hit.status === "checked_in" ? "occupied" : "booked";

  //       return {
  //         ...room,
  //         status,
  //         activeBooking: hit,
  //         rangeBookings: inRange,
  //         checkoutNote: hit ? `Checkout: ${hit.checkOut}` : null,
  //       };
  //     });
  // }, [rooms, property, viewRange, isDateFiltered]);


  const propertyRooms = useMemo(() => {
  return rooms
    .filter((r) => r.propertyId === property?.id)
    .map((room) => {
      const scoped = scopeRoom(room, viewRange.from, viewRange.to, !isDateFiltered);
      const all = room.bookings || [];
      return {
        ...scoped,
        hasCheckedIn: all.some((b) => b.status === "checked_in"),
        hasBooked: all.some((b) => b.status !== "checked_in"),
      };
    });
}, [rooms, property, viewRange, isDateFiltered]);

  // Evaluated availability for rooms based on active dateFilter
  const evaluatedRooms = useMemo(() => {
    if (isDateFiltered) {
      return evaluateRoomsAvailability(
        propertyRooms,
        dateFilter.checkIn,
        dateFilter.checkOut
      );
    }
    return propertyRooms;
  }, [propertyRooms, dateFilter, isDateFiltered]);

  // Filtered rooms by search and status pill
// Put the chosen booking on the card (status follows that booking)
// const withBooking = (room, b) =>
//   room.raw?.is_maintenance
//     ? room
//     : {
//         ...room,
//         activeBooking: b,
//         status: b.status === "checked_in" ? "occupied" : "booked",
//         checkoutNote: `Checkout: ${b.checkOut}`,
//       };

const withBooking = (room, b) =>
  room.raw?.is_maintenance
    ? room
    : {
        ...room,
        activeBooking: b,
        status: b.status === "checked_in" ? "occupied" : "booked",
        checkoutNote: `Checkout: ${b.checkOut}`,
      };

const filteredRooms = useMemo(() => {
  const q = searchTerm.toLowerCase().trim();
  const guestMatch = (b) =>
    b.customer?.name?.toLowerCase().includes(q) ||
    b.customer?.email?.toLowerCase().includes(q) ||
    b.customer?.phone?.includes(q) ||
    b.bookingId?.toLowerCase().includes(q);

  return evaluatedRooms
    .map((room) => {
      const all = room.bookings || [];

      // 1) searching a guest -> show THEIR booking, any date
      if (q) {
        const hits = all.filter(guestMatch);
        if (hits.length) {
          const b = hits.find((x) => x.status === "checked_in") || hits[0];
          return { ...withBooking(room, b), _guestHit: true };
        }
      }
      // 2) Occupied / Booked pills -> show the matching booking, any date
      if (statusFilter === "occupied") {
        const b = all.find((x) => x.status === "checked_in");
        if (b) return withBooking(room, b);
      }
      if (statusFilter === "booked") {
        const b = all.find((x) => x.status !== "checked_in");
        if (b) return withBooking(room, b);
      }
      return room;
    })
    .filter((room) => {
      let matchSearch = true;
      if (q) {
        const inRoomFields =
          room.roomNumber?.toLowerCase().includes(q) ||
          room.roomType?.toLowerCase().includes(q) ||
          room.roomName?.toLowerCase().includes(q) ||
          room.roomId?.toLowerCase().includes(q);
        matchSearch = Boolean(inRoomFields || room._guestHit);
      }

      let matchStatus = true;
      if (statusFilter === "available") {
        matchStatus = isDateFiltered
          ? room.isAvailableForDates !== false
          : room.status === "available";
      } else if (statusFilter === "occupied") {
        matchStatus = room.hasCheckedIn;
      } else if (statusFilter === "booked") {
        matchStatus = room.hasBooked;
      } else if (statusFilter === "maintenance") {
        matchStatus = Boolean(room.raw?.is_maintenance);
      }

      return matchSearch && matchStatus;
    });
}, [evaluatedRooms, searchTerm, statusFilter, isDateFiltered]);

// Occupied / Booked / Maintenance / Total are overall, so the date filter never changes them.
const totalUnits = propertyRooms.length;
const occupiedUnits = propertyRooms.filter((r) => r.hasCheckedIn).length;
const bookedUnits = propertyRooms.filter((r) => r.hasBooked).length;
const maintenanceUnits = propertyRooms.filter((r) => r.raw?.is_maintenance).length;
// Available is the only count that follows the date filter, since that is what the filter is for
const readyUnits = isDateFiltered
  ? evaluatedRooms.filter((r) => r.isAvailableForDates !== false && !r.raw?.is_maintenance).length
  : propertyRooms.filter((r) => r.status === "available").length;
  // Pagination



  const pct = (n) => (totalUnits ? Math.round((n / totalUnits) * 100) : 0);

const statItems = [
  { key: "total", label: "Total Rooms", value: totalUnits, sub: "all units", tone: "gray", Icon: DoorClosed },
  {
    key: "available", label: "Available", value: readyUnits,
    sub: isDateFiltered ? "for selected dates" : `${pct(readyUnits)}% ready`,
    tone: "green", Icon: CheckCircle2,
  },
  { key: "occupied", label: "Occupied", value: occupiedUnits, sub: `${pct(occupiedUnits)}% checked in`, tone: "blue", Icon: User },
  { key: "booked", label: "Booked", value: bookedUnits, sub: `${pct(bookedUnits)}% upcoming`, tone: "orange", Icon: BedDouble },
  ...(maintenanceUnits > 0
    ? [{ key: "maint", label: "Maintenance", value: maintenanceUnits, sub: "under repair", tone: "gray", Icon: Wrench }]
    : []),
];
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRooms = filteredRooms.slice(
    startIndex,
    startIndex + itemsPerPage
  );


  useEffect(() => {
  if (isCheckingAvailability) {
    sawCheckingRef.current = true;
    return;
  }
  if (!searchedRef.current || !sawCheckingRef.current || !dateFilter.isApplied) return;

  searchedRef.current = false;
  sawCheckingRef.current = false;

const range = `${fmtDMY(dateFilter.checkIn)} → ${fmtDMY(dateFilter.checkOut)}`;
  if (readyUnits > 0) {
    push(`${readyUnits} room${readyUnits > 1 ? "s" : ""} available for ${range}`, "success");
  } else {
    push(`No rooms available for ${range}`, "error");
  }
}, [isCheckingAvailability, dateFilter.isApplied, readyUnits]);

  // Reset to first page on search or filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFilter]);

  // Drawer always shows the freshest, date-scoped copy of the room
const drawerRoom = drawerRoomTarget
  ? filteredRooms.find((r) => r.id === drawerRoomTarget.id) ||
    propertyRooms.find((r) => r.id === drawerRoomTarget.id) ||
    drawerRoomTarget
  : null;


  // check-in only opens from the booking's check-in date onwards
const bookingCheckIn = drawerRoom?.activeBooking?.checkIn;
const canCheckInNow =
  !bookingCheckIn || String(bookingCheckIn).slice(0, 10) <= localToday();


  if (!property && (isLoadingProperties || isLoadingRooms)) {
    return (
      <div className="pmv2-container">
        <V2LoadingSkeleton type="cards" count={3} />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="pmv2-container">
        <div className="pmv2-notfound">
          <div className="pmv2-notfound-icon">
            <SearchX size={34} />
          </div>
          <h2 className="pmv2-notfound-title">Property not found</h2>
          <p className="pmv2-notfound-text">
            This property may have been removed, or the link is incorrect.
            Go back to your properties and pick one from the list.
          </p>
          <div className="pmv2-notfound-actions">
            <Link to="/property-management-v2" className="pmv2-btn pmv2-btn-primary">
              <ArrowLeft size={16} />
              <span>Back to Properties</span>
            </Link>
            <button
              type="button"
              className="pmv2-btn pmv2-btn-secondary"
              onClick={() => fetchProperties()}
            >
              <RefreshCw size={15} />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
  const pillStyle = {
    height: 36,
    padding: "0 14px",
    borderRadius: 20,
    fontSize: 13,
  };

  return (
    <div className="pmv2-container">
      {/* Page Header */}
      <V2PageHeader
        title={`Rooms  – ${property?.name || "Property"}`}
        subtitle=""
        primaryActionText={canCreate ? "Add Room" : undefined}
        onPrimaryAction={canCreate ? () => setIsAddRoomOpen(true) : undefined}
        // showExport={true}
        onRefresh={() => {
          setSearchTerm("");
          setStatusFilter("all");
          if (property?.id) {
            clearAvailabilityDates(property.id, property.name);
          }
        }}
      />

{/* Property + Stats (single card) */}
<div className="pmv2-hero">
<div
  className="pmv2-hero-top"
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
  }}
>
  {/* Left: property info */}
  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
    <div className="pmv2-property-strip-icon">
      <Building2 size={24} />
    </div>
    <div>
      <h3 className="pmv2-property-strip-name">{property?.name || "Property"}</h3>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "#6B7280" }}>
        <MapPin size={13} style={{ color: "#9CA3AF" }} />
        <span>{property?.location || property?.city || "Campus"}</span>
      </div>
    </div>
  </div>

  {/* Right: standard info message */}
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "8px 12px",
      borderRadius: 10,
      background: "#EFF6FF",
      border: "1px solid #BFDBFE",
      color: "#1D4ED8",
      fontSize: 12.5,
      maxWidth: 420,
    }}
  >
    <Info size={15} style={{ flexShrink: 0 }} />
    <span>
      These stats update automatically based on the check-in &amp; check-out
      dates you select below.
    </span>
  </div>
</div>

  <div className="pmv2-stats-row">
    {statItems.map(({ key, label, value, sub, tone, Icon }) => (
      <div className="pmv2-stat" key={key}>
        <div className={`pmv2-stat-icon ${tone}`}>
          <Icon size={26} />
        </div>
        <div className="pmv2-stat-text">
          <div className="pmv2-stat-label">{label}</div>
          <div className="pmv2-stat-line">
            <span className="pmv2-stat-val">{value}</span>
            <span className={`pmv2-stat-sub ${tone}`}>{sub}</span>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>
      {/* Date Availability Filter Section */}
<V2AvailabilityFilter
  dateFilter={dateFilter}
  isChecking={isCheckingAvailability}
  availableCount={readyUnits}
  onSearch={(cin, cout) => {
    searchedRef.current = true;
    sawCheckingRef.current = false;
    searchAvailability(cin, cout, property?.id);
  }}
  onClear={() => {
    if (property?.id) {
      clearAvailabilityDates(property.id, property.name);
    }
  }}
/>

      {/* Search & Status Filter Pills */}
      <div
        className="pmv2-filter-bar"
        style={{ marginBottom: 18, background: "#FFFFFF" }}
      >
        <div className="pmv2-search-input-wrap">
          <Search size={16} className="pmv2-search-icon" />
          <input
            type="text"
            className="pmv2-search-input"
            placeholder="Search room number, guest name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {[
            { key: "all", label: "All", count: totalUnits },
            { key: "available", label: "Available", count: readyUnits },
            { key: "occupied", label: "Occupied", count: occupiedUnits },
            { key: "booked", label: "Booked", count: bookedUnits },
          ].map((p) => (
            <button
              key={p.key}
              type="button"
              className={`pmv2-btn ${
                statusFilter === p.key ? "pmv2-btn-primary" : "pmv2-btn-secondary"
              }`}
              style={pillStyle}
              onClick={() => setStatusFilter(p.key)}
            >
              {p.label} ({p.count})
            </button>
          ))}
          {maintenanceUnits > 0 && (
            <button
              type="button"
              className={`pmv2-btn ${
                statusFilter === "maintenance"
                  ? "pmv2-btn-primary"
                  : "pmv2-btn-secondary"
              }`}
              style={pillStyle}
              onClick={() => setStatusFilter("maintenance")}
            >
              Maintenance ({maintenanceUnits})
            </button>
          )}
        </div>

        {/* Grid/List View Toggle */}
        {/* <div className="pmv2-view-toggle" style={{ marginLeft: "auto" }}>
          <button
            type="button"
            className={`pmv2-view-toggle-btn ${viewMode === "grid" ? "active" : ""}`}
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            type="button"
            className={`pmv2-view-toggle-btn ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
          >
            <List size={16} />
          </button>
        </div> */}
      </div>

      {/* Real-time availability synced notice */}
      <div
        style={{
          fontSize: 12,
          color: "#6B7280",
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 16,
        }}
      >
        {/* <span>
          ⇄ Showing{" "}
          {isDateFiltered
            ? `${viewRange.from} → ${viewRange.to}`
            : "today"}
        </span> */}

  <span>
  ⇄ Counts are overall · list shows{" "}
  {isDateFiltered ? `${fmtDMY(viewRange.from)} → ${fmtDMY(viewRange.to)}` : "today"}
</span>
      </div>

      {/* Room Grid or Loading Skeleton */}
      {isLoadingRooms && propertyRooms.length === 0 ? (
        <V2LoadingSkeleton type="cards" count={3} />
      ) : (
        <V2RoomGrid
          rooms={paginatedRooms}
          canCreate={canCreate}
          canUpdate={canUpdate}
          canDelete={canDelete}
          isFilterApplied={dateFilter.isApplied}
          onQuickBook={(room) => setQuickBookRoomTarget(room)}
          onViewDetails={(room) => setDrawerRoomTarget(room)}
          onEditRoom={(room) => setEditRoomTarget(room)}
          onDeleteRoom={(room) => setDeleteRoomTarget(room)}
          onClearDates={() => {
            if (property?.id) {
              clearAvailabilityDates(property.id, property.name);
            }
          }}
          onAddRoom={() => setIsAddRoomOpen(true)}
        />
      )}

      {/* Pagination Footer */}
{/* Pagination Footer */}
{filteredRooms.length > 0 && totalPages > 1 && (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 10,
      paddingTop: 16,
      borderTop: "1px solid #E5E7EB",
      marginTop: 20,
      fontSize: 13,
      color: "#6B7280",
    }}
  >
    <span>
      Showing {Math.min(startIndex + 1, filteredRooms.length)} to{" "}
      {Math.min(startIndex + itemsPerPage, filteredRooms.length)} of{" "}
      {filteredRooms.length} total rooms
    </span>
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onChange={setCurrentPage}
      windowSize={3}
    />
  </div>
)}

      {/* Quick Booking Modal */}
      <V2QuickBookingModal
        isOpen={Boolean(quickBookRoomTarget)}
        room={quickBookRoomTarget}
        initialDates={dateFilter.isApplied ? dateFilter : null}
        customers={customers}
        onClose={() => setQuickBookRoomTarget(null)}
        onConfirmBooking={quickBookRoom}
        onAddNewCustomer={addCustomer}
        onCheckAvailability={checkRoomAvailability}
      />

      {/* Room Details Right Drawer */}
      <V2RoomDetailsDrawer
        isOpen={Boolean(drawerRoomTarget)}
        canCreate={canCreate}
        canUpdate={canUpdate}
        canDelete={canDelete}
        room={drawerRoom}
        property={property}
        onClose={() => setDrawerRoomTarget(null)}
        onOpenQuickBook={(r) => {
          setDrawerRoomTarget(null);
          setQuickBookRoomTarget(r);
        }}
        onOpenCancelBooking={(r) => {
          setDrawerRoomTarget(null);
          setCancelBookingTarget(r);
        }}
  canCheckInNow={canCheckInNow}
  onCheckInGuest={(rId) => {
    if (!canCheckInNow) return;
    checkInGuest(rId, drawerRoom?.activeBooking?.roomBookingId);
    setDrawerRoomTarget(null);
  }}
        onCheckOutGuest={(rId) => {
          checkOutGuest(rId, drawerRoom?.activeBooking?.roomBookingId);
          setDrawerRoomTarget(null);
        }}
        onToggleMaintenance={(rId, isMaint) => {
          toggleRoomMaintenance(rId, isMaint);
          setDrawerRoomTarget(null);
        }}
        onUpdateDates={(rId, cin, cout) =>
          updateBookingDates(
            rId,
            cin,
            cout,
            drawerRoom?.activeBooking?.roomBookingId
          )
        }
      />

      {/* Cancel Booking Modal */}
      <V2CancelBookingModal
        isOpen={Boolean(cancelBookingTarget)}
        room={cancelBookingTarget}
        onClose={() => setCancelBookingTarget(null)}
        onConfirmCancel={(rId) =>
          cancelBooking(rId, cancelBookingTarget?.activeBooking?.roomBookingId)
        }
      />

      {/* Add Room Modal */}
      <V2AddRoomModal
        isOpen={isAddRoomOpen}
        property={property}
        onClose={() => setIsAddRoomOpen(false)}
        onSubmit={addRoom}
      />

      {/* Edit Room Modal */}
      <V2EditRoomModal
        isOpen={Boolean(editRoomTarget)}
        room={editRoomTarget}
        onClose={() => setEditRoomTarget(null)}
        onSubmit={editRoom}
      />

      {/* Delete Room Modal */}
      <V2DeleteRoomModal
        isOpen={Boolean(deleteRoomTarget)}
        room={deleteRoomTarget}
        onClose={() => setDeleteRoomTarget(null)}
        onConfirm={async (rmId) => {
          const ok = await deleteRoom(rmId);
          if (ok) setDeleteRoomTarget(null);
        }}
      />

      <ToastHost />
    </div>
  );
}

export default function PropertyManagementV2Rooms() {
  return (
    <PropertyManagementV2Provider>
      <RoomsContent />
    </PropertyManagementV2Provider>
  );
}