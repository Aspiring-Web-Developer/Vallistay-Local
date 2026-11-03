import React, { useState, useEffect, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Download,
  List,
  GitCommit,
  Search,
  RotateCw, 
  AlertCircle,
  Clock,
} from "lucide-react";
import { useToast } from "../Stays/Rooms/Room_Shared";
import "./AuditLogs.css";
import { fetchUserAuditLogs } from "./services/auditLogsApi";
import { fetchUserById } from "../AccessManagement/services/accessManagementApi";
import AuditTable from "./AuditTable";
import AuditTimeline from "./AuditTimeline";
import AuditEventDrawer from "./AuditEventDrawer";
import ExportAuditModal from "./ExportAuditModal";
import { useAccess } from "../../services/AccessContext";

import { downloadEventPdf } from "./utils/auditPdf";

export default function UserAuditLogs() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { push: toast, ToastHost } = useToast();
const { can } = useAccess();
const canExport = can("audit_logs", "export");
  const [userEvents, setUserEvents] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [viewMode, setViewMode] = useState("timeline"); // 'timeline' | 'table'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");

  const loadUserDataAndLogs = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch user profile metadata
      try {
        const u = await fetchUserById(userId);
        setUserDetails(u);
      } catch (uErr) {
        console.warn("Could not load user profile details:", uErr);
      }

      // 2. Fetch user's audit logs via GET /changes_history/list_changes_history?user_id=<UUID>
      const logs = await fetchUserAuditLogs(userId);
      setUserEvents(logs);
    } catch (err) {
      console.error("Failed to load user audit trail:", err);
      setError(err?.message || "We couldn’t load this user’s activity.");
      toast("We couldn’t load this user’s activity.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserDataAndLogs();
  }, [userId]);

  // Filtered user events
  const filteredEvents = useMemo(() => {
    return userEvents.filter((ev) => {
      const matchesSearch =
        searchTerm === "" ||
        ev.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.resource_display_id?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesModule =
        moduleFilter === "all" || ev.module_key === moduleFilter;

      const matchesAction =
        actionFilter === "all" || ev.action === actionFilter;

      return matchesSearch && matchesModule && matchesAction;
    });
  }, [userEvents, searchTerm, moduleFilter, actionFilter]);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setIsDrawerOpen(true);
  };

  const handleCopyId = (auditId) => {
    navigator.clipboard.writeText(auditId);
    toast("Copied Event ID to clipboard!", "success");
  };

  // const handleDownloadEventPdf = async (event) => {
  //   try {
  //     const { jsPDF } = await import("jspdf");
  //     const { default: autoTable } = await import("jspdf-autotable");

  //     const doc = new jsPDF({
  //       orientation: "portrait",
  //       unit: "mm",
  //       format: "a4",
  //     });

  //     doc.setFillColor(37, 99, 235);
  //     doc.rect(0, 0, 210, 8, "F");

  //     doc.setFont("helvetica", "bold");
  //     doc.setFontSize(14);
  //     doc.setTextColor(15, 23, 42);
  //     doc.text("Valli Stay - User Activity Receipt", 14, 20);

  //     doc.setFont("helvetica", "normal");
  //     doc.setFontSize(9);
  //     doc.setTextColor(100, 116, 139);
  //     doc.text(`Event UUID: ${event.audit_id} • User: ${userDetails?.full_name || event.performed_by_name}`, 14, 26);

  //     const eventRows = [
  //       ["Record Display ID", event.resource_display_id],
  //       ["Target Module", event.module_name],
  //       ["Action Performed", event.action.toUpperCase()],
  //       ["Performed By", `${event.performed_by_name} (${event.performed_by_email})`],
  //       ["User Role", event.performed_by_role || "User"],
  //       ["Execution Status", event.status.toUpperCase()],
  //       ["Timestamp", event.formatted_date],
  //       ["Description", event.description],
  //     ];

  //     autoTable(doc, {
  //       startY: 32,
  //       head: [["Field", "Value"]],
  //       body: eventRows,
  //       theme: "striped",
  //       headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: "bold" },
  //       styles: { fontSize: 8.5, cellPadding: 3 },
  //     });

  //     doc.save(`ValliStay_Event_${event.resource_display_id}.pdf`);
  //     toast(`Downloaded receipt for ${event.resource_display_id}!`, "success");
  //   } catch (err) {
  //     console.error(err);
  //     toast("Error downloading event PDF.", "error");
  //   }
  // };


  const handleDownloadEventPdf = async (event) => {
    if (!canExport) return;
  try {
    await downloadEventPdf(event, "User Activity Report");
    toast("Activity receipt downloaded.", "success");
  } catch (err) {
    console.error(err);
    toast("Error downloading event PDF.", "error");
  }
};
  const displayName = userDetails?.full_name || (userEvents[0]?.performed_by_name) || "User Activity";
  const displayEmail = userDetails?.email || (userEvents[0]?.performed_by_email) || "—";
  const displayRole = userDetails?.role_title || userDetails?.user_type || (userEvents[0]?.performed_by_role) || "User";
  const displayMobile = userDetails?.mobile || "—";
  const displayAvatar = userDetails?.avatar || (userEvents[0]?.performed_by_avatar) || "U";

  return (
    <div className="al-container">
      <ToastHost />

      {/* Breadcrumb */}
      {/* <div className="al-breadcrumb">
        <Link to="/audit-logs">Audit Logs</Link>
        <span>/</span>
        <span style={{ color: "#0f172a", fontWeight: 600 }}>User Activity Trail</span>
      </div> */}

      {/* Header */}
      <div className="al-header">
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <button
            type="button"
            className="al-btn-action"
            onClick={() => navigate("/audit-logs")}
            style={{ padding: "8px 10px" }}
            title="Back to all audit logs"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="al-title">User Audit Trail: {displayName}</h1>
            {/* <p className="al-subtitle">
              Granular activity logs, mutation history, and compliance records for this staff member.
            </p> */}
          </div>
        </div>

        <div className="al-header-actions">
{canExport && (
  <>
    <Link to="/audit-logs/report-preview" className="al-btn-action">
      <FileText size={15} color="#ea580c" /> Report Preview
    </Link>
    <button type="button" className="al-btn-action" onClick={() => setIsExportModalOpen(true)}>
      <Download size={15} color="#16a34a" /> Download Excel / PDF
    </button>
  </>
)}

        </div>
      </div>

      {/* User Banner Card */}
      <div className="am-profile-banner" style={{ marginBottom: 20 }}>
        <div className="am-profile-left">
          <div className="al-avatar-circle" style={{ width: 56, height: 56, fontSize: 20 }}>
            {displayAvatar}
          </div>
          <div className="am-profile-info">
            <div className="am-profile-name-row">
              <span className="am-profile-name">{displayName}</span>
              <span className="am-status-badge am-status-active">
                <span className="am-status-dot" />
                Active
              </span>
              <span className="am-role-badge am-role-user">
                {displayRole}
              </span>
            </div>
            <div className="am-profile-meta-row">
              <span>{displayEmail}</span>
              <span>•</span>
              <span>{displayMobile}</span>
            </div>
            <div className="am-profile-submeta">
              <span>User ID: {userId}</span>
            </div>
          </div>
        </div>

        <div className="am-profile-stats">
          <div className="am-stat-box">
            <span className="am-stat-label">Total Activities</span>
            <span className="am-stat-val primary">{userEvents.length} Events</span>
          </div>
          <div className="am-stat-box">
            <span className="am-stat-label">Last Operation</span>
            <span className="am-stat-val">{userEvents[0]?.formatted_date || "—"}</span>
          </div>
          <div className="am-stat-box">
            <span className="am-stat-label">Audit Status</span>
            <span className="am-stat-val" style={{ color: "#16a34a" }}>Verified</span>
          </div>
        </div>
      </div>

      {/* Controls Bar: Search, Filters & View Toggle */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #eef2f6",
          borderRadius: "12px",
          padding: "12px 16px",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 260 }}>
          <div className="al-search-wrap" style={{ flex: 1 }}>
            <Search size={15} className="al-search-icon" />
            <input
              type="text"
              className="al-search-input"
              placeholder="Filter by description or record ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="al-filter-select"
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
          >
            <option value="all">All Modules</option>
            <option value="invoice">Invoice</option>
            <option value="customers">Customers</option>
            <option value="departments">Departments</option>
          </select>

          <select
            className="al-filter-select"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="all">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="view">View</option>
          </select>
        </div>

        <div className="am-view-toggle">
          <button
            type="button"
            className={`am-view-btn ${viewMode === "timeline" ? "active" : ""}`}
            onClick={() => setViewMode("timeline")}
            title="Timeline View"
          >
            <GitCommit size={16} />
          </button>
          <button
            type="button"
            className={`am-view-btn ${viewMode === "table" ? "active" : ""}`}
            onClick={() => setViewMode("table")}
            title="Table View"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="al-table-container" style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
          <div className="animate-spin" style={{ display: "inline-block", marginBottom: 12 }}>
            <RotateCw size={24} color="#2563eb" />
          </div>
          <p style={{ margin: 0, fontSize: 14 }}>Loading activity for this user...</p>
        </div>
      ) : error ? (
        <div className="al-table-container" style={{ textAlign: "center", padding: "48px 20px" }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "#fef2f2",
              color: "#dc2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
            }}
          >
            <AlertCircle size={22} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>
            Failed to Load User Activity
          </h3>
          <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 16px" }}>
            {error}
          </p>
          <button
            type="button"
            className="al-btn-action"
            style={{ background: "#2563eb", color: "#ffffff", borderColor: "#2563eb" }}
            onClick={loadUserDataAndLogs}
          >
            <RotateCw size={14} /> Retry
          </button>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="al-table-container" style={{ textAlign: "center", padding: "60px 20px" }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "#eff6ff",
              color: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
            }}
          >
            <Clock size={24} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>
            No activity found for this user in the selected date range.
          </h3>
          <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
            This account has not triggered any logged events matching your filter criteria.
          </p>
        </div>
      ) : viewMode === "timeline" ? (
        <AuditTimeline
          events={filteredEvents}
          // onSelectEvent={handleSelectEvent}
          canExport={canExport}
        />
      ) : (
        <AuditTable
          events={filteredEvents}
          // onSelectEvent={handleSelectEvent}
          onDownloadEventPdf={handleDownloadEventPdf}
          onCopyId={handleCopyId}
          canExport={canExport} 
        />
      )}

      {/* Side Drawer */}
      <AuditEventDrawer
        event={selectedEvent}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        canExport={canExport}
      />

      {/* Export Modal */}
      {/* <ExportAuditModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      /> */}
      {canExport && (

      <ExportAuditModal
  isOpen={isExportModalOpen}
  onClose={() => setIsExportModalOpen(false)}
  events={filteredEvents}
  toast={toast}
/>
      )}
    </div>
  );
}
