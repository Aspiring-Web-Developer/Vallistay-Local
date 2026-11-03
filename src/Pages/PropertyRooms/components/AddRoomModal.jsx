// src/Pages/PropertyRooms/components/AddRoomModal.jsx
import React, { useState, useEffect } from "react";
import {
  DoorClosed,
  X,
  Lock,
  BedDouble,
  Crown,
  Layers,
  Home,
  Plus,
  Minus,
  Check,
  Sparkles,
} from "lucide-react";
import { propertyStore } from "../data/propertyState";

export default function AddRoomModal({
  isOpen,
  onClose,
  property,
  initialRoom = null,
  onSaved,
}) {
  if (!isOpen) return null;

  const isEdit = Boolean(initialRoom);

  const [formData, setFormData] = useState({
    number: initialRoom?.number || "",
    name: initialRoom?.name || "",
    category: initialRoom?.category || "Deluxe King",
    pricePerNight: initialRoom?.pricePerNight || "$210/nt",
    floor: initialRoom?.floor || "Floor 1",
    wing: initialRoom?.wing || "East Courtyard Wing",
    capacity: initialRoom?.capacity || 2,
    bedConfig: initialRoom?.bedConfig || "1 King Size Pillow-top",
    rfidHardware: initialRoom?.rfidHardware ?? true,
    status: initialRoom?.status || "AVAILABLE",
    remarks: initialRoom?.remarks || "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialRoom) {
      setFormData({
        number: initialRoom.number,
        name: initialRoom.name || "",
        category: initialRoom.category || "Deluxe King",
        pricePerNight: initialRoom.pricePerNight || "$210/nt",
        floor: initialRoom.floor || "Floor 1",
        wing: initialRoom.wing || "East Courtyard Wing",
        capacity: initialRoom.capacity || 2,
        bedConfig: initialRoom.bedConfig || "1 King Size Pillow-top",
        rfidHardware: initialRoom.rfidHardware ?? true,
        status: initialRoom.status || "AVAILABLE",
        remarks: initialRoom.remarks || "",
      });
    }
  }, [initialRoom]);

  const CATEGORIES = [
    { id: "Deluxe King", label: "Deluxe King", price: "$210/nt", icon: BedDouble },
    { id: "Exec Suite", label: "Exec Suite", price: "$340/nt", icon: Crown },
    { id: "Twin Single", label: "Twin Single", price: "$180/nt", icon: Layers },
    { id: "Luxury Villa", label: "Luxury Villa", price: "$520/nt", icon: Home },
  ];

  const validate = () => {
    const errs = {};
    if (!formData.number.trim()) errs.number = "Room number is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    if (isEdit) {
      propertyStore.updateRoom(property.id, {
        ...initialRoom,
        number: formData.number,
        name: formData.name || formData.number,
        type: formData.category,
        category: formData.category,
        pricePerNight: formData.pricePerNight,
        floor: formData.floor,
        wing: formData.wing,
        capacity: formData.capacity,
        bedConfig: formData.bedConfig,
        rfidHardware: formData.rfidHardware,
        status: formData.status,
        remarks: formData.remarks,
      });
      if (onSaved) onSaved(`Room ${formData.number} updated successfully.`);
    } else {
      propertyStore.addRoom(property.id, {
        number: formData.number,
        name: formData.name || formData.number,
        type: formData.category,
        category: formData.category,
        pricePerNight: formData.pricePerNight,
        floor: formData.floor,
        wing: formData.wing,
        capacity: formData.capacity,
        bedConfig: formData.bedConfig,
        rfidHardware: formData.rfidHardware,
        status: formData.status,
        tags: [formData.floor, formData.rfidHardware ? "Keyless RF" : "Keyed"],
        remarks: formData.remarks,
      });
      if (onSaved) onSaved(`Room ${formData.number} created successfully.`);
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
              <DoorClosed size={24} />
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
                {property?.shortCode || "G1"}-INV
              </div>
              <div className="pr-modal-title">
                {isEdit ? "Edit Room" : "Add New Room"}
              </div>
              <div className="pr-modal-subtitle">
                Configure and register a unit inside {property?.name || "Property"}.
              </div>
            </div>
          </div>
          <button className="pr-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* ── Modal Body ── */}
        <div className="pr-modal-body" style={{ padding: "16px 24px" }}>
          {/* Section 01: Property & Identification */}
          <div>
            <div className="pr-step-header">
              <span>01. PROPERTY & IDENTIFICATION</span>
              <span style={{ color: "#94a3b8" }}>REQUIRED FIELDS MARKED *</span>
            </div>

            {/* Target Property locked strip */}
            <div
              style={{
                background: "#f1f5f9",
                border: "1px solid #e2e8f0",
                borderRadius: 10,
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                  Target Property: {property?.fullName || property?.name}
                </div>
                <div style={{ fontSize: 11, color: "#64748b" }}>
                  {property?.location || "Folio Campus Main"}
                </div>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  background: "#e2e8f0",
                  color: "#475569",
                  padding: "4px 8px",
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Lock size={12} />
                LOCKED
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1.4fr",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <div className="pr-field-group">
                <label className="pr-field-label">Room Code / Number *</label>
                <input
                  type="text"
                  className="pr-custom-input"
                  placeholder="# G1-204"
                  value={formData.number}
                  onChange={(e) =>
                    setFormData({ ...formData, number: e.target.value })
                  }
                />
                {errors.number && (
                  <span style={{ color: "#dc2626", fontSize: 12 }}>
                    {errors.number}
                  </span>
                )}
              </div>

              <div className="pr-field-group">
                <label className="pr-field-label">Display Name / Label (Optional)</label>
                <input
                  type="text"
                  className="pr-custom-input"
                  placeholder="e.g. Deluxe Garden Suite"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div className="pr-field-group">
                <label className="pr-field-label">Floor Level *</label>
                <select
                  className="pr-custom-input"
                  value={formData.floor}
                  onChange={(e) =>
                    setFormData({ ...formData, floor: e.target.value })
                  }
                >
                  <option value="Floor 1">Floor 1 (Ground Level)</option>
                  <option value="Floor 2">Floor 2 (Executive Level)</option>
                  <option value="Floor 3">Floor 3 (Penthouse Level)</option>
                </select>
              </div>

              <div className="pr-field-group">
                <label className="pr-field-label">Building Wing / Sector *</label>
                <select
                  className="pr-custom-input"
                  value={formData.wing}
                  onChange={(e) =>
                    setFormData({ ...formData, wing: e.target.value })
                  }
                >
                  <option value="East Courtyard Wing">East Courtyard Wing</option>
                  <option value="Main Hotel Wing">Main Hotel Wing</option>
                  <option value="Poolside Pavilion">Poolside Pavilion</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 02: Classification & Specs */}
          <div>
            <div className="pr-step-header">
              <span>02. CLASSIFICATION & SPECS</span>
              <span style={{ color: "#94a3b8" }}>Tier rate mapping</span>
            </div>

            <div className="pr-field-group" style={{ marginBottom: 12 }}>
              <label className="pr-field-label">Room Category</label>
              <div className="pr-category-grid">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = formData.category === cat.id;
                  return (
                    <div
                      key={cat.id}
                      className={`pr-category-tile ${isActive ? "active" : ""}`}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          category: cat.id,
                          pricePerNight: cat.price,
                        })
                      }
                    >
                      <Icon size={18} />
                      <span className="pr-category-name">{cat.label}</span>
                      <span className="pr-category-price">{cat.price}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1.4fr",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <div className="pr-field-group">
                <label className="pr-field-label">Max Guest Capacity</label>
                <div
                  style={{
                    height: 44,
                    border: "1px solid #e2e8f0",
                    borderRadius: 10,
                    padding: "0 8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <button
                    type="button"
                    style={{
                      border: "none",
                      background: "#f1f5f9",
                      borderRadius: 6,
                      width: 28,
                      height: 28,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onClick={() =>
                      setFormData({
                        ...formData,
                        capacity: Math.max(1, formData.capacity - 1),
                      })
                    }
                  >
                    <Minus size={14} />
                  </button>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>
                    {formData.capacity} adults max
                  </span>
                  <button
                    type="button"
                    style={{
                      border: "none",
                      background: "#f1f5f9",
                      borderRadius: 6,
                      width: 28,
                      height: 28,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onClick={() =>
                      setFormData({
                        ...formData,
                        capacity: formData.capacity + 1,
                      })
                    }
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="pr-field-group">
                <label className="pr-field-label">Bed Configuration</label>
                <select
                  className="pr-custom-input"
                  value={formData.bedConfig}
                  onChange={(e) =>
                    setFormData({ ...formData, bedConfig: e.target.value })
                  }
                >
                  <option value="1 King Size Pillow-top">1 King Size Pillow-top</option>
                  <option value="2 Queen Beds">2 Queen Beds</option>
                  <option value="1 King Size Four-poster">1 King Size Four-poster</option>
                  <option value="Twin Single Beds">Twin Single Beds</option>
                </select>
              </div>
            </div>

            {/* Keyless Smart RFID Toggle */}
            <div
              style={{
                border: "1px solid #e2e8f0",
                background: "#f8fafc",
                borderRadius: 10,
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                  Keyless Smart RFID Hardware
                </div>
                <div style={{ fontSize: 11, color: "#64748b" }}>
                  Assign Lock #LK-882 • NFC Reader Ready
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.rfidHardware}
                onChange={(e) =>
                  setFormData({ ...formData, rfidHardware: e.target.checked })
                }
                style={{ width: 18, height: 18, cursor: "pointer" }}
              />
            </div>
          </div>

          {/* Section 03: Operational Status & Notes */}
          <div>
            <div className="pr-step-header">
              <span>03. OPERATIONAL STATUS & NOTES</span>
              <span style={{ color: "#16a34a" }}>READY ON PUBLISH</span>
            </div>

            <div className="pr-field-group" style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { id: "AVAILABLE", label: "Available", bg: "#dcfce7", color: "#15803d" },
                  { id: "INSPECTION", label: "Inspection", bg: "#fef3c7", color: "#b45309" },
                  { id: "HOUSEKEEPING", label: "Housekeeping", bg: "#f3e8ff", color: "#7e22ce" },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, status: st.id })}
                    style={{
                      flex: 1,
                      height: 42,
                      borderRadius: 8,
                      border: `1px solid ${
                        formData.status === st.id ? st.color : "#e2e8f0"
                      }`,
                      background: formData.status === st.id ? st.bg : "#ffffff",
                      color: formData.status === st.id ? st.color : "#64748b",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    ● {st.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pr-field-group">
              <label className="pr-field-label">Staff Remarks & Features</label>
              <input
                type="text"
                className="pr-custom-input"
                placeholder="e.g. Garden facing unit, recent bathroom renovation"
                value={formData.remarks}
                onChange={(e) =>
                  setFormData({ ...formData, remarks: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* ── Modal Footer ── */}
        <div className="pr-modal-footer">
          <div style={{ flex: 1, fontSize: 12, color: "#64748b" }}>
            Immediately visible in booking dispatcher
          </div>
          <button
            type="button"
            className="pr-btn pr-btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="pr-btn pr-btn-primary"
            onClick={handleSave}
          >
            {isEdit ? <Check size={16} /> : <Plus size={16} />}
            <span>{isEdit ? "Save Changes" : "+ Create Room"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
