





import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  FileText,
  Download,
  RotateCw,
  Filter,
  AlertCircle,
  Clock,
} from "lucide-react";
import { useToast } from "../Stays/Rooms/Room_Shared";
import "./AuditLogs.css";
import { fetchGlobalAuditLogs } from "./services/auditLogsApi";
import AuditSummaryCards from "./AuditSummaryCards";
import AuditFilters from "./AuditFilters";
import AuditTable from "./AuditTable";
import AuditEventDrawer from "./AuditEventDrawer";
import ExportAuditModal from "./ExportAuditModal";
import { useAccess } from "../../services/AccessContext";
import Pagination from "./Pagination";
import { downloadEventPdf } from "./utils/auditPdf";
import { getDateBounds, getDateLabel } from "./utils/dateRange";
import "./AuditLogs.responsive.css";

const PAGE_SIZE = 10;


const toGuestLabels = (ev) => {
  const key = String(ev.module_key || ev.module_name || "").toLowerCase();
  const next = { ...ev };

  if (key === "customer" || key === "customers") {
    next.module_name = "Guest";
    if (typeof next.description === "string") {
      next.description = next.description
        .replace(/\bcustomers\b/g, "guests")
        .replace(/\bCustomers\b/g, "Guests")
        .replace(/\bcustomer\b/g, "guest")
        .replace(/\bCustomer\b/g, "Guest");
    }
  }
  return next;
};



export default function AuditLogsPage() {
  const { push: toast, ToastHost } = useToast();
  const { can } = useAccess();
  const canExport = can("audit_logs", "export");

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState("pdf");
  const [showFilters, setShowFilters] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Server-side pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageMeta, setPageMeta] = useState({ total: 0, total_pages: 1 });
  const requestId = useRef(0); // ignore stale responses when user clicks pages fast

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [performedBy, setPerformedBy] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadAuditLogs = async ({ page = currentPage, showToast = false } = {}) => {
    const myId = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const { events: rows, meta } = await fetchGlobalAuditLogs({ page, per_page: PAGE_SIZE });
      if (myId !== requestId.current) return; // a newer request is in flight
      setEvents(rows.map(toGuestLabels)); 
      setPageMeta({ total: meta.total, total_pages: meta.total_pages || 1 });
      if (showToast) toast("Audit logs refreshed successfully.", "success");
    } catch (err) {
      if (myId !== requestId.current) return;
      console.error("Failed to fetch audit logs:", err);
      setError(err?.message || "We couldn’t load audit logs. Please try again.");
      toast("We couldn’t load audit logs. Please try again.", "error");
    } finally {
      if (myId === requestId.current) {
        setLoading(false);
        setIsRefreshing(false);
      }
    }
  };

  // Fetch whenever the page changes
  useEffect(() => {
    loadAuditLogs({ page: currentPage });
    window.scrollTo({ top: 0, behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Filters apply to the rows of the current page
  const filteredEvents = useMemo(() => {
    const { start, end } = getDateBounds(dateRange, customFrom, customTo);
    const q = searchTerm.toLowerCase();

    return events.filter((ev) => {
      const searchMatch =
        q === "" ||
        ev.performed_by_name?.toLowerCase().includes(q) ||
        ev.performed_by_email?.toLowerCase().includes(q) ||
        ev.description?.toLowerCase().includes(q) ||
        ev.module_name?.toLowerCase().includes(q);

      const dateMatch = dateRange === "all" || (ev.created_ts >= start && ev.created_ts <= end);
      const userMatch = performedBy === "all" || ev.performed_by_name === performedBy;
      const moduleMatch = moduleFilter === "all" || ev.module_key === moduleFilter;
      const actionMatch = actionFilter === "all" || ev.action === actionFilter;
      const statusMatch = statusFilter === "all" || ev.status === statusFilter;

      return searchMatch && dateMatch && userMatch && moduleMatch && actionMatch && statusMatch;
    });
  }, [events, searchTerm, dateRange, customFrom, customTo, performedBy, moduleFilter, actionFilter, statusFilter]);

  const totalPages = pageMeta.total_pages || 1;
  const startRecord = events.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const endRecord = events.length > 0 ? startRecord + events.length - 1 : 0;

  // Total comes from the server; other counts are for the current page
  const dynamicStats = useMemo(() => {
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);
    return {
      totalEvents: pageMeta.total.toLocaleString(),
      todayEvents: String(events.filter((e) => e.created_ts >= midnight.getTime()).length),
      creates: String(events.filter((e) => e.action === "create").length),
      updates: String(events.filter((e) => e.action === "update").length),
      deletes: String(events.filter((e) => e.action === "delete").length),
      failedActions: String(events.filter((e) => e.status === "failed").length),
    };
  }, [events, pageMeta.total]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setDateRange("all");
    setCustomFrom("");
    setCustomTo("");
    setPerformedBy("all");
    setModuleFilter("all");
    setActionFilter("all");
    setStatusFilter("all");
    toast("Filters reset to default view.", "info");
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadAuditLogs({ page: currentPage, showToast: true });
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setIsDrawerOpen(true);
  };

  const handleOpenExport = (format) => {
    setExportFormat(format);
    setIsExportModalOpen(true);
  };

  const handleDownloadEventPdf = async (event) => {
    try {
      await downloadEventPdf(event);
      toast("Audit receipt downloaded.", "success");
    } catch (err) {
      console.error(err);
      toast("Error generating PDF receipt.", "error");
    }
  };

  const handleCopyId = (auditId) => {
    navigator.clipboard.writeText(auditId);
    toast("Copied Event ID to clipboard!", "success");
  };

  return (
    <div className="al-container">
      <ToastHost />

      {/* Header */}
      <div className="al-header">
        <div className="al-header-titles">
          <h1 className="al-title">Audit Logs</h1>
          <p className="al-subtitle">Track all user and system activity across the application.</p>
        </div>

        <div className="al-header-actions">
          {canExport && (
            <>
              {/* <button type="button" className="al-btn-action" onClick={() => handleOpenExport("pdf")}>
                <FileText size={15} color="#ea580c" /> Export 
              </button> */}
              <button type="button" className="al-btn-action" onClick={() => handleOpenExport("csv")}>
                <Download size={15} color="#16a34a" /> Export 
              </button>
            </>
          )}

          {/* <button type="button" className="al-btn-action" onClick={handleRefresh} disabled={isRefreshing}>
            <RotateCw size={15} className={isRefreshing ? "al-spinner" : ""} />
            Refresh
          </button> */}

          <button
            type="button"
            className="al-btn-toggle-filters"
            onClick={() => setShowFilters((prev) => !prev)}
          >
            <Filter size={15} />
            {showFilters ? "Hide Filters" : "Show Filters"}
            <span className="al-filter-dot" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <AuditSummaryCards stats={dynamicStats} />

      {/* Search and Filters */}
      <AuditFilters
        events={events}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        dateRange={dateRange}
        setDateRange={setDateRange}
        performedBy={performedBy}
        setPerformedBy={setPerformedBy}
        moduleFilter={moduleFilter}
        setModuleFilter={setModuleFilter}
        actionFilter={actionFilter}
        setActionFilter={setActionFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onReset={handleResetFilters}
        totalMatched={filteredEvents.length}
        showFilters={showFilters}
        customFrom={customFrom}
        setCustomFrom={setCustomFrom}
        customTo={customTo}
        setCustomTo={setCustomTo}
      />

      {loading ? (
        <div className="al-table-container" style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
          <RotateCw size={28} color="#2563eb" className="al-spinner" style={{ marginBottom: 12 }} />
          <p style={{ margin: 0, fontSize: 14 }}>Loading activity and compliance logs...</p>
        </div>
      ) : error ? (
        <div className="al-table-container" style={{ textAlign: "center", padding: "48px 20px" }}>
          <div
            style={{
              width: 44, height: 44, borderRadius: "50%", background: "#fef2f2", color: "#dc2626",
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px",
            }}
          >
            <AlertCircle size={22} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>
            Failed to Load Audit Logs
          </h3>
          <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 16px" }}>{error}</p>
          <button
            type="button"
            className="al-btn-action"
            style={{ background: "#2563eb", color: "#ffffff", borderColor: "#2563eb" }}
            onClick={() => loadAuditLogs({ page: currentPage, showToast: true })}
          >
            <RotateCw size={14} /> Retry
          </button>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="al-table-container" style={{ textAlign: "center", padding: "60px 20px" }}>
          <div
            style={{
              width: 48, height: 48, borderRadius: "50%", background: "#eff6ff", color: "#2563eb",
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px",
            }}
          >
            <Clock size={24} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>
            No audit records found
          </h3>
          <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
            No events on this page match your filters.
          </p>
        </div>
      ) : (
        <AuditTable
          events={filteredEvents}
          onSelectEvent={handleSelectEvent}
          onDownloadEventPdf={handleDownloadEventPdf}
          onCopyId={handleCopyId}
          canExport={canExport}
        />
      )}

      {/* Pagination Footer (server-side) */}
      {!error && pageMeta.total > 0 && (
        <div className="al-pager">
          <div>
            Showing <strong>{startRecord}-{endRecord}</strong> of{" "}
            <strong>{pageMeta.total.toLocaleString()}</strong> events
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onChange={(p) => { if (!loading) setCurrentPage(p); }}
          />
        </div>
      )}

      <AuditEventDrawer
        event={selectedEvent}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />

      {canExport && (
        <ExportAuditModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          defaultFormat={exportFormat}
          events={filteredEvents}
          toast={toast}
          dateLabel={getDateLabel(dateRange, customFrom, customTo)}
        />
      )}
    </div>
  );
}