// src/Pages/PropertyManagementV2/components/V2PropertyCard.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  MapPin,
  MoreVertical,
  ArrowRight,
  BedDouble,
  Edit2,
  Trash2,
  Eye,
  DoorOpen,
} from "lucide-react";
import V2StatusBadge from "./V2StatusBadge";

import { ClipboardList } from "lucide-react";

export default function V2PropertyCard({
  property,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
}) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleViewProperty = () => {
    navigate(`/property-management-v2/property/${property.id}`);
  };

  const handleManageRooms = () => {
    navigate(`/property-management-v2/property/${property.id}/rooms`);
  };

  const availablePct =
    property.totalRooms > 0
      ? Math.round((property.availableRooms / property.totalRooms) * 100)
      : 0;

  return (
    <div className="pmv2-property-card">
      {/* Top Header */}
      <div className="pmv2-property-card-top">
        <div className="pmv2-property-card-icon-box">
          <Building2 size={22} />
        </div>

        <div className="pmv2-property-card-top-right">
          <V2StatusBadge status={property.status} />

          {/* More options menu */}
          <div style={{ position: "relative" }} ref={menuRef}>
           {canEdit && (
                  <div
                    className="pmv2-dropdown-item"
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit && onEdit(property);
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Edit2 size={14} /> 
                    </span>
                  </div>
                )}

 
          </div>
        </div>
      </div>

      {/* Property Code Tag */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 2 }}>
        <span className="pmv2-property-code-tag">
          {property.propertyCodeTag || `#${property.code}-01`}
        </span>
      </div>

      {/* Property Name */}
      <h3 className="pmv2-property-title">
        {property.shortName || property.name}
      </h3>

      {/* Location */}
      <div className="pmv2-property-location">
        <MapPin size={13} style={{ color: "#9CA3AF", flexShrink: 0 }} />
        <span>{property.type} • {property.city || property.location}</span>
      </div>

      {/* Metrics Grid */}
      <div className="pmv2-property-metrics-grid">
        <div className="pmv2-property-metric-cell">
          <span className="pmv2-property-metric-label">Total Rooms</span>
          <span className="pmv2-property-metric-val">{property.totalRooms}</span>
        </div>
        <div className="pmv2-property-metric-cell">
          <span className="pmv2-property-metric-label">Available</span>
          <span className="pmv2-property-metric-val">
            {property.availableRooms}
            {property.totalRooms > 0 && (
              <span className="pmv2-property-metric-sub">({availablePct}%)</span>
            )}
          </span>
        </div>
        <div className="pmv2-property-metric-cell">
          <span className="pmv2-property-metric-label">Occupied</span>
          <span className="pmv2-property-metric-val">{property.occupiedRooms}</span>
        </div>
        <div className="pmv2-property-metric-cell">
          <span className="pmv2-property-metric-label">Upcoming</span>
          <span className="pmv2-property-metric-val">{property.activeBookings}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pmv2-property-card-actions">
        <button
          type="button"
          // className="pmv2-btn pmv2-btn-outline"
           className="pmv2-btn pmv2-btn-primary"
          onClick={handleManageRooms}
        >
          <BedDouble size={16} />
          <span>View Rooms</span>
        </button>

        {/* <button
          type="button"
          className="pmv2-btn pmv2-btn-primary"
          onClick={handleViewProperty}
        >
          <span>View Details</span>
          <ArrowRight size={15} />
        </button> */}
      </div>
    </div>
  );
}
