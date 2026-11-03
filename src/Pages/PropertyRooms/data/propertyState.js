// src/Pages/PropertyRooms/data/propertyState.js
// Reactive singleton store for Property Rooms mock state across pages

import { INITIAL_PROPERTIES, INITIAL_ROOMS_DATA } from "./mockRoomBookingData";

let properties = [...INITIAL_PROPERTIES];
let roomsByProperty = { ...INITIAL_ROOMS_DATA };
let listeners = new Set();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

export const propertyStore = {
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getProperties() {
    return properties;
  },

  getProperty(id) {
    return (
      properties.find(
        (p) =>
          p.id.toUpperCase() === id?.toUpperCase() ||
          p.shortCode?.toUpperCase() === id?.toUpperCase()
      ) || properties[0]
    );
  },

  addProperty(newProp) {
    const nextId = newProp.id || `G${properties.length + 1}`;
    const propRecord = {
      ...newProp,
      id: nextId,
      shortCode: nextId,
      code: newProp.code || `#F${properties.length + 1}-101`,
      totalRooms: parseInt(newProp.totalRooms || 0, 10) || 12,
      availableRooms: parseInt(newProp.availableRooms || newProp.totalRooms || 0, 10) || 12,
      occupiedRooms: 0,
      upcomingBookings: 0,
      status: newProp.status || "ACTIVE",
      liveSync: true,
      updatedAt: "Created just now",
    };
    properties = [propRecord, ...properties];
    if (!roomsByProperty[nextId]) {
      roomsByProperty[nextId] = [];
    }
    emitChange();
    return propRecord;
  },

  updateProperty(updatedProp) {
    properties = properties.map((p) =>
      p.id === updatedProp.id ? { ...p, ...updatedProp, updatedAt: "Updated just now" } : p
    );
    emitChange();
  },

  deleteProperty(id) {
    properties = properties.filter((p) => p.id !== id);
    delete roomsByProperty[id];
    emitChange();
  },

  getRooms(propertyId) {
    const key = propertyId?.toUpperCase() || "G1";
    return roomsByProperty[key] || [];
  },

  addRoom(propertyId, newRoom) {
    const key = propertyId?.toUpperCase() || "G1";
    const existing = roomsByProperty[key] || [];
    const nextRoomId = newRoom.id || `RM-${Math.floor(100 + Math.random() * 900)}`;
    const roomRecord = {
      ...newRoom,
      id: nextRoomId,
      propertyId: key,
      status: newRoom.status || "AVAILABLE",
      systemAudit: "Created just now",
      currentBooking: null,
    };
    roomsByProperty = {
      ...roomsByProperty,
      [key]: [...existing, roomRecord],
    };

    // Update property counts
    properties = properties.map((p) => {
      if (p.id.toUpperCase() === key) {
        return {
          ...p,
          totalRooms: (p.totalRooms || 0) + 1,
          availableRooms:
            roomRecord.status === "AVAILABLE"
              ? (p.availableRooms || 0) + 1
              : p.availableRooms || 0,
        };
      }
      return p;
    });

    emitChange();
    return roomRecord;
  },

  updateRoom(propertyId, updatedRoom) {
    const key = propertyId?.toUpperCase() || "G1";
    const list = roomsByProperty[key] || [];
    roomsByProperty = {
      ...roomsByProperty,
      [key]: list.map((r) => (r.id === updatedRoom.id ? { ...r, ...updatedRoom } : r)),
    };
    emitChange();
  },

  setRoomBooking(propertyId, roomId, bookingData) {
    const key = propertyId?.toUpperCase() || "G1";
    const list = roomsByProperty[key] || [];
    roomsByProperty = {
      ...roomsByProperty,
      [key]: list.map((r) => {
        if (r.id === roomId) {
          return {
            ...r,
            status: "BOOKED",
            currentBooking: bookingData,
            checkoutNote: bookingData.checkOut,
            systemAudit: `Booked by ${bookingData.customerName}`,
          };
        }
        return r;
      }),
    };

    // Update counts
    properties = properties.map((p) => {
      if (p.id.toUpperCase() === key) {
        return {
          ...p,
          availableRooms: Math.max(0, (p.availableRooms || 1) - 1),
          occupiedRooms: (p.occupiedRooms || 0) + 1,
        };
      }
      return p;
    });

    emitChange();
  },

  cancelRoomBooking(propertyId, roomId) {
    const key = propertyId?.toUpperCase() || "G1";
    const list = roomsByProperty[key] || [];
    roomsByProperty = {
      ...roomsByProperty,
      [key]: list.map((r) => {
        if (r.id === roomId) {
          return {
            ...r,
            status: "AVAILABLE",
            currentBooking: null,
            checkoutNote: undefined,
            systemAudit: "Booking cancelled • Available again",
          };
        }
        return r;
      }),
    };

    // Update counts
    properties = properties.map((p) => {
      if (p.id.toUpperCase() === key) {
        return {
          ...p,
          availableRooms: (p.availableRooms || 0) + 1,
          occupiedRooms: Math.max(0, (p.occupiedRooms || 1) - 1),
        };
      }
      return p;
    });

    emitChange();
  },
};
