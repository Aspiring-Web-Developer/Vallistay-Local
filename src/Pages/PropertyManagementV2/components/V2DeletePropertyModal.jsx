// src/Pages/PropertyManagementV2/components/V2DeletePropertyModal.jsx
import React from "react";
import { AlertTriangle, X } from "lucide-react";

export default function V2DeletePropertyModal({
  isOpen,
  property,
  onClose,
  onConfirm,
}) {
  if (!isOpen || !property) return null;

  return (
    <div className="pmv2-modal-backdrop" onClick={onClose}>
      <div className="pmv2-modal sm" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="pmv2-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "#FEE2E2",
                color: "#DC2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="pmv2-modal-title">Delete this property?</h3>
              <p className="pmv2-modal-subtitle">
                {property.name} ({property.code})
              </p>
            </div>
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

        {/* Body */}
        <div className="pmv2-modal-body">
          <p style={{ margin: 0, fontSize: 14, color: "#4B5563", lineHeight: 1.5 }}>
            Are you sure you want to delete{" "}
            <strong style={{ color: "#111827" }}>{property.name}</strong>? All
            associated rooms and inventory records will be removed.
          </p>

          <div
            style={{
              background: "#FFF1F2",
              border: "1px solid #FECDD3",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 13,
              color: "#9F1239",
              fontWeight: 500,
            }}
          >
            ⚠️ Warning: This action cannot be undone. Properties with active guest
            bookings cannot be deleted.
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
            <button
              type="button"
              className="pmv2-btn pmv2-btn-danger"
              onClick={() => onConfirm(property.id)}
            >
              Delete Property
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
