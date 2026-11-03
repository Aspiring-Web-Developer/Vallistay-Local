// src/Pages/PropertyRooms/components/AddPropertyModal.jsx
import React, { useState, useEffect } from "react";
import {
  Building2,
  X,
  MapPin,
  Check,
  Sparkles,
  Hotel,
  Castle,
  Home,
  Layers,
  Star,
  DoorClosed,
  User,
  ShieldCheck,
} from "lucide-react";
import { propertyStore } from "../data/propertyState";

export default function AddPropertyModal({
  isOpen,
  onClose,
  initialProperty = null,
  onSaved,
}) {
  if (!isOpen) return null;

  const isEdit = Boolean(initialProperty);

  const [formData, setFormData] = useState({
    name: initialProperty?.name || "",
    code: initialProperty?.code || "",
    classification: initialProperty?.classification || "Boutique",
    rating: initialProperty?.rating || "4 Star Boutique Resort",
    address: initialProperty?.address || "",
    city: initialProperty?.city || "Panjim",
    state: initialProperty?.state || "Goa",
    campus: initialProperty?.campus || "Coastal Zone",
    totalRooms: initialProperty?.totalRooms || 32,
    status: initialProperty?.status || "ACTIVE",
    manager: initialProperty?.manager || "Elena R. (Ops Lead)",
    keycard: initialProperty?.controls?.keycard ?? true,
    frontDeskSync: initialProperty?.controls?.frontDeskSync ?? true,
    directBooking: initialProperty?.controls?.directBooking ?? true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialProperty) {
      setFormData({
        name: initialProperty.name,
        code: initialProperty.code,
        classification: initialProperty.classification || "Boutique",
        rating: initialProperty.rating || "4 Star Boutique Resort",
        address: initialProperty.address || "",
        city: initialProperty.city || "Panjim",
        state: initialProperty.state || "Goa",
        campus: initialProperty.campus || "Coastal Zone",
        totalRooms: initialProperty.totalRooms || 32,
        status: initialProperty.status || "ACTIVE",
        manager: initialProperty.manager || "Elena R. (Ops Lead)",
        keycard: initialProperty.controls?.keycard ?? true,
        frontDeskSync: initialProperty.controls?.frontDeskSync ?? true,
        directBooking: initialProperty.controls?.directBooking ?? true,
      });
    }
  }, [initialProperty]);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = "Property name is required.";
    if (!formData.code.trim()) errs.code = "Code / Short ID is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    if (isEdit) {
      propertyStore.updateProperty({
        ...initialProperty,
        name: formData.name,
        fullName: formData.name,
        code: formData.code,
        classification: formData.classification,
        rating: formData.rating,
        address: formData.address,
        location: `${formData.classification} • ${formData.city}, ${formData.state}`,
        city: formData.city,
        state: formData.state,
        campus: formData.campus,
        totalRooms: parseInt(formData.totalRooms, 10),
        status: formData.status,
        manager: formData.manager,
        controls: {
          keycard: formData.keycard,
          frontDeskSync: formData.frontDeskSync,
          directBooking: formData.directBooking,
        },
      });
      if (onSaved) onSaved("Property updated successfully.");
    } else {
      propertyStore.addProperty({
        name: formData.name,
        fullName: formData.name,
        code: formData.code,
        classification: formData.classification,
        rating: formData.rating,
        address: formData.address,
        location: `${formData.classification} • ${formData.city}, ${formData.state}`,
        city: formData.city,
        state: formData.state,
        campus: formData.campus,
        totalRooms: parseInt(formData.totalRooms, 10),
        status: formData.status,
        manager: formData.manager,
        controls: {
          keycard: formData.keycard,
          frontDeskSync: formData.frontDeskSync,
          directBooking: formData.directBooking,
        },
      });
      if (onSaved) onSaved("Property created successfully.");
    }
    onClose();
  };

  return (
    <div className="pr-modal-backdrop" onClick={onClose}>
      <div
        className="pr-modal-dialog-large"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal Header ── */}
        <div className="pr-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "#eff6ff",
                color: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Building2 size={24} />
            </div>
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#2563eb",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                ASSET PROVISIONING • Valli Stay PMS
              </div>
              <div className="pr-modal-title">
                {isEdit ? "Edit Property" : "Add New Property"}
              </div>
              <div className="pr-modal-subtitle">
                Register a new property portfolio into the central management cluster.
              </div>
            </div>
          </div>
          <button className="pr-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* ── Modal Body ── */}
        <div className="pr-modal-body" style={{ padding: "16px 24px" }}>
          {/* STEP 1 */}
          <div>
            <div className="pr-step-header">
              <span>1. Basic Property Information</span>
              <span style={{ color: "#94a3b8" }}>STEP 01 / 04</span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.6fr 1fr",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <div className="pr-field-group">
                <label className="pr-field-label">Property Legal / Public Name *</label>
                <input
                  type="text"
                  className="pr-custom-input"
                  placeholder="e.g. Valli F4 - Palm Beach Resort"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                {errors.name && (
                  <span style={{ color: "#dc2626", fontSize: 12 }}>
                    {errors.name}
                  </span>
                )}
              </div>

              <div className="pr-field-group">
                <label className="pr-field-label">Code / Short ID *</label>
                <input
                  type="text"
                  className="pr-custom-input"
                  placeholder="#F4-401"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                />
                {errors.code && (
                  <span style={{ color: "#dc2626", fontSize: 12 }}>
                    {errors.code}
                  </span>
                )}
              </div>
            </div>

            {/* Classification chips */}
            <div className="pr-field-group" style={{ marginBottom: 12 }}>
              <label className="pr-field-label">Property Classification</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {[
                  { id: "Boutique", icon: Hotel, label: "Boutique" },
                  { id: "Heritage", icon: Castle, label: "Heritage" },
                  { id: "Luxury Villa", icon: Home, label: "Luxury Villa" },
                  { id: "Suites", icon: Layers, label: "Suites" },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = formData.classification === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, classification: item.id })
                      }
                      style={{
                        height: 42,
                        borderRadius: 10,
                        border: `1px solid ${isActive ? "#2563eb" : "#e2e8f0"}`,
                        background: isActive ? "#eff6ff" : "#ffffff",
                        color: isActive ? "#2563eb" : "#475569",
                        fontWeight: 600,
                        fontSize: 12.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        cursor: "pointer",
                      }}
                    >
                      <Icon size={15} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pr-field-group">
              <label className="pr-field-label">Category Rating</label>
              <select
                className="pr-custom-input"
                value={formData.rating}
                onChange={(e) =>
                  setFormData({ ...formData, rating: e.target.value })
                }
              >
                <option value="4 Star Boutique Resort">4 Star Boutique Resort</option>
                <option value="5 Star Heritage Palace">5 Star Heritage Palace</option>
                <option value="Premium Luxury Villa">Premium Luxury Villa</option>
                <option value="Standard Executive Hotel">Standard Executive Hotel</option>
              </select>
            </div>
          </div>

          {/* STEP 2 */}
          <div>
            <div className="pr-step-header">
              <span>2. Location & Campus Association</span>
              <span style={{ color: "#94a3b8" }}>STEP 02 / 04</span>
            </div>

            <div className="pr-field-group" style={{ marginBottom: 10 }}>
              <label className="pr-field-label">Address Line</label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  className="pr-custom-input"
                  style={{ paddingLeft: 34 }}
                  placeholder="Candolim Beach Road, North Goa"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
                <MapPin
                  size={15}
                  color="#94a3b8"
                  style={{ position: "absolute", left: 12, top: 14 }}
                />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1.2fr",
                gap: 10,
              }}
            >
              <div className="pr-field-group">
                <label className="pr-field-label">City / Sector</label>
                <input
                  type="text"
                  className="pr-custom-input"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                />
              </div>

              <div className="pr-field-group">
                <label className="pr-field-label">State / Province</label>
                <input
                  type="text"
                  className="pr-custom-input"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                />
              </div>

              <div className="pr-field-group">
                <label className="pr-field-label">Assigned Campus</label>
                <select
                  className="pr-custom-input"
                  value={formData.campus}
                  onChange={(e) =>
                    setFormData({ ...formData, campus: e.target.value })
                  }
                >
                  <option value="Coastal Zone">Coastal Zone</option>
                  <option value="Heritage Sector">Heritage Sector</option>
                  <option value="Highland Retreat Zone">Highland Retreat Zone</option>
                </select>
              </div>
            </div>
          </div>

          {/* STEP 3 */}
          <div>
            <div className="pr-step-header">
              <span>3. Initial Inventory & Capacity</span>
              <span style={{ color: "#94a3b8" }}>STEP 03 / 04</span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1.2fr 1.4fr",
                gap: 10,
              }}
            >
              <div className="pr-field-group">
                <label className="pr-field-label">Rooms to Provision</label>
                <input
                  type="number"
                  className="pr-custom-input"
                  value={formData.totalRooms}
                  onChange={(e) =>
                    setFormData({ ...formData, totalRooms: e.target.value })
                  }
                />
              </div>

              <div className="pr-field-group">
                <label className="pr-field-label">Operational Status</label>
                <div style={{ display: "flex", gap: 6 }}>
                  {["ACTIVE", "SETUP"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setFormData({ ...formData, status: st })}
                      style={{
                        flex: 1,
                        height: 42,
                        borderRadius: 8,
                        border: `1px solid ${
                          formData.status === st
                            ? st === "ACTIVE"
                              ? "#16a34a"
                              : "#f59e0b"
                            : "#e2e8f0"
                        }`,
                        background:
                          formData.status === st
                            ? st === "ACTIVE"
                              ? "#dcfce7"
                              : "#fef3c7"
                            : "#ffffff",
                        color:
                          formData.status === st
                            ? st === "ACTIVE"
                              ? "#15803d"
                              : "#b45309"
                            : "#64748b",
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      ● {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pr-field-group">
                <label className="pr-field-label">Property Manager</label>
                <select
                  className="pr-custom-input"
                  value={formData.manager}
                  onChange={(e) =>
                    setFormData({ ...formData, manager: e.target.value })
                  }
                >
                  <option value="Elena R. (Ops Lead)">Elena R. (Ops Lead)</option>
                  <option value="Rajesh S. (Operations)">Rajesh S. (Operations)</option>
                  <option value="Meenakshi K.">Meenakshi K.</option>
                </select>
              </div>
            </div>
          </div>

          {/* STEP 4 */}
          <div>
            <div className="pr-step-header">
              <span>4. Operational Controls & Access</span>
              <span style={{ color: "#94a3b8" }}>STEP 04 / 04</span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 10,
              }}
            >
              {[
                {
                  key: "keycard",
                  title: "Keycard Access",
                  desc: "Centralized RFID/NFC sync with door hubs.",
                },
                {
                  key: "frontDeskSync",
                  title: "Front Desk Sync",
                  desc: "Auto-reflect vacancies in live terminal.",
                },
                {
                  key: "directBooking",
                  title: "Direct Booking",
                  desc: "Allow webfolio direct reservations.",
                },
              ].map((ctrl) => (
                <div
                  key={ctrl.key}
                  onClick={() =>
                    setFormData({
                      ...formData,
                      [ctrl.key]: !formData[ctrl.key],
                    })
                  }
                  style={{
                    border: `1px solid ${
                      formData[ctrl.key] ? "#bfdbfe" : "#e2e8f0"
                    }`,
                    background: formData[ctrl.key] ? "#f0f7ff" : "#ffffff",
                    borderRadius: 10,
                    padding: "10px 12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData[ctrl.key]}
                    onChange={() => {}}
                    style={{ marginTop: 2 }}
                  />
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0f172a" }}>
                      {ctrl.title}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                      {ctrl.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Modal Footer ── */}
        <div className="pr-modal-footer">
          <button
            type="button"
            className="pr-btn pr-btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="pr-btn pr-btn-secondary"
            onClick={onClose}
          >
            Save as Draft
          </button>
          <button
            type="button"
            className="pr-btn pr-btn-primary"
            onClick={handleSave}
          >
            {isEdit ? <Check size={16} /> : <Sparkles size={16} />}
            <span>{isEdit ? "Save Changes" : "+ Add Property"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
