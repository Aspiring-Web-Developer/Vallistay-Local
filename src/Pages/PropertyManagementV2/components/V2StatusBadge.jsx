// src/Pages/PropertyManagementV2/components/V2StatusBadge.jsx
import React from "react";
import { formatStatusLabel } from "../utils/formatUtils";

export default function V2StatusBadge({ status, className = "" }) {
  if (!status) return null;
  const normalized = status.toLowerCase();

  return (
    <span className={`pmv2-badge pmv2-badge-${normalized} ${className}`}>
      <span className="pmv2-badge-dot" />
      {formatStatusLabel(status)}
    </span>
  );
}
