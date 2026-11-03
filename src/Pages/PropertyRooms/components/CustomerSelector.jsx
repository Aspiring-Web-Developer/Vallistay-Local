// src/Pages/PropertyRooms/components/CustomerSelector.jsx
import React, { useState } from "react";
import { UserRound, Search, Phone, Mail, Check, Plus } from "lucide-react";
import { MOCK_CUSTOMERS } from "../data/mockRoomBookingData";

export default function CustomerSelector({
  customerMode,
  setCustomerMode,
  selectedCustomer,
  setSelectedCustomer,
  newCustomer,
  setNewCustomer,
  errors = {},
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredCustomers = MOCK_CUSTOMERS.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
    );
  });

  const handleSelect = (customer) => {
    setSelectedCustomer(customer);
    setIsOpen(false);
    setSearchTerm(customer.name);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* ── Segmented Control ── */}
      <div className="pr-segmented">
        <button
          type="button"
          className={`pr-segmented-btn ${customerMode === "existing" ? "active" : ""}`}
          onClick={() => setCustomerMode("existing")}
        >
          Select Existing Customer
        </button>
        <button
          type="button"
          className={`pr-segmented-btn ${customerMode === "new" ? "active" : ""}`}
          onClick={() => setCustomerMode("new")}
        >
          + Add New Guest
        </button>
      </div>

      {/* ── Existing Customer Search Combobox ── */}
      {customerMode === "existing" ? (
        <div style={{ position: "relative" }}>
          <label className="pr-field-label">Search Customer (Name, Phone, ID)</label>
          <div className="pr-input-wrap" style={{ marginTop: 6 }}>
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="e.g. Ram C, Priya Sharma, +91 98563..."
              value={searchTerm}
              onFocus={() => setIsOpen(true)}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsOpen(true);
              }}
            />
          </div>

          {/* Combobox Dropdown Results */}
          {isOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: "12px",
                marginTop: 6,
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                zIndex: 100,
                maxHeight: "220px",
                overflowY: "auto",
              }}
            >
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((cust) => (
                  <div
                    key={cust.id}
                    onClick={() => handleSelect(cust)}
                    style={{
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderBottom: "1px solid #f1f5f9",
                      cursor: "pointer",
                      background:
                        selectedCustomer?.id === cust.id ? "#eff6ff" : "transparent",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background =
                        selectedCustomer?.id === cust.id ? "#eff6ff" : "transparent")
                    }
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: "#2563eb",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: 12,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {cust.avatar}
                      </div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a" }}>
                          {cust.name}{" "}
                          <span
                            style={{
                              fontSize: 10.5,
                              color: "#64748b",
                              fontWeight: 500,
                            }}
                          >
                            ({cust.id})
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>
                          {cust.phone} • {cust.email}
                        </div>
                      </div>
                    </div>
                    {selectedCustomer?.id === cust.id && (
                      <Check size={16} color="#2563eb" strokeWidth={2.5} />
                    )}
                  </div>
                ))
              ) : (
                <div style={{ padding: "14px", textAlign: "center", color: "#64748b", fontSize: 13 }}>
                  No guest matching "{searchTerm}" found. Switch to "Add New Guest" above.
                </div>
              )}
            </div>
          )}

          {/* Selected Customer Card Preview */}
          {selectedCustomer && (
            <div
              style={{
                marginTop: 10,
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "10px",
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "#16a34a",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {selectedCustomer.avatar || "C"}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#14532d" }}>
                    Selected: {selectedCustomer.name}
                  </div>
                  <div style={{ fontSize: 12, color: "#15803d" }}>
                    {selectedCustomer.phone} • {selectedCustomer.email}
                  </div>
                </div>
              </div>
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  background: "#dcfce7",
                  color: "#166534",
                  padding: "3px 8px",
                  borderRadius: 9999,
                }}
              >
                {selectedCustomer.tag}
              </span>
            </div>
          )}
          {errors.customer && (
            <div style={{ color: "#dc2626", fontSize: 12, marginTop: 4 }}>
              {errors.customer}
            </div>
          )}
        </div>
      ) : (
        /* ── Add New Customer Form ── */
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="pr-field-group">
            <label className="pr-field-label">Customer Full Name *</label>
            <div className="pr-input-wrap">
              <UserRound size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder="e.g. Rohit Sharma"
                value={newCustomer.name}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, name: e.target.value })
                }
              />
            </div>
            {errors.name && (
              <span style={{ color: "#dc2626", fontSize: 12 }}>{errors.name}</span>
            )}
          </div>

          <div className="pr-field-group">
            <label className="pr-field-label">Mobile Number *</label>
            <div className="pr-input-wrap">
              <Phone size={16} color="#94a3b8" />
              <input
                type="tel"
                placeholder="e.g. +91 98765 43210"
                value={newCustomer.phone}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, phone: e.target.value })
                }
              />
            </div>
            {errors.phone && (
              <span style={{ color: "#dc2626", fontSize: 12 }}>{errors.phone}</span>
            )}
          </div>

          <div className="pr-field-group">
            <label className="pr-field-label">Email Address (Optional)</label>
            <div className="pr-input-wrap">
              <Mail size={16} color="#94a3b8" />
              <input
                type="email"
                placeholder="e.g. customer@example.com"
                value={newCustomer.email}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, email: e.target.value })
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
