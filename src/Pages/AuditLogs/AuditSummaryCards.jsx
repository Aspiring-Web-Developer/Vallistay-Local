import React from "react";
import {
  Layers,
  Clock,
  PlusCircle,
  Edit3,
  Trash2,
  AlertCircle,
} from "lucide-react";

export default function AuditSummaryCards({ stats = {} }) {
  const data = {
    totalEvents: "0", todayEvents: "0", creates: "0",
    updates: "0", deletes: "0", failedActions: "0",
    ...stats,
  };
  return (
    <div className="al-summary-grid">
      {/* Total Events */}
      <div className="al-summary-card">
        <div className="al-card-top">
          <span className="al-card-label">Total Events</span>
          <div className="al-card-icon" style={{ background: "#eff6ff", color: "#2563eb" }}>
            <Layers size={15} />
          </div>
        </div>
        <div className="al-card-value">{data.totalEvents}</div>
        <div className="al-card-subtext highlight-green">
          <span>↑</span> +18% this month
        </div>
      </div>

      {/* Today's Events */}
      <div className="al-summary-card">
        <div className="al-card-top">
          <span className="al-card-label">Today's Events</span>
          <div className="al-card-icon" style={{ background: "#f5f3ff", color: "#8b5cf6" }}>
            <Clock size={15} />
          </div>
        </div>
        <div className="al-card-value">{data.todayEvents}</div>
        <div className="al-card-subtext">
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a", display: "inline-block" }} />
          Active monitoring
        </div>
      </div>

      {/* Creates */}
      <div className="al-summary-card">
        <div className="al-card-top">
          <span className="al-card-label">Creates</span>
          <div className="al-card-icon" style={{ background: "#ecfdf5", color: "#10b981" }}>
            <PlusCircle size={15} />
          </div>
        </div>
        <div className="al-card-value">{data.creates}</div>
        <div className="al-card-subtext">
          New records gener...
        </div>
      </div>

      {/* Updates */}
      <div className="al-summary-card">
        <div className="al-card-top">
          <span className="al-card-label">Updates</span>
          <div className="al-card-icon" style={{ background: "#eff6ff", color: "#0284c7" }}>
            <Edit3 size={15} />
          </div>
        </div>
        <div className="al-card-value">{data.updates}</div>
        <div className="al-card-subtext">
          Modifications logged
        </div>
      </div>

      {/* Deletes */}
      <div className="al-summary-card">
        <div className="al-card-top">
          <span className="al-card-label">Deletes</span>
          <div className="al-card-icon" style={{ background: "#fef2f2", color: "#dc2626" }}>
            <Trash2 size={15} />
          </div>
        </div>
        <div className="al-card-value">{data.deletes}</div>
        <div className="al-card-subtext">
          Records removed
        </div>
      </div>

      {/* Failed Actions */}
      <div className="al-summary-card">
        <div className="al-card-top">
          <span className="al-card-label">Failed Actions</span>
          <div className="al-card-icon" style={{ background: "#fffbeb", color: "#d97706" }}>
            <AlertCircle size={15} />
          </div>
        </div>
        <div className="al-card-value">{data.failedActions}</div>
        <div className="al-card-subtext highlight-red">
          Needs attention / al...
        </div>
      </div>
    </div>
  );
}
