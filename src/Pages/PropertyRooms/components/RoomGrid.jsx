// src/Pages/PropertyRooms/components/RoomGrid.jsx
import React, { useState } from "react";
import RoomCard from "./RoomCard";

export default function RoomGrid({
  rooms = [],
  totalRoomsCount = 48,
  onQuickBook,
  onViewDetails,
  onViewBooking,
  viewMode = "grid",
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const totalPages = Math.ceil(rooms.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedRooms = rooms.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      {/* ── Grid Container ── */}
      <div
        className="pr-rooms-grid"
        style={{
          display: "grid",
          gridTemplateColumns:
            viewMode === "list" ? "1fr" : undefined,
        }}
      >
        {displayedRooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            onQuickBook={onQuickBook}
            onViewDetails={onViewDetails}
            onViewBooking={onViewBooking}
          />
        ))}
      </div>

      {/* ── Pagination ── */}
      <div className="pr-pagination">
        <div className="pr-pagination-info">
          Showing {displayedRooms.length} of {rooms.length} rooms (Total{" "}
          {totalRoomsCount} units)
        </div>

        <div className="pr-pagination-controls">
          <button
            type="button"
            className="pr-page-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>

          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx + 1}
              type="button"
              className={`pr-page-btn ${currentPage === idx + 1 ? "active" : ""}`}
              onClick={() => setCurrentPage(idx + 1)}
            >
              {idx + 1}
            </button>
          ))}

          <button
            type="button"
            className="pr-page-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
