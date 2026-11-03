







import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, ChevronDown, Check, X, RotateCcw, CalendarDays } from "lucide-react";
import { pretty } from "./utils/formatValue";
import { DATE_PRESETS, getDateLabel, toISO } from "./utils/dateRange";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "success", label: "Success" },
  { value: "failed", label: "Failed" },
];

function useOutside(ref, onClose) {
  useEffect(() => {
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && onClose();
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [ref, onClose]);
}

function Dropdown({ label, value, onChange, options, searchable = false }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);
  useOutside(ref, () => setOpen(false));

  const selected = options.find((o) => o.value === value) || options[0];
  const active = value !== "all";
  const visible = useMemo(
    () => options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())),
    [options, query]
  );

  const pick = (v) => {
    onChange(v);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="alf-group" ref={ref}>
      <span className="alf-label">{label}</span>
      <button
        type="button"
        className={`alf-trigger ${active ? "active" : ""} ${open ? "open" : ""}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="alf-trigger-text">{selected.label}</span>
        <ChevronDown size={15} className="alf-chevron" />
      </button>

      {open && (
        <div className="alf-panel">
          {searchable && (
            <div className="alf-panel-search">
              <Search size={13} />
              <input
                autoFocus
                placeholder={`Search ${label.toLowerCase()}...`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          )}
          <div className="alf-list">
            {visible.length === 0 && <div className="alf-empty">No results</div>}
            {visible.map((o) => (
              <button
                type="button"
                key={o.value}
                className={`alf-item ${o.value === value ? "selected" : ""}`}
                onClick={() => pick(o.value)}
              >
                <span>{o.label}</span>
                {o.value === value && <Check size={14} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DateRangeDropdown({ dateRange, setDateRange, customFrom, setCustomFrom, customTo, setCustomTo }) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState("");
  const ref = useRef(null);
  useOutside(ref, () => setOpen(false));

  const today = toISO(new Date());
  const active = dateRange !== "all";
  const label = getDateLabel(dateRange, customFrom, customTo);

  const pickPreset = (v) => {
    setDateRange(v);
    setCustomFrom("");
    setCustomTo("");
    setMonth("");
    setOpen(false);
  };

  const applyMonth = (val) => {
    setMonth(val);
    if (!val) return;
    const [y, m] = val.split("-").map(Number);
    setCustomFrom(toISO(new Date(y, m - 1, 1)));
    setCustomTo(toISO(new Date(y, m, 0)));
    setDateRange("custom");
  };

  const onFrom = (v) => {
    setMonth("");
    setCustomFrom(v);
    if (customTo && v && v > customTo) setCustomTo(v);
    setDateRange("custom");
  };

  const onTo = (v) => {
    setMonth("");
    setCustomTo(v);
    if (customFrom && v && v < customFrom) setCustomFrom(v);
    setDateRange("custom");
  };

  return (
    <div className="alf-group" ref={ref}>
      <span className="alf-label">Date range</span>
      <button
        type="button"
        className={`alf-trigger ${active ? "active" : ""} ${open ? "open" : ""}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="alf-trigger-text">
          <CalendarDays size={13} style={{ marginRight: 6, verticalAlign: "-2px" }} />
          {label}
        </span>
        <ChevronDown size={15} className="alf-chevron" />
      </button>

      {open && (
        <div className="alf-panel alf-panel-date">
          <div className="alf-list">
            {DATE_PRESETS.map((o) => (
              <button
                type="button"
                key={o.value}
                className={`alf-item ${o.value === dateRange ? "selected" : ""}`}
                onClick={() => pickPreset(o.value)}
              >
                <span>{o.label}</span>
                {o.value === dateRange && <Check size={14} />}
              </button>
            ))}
          </div>

          <div className="alf-date-section">
            <span className="alf-date-title">Pick a month</span>
            <input
              type="month"
              className="alf-date-input"
              value={month}
              max={today.slice(0, 7)}
              onChange={(e) => applyMonth(e.target.value)}
            />
          </div>

          <div className="alf-date-section">
            <span className="alf-date-title">Custom range</span>
            <div className="alf-date-row">
              <label>
                <small>From</small>
                <input
                  type="date"
                  className="alf-date-input"
                  value={customFrom}
                  max={customTo || today}
                  onChange={(e) => onFrom(e.target.value)}
                />
              </label>
              <label>
                <small>To</small>
                <input
                  type="date"
                  className="alf-date-input"
                  value={customTo}
                  min={customFrom || undefined}
                  max={today}
                  onChange={(e) => onTo(e.target.value)}
                />
              </label>
            </div>
            <button type="button" className="alf-date-done" onClick={() => setOpen(false)}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AuditFilters({
  events = [],
  searchTerm, setSearchTerm,
  dateRange, setDateRange,
  customFrom, setCustomFrom,
  customTo, setCustomTo,
  performedBy, setPerformedBy,
  moduleFilter, setModuleFilter,
  actionFilter, setActionFilter,
  statusFilter, setStatusFilter,
  onReset, totalMatched, showFilters = true,
}) {
  const userOptions = useMemo(() => {
    const names = [...new Set(events.map((e) => e.performed_by_name).filter(Boolean))].sort();
    return [{ value: "all", label: "All users" }, ...names.map((n) => ({ value: n, label: n }))];
  }, [events]);

  const moduleOptions = useMemo(() => {
    const map = new Map(events.map((e) => [e.module_key, e.module_name]));
    return [
      { value: "all", label: "All modules" },
      ...[...map].map(([k, n]) => ({ value: k, label: pretty(n) })).sort((a, b) => a.label.localeCompare(b.label)),
    ];
  }, [events]);

  const actionOptions = useMemo(() => {
    const acts = [...new Set(events.map((e) => e.action).filter(Boolean))].sort();
    return [{ value: "all", label: "All actions" }, ...acts.map((a) => ({ value: a, label: pretty(a) }))];
  }, [events]);

  const clearDate = () => {
    setDateRange("all");
    setCustomFrom("");
    setCustomTo("");
  };

  const chips = [
    dateRange !== "all" && { key: "date", text: getDateLabel(dateRange, customFrom, customTo), clear: clearDate },
    performedBy !== "all" && { key: "user", text: performedBy, clear: () => setPerformedBy("all") },
    moduleFilter !== "all" && { key: "module", text: moduleOptions.find((o) => o.value === moduleFilter)?.label, clear: () => setModuleFilter("all") },
    actionFilter !== "all" && { key: "action", text: pretty(actionFilter), clear: () => setActionFilter("all") },
    statusFilter !== "all" && { key: "status", text: pretty(statusFilter), clear: () => setStatusFilter("all") },
  ].filter(Boolean);

  return (
    <div className="alf-wrap">
      <div className="alf-search-row">
        <div className="alf-search">
          <Search size={16} />
          <input
            placeholder="Search by user, email, module or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button type="button" className="alf-search-clear" onClick={() => setSearchTerm("")}>
              <X size={14} />
            </button>
          )}
        </div>
        <span className="alf-count">
          <strong>{totalMatched}</strong> result{totalMatched !== 1 ? "s" : ""}
        </span>
      </div>

      {showFilters && (
        <div className="alf-bar">
          <DateRangeDropdown
            dateRange={dateRange}
            setDateRange={setDateRange}
            customFrom={customFrom}
            setCustomFrom={setCustomFrom}
            customTo={customTo}
            setCustomTo={setCustomTo}
          />
          <Dropdown label="Performed by" value={performedBy} onChange={setPerformedBy} options={userOptions} searchable />
          <Dropdown label="Module" value={moduleFilter} onChange={setModuleFilter} options={moduleOptions} searchable />
          <Dropdown label="Action" value={actionFilter} onChange={setActionFilter} options={actionOptions} />
          <Dropdown label="Status" value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} />
          <button type="button" className="alf-reset" onClick={onReset} disabled={chips.length === 0 && !searchTerm}>
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      )}

      {chips.length > 0 && (
        <div className="alf-chips">
          <span className="alf-chips-label">Active filters:</span>
          {chips.map((c) => (
            <span key={c.key} className="alf-chip">
              {c.text}
              <button type="button" onClick={c.clear}><X size={12} /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}