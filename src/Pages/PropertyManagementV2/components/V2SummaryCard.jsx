// src/Pages/PropertyManagementV2/components/V2SummaryCard.jsx
import React from "react";

export default function V2SummaryCard({
  label,
  value,
  tag,
  subtext,
  icon: Icon,
  colorScheme = "blue", // "blue" | "green" | "purple" | "orange"
}) {
  return (
    <div className="pmv2-summary-card">
      <div className="pmv2-summary-header">
        <span className="pmv2-summary-label">{label}</span>
        {Icon && (
          <div className={`pmv2-summary-icon ${colorScheme}`}>
            <Icon size={20} />
          </div>
        )}
      </div>

      <div className="pmv2-summary-body">
        <span className="pmv2-summary-value">{value}</span>
        {tag && <span className="pmv2-summary-tag">{tag}</span>}
      </div>

      {subtext && <div className="pmv2-summary-sub">{subtext}</div>}
    </div>
  );
}
