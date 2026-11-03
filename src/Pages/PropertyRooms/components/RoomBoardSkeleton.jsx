// src/Pages/PropertyRooms/components/RoomBoardSkeleton.jsx
import React from "react";

export default function RoomBoardSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Metrics skeleton */}
      <div className="pr-stats-grid">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="pr-stat-card">
            <div style={{ width: "60%" }}>
              <div className="pr-skeleton" style={{ height: 12, width: "80%", marginBottom: 8 }} />
              <div className="pr-skeleton" style={{ height: 24, width: "50%" }} />
            </div>
            <div className="pr-skeleton" style={{ width: 36, height: 36, borderRadius: 10 }} />
          </div>
        ))}
      </div>

      {/* Cards skeleton */}
      <div className="pr-rooms-grid">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="pr-room-card"
            style={{ minHeight: 220, opacity: 0.85 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center", width: "70%" }}>
                <div className="pr-skeleton" style={{ width: 40, height: 40, borderRadius: 10 }} />
                <div style={{ flex: 1 }}>
                  <div className="pr-skeleton" style={{ height: 16, width: "70%", marginBottom: 6 }} />
                  <div className="pr-skeleton" style={{ height: 12, width: "90%" }} />
                </div>
              </div>
              <div className="pr-skeleton" style={{ width: 70, height: 24, borderRadius: 9999 }} />
            </div>

            <div style={{ padding: "14px 0", borderTop: "1px solid #f1f5f9", borderBottom: "1px solid #f1f5f9", marginBottom: 16 }}>
              <div className="pr-skeleton" style={{ height: 14, width: "40%", marginBottom: 8 }} />
              <div className="pr-skeleton" style={{ height: 14, width: "60%" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div className="pr-skeleton" style={{ height: 36, borderRadius: 10 }} />
              <div className="pr-skeleton" style={{ height: 36, borderRadius: 10 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
