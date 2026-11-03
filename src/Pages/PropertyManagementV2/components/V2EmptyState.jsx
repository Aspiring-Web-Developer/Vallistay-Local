// src/Pages/PropertyManagementV2/components/V2EmptyState.jsx
import React from "react";
import { Building2, Plus } from "lucide-react";

export default function V2EmptyState({
  icon: Icon = Building2,
  title = "No properties found.",
  subtitle = "Add a property to start managing rooms and bookings.",
  actionText = "Add Property",
  onAction,
}) {
  return (
    <div className="pmv2-empty-state">
      <div className="pmv2-empty-icon">
        <Icon size={26} />
      </div>
      <h4 className="pmv2-empty-title">{title}</h4>
      <p className="pmv2-empty-subtitle">{subtitle}</p>
      {onAction && actionText && (
        <button
          type="button"
          onClick={onAction}
          className="pmv2-btn pmv2-btn-primary"
          style={{ marginTop: 8 }}
        >
          <Plus size={16} />
          {actionText}
        </button>
      )}
    </div>
  );
}
