// src/Pages/PropertyManagementV2/PropertyManagementV2Overview.jsx
import React, { useState, useMemo, useEffect } from "react";
import {
  Building2,
  BedDouble,
  CheckCircle2,
  CalendarDays,
  Wrench,
  ArrowRight,
} from "lucide-react";
import {
  usePropertyManagementV2,
  PropertyManagementV2Provider,
} from "./context/PropertyManagementV2Context";
import V2PageHeader from "./components/V2PageHeader";
import V2SummaryCard from "./components/V2SummaryCard";
import V2PropertySearchBar from "./components/V2PropertySearchBar";
import V2PropertyList from "./components/V2PropertyList";
import V2AddPropertyModal from "./components/V2AddPropertyModal";
import V2EditPropertyModal from "./components/V2EditPropertyModal";
import V2DeletePropertyModal from "./components/V2DeletePropertyModal";
import V2LoadingSkeleton from "./components/V2LoadingSkeleton";
import "./styles/propertyManagementV2.css";
import { useAccess } from "../../services/AccessContext";


function OverviewContent() {
  const {
    properties,
    summaryStats,
    isLoadingProperties,
    fetchProperties,
    addProperty,
    editProperty,
    deleteProperty,
  } = usePropertyManagementV2();

    const { can } = useAccess();
  const canCreate = can("room_booking", "create");
  const canUpdate = can("room_booking", "update");
  const canDelete = can("room_booking", "delete");
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filtered properties
  const filteredProperties = useMemo(() => {
    return properties.filter((prop) => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        (prop.name && prop.name.toLowerCase().includes(q)) ||
        (prop.code && prop.code.toLowerCase().includes(q)) ||
        (prop.location && prop.location.toLowerCase().includes(q));

      const matchStatus =
        statusFilter === "all" ||
        prop.status?.toLowerCase() === statusFilter.toLowerCase();

      const matchType =
        typeFilter === "all" ||
        prop.type?.toLowerCase() === typeFilter.toLowerCase();

      return matchSearch && matchStatus && matchType;
    });
  }, [properties, searchTerm, statusFilter, typeFilter]);

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter]);

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProperties = filteredProperties.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const maintenanceProperty = properties.find((p) => p.status === "Maintenance");

  return (
    <div className="pmv2-container">
      {/* Header */}
      <V2PageHeader
        title="Property Management"
        subtitle="Manage properties, rooms, availability, and guest bookings."
                primaryActionText={canCreate ? "Add Property" : undefined}
        onPrimaryAction={canCreate ? () => setIsAddOpen(true) : undefined}
   
        // showExport={true}
        onRefresh={() => {
          setSearchTerm("");
          setStatusFilter("all");
          setTypeFilter("all");
          fetchProperties();
        }}
      />

      {/* 4 Summary Cards */}
      <div className="pmv2-summary-grid">
        <V2SummaryCard
          label="Total Properties"
          value={summaryStats.totalProperties}
          tag="Portfolios"
          subtext=""
          icon={Building2}
          colorScheme="blue"
        />
        <V2SummaryCard
          label="Total Rooms"
          value={summaryStats.totalRooms}
          tag="Inventory"
          subtext=""
          icon={BedDouble}
          colorScheme="purple"
        />
        <V2SummaryCard
          label="Available Rooms"
          value={summaryStats.availableRooms}
          tag="Ready"
          // subtext="Ready for check-in"
          icon={CheckCircle2}
          colorScheme="green"
        />
        <V2SummaryCard
          label="Active Bookings"
          value={summaryStats.activeBookings}
          tag="Occupied"
          // subtext="Current checked-in & booked"
          icon={CalendarDays}
          colorScheme="orange"
        />
      </div>

      {/* Filter and Search Bar */}
      <V2PropertySearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Property Cards Collection or Loading Skeleton */}
      {isLoadingProperties && properties.length === 0 ? (
        <V2LoadingSkeleton type="cards" count={3} />
      ) : (
        <V2PropertyList
          properties={paginatedProperties}
          viewMode={viewMode}
          canEdit={canUpdate}
          canDelete={canDelete}
          canAdd={canCreate}
          onEditProperty={(prop) => setEditTarget(prop)}
          onDeleteProperty={(prop) => setDeleteTarget(prop)}
          onAddProperty={() => setIsAddOpen(true)}
        />
      )}

      {/* Functional Pagination */}
      {filteredProperties.length > itemsPerPage && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 16,
            borderTop: "1px solid #E5E7EB",
            marginTop: 20,
            fontSize: 13,
            color: "#6B7280",
          }}
        >
          <span>
            Showing {Math.min(startIndex + 1, filteredProperties.length)} to{" "}
            {Math.min(startIndex + itemsPerPage, filteredProperties.length)} of{" "}
            {filteredProperties.length} properties
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              type="button"
              className="pmv2-btn pmv2-btn-secondary"
              style={{ height: 32, padding: "0 10px", fontSize: 12 }}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx + 1}
                type="button"
                className={`pmv2-btn ${currentPage === idx + 1 ? "pmv2-btn-primary" : "pmv2-btn-secondary"}`}
                style={{ height: 32, width: 32, padding: 0, fontSize: 12 }}
                onClick={() => setCurrentPage(idx + 1)}
              >
                {idx + 1}
              </button>
            ))}
            <button
              type="button"
              className="pmv2-btn pmv2-btn-secondary"
              style={{ height: 32, padding: "0 10px", fontSize: 12 }}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Scheduled Deep Clean Notice Banner matching Screenshot 1 */}
      {maintenanceProperty && (
        <div className="pmv2-maintenance-banner">
          <div className="pmv2-maintenance-banner-left">
            <div className="pmv2-maintenance-icon">
              <Wrench size={18} />
            </div>
            <div>
              <h5 className="pmv2-maintenance-title">
                Scheduled Maintenance: {maintenanceProperty.name}
              </h5>
              <p className="pmv2-maintenance-text">
                Facility inspection and servicing in progress. Keys temporarily held.
              </p>
            </div>
          </div>
          <span className="pmv2-maintenance-link">
            Review Maintenance Schedule <ArrowRight size={14} />
          </span>
        </div>
      )}

      {/* Add Property Modal */}
      <V2AddPropertyModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={addProperty}
      />

      {/* Edit Property Modal */}
      <V2EditPropertyModal
        isOpen={Boolean(editTarget)}
        property={editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={editProperty}
      />

      {/* Delete Property Modal */}
      <V2DeletePropertyModal
        isOpen={Boolean(deleteTarget)}
        property={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={(propId) => {
          const ok = deleteProperty(propId);
          if (ok) setDeleteTarget(null);
        }}
      />
    </div>
  );
}

export default function PropertyManagementV2Overview() {
  return (
    <PropertyManagementV2Provider>
      <OverviewContent />
    </PropertyManagementV2Provider>
  );
}
