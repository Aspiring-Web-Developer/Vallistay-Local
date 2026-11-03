// src/Pages/PropertyManagementV2/utils/availabilityUtils.js

/**
 * Check if two date intervals overlap:
 * startA < endB && endA > startB
 */
export function isDateOverlap(startA, endA, startB, endB) {
  if (!startA || !endA || !startB || !endB) return false;
  return startA < endB && endA > startB;
}

/**
 * Check if a room is available for given check-in and check-out dates
 * @param {Object} room
 * @param {string} requestedCheckIn YYYY-MM-DD
 * @param {string} requestedCheckOut YYYY-MM-DD
 * @returns {{ isAvailable: boolean, reason?: string }}
 */
export function checkRoomAvailability(room, requestedCheckIn, requestedCheckOut) {
  if (!room) return { isAvailable: false, reason: "Room not found" };

  // Maintenance rooms are never available
  if (room.status === "maintenance") {
    return { isAvailable: false, reason: "Under Maintenance" };
  }

  // If no dates provided, evaluate purely on current live status
  if (!requestedCheckIn || !requestedCheckOut) {
    if (room.status === "available") {
      return { isAvailable: true };
    }
    if (room.status === "occupied") {
      return { isAvailable: false, reason: "Currently Occupied" };
    }
    if (room.status === "booked") {
      return { isAvailable: false, reason: "Currently Booked" };
    }
    if (room.status === "due_out") {
      return { isAvailable: false, reason: "Due Out Today" };
    }
    return { isAvailable: false, reason: "Unavailable" };
  }

  // Date-based overlap check against active booking
  const booking = room.activeBooking;
  if (booking) {
    const blockingStatuses = ["confirmed", "checked_in"];
    if (blockingStatuses.includes(booking.status)) {
      if (
        isDateOverlap(
          requestedCheckIn,
          requestedCheckOut,
          booking.checkIn,
          booking.checkOut
        )
      ) {
        return {
          isAvailable: false,
          reason: "Booked for selected dates",
        };
      }
    }
  }

  return { isAvailable: true };
}

/**
 * Filter rooms list and decorate each with availability status
 */
export function evaluateRoomsAvailability(rooms, checkIn, checkOut) {
  if (!Array.isArray(rooms)) return [];
  return rooms.map((room) => {
    const result = checkRoomAvailability(room, checkIn, checkOut);
    return {
      ...room,
      isAvailableForDates: result.isAvailable,
      unavailableReason: result.reason || null,
    };
  });
}
