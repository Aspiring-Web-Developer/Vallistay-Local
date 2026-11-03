


// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { X, FileText, Table, Download, Eye } from "lucide-react";
// import { downloadReportPdf } from "./utils/auditPdf";

// const RANGE_LABELS = {
//   today: "Last 24 hours",
//   last_7_days: "Last 7 days",
//   last_30_days: "Last 30 days",
//   all: "All records",
// };

// const filterEventsByRange = (events, range) => {
//   if (range === "all") return events;
//   const days = { today: 1, last_7_days: 7, last_30_days: 30 }[range];
//   if (!days) return events;
//   const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
//   return events.filter((ev) => !ev.created_ts || ev.created_ts >= cutoff);
// };

// export default function ExportAuditModal({
//   isOpen,
//   onClose,
//   defaultFormat = "pdf",
//   events = [],
//   toast = () => {},
// }) {
//   const navigate = useNavigate();
//   const [format, setFormat] = useState(defaultFormat);
//   const [dateRange, setDateRange] = useState("all");
//   const [includeDiffs, setIncludeDiffs] = useState(true);
//   const [isExporting, setIsExporting] = useState(false);

//   if (!isOpen) return null;

//   const scopedEvents = filterEventsByRange(events, dateRange);

//   const handleDownload = async () => {
//     setIsExporting(true);
//     try {
//       if (scopedEvents.length === 0) {
//         toast("No events found for the selected date range.", "error");
//         return;
//       }

//       if (format === "pdf") {
//         await downloadReportPdf(scopedEvents, {
//           includeDiffs,
//           rangeLabel: RANGE_LABELS[dateRange],
//         });
//       } else {
//         const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
//         const headers = ["Date & Time", "Performed By", "Email", "Role", "Module", "Action", "Description", "Status"];
//         const rows = scopedEvents.map((ev) =>
//           [ev.formatted_date, ev.performed_by_name, ev.performed_by_email, ev.performed_by_role,
//            ev.module_name, ev.action_label, ev.description, ev.status].map(esc).join(",")
//         );
//         const blob = new Blob(["\uFEFF" + [headers.map(esc).join(","), ...rows].join("\n")], {
//           type: "text/csv;charset=utf-8;",
//         });
//         const url = URL.createObjectURL(blob);
//         const a = document.createElement("a");
//         a.href = url;
//         a.download = "ValliStay_Audit_Report.csv";
//         a.click();
//         URL.revokeObjectURL(url);
//       }

//       onClose();
//       toast(`Export (${format.toUpperCase()}) downloaded successfully!`, "success");
//     } catch (err) {
//       console.error(err);
//       toast(`Export failed: ${err?.message || "unknown error"}`, "error");
//     } finally {
//       setIsExporting(false);
//     }
//   };

//   const handlePreview = () => {
//     onClose();
//     navigate("/audit-logs/report-preview");
//   };

//   const formatCard = (key, Icon, title, sub) => (
//     <div
//       onClick={() => setFormat(key)}
//       style={{
//         border: `1.5px solid ${format === key ? "#2563eb" : "#e2e8f0"}`,
//         background: format === key ? "#eff6ff" : "#ffffff",
//         padding: 12, borderRadius: 10, cursor: "pointer",
//         display: "flex", alignItems: "center", gap: 10,
//       }}
//     >
//       <Icon size={20} color={format === key ? "#2563eb" : "#64748b"} />
//       <div>
//         <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{title}</div>
//         <div style={{ fontSize: 11, color: "#64748b" }}>{sub}</div>
//       </div>
//     </div>
//   );

//   return (
//     <>
//       <div className="al-drawer-backdrop" onClick={onClose} />
//       <div
//         style={{
//           position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
//           width: 480, maxWidth: "92vw", background: "#ffffff", borderRadius: 16,
//           boxShadow: "0 20px 40px rgba(0,0,0,0.2)", zIndex: 1070, overflow: "hidden",
//         }}
//       >
//         {/* Header */}
//         <div style={{ padding: "18px 24px", borderBottom: "1px solid #eef2f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//           <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//             <div style={{ width: 34, height: 34, borderRadius: 8, background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
//               <FileText size={18} />
//             </div>
//             <div>
//               <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>Export Audit Trail</h3>
//               <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>Download your audit logs as PDF or CSV</p>
//             </div>
//           </div>
//           <button type="button" onClick={onClose} className="al-drawer-close">
//             <X size={16} />
//           </button>
//         </div>

//         {/* Body */}
//         <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
//           <div>
//             <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 8 }}>
//               Export Format
//             </label>
//             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
//               {formatCard("pdf", FileText, "PDF Document", "Print & share")}
//               {formatCard("csv", Table, "CSV / Excel", "Raw spreadsheet")}
//             </div>
//           </div>

//           <div>
//             <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
//               Date Range
//             </label>
//             <select
//               className="al-filter-select"
//               style={{ width: "100%", padding: "9px 12px" }}
//               value={dateRange}
//               onChange={(e) => setDateRange(e.target.value)}
//             >
//               <option value="today">Today (Past 24 Hours)</option>
//               <option value="last_7_days">Last 7 Days</option>
//               <option value="last_30_days">Last 30 Days</option>
//               <option value="all">{`All Records (${events.length} events)`}</option>
//             </select>
//             <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>
//               {scopedEvents.length} event{scopedEvents.length !== 1 ? "s" : ""} match this range.
//             </p>
//           </div>

//           {format === "pdf" && (
//             <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 12 }}>
//               <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#334155", cursor: "pointer" }}>
//                 <input
//                   type="checkbox"
//                   checked={includeDiffs}
//                   onChange={(e) => setIncludeDiffs(e.target.checked)}
//                   style={{ accentColor: "#2563eb", width: 16, height: 16 }}
//                 />
//                 Include change details (before &amp; after)
//               </label>
//             </div>
//           )}
//         </div>

//         {/* Footer */}
//         <div style={{ padding: "16px 24px", background: "#fafbfc", borderTop: "1px solid #eef2f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//           <button type="button" className="al-btn-action" onClick={handlePreview}>
//             <Eye size={14} /> Preview Report
//           </button>
//           <div style={{ display: "flex", gap: 10 }}>
//             <button type="button" className="al-btn-action" onClick={onClose}>Cancel</button>
//             <button
//               type="button"
//               className="al-btn-action"
//               style={{ background: "#2563eb", color: "#ffffff", borderColor: "#2563eb" }}
//               onClick={handleDownload}
//               disabled={isExporting}
//             >
//               <Download size={14} />
//               {isExporting ? "Generating..." : "Download Export"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }



















import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, FileText, Table, Download, Eye } from "lucide-react";
import { downloadReportPdf } from "./utils/auditPdf";

const RANGE_LABELS = {
  today: "Last 24 hours",
  last_7_days: "Last 7 days",
  last_30_days: "Last 30 days",
  all: "All records",
};

const filterEventsByRange = (events, range) => {
  if (range === "all") return events;
  const days = { today: 1, last_7_days: 7, last_30_days: 30 }[range];
  if (!days) return events;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return events.filter((ev) => !ev.created_ts || ev.created_ts >= cutoff);
};

export default function ExportAuditModal({
  isOpen,
  onClose,
  defaultFormat = "pdf",
  events = [],
  toast = () => {},
}) {
  const navigate = useNavigate();
  const [format, setFormat] = useState(defaultFormat);
  const [dateRange, setDateRange] = useState("all");
  const [includeDiffs, setIncludeDiffs] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const scopedEvents = filterEventsByRange(events, dateRange);

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      if (scopedEvents.length === 0) {
        toast("No events found for the selected date range.", "error");
        return;
      }

      if (format === "pdf") {
        await downloadReportPdf(scopedEvents, {
          includeDiffs,
          rangeLabel: RANGE_LABELS[dateRange],
        });
      } else {
        const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
        const headers = ["Date & Time", "Performed By", "Email", "Role", "Module", "Action", "Description", "Status"];
        const rows = scopedEvents.map((ev) =>
          [ev.formatted_date, ev.performed_by_name, ev.performed_by_email, ev.performed_by_role,
           ev.module_name, ev.action_label, ev.description, ev.status].map(esc).join(",")
        );
        const blob = new Blob(["\uFEFF" + [headers.map(esc).join(","), ...rows].join("\n")], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "ValliStay_Audit_Report.csv";
        a.click();
        URL.revokeObjectURL(url);
      }

      onClose();
      toast(`Export (${format.toUpperCase()}) downloaded successfully!`, "success");
    } catch (err) {
      console.error(err);
      toast(`Export failed: ${err?.message || "unknown error"}`, "error");
    } finally {
      setIsExporting(false);
    }
  };

  const handlePreview = () => {
    onClose();
    navigate("/audit-logs/report-preview");
  };

  const formatCard = (key, Icon, title, sub) => (
    <button
      type="button"
      onClick={() => setFormat(key)}
      className={`al-format-card ${format === key ? "is-active" : ""}`}
      aria-pressed={format === key}
    >
      <Icon size={20} color={format === key ? "#2563eb" : "#64748b"} />
      <div>
        <div className="al-format-title">{title}</div>
        <div className="al-format-sub">{sub}</div>
      </div>
    </button>
  );

  return (
    <>
      <div className="al-drawer-backdrop" onClick={onClose} />
      <div className="al-modal" role="dialog" aria-modal="true" aria-label="Export audit trail">
        {/* Header */}
        <div className="al-modal-head">
          <div className="al-modal-title-group">
            <div className="al-modal-icon">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="al-modal-title">Export Audit Trail</h3>
              <p className="al-modal-sub">Download your audit logs as PDF or CSV</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="al-drawer-close" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="al-modal-body">
          <div>
            <label className="al-modal-label">Export Format</label>
            <div className="al-format-grid">
              {formatCard("pdf", FileText, "PDF Document", "Print & share")}
              {formatCard("csv", Table, "CSV / Excel", "Raw spreadsheet")}
            </div>
          </div>

          <div>
            <label className="al-modal-label">Date Range</label>
            <select
              className="al-filter-select"
              style={{ width: "100%", padding: "9px 12px" }}
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="today">Today (Past 24 Hours)</option>
              <option value="last_7_days">Last 7 Days</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="all">{`All Records (${events.length} events)`}</option>
            </select>
            <p className="al-modal-hint">
              {scopedEvents.length} event{scopedEvents.length !== 1 ? "s" : ""} match this range.
            </p>
          </div>

          {format === "pdf" && (
            <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 12 }}>
              <label className="al-modal-check">
                <input
                  type="checkbox"
                  checked={includeDiffs}
                  onChange={(e) => setIncludeDiffs(e.target.checked)}
                  style={{ accentColor: "#2563eb", width: 16, height: 16 }}
                />
                Include change details (before &amp; after)
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="al-modal-foot">
          <button type="button" className="al-btn-action" onClick={handlePreview}>
            <Eye size={14} /> Preview Report
          </button>
          <div className="al-modal-foot-actions">
            <button type="button" className="al-btn-action" onClick={onClose}>Cancel</button>
            <button
              type="button"
              className="al-btn-action"
              style={{ background: "#2563eb", color: "#ffffff", borderColor: "#2563eb" }}
              onClick={handleDownload}
              disabled={isExporting}
            >
              <Download size={14} />
              {isExporting ? "Generating..." : "Download Export"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}