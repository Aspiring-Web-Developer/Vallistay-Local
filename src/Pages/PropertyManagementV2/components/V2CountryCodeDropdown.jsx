// src/Pages/PropertyManagementV2/components/V2CountryCodeDropdown.jsx
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";
import { COUNTRY_CODES } from "../../Customer/Create_Customer";// <-- adjust path

export default function V2CountryCodeDropdown({
  value,
  onChange,
  disabled = false,
  excludeCodes = [],
  error = false,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapRef = useRef(null);
  const panelRef = useRef(null);
  const searchRef = useRef(null);

  const active = COUNTRY_CODES.find((c) => c.code === value);

  useEffect(() => {
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    setSearch("");
    const t = setTimeout(() => searchRef.current?.focus(), 30);
    // keep the panel visible inside the scrolling modal body
    const raf = requestAnimationFrame(() => {
      panelRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(raf);
    };
  }, [open]);

  const q = search.trim().toLowerCase();
  const list = COUNTRY_CODES.filter((c) => !excludeCodes.includes(c.code)).filter((c) => {
    if (!q) return true;
    return (
      c.country.toLowerCase().includes(q) ||
      c.code.includes(q.replace("+", "")) ||
      (c.aliases || []).some((a) => a.toLowerCase().includes(q))
    );
  });

  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%" }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        title={active ? `+${active.code} ${active.country}` : "Select country code"}
        style={{
          width: "100%",
          height: 40,
          padding: "0 10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 6,
          border: `1px solid ${error ? "#EF4444" : open ? "#2563EB" : "#E5E7EB"}`,
          boxShadow: open ? "0 0 0 3px rgba(37,99,235,0.14)" : "none",
          borderRadius: 8,
          background: disabled ? "#F3F4F6" : "#fff",
          color: active ? "#111827" : "#9CA3AF",
          fontSize: 13.5,
          fontWeight: 600,
          cursor: disabled ? "not-allowed" : "pointer",
          boxSizing: "border-box",
          fontFamily: "inherit",
        }}
      >
        <span style={{ whiteSpace: "nowrap" }}>{active ? `+${active.code}` : "Code"}</span>
        {!disabled && (
          <ChevronDown
            size={14}
            color="#9CA3AF"
            style={{ transition: "transform .18s", transform: open ? "rotate(180deg)" : "none" }}
          />
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            width: 280,
            maxWidth: "calc(100vw - 64px)",
            zIndex: 30,
            background: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: 12,
            boxShadow: "0 16px 36px rgba(17,24,39,0.14)",
            overflow: "hidden",
            scrollMarginBottom: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 12px",
              borderBottom: "1px solid #E5E7EB",
              background: "#F9FAFB",
            }}
          >
            <Search size={14} color="#9CA3AF" />
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country or code..."
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: 13,
                width: "100%",
                minWidth: 0,
              }}
            />
          </div>

          <div style={{ maxHeight: 200, overflowY: "auto", padding: 6 }}>
            {list.length === 0 && (
              <div style={{ padding: "12px 10px", fontSize: 12.5, color: "#9CA3AF", textAlign: "center" }}>
                No matches found
              </div>
            )}
            {list.map((c) => {
              const isActive = active && c.code === value && c.country === active.country;
              return (
                <button
                  type="button"
                  key={`${c.code}-${c.country}`}
                  onClick={() => {
                    onChange(c.code);
                    setOpen(false);
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 10px",
                    border: "none",
                    borderRadius: 8,
                    textAlign: "left",
                    cursor: "pointer",
                    background: isActive ? "#EFF6FF" : "transparent",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = "#F9FAFB";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span style={{ width: 48, flexShrink: 0, fontSize: 12.5, fontWeight: 700, color: "#2563EB" }}>
                    +{c.code}
                  </span>
                  <span
                    style={{
                      fontSize: 13.5,
                      color: "#111827",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {c.country}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}