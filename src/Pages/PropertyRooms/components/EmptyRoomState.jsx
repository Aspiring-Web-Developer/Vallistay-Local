// src/Pages/PropertyRooms/components/EmptyRoomState.jsx
import React from "react";
import { BedDouble, Plus, SearchX } from "lucide-react";

export default function EmptyRoomState({ isSearchEmpty, onClearSearch, onAddRoom }) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        padding: "48px 24px",
        textAlign: "center",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "#f1f5f9",
          color: "#64748b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
        }}
      >
        {isSearchEmpty ? <SearchX size={32} /> : <BedDouble size={32} />}
      </div>

      <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: "0 0 6px 0" }}>
        {isSearchEmpty ? "No matching rooms found" : "No rooms found"}
      </h3>

      <p style={{ fontSize: 13.5, color: "#64748b", maxWidth: 400, margin: "0 auto 20px" }}>
        {isSearchEmpty
          ? "No rooms match your filter or search query. Try clearing the search query."
          : "Add a room to start managing live inventory and bookings for this property."}
      </p>

      <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
        {isSearchEmpty ? (
          <button
            type="button"
            className="pr-btn pr-btn-secondary"
            onClick={onClearSearch}
          >
            Clear Search
          </button>
        ) : (
          <button
            type="button"
            className="pr-btn pr-btn-primary"
            onClick={onAddRoom}
          >
            <Plus size={16} />
            <span>Add Room</span>
          </button>
        )}
      </div>
    </div>
  );
}
