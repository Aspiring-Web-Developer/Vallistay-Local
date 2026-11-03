// src/Pages/PropertyManagementV2/components/V2LoadingSkeleton.jsx
import React from "react";

export default function V2LoadingSkeleton({ type = "cards", count = 3 }) {
  const items = Array.from({ length: count });

  if (type === "summary") {
    return (
      <div className="pmv2-summary-grid">
        {items.map((_, i) => (
          <div
            key={i}
            className="pmv2-summary-card"
            style={{ opacity: 0.6, animation: "pmv2FadeIn 1s infinite alternate" }}
          >
            <div style={{ height: 16, width: "60%", background: "#E5E7EB", borderRadius: 4 }} />
            <div style={{ height: 32, width: "40%", background: "#E5E7EB", borderRadius: 6, marginTop: 12 }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="pmv2-properties-grid">
      {items.map((_, i) => (
        <div
          key={i}
          className="pmv2-property-card"
          style={{ opacity: 0.6, animation: "pmv2FadeIn 1s infinite alternate", minHeight: 240 }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ width: 42, height: 42, background: "#E5E7EB", borderRadius: 10 }} />
            <div style={{ width: 70, height: 24, background: "#E5E7EB", borderRadius: 12 }} />
          </div>
          <div style={{ height: 20, width: "70%", background: "#E5E7EB", borderRadius: 4, marginBottom: 8 }} />
          <div style={{ height: 14, width: "50%", background: "#E5E7EB", borderRadius: 4, marginBottom: 20 }} />
          <div style={{ height: 60, width: "100%", background: "#F3F4F6", borderRadius: 8, marginBottom: 16 }} />
          <div style={{ height: 42, width: "100%", background: "#E5E7EB", borderRadius: 8, marginTop: "auto" }} />
        </div>
      ))}
    </div>
  );
}
