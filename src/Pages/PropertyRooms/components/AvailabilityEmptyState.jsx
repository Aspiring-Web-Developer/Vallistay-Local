// src/Pages/PropertyRooms/components/AvailabilityEmptyState.jsx
import React from "react";
import { DoorClosed, CalendarX, Sparkles, ArrowRight, RotateCcw } from "lucide-react";
import { getUpcomingCheckoutSuggestions } from "../data/mockRoomBookingData";

export default function AvailabilityEmptyState({
  allRooms = [],
  filterDates,
  onClearDates,
  onApplySuggestedDates,
}) {
  const suggestions = getUpcomingCheckoutSuggestions(allRooms);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ── Main Big Icon Empty State ── */}
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
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "#fee2e2",
            color: "#dc2626",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <DoorClosed size={36} />
        </div>

        <h3
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "#0f172a",
            margin: "0 0 6px 0",
          }}
        >
          No rooms available for selected dates
        </h3>

        <p
          style={{
            fontSize: "14px",
            color: "#64748b",
            maxWidth: "460px",
            margin: "0 auto 20px",
            lineHeight: 1.5,
          }}
        >
          All rooms in this property are currently booked or occupied during{" "}
          <strong>{filterDates?.checkIn}</strong> to{" "}
          <strong>{filterDates?.checkOut}</strong>. Try choosing alternative dates
          below or clear the date filter.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
          <button
            type="button"
            className="pr-btn pr-btn-secondary"
            onClick={onClearDates}
          >
            <RotateCcw size={15} />
            <span>Clear Dates Filter</span>
          </button>
        </div>
      </div>

      {/* ── Downside Separately Show Closest Check-in Dates (Smart Availability Suggestions) ── */}
      {suggestions.length > 0 && (
        <div className="pr-smart-suggestions-box">
          <div className="pr-suggestions-header">
            <Sparkles size={18} color="#2563eb" />
            <span>
              💡 Closest Available Check-in Dates Based on Upcoming Checkouts:
            </span>
          </div>

          <p style={{ fontSize: 13, color: "#475569", margin: "0 0 14px 0" }}>
            Guests in these rooms are scheduled to checkout soon. Click any option
            to immediately search room availability starting from their checkout date:
          </p>

          <div className="pr-suggestions-grid">
            {suggestions.map((sug, idx) => (
              <div key={idx} className="pr-suggestion-item">
                <div className="pr-sug-info">
                  <div className="pr-sug-room">
                    {sug.roomNumber} • Guest {sug.guestName}
                  </div>
                  <div className="pr-sug-text">
                    Checkout: <strong>{sug.checkoutDisplay}</strong>
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#16a34a",
                      fontWeight: 600,
                      marginTop: 2,
                    }}
                  >
                    Available from {sug.suggestedCheckIn} ({sug.nights} nights)
                  </div>
                </div>

                <button
                  type="button"
                  className="pr-btn pr-btn-soft-blue"
                  style={{ fontSize: 12, padding: "6px 12px" }}
                  onClick={() =>
                    onApplySuggestedDates(sug.suggestedCheckIn, sug.suggestedCheckOut)
                  }
                >
                  <span>Try Dates</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
