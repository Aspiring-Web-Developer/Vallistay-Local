// src/Pages/PropertyManagementV2/components/V2PropertySearchBar.jsx
import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, LayoutGrid, List, ArrowDownUp } from "lucide-react";

export default function V2PropertySearchBar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
  viewMode = "grid",
  onViewModeChange,
}) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (name) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
    // { value: "Maintenance", label: "Maintenance" },
  ];

  const typeOptions = [
    { value: "all", label: "All Types" },
    { value: "Boutique Hotel", label: "Boutique Hotel" },
    { value: "Heritage Stay", label: "Heritage Stay" },
    { value: "Luxury Villa", label: "Luxury Villa" },
  ];

  const currentStatusLabel =
    statusOptions.find((o) => o.value === statusFilter)?.label || "All Statuses";
  const currentTypeLabel =
    typeOptions.find((o) => o.value === typeFilter)?.label || "All Types";

  return (
    <div className="pmv2-filter-bar" ref={containerRef}>
      {/* Search Input */}
      <div className="pmv2-search-input-wrap">
        <Search size={16} className="pmv2-search-icon" />
        <input
          type="text"
          className="pmv2-search-input"
          placeholder="Search by property name or property code..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Status Filter Custom Select */}
      <div style={{ position: "relative" }}>
        <button
          type="button"
          className="pmv2-select-trigger"
          onClick={() => toggleDropdown("status")}
        >
          <span>{currentStatusLabel}</span>
          <ChevronDown size={14} style={{ color: "#9CA3AF" }} />
        </button>

        {openDropdown === "status" && (
          <div className="pmv2-dropdown-menu">
            {statusOptions.map((opt) => (
              <div
                key={opt.value}
                className={`pmv2-dropdown-item ${statusFilter === opt.value ? "active" : ""}`}
                onClick={() => {
                  onStatusChange(opt.value);
                  setOpenDropdown(null);
                }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Type Filter Custom Select */}
      <div style={{ position: "relative" }}>
        {/* <button
          type="button"
          className="pmv2-select-trigger"
          onClick={() => toggleDropdown("type")}
        >
          <span>{currentTypeLabel}</span>
          <ChevronDown size={14} style={{ color: "#9CA3AF" }} />
        </button> */}

        {openDropdown === "type" && (
          <div className="pmv2-dropdown-menu">
            {typeOptions.map((opt) => (
              <div
                key={opt.value}
                className={`pmv2-dropdown-item ${typeFilter === opt.value ? "active" : ""}`}
                onClick={() => {
                  onTypeChange(opt.value);
                  setOpenDropdown(null);
                }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grid / List Toggle */}
      {/* <div className="pmv2-view-toggle" style={{ marginLeft: "auto" }}>
        <button
          type="button"
          className={`pmv2-view-toggle-btn ${viewMode === "grid" ? "active" : ""}`}
          onClick={() => onViewModeChange && onViewModeChange("grid")}
          title="Grid View"
        >
          <LayoutGrid size={16} />
        </button>
        <button
          type="button"
          className={`pmv2-view-toggle-btn ${viewMode === "list" ? "active" : ""}`}
          onClick={() => onViewModeChange && onViewModeChange("list")}
          title="List View"
        >
          <List size={16} />
        </button>
      </div> */}
    </div>
  );
}
