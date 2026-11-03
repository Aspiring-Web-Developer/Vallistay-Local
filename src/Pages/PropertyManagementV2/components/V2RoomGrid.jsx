// src/Pages/PropertyManagementV2/components/V2RoomGrid.jsx
import React from "react";
import { DoorClosed, RotateCcw } from "lucide-react";
import V2RoomCard from "./V2RoomCard";

export default function V2RoomGrid({
  rooms,
  isFilterApplied,
  onQuickBook,
  onViewDetails,
  onEditRoom,
  onDeleteRoom,
  onClearDates,
  onAddRoom,
  canCreate = true,
  canUpdate = true,
  canDelete = true,
}) {
  if (!rooms || rooms.length === 0) {
    if (isFilterApplied) {
      return (
        <div className="pmv2-empty-state">
          <div className="pmv2-empty-icon">
            <DoorClosed size={28} />
          </div>
          <h4 className="pmv2-empty-title">No rooms available for these dates.</h4>
          <p className="pmv2-empty-subtitle">
            Try changing the check-in or check-out date to find available units.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button
              type="button"
              className="pmv2-btn pmv2-btn-secondary"
              onClick={onClearDates}
            >
              <RotateCcw size={15} />
              <span>Clear Dates</span>
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="pmv2-empty-state">
        <div className="pmv2-empty-icon">
          <DoorClosed size={28} />
        </div>
        <h4 className="pmv2-empty-title">No rooms found.</h4>
        <p className="pmv2-empty-subtitle">
          Add rooms to this property to start managing room availability and bookings.
        </p>
                {onAddRoom && canCreate && (
          <button
            type="button"
            className="pmv2-btn pmv2-btn-primary"
            onClick={onAddRoom}
            style={{ marginTop: 8 }}
          >
            Add Room
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="pmv2-rooms-grid">
      {rooms.map((room) => (
        <V2RoomCard
          key={room.id}
          room={room}
          isFilterApplied={isFilterApplied}
          onQuickBook={onQuickBook}
          onViewDetails={onViewDetails}
          onEditRoom={onEditRoom}
          onDeleteRoom={onDeleteRoom}
          canCreate={canCreate}
          canUpdate={canUpdate}
          canDelete={canDelete}
        />
      ))}
    </div>
  );
}
