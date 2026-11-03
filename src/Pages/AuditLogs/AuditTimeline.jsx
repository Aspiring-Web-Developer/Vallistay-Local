import React from "react";
import { Clock } from "lucide-react";
import AuditActionBadge from "./AuditActionBadge";
import BeforeAfterTable from "./BeforeAfterTable";
import { formatLabel } from "./utils/formatLabel";

// "Create operation performed on access_management." -> "... on Access Management."
const cleanDescription = (text) =>
  text ? text.replace(/\b[a-z]+(?:_[a-z]+)+\b/g, (m) => formatLabel(m)) : "";

export default function AuditTimeline({ events, onSelectEvent }) {
  if (!events || events.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
        No timeline events found for this filter criteria.
      </div>
    );
  }

  return (
    <div className="al-timeline">
      {events.map((event) => (
        <div key={event.audit_id} className="al-timeline-item">
          <div className="al-timeline-node">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563eb" }} />
          </div>

          <div
            className="al-timeline-card"
            onClick={() => onSelectEvent(event)}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <AuditActionBadge action={event.action} />
                <span className="al-module-pill">{formatLabel(event.module_name)}</span>
                <span style={{ fontWeight: 700, color: "#2563eb", fontSize: "12.5px" }}>
                  {event.resource_display_id}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "12px", color: "#64748b" }}>
                <Clock size={13} />
                <span>{event.formatted_date}</span>
                {event.time_ago && <span>({event.time_ago})</span>}
              </div>
            </div>

            <p style={{ margin: "0 0 10px 0", fontSize: "13.5px", color: "#1e293b", fontWeight: 500 }}>
              {cleanDescription(event.description)}
            </p>

            {event.changed_fields && event.changed_fields.length > 0 && (
              <div onClick={(e) => e.stopPropagation()}>
                <BeforeAfterTable
                  action={event.action}
                  changedFields={event.changed_fields}
                  oldValue={event.old_value}
                  newValue={event.new_value}
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}