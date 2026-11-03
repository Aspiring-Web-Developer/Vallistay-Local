






import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, LayoutList, LayoutGrid, ChevronDown, Check, X, CalendarDays } from "lucide-react";
import "./AccessFilters.css";

export const MODULE_OPTIONS = [
  { value: "invoice", label: "Invoice" },
  { value: "customers", label: "Guest" },
  { value: "departments", label: "Departments" },
  { value: "access_management", label: "Access Management" },
  { value: "audit_logs", label: "Audit Logs" },
];

export const PERMISSION_OPTIONS = [
  { value: "view", label: "View" },
  { value: "create", label: "Create" },
  { value: "update", label: "Update" },
  { value: "delete", label: "Delete" },
  { value: "export", label: "Export" },
];

/* ---------- date range helpers (use these in the parent page) ---------- */
// dateFrom / dateTo are "YYYY-MM-DD" strings from <input type="date">
export const filterByCreatedDate = (users, dateFrom, dateTo, getDate = (u) => u.created_at) => {
  if (!dateFrom && !dateTo) return users;
  const from = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null;
  const to = dateTo ? new Date(`${dateTo}T23:59:59.999`) : null;

  return users.filter((u) => {
    const d = new Date(getDate(u));
    if (isNaN(d.getTime())) return false;
    if (from && d < from) return false;
    if (to && d > to) return false;
    return true;
  });
};

const fmtDate = (s) =>
  new Date(`${s}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

function MultiSelect({ label, options, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("touchstart", onDoc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("touchstart", onDoc);
    };
  }, []);

  const visible = useMemo(
    () => options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())),
    [options, query]
  );

  const toggle = (value) =>
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);

  return (
    <div className="amf-ms" ref={ref}>
      <button
        type="button"
        className={`amf-ms-trigger ${selected.length ? "has-value" : ""}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span>{label}</span>
        {selected.length > 0 && <span className="amf-ms-count">{selected.length}</span>}
        <ChevronDown size={15} className={open ? "amf-rot" : ""} />
      </button>

      {open && (
        <div className="amf-ms-panel">
          <input
            className="amf-ms-search"
            placeholder={`Search ${label.toLowerCase()}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="amf-ms-list">
            {visible.length === 0 && <div className="amf-ms-empty">No match</div>}
            {visible.map((o) => {
              const active = selected.includes(o.value);
              return (
                <button
                  type="button"
                  key={o.value}
                  className={`amf-ms-item ${active ? "active" : ""}`}
                  onClick={() => toggle(o.value)}
                >
                  <span className="amf-check">{active && <Check size={12} />}</span>
                  {o.label}
                </button>
              );
            })}
          </div>
          <div className="amf-ms-footer">
            <button type="button" onClick={() => onChange(options.map((o) => o.value))}>
              Select all
            </button>
            <button type="button" onClick={() => onChange([])}>
              Clear
            </button>
            <button type="button" className="amf-ms-done" onClick={() => setOpen(false)}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PillGroup({ title, options, selected, onChange }) {
  const toggle = (v) =>
    onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
  return (
    <div className="amf-quick-group">
      <span className="amf-quick-label">{title}</span>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={`amf-pill ${selected.includes(o.value) ? "active" : ""}`}
          onClick={() => toggle(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- created date range ---------- */
function DateRange({ dateFrom, dateTo, setDateFrom, setDateTo }) {
  const today = new Date().toISOString().slice(0, 10);
  const active = Boolean(dateFrom || dateTo);

  return (
    <div className={`amf-date ${active ? "has-value" : ""}`} title="Filter by created date">
      <CalendarDays size={15} className="amf-date-icon" />
      <label className="amf-date-field">
        <span>From</span>
        <input
          type="date"
          value={dateFrom}
          max={dateTo || today}
          onChange={(e) => setDateFrom(e.target.value)}
        />
      </label>
      <span className="amf-date-sep">–</span>
      <label className="amf-date-field">
        <span>To</span>
        <input
          type="date"
          value={dateTo}
          min={dateFrom || undefined}
          max={today}
          onChange={(e) => setDateTo(e.target.value)}
        />
      </label>
      {active && (
        <button
          type="button"
          className="amf-date-clear"
          onClick={() => {
            setDateFrom("");
            setDateTo("");
          }}
          title="Clear dates"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}

export default function AccessFilters({
  bp = "desktop",
  searchTerm,
  setSearchTerm,
  selectedModules,
  setSelectedModules,
  selectedPermissions,
  setSelectedPermissions,
  dateFrom = "",
  setDateFrom = () => {},
  dateTo = "",
  setDateTo = () => {},
  matchMode,
  setMatchMode,
  viewMode,
  setViewMode,
}) {
  const isMobile = bp === "mobile";
  const isTablet = bp === "tablet";
  const hasDate = Boolean(dateFrom || dateTo);
  const hasFilters = selectedModules.length > 0 || selectedPermissions.length > 0 || hasDate;
  const labelOf = (opts, v) => opts.find((o) => o.value === v)?.label || v;

  const clearAll = () => {
    setSelectedModules([]);
    setSelectedPermissions([]);
    setDateFrom("");
    setDateTo("");
  };

  const dateChipText =
    dateFrom && dateTo
      ? `${fmtDate(dateFrom)} – ${fmtDate(dateTo)}`
      : dateFrom
      ? `From ${fmtDate(dateFrom)}`
      : dateTo
      ? `Until ${fmtDate(dateTo)}`
      : "";

  return (
    <div className="amf-wrap">
      <div className="amf-row">
        <div className="amf-search">
          <Search size={16} />
          <input
            placeholder="Search by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Mobile + desktop: dropdowns */}
        {!isTablet && (
          <>
            <MultiSelect
              label="Modules"
              options={MODULE_OPTIONS}
              selected={selectedModules}
              onChange={setSelectedModules}
            />
            <MultiSelect
              label="Permissions"
              options={PERMISSION_OPTIONS}
              selected={selectedPermissions}
              onChange={setSelectedPermissions}
            />
          </>
        )}

        <DateRange
          dateFrom={dateFrom}
          dateTo={dateTo}
          setDateFrom={setDateFrom}
          setDateTo={setDateTo}
        />

        {!isMobile && (
          <div className="amf-seg">
            <button
              type="button"
              className={viewMode === "list" ? "active" : ""}
              onClick={() => setViewMode("list")}
              title="List view"
            >
              <LayoutList size={16} />
            </button>
            <button
              type="button"
              className={viewMode === "grid" ? "active" : ""}
              onClick={() => setViewMode("grid")}
              title="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Tablet only: quick pills */}
      {isTablet && (
        <div className="amf-quick">
          <PillGroup
            title="Modules"
            options={MODULE_OPTIONS}
            selected={selectedModules}
            onChange={setSelectedModules}
          />
          <PillGroup
            title="Permissions"
            options={PERMISSION_OPTIONS}
            selected={selectedPermissions}
            onChange={setSelectedPermissions}
          />
        </div>
      )}

      {/* Chips (hidden on tablet since pills already show state) */}
      {hasFilters && !isTablet && (
        <div className="amf-chips">
          {selectedModules.map((m) => (
            <span key={m} className="amf-chip module">
              {labelOf(MODULE_OPTIONS, m)}
              <button type="button" onClick={() => setSelectedModules(selectedModules.filter((x) => x !== m))}>
                <X size={12} />
              </button>
            </span>
          ))}
          {selectedPermissions.map((p) => (
            <span key={p} className="amf-chip perm">
              {labelOf(PERMISSION_OPTIONS, p)}
              <button type="button" onClick={() => setSelectedPermissions(selectedPermissions.filter((x) => x !== p))}>
                <X size={12} />
              </button>
            </span>
          ))}
          {hasDate && (
            <span className="amf-chip date">
              <CalendarDays size={12} /> {dateChipText}
              <button
                type="button"
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                }}
              >
                <X size={12} />
              </button>
            </span>
          )}
          <button type="button" className="amf-clear" onClick={clearAll}>
            Clear all
          </button>
        </div>
      )}

      {hasFilters && isTablet && (
        <div className="amf-chips">
          {hasDate && (
            <span className="amf-chip date">
              <CalendarDays size={12} /> {dateChipText}
              <button
                type="button"
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                }}
              >
                <X size={12} />
              </button>
            </span>
          )}
          <button type="button" className="amf-clear" onClick={clearAll}>
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}