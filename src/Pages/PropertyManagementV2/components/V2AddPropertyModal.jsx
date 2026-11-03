// src/Pages/PropertyManagementV2/components/V2AddPropertyModal.jsx
import React, { useState } from "react";
import { X, Building2 } from "lucide-react";

export default function V2AddPropertyModal({ isOpen, onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Property name is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      name: name.trim(),
      code: name.trim().split(/\s+/)[0]?.toUpperCase() || "PROP",
      location: location.trim() || "Main Campus",
      address: location.trim() || "Main Campus",
      status: "Active",
    });

    setName("");
    setLocation("");
    setErrors({});
    onClose();
  };

  return (
    <div className="pmv2-modal-backdrop" onClick={onClose}>
      <div className="pmv2-modal sm" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="pmv2-modal-header">
          <div>
            <h3 className="pmv2-modal-title">Add Property</h3>
            <p className="pmv2-modal-subtitle">
              Create a property to organize rooms and bookings.
            </p>
          </div>
          <button
            type="button"
            className="pmv2-btn-icon"
            onClick={onClose}
            style={{ width: 34, height: 34 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit}>
          <div className="pmv2-modal-body">
            {/* Property Name */}
            <div className="pmv2-form-group">
              <label className="pmv2-form-label">
                <span>Property Name *</span>
              </label>
              <input
                type="text"
                className={`pmv2-form-input ${errors.name ? "error" : ""}`}
                placeholder="e.g. Guest h-1"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
                }}
                autoFocus
              />
              {errors.name && <span className="pmv2-form-error">{errors.name}</span>}
            </div>

            {/* Address / Location */}
            <div className="pmv2-form-group">
              <label className="pmv2-form-label">Address / Location</label>
              <input
                type="text"
                className="pmv2-form-input"
                placeholder="e.g. cbe or Main Campus"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="pmv2-modal-footer">
            <div className="pmv2-modal-footer-right">
              <button
                type="button"
                className="pmv2-btn pmv2-btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button type="submit" className="pmv2-btn pmv2-btn-primary">
                Create Property
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
