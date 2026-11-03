


// src/Pages/PropertyManagementV2/context/PropertyManagementV2Context.jsx
import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { isDateOverlap } from "../utils/availabilityUtils";
import { ToastProvider, useToast } from "../components/V2ToastMessages";
import {
  propertyApi,
  subRoomApi,
  bookingApi,
  customerApi,
  BOOKING_STATUS,
} from "../services/propertyManagementV2Service";
import { useNavigate } from "react-router-dom";

const PropertyManagementV2Context = createContext(null);

/* ── date helpers (shared by all pages) ───────────────────────────── */
export const toYMD = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

export const bookingOverlaps = (b, from, to) =>
  Boolean(b.checkIn && b.checkOut) && b.checkIn < to && b.checkOut > from;

export function getTodayRange() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  return { from: toYMD(today), to: toYMD(tomorrow) };
}

/**
 * Resolve a room's status + activeBooking for ONE date range only.
 * includeOverstay: a guest still checked in past planned checkout stays "occupied"
 * (use for the "today" view, not for a selected date range).
 */
export function scopeRoom(room, from, to, includeOverstay = false) {
  const inRange = (room.bookings || []).filter(
    (b) =>
      bookingOverlaps(b, from, to) ||
      (includeOverstay && b.status === "checked_in" && b.checkIn < to)
  );

  // checked-in guest wins, otherwise earliest booking
  const hit =
    inRange.find((b) => b.status === "checked_in") || inRange[0] || null;

  let status = "available";
  if (room.raw?.is_maintenance) status = "maintenance";
  else if (hit) status = hit.status === "checked_in" ? "occupied" : "booked";

  return {
    ...room,
    status,
    activeBooking: hit,
    rangeBookings: inRange,
    checkoutNote: hit ? `Checkout: ${hit.checkOut}` : null,
  };
}

/** Pull the real backend message out of any error */
function getErrMsg(err, fallback = "Something went wrong. Please try again.") {
  const d = err?.response?.data;
  return d?.message || d?.error || d?.detail || err?.message || fallback;
}

/** Make backend booking errors readable for the user */
function friendlyBookingError(err) {
  const msg = getErrMsg(err, "Booking failed. Please try again.");
  if (/duplicate|unique/i.test(msg)) {
    return "Booking failed: a customer with this email or phone already exists. Please contact support or use different details.";
  }
  return msg;
}

function ContextProviderInner({ children }) {
  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [isInitialLoadDone, setIsInitialLoadDone] = useState(false);
  const { toast } = useToast();
const navigate = useNavigate();
  // Availability Date Search State
  const [dateFilter, setDateFilter] = useState({
    checkIn: "",
    checkOut: "",
    isApplied: false,
  });
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  // ── LOAD INITIAL PROPERTIES FROM BACKEND API ──────────────────────────
  const fetchProperties = useCallback(async () => {
    setIsLoadingProperties(true);
    try {
      const apiProps = await propertyApi.listProperties();
      if (Array.isArray(apiProps)) {
        setProperties(apiProps);
      }
    } catch (err) {
      console.warn("Backend API error fetching properties:", err.message);
      setProperties([]);
    } finally {
      setIsLoadingProperties(false);
      setIsInitialLoadDone(true);
    }
  }, []);

  // ── LOAD REAL CUSTOMERS FROM BACKEND API ───────────────────────────────
  const fetchCustomers = useCallback(async () => {
    try {
      const apiCusts = await customerApi.listCustomers();
      if (Array.isArray(apiCusts) && apiCusts.length > 0) {
        setCustomers(apiCusts);
      }
    } catch (err) {
      console.warn("Backend API error fetching customers:", err.message);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
    fetchCustomers();
  }, [fetchProperties, fetchCustomers]);

  // ── FETCH SUB-ROOMS FOR A GIVEN PROPERTY ──────────────────────────────
  const fetchRoomsForProperty = useCallback(
    async (propertyId, fromDate = null, endDate = null, propertyName = "") => {
      if (!propertyId) return;
      setIsLoadingRooms(true);
      try {
        const apiRooms = await subRoomApi.listSubRooms(
          propertyId,
          fromDate,
          endDate,
          propertyName
        );
        if (Array.isArray(apiRooms)) {
          setRooms((prev) => {
            // Keep rooms of other properties, replace rooms for this property
            const others = prev.filter((r) => r.propertyId !== propertyId);
            return [...others, ...apiRooms];
          });
        }
      } catch (err) {
        console.warn("Failed to fetch sub-rooms from backend:", err.message);
      } finally {
        setIsLoadingRooms(false);
      }
    },
    []
  );

  // ── ROOMS RESOLVED FOR TODAY (used by Overview + Details) ─────────────
  const roomsToday = useMemo(() => {
    const { from, to } = getTodayRange();
    return rooms.map((r) => scopeRoom(r, from, to, true));
  }, [rooms]);

  // ── RECOMPUTE PROPERTY COUNTS (today only) ────────────────────────────
  const propertiesWithDynamicCounts = useMemo(() => {
    return properties.map((prop) => {
      const propRooms = roomsToday.filter((r) => r.propertyId === prop.id);
      const hasRooms = propRooms.length > 0;

      const total = hasRooms ? propRooms.length : prop.totalRooms || 0;
      const available = hasRooms
        ? propRooms.filter((r) => r.status === "available").length
        : prop.availableRooms || 0;
      const occupied = hasRooms
        ? propRooms.filter((r) => r.status === "occupied").length
        : prop.occupiedRooms || 0;
      const booked = hasRooms
        ? propRooms.filter((r) => r.status === "booked").length
        : prop.activeBookings || 0;
      const activeBookings = hasRooms
        ? propRooms.filter((r) => r.activeBooking !== null).length
        : prop.activeBookings || 0;

      return {
        ...prop,
        totalRooms: total,
        availableRooms: available,
        occupiedRooms: occupied,
        bookedRooms: booked,
        activeBookings,
      };
    });
  }, [properties, roomsToday]);

  // ── OVERALL SUMMARY STATS ──────────────────────────────────────────
  const summaryStats = useMemo(() => {
    const totalProperties = propertiesWithDynamicCounts.length;
    const sum = (key) =>
      propertiesWithDynamicCounts.reduce((s, p) => s + (p[key] || 0), 0);

    return {
      totalProperties,
      totalRooms: sum("totalRooms"),
      availableRooms: sum("availableRooms"),
      activeBookings: sum("activeBookings"),
      occupiedRooms: sum("occupiedRooms"),
    };
  }, [propertiesWithDynamicCounts]);

  // ── PROPERTY ACTIONS ───────────────────────────────────────────────

  // Add Property (POST /api/rooms/create_rooms)
  const addProperty = useCallback(
    async (propertyData) => {
      try {
const res = await propertyApi.createProperty({
  name: propertyData.name,
  address: propertyData.address ?? propertyData.location ?? "",
});
        if (res?.success === false) {
          throw new Error(res.message || "Failed to create property.");
        }
        toast.success("Property created successfully.");
        await fetchProperties();
        return true;
      } catch (err) {
        console.error("API createProperty error:", err);
        toast.error(getErrMsg(err, "Failed to create property."));
        return false;
      }
    },
    [fetchProperties, toast]
  );

  // Edit Property (PUT /api/rooms/update_rooms)
  const editProperty = useCallback(
    async (propertyId, updatedData) => {
      try {
const res = await propertyApi.updateProperty({
  roomId: propertyId,
  name: updatedData.name,
  address: updatedData.address ?? updatedData.location,
});
        if (res?.success === false) {
          throw new Error(res.message || "Failed to update property.");
        }
        toast.success("Property updated successfully.");
        await fetchProperties();
        return true;
      } catch (err) {
        console.error("API updateProperty error:", err);
        toast.error(getErrMsg(err, "Failed to update property."));
        return false;
      }
    },
    [fetchProperties, toast]
  );

  // Delete Property (local only - no backend endpoint wired yet)
  const deleteProperty = useCallback(
    (propertyId) => {
      const propRooms = rooms.filter((r) => r.propertyId === propertyId);
      // any live booking on any date blocks deletion
      const hasActiveBooking = propRooms.some(
        (r) => (r.bookings || []).length > 0
      );

      if (hasActiveBooking) {
        toast.error(
          "This property cannot be deleted because it has rooms with active bookings."
        );
        return false;
      }

      setProperties((prev) => prev.filter((p) => p.id !== propertyId));
      setRooms((prev) => prev.filter((r) => r.propertyId !== propertyId));
      toast.success("Property deleted successfully.");
      return true;
    },
    [rooms, toast]
  );

  // ── ROOM ACTIONS (SUB-ROOMS) ───────────────────────────────────────

  // Add Room (POST /api/sub_rooms/create_subrooms)
  // Add Room (POST /api/sub_rooms/create_subrooms)
  const addRoom = useCallback(
    async (roomData) => {
      const parentProperty = properties.find((p) => p.id === roomData.roomId);
      try {
        const res = await subRoomApi.createSubRoom({
          roomId: roomData.roomId,
          subRoomName: roomData.subRoomName,
          maxAdults: roomData.maxAdults,
          maxChildren: roomData.maxChildren,
          pricePerDay: roomData.pricePerDay,
        });
        if (res?.success === false) {
          throw new Error(res.message || "Failed to create room.");
        }

        toast.success("Room created successfully.");
        if (parentProperty) {
          await fetchRoomsForProperty(parentProperty.id, null, null, parentProperty.name);
        }
        await fetchProperties();
        return true;
      } catch (err) {
        console.error("API createSubRoom error:", err);
        toast.error(getErrMsg(err, "Failed to create room."));
        return false;
      }
    },
    [properties, fetchRoomsForProperty, fetchProperties, toast]
  );

  // Edit Room (PUT /api/sub_rooms/update_subrooms)
  const editRoom = useCallback(
    async (subRoomId, updatedData) => {
      const currentRoom = rooms.find((r) => r.id === subRoomId);
      try {
        const res = await subRoomApi.updateSubRoom({
          room_id: updatedData.roomId,
          sub_room_id: subRoomId,
          sub_room_name: updatedData.subRoomName,
          max_adults: updatedData.maxAdults,
          max_children: updatedData.maxChildren,
          price_per_day: updatedData.pricePerDay,
        });
        if (res?.success === false) {
          throw new Error(res.message || "Failed to update room.");
        }

        toast.success("Room updated successfully.");
        await fetchRoomsForProperty(
          updatedData.roomId,
          null,
          null,
          currentRoom?.propertyName || ""
        );
        await fetchProperties();
        return true;
      } catch (err) {
        console.error("API updateSubRoom error:", err);
        toast.error(getErrMsg(err, "Failed to update room."));
        return false;
      }
    },
    [rooms, fetchRoomsForProperty, fetchProperties, toast]
  );

  // Check In Guest -> updates the BOOKING status
  const checkInGuest = useCallback(
    async (roomId, bookingIdOverride) => {
      const room = rooms.find((r) => r.id === roomId);
      const bookingId = bookingIdOverride || room?.activeBooking?.roomBookingId;
      if (!bookingId) {
        toast.error("No active reservation found to check in.");
        return false;
      }
      try {
        await bookingApi.changeStatus(bookingId, BOOKING_STATUS.CHECKED_IN);
        toast.success("Guest checked in. Room is now occupied.");
        await fetchRoomsForProperty(room.propertyId, null, null, room.propertyName);
        await fetchProperties();
        return true;
      } catch (err) {
        toast.error(getErrMsg(err, "Check-in failed. Please try again."));
        return false;
      }
    },
    [rooms, fetchRoomsForProperty, fetchProperties, toast]
  );

  // Check Out Guest -> updates the BOOKING status
  const checkOutGuest = useCallback(
    async (roomId, bookingIdOverride) => {
      const room = rooms.find((r) => r.id === roomId);
      const bookingId = bookingIdOverride || room?.activeBooking?.roomBookingId;
      if (!bookingId) {
        toast.error("No active stay found to check out.");
        return false;
      }
      try {
        await bookingApi.changeStatus(bookingId, BOOKING_STATUS.CHECKED_OUT);
        toast.success("Guest checked out. Room is now available.");
        await fetchRoomsForProperty(room.propertyId, null, null, room.propertyName);
        await fetchProperties();
        return true;
      } catch (err) {
        toast.error(getErrMsg(err, "Check-out failed. Please try again."));
        return false;
      }
    },
    [rooms, fetchRoomsForProperty, fetchProperties, toast]
  );

  // Maintenance -> only send the field the Subrooms model has
  const toggleRoomMaintenance = useCallback(
    async (roomId, setMaintenance) => {
      const room = rooms.find((r) => r.id === roomId);
      if (!room) return false;
      try {
        const res = await subRoomApi.updateSubRoom({
          sub_room_id: room.sub_room_id || roomId,
          room_id: room.propertyId,
          is_maintenance: setMaintenance,
        });
        if (res?.success === false) throw new Error(res.message);

        if (setMaintenance) toast.info(`Room ${room.roomNumber} set to maintenance.`);
        else toast.success(`Room ${room.roomNumber} is back in service.`);

        await fetchRoomsForProperty(room.propertyId, null, null, room.propertyName);
        await fetchProperties();
        return true;
      } catch (err) {
        toast.error(getErrMsg(err, "Failed to update maintenance status."));
        return false;
      }
    },
    [rooms, fetchRoomsForProperty, fetchProperties, toast]
  );

  // Delete Room (local only - no backend endpoint wired yet)
  // Delete Room (DELETE /api/sub_rooms/delete_subrooms)
  const deleteRoom = useCallback(
    async (roomId) => {
      const currentRoom = rooms.find((r) => r.id === roomId);
      if (currentRoom && (currentRoom.bookings || []).length > 0) {
        toast.error("This room cannot be deleted because it has an active booking.");
        return false;
      }

      try {
        const res = await subRoomApi.deleteSubRoom(
          currentRoom?.sub_room_id || roomId
        );
        if (res?.success === false) {
          throw new Error(res.message || "Failed to delete room.");
        }

        // remove from the screen immediately
        setRooms((prev) => prev.filter((r) => r.id !== roomId));
        toast.success("Room deleted successfully.");

        // refresh property counts only, don't refetch rooms
        fetchProperties();
        return true;
      } catch (err) {
        console.error("API deleteSubRoom error:", err);
        toast.error(getErrMsg(err, "Failed to delete room."));
        return false;
      }
    },
    [rooms, fetchProperties, toast]
  );
  // Add New Customer (local only until backend customer create is wired)
  const addCustomer = useCallback((customerData) => {
    const newCust = {
      id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      name: customerData.name,
      phone: customerData.phone,
      email: customerData.email || "",
      avatarBg: "#2563EB",
      initials: customerData.name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
    };
    setCustomers((prev) => [newCust, ...prev]);
    return newCust;
  }, []);

  // Quick Book Room (POST /api/room_booking/create_customer_booking)
  const quickBookRoom = useCallback(
    async ({ roomId, customer, checkIn, checkOut }) => {
      const room = rooms.find((r) => r.id === roomId);
      if (!room) {
        toast.error("Room not found.");
        return false;
      }

      // Client-side overlap check against ALL live bookings of this room
      const clash = (room.bookings || []).some((b) =>
        isDateOverlap(checkIn, checkOut, b.checkIn, b.checkOut)
      );
      if (clash) {
        toast.error(
          "This room is no longer available for the selected dates. Please choose different dates."
        );
        return false;
      }

      // Server-side availability check
      try {
        const avail = await bookingApi.checkAvailability({
          roomId: room.propertyId,
          subRoomId: room.sub_room_id || room.id,
          checkIn,
          checkOut,
        });
        if (!avail.available) {
          toast.error(
            `Room ${room.roomNumber} is already booked or occupied for ${checkIn} to ${checkOut}. Please choose different dates.`
          );
          return false;
        }
      } catch (err) {
        toast.error(getErrMsg(err, "Could not check room availability."));
        return false;
      }

      try {
        const res = await bookingApi.createBooking({
          roomId: room.propertyId,
          subRoomId: room.sub_room_id || room.id,
          customer,
          checkIn,
          checkOut,
        });
        if (res?.success === false) {
          throw new Error(res.message || "Booking failed.");
        }

        toast.success(
          `Booking confirmed for ${customer.name} in Room ${room.roomNumber}.`
        );

        // Reload from server (never fake booking locally)
        if (customer.isNew) await fetchCustomers();
        await fetchRoomsForProperty(room.propertyId, null, null, room.propertyName);
        await fetchProperties();

        console.log("booking response:", res); // check this in the browser console
        const bookingId =
          res?.data?.room_booking_id ||
          res?.room_booking_id ||
          res?.data?.booking?.room_booking_id;
        if (bookingId) navigate(`/invoices/room-create?booking_id=${bookingId}`);
        return true;
      } catch (err) {
        console.error("API createBooking error:", err);
        toast.error(friendlyBookingError(err));
        return false;
      }
    },
[rooms, fetchRoomsForProperty, fetchProperties, fetchCustomers, toast, navigate]
  );

  // Cancel Booking (PUT /api/room_booking/cancel_booking)
  const cancelBooking = useCallback(
    async (roomId, bookingIdOverride) => {
      const room = rooms.find((r) => r.id === roomId);
      if (!room || !(bookingIdOverride || room.activeBooking)) {
        toast.error("We couldn’t cancel this booking. Please try again.");
        return false;
      }

      const bookingIdToCancel =
        bookingIdOverride ||
        room.activeBooking.roomBookingId ||
        room.activeBooking.bookingId;

      try {
        const res = await bookingApi.cancelBooking(bookingIdToCancel);
        if (res?.success === false) {
          throw new Error(res.message || "Cancellation failed.");
        }

        toast.success("Booking cancelled successfully. The room is available again.");
        await fetchRoomsForProperty(room.propertyId, null, null, room.propertyName);
        await fetchProperties();
        return true;
      } catch (err) {
        console.error("API cancelBooking error:", err);
        toast.error(getErrMsg(err, "Cancellation failed. Please try again."));
        return false;
      }
    },
    [rooms, fetchRoomsForProperty, fetchProperties, toast]
  );

  // Live availability check used by the quick-booking modal
  const checkRoomAvailability = useCallback(
    async (roomId, checkIn, checkOut, { notify = false } = {}) => {
      const room = rooms.find((r) => r.id === roomId);
      if (!room || !checkIn || !checkOut || checkOut <= checkIn) {
        return { available: false, message: "" };
      }
      try {
        const res = await bookingApi.checkAvailability({
          roomId: room.propertyId,
          subRoomId: room.sub_room_id || room.id,
          checkIn,
          checkOut,
        });
        if (!res.available) {
          const message = `Room ${room.roomNumber} is already booked or occupied for these dates.`;
          if (notify) toast.error(message);
          return { available: false, message };
        }
        return { available: true, message: "" };
      } catch (err) {
        // Don't block the UI if the check itself fails; backend validates again on save
        return { available: true, message: "" };
      }
    },
    [rooms, toast]
  );

  // Edit stay dates of the active booking (backend validates availability)
  const updateBookingDates = useCallback(
    async (roomId, checkIn, checkOut, bookingIdOverride) => {
      const room = rooms.find((r) => r.id === roomId);
      const bookingId = bookingIdOverride || room?.activeBooking?.roomBookingId;
      if (!bookingId) {
        toast.error("No active booking found to edit.");
        return false;
      }
      if (!checkIn || !checkOut || checkOut <= checkIn) {
        toast.error("Check-out must be after check-in.");
        return false;
      }
      try {
        await bookingApi.updateBookingDates(bookingId, checkIn, checkOut);
        toast.success("Stay dates updated.");
        await fetchRoomsForProperty(room.propertyId, null, null, room.propertyName);
        await fetchProperties();
        return true;
      } catch (err) {
        toast.error(getErrMsg(err, "Could not update stay dates."));
        return false;
      }
    },
    [rooms, fetchRoomsForProperty, fetchProperties, toast]
  );

  // Search Availability
  const searchAvailability = useCallback(
    async (checkIn, checkOut, propertyId = null) => {
      setIsCheckingAvailability(true);
      try {
        if (propertyId) {
          await fetchRoomsForProperty(propertyId, checkIn, checkOut);
        }
        setDateFilter({ checkIn, checkOut, isApplied: true });
        // toast.success("Room availability updated.");
      } catch (e) {
        console.warn(e);
        toast.error(getErrMsg(e, "Could not check availability."));
      } finally {
        setIsCheckingAvailability(false);
      }
    },
    [fetchRoomsForProperty, toast]
  );

  // Clear Dates
  const clearAvailabilityDates = useCallback(
    (propertyId = null, propertyName = "") => {
      setDateFilter({
        checkIn: "",
        checkOut: "",
        isApplied: false,
      });
      if (propertyId) {
        fetchRoomsForProperty(propertyId, null, null, propertyName);
      }
    },
    [fetchRoomsForProperty]
  );

  const value = {
    properties: propertiesWithDynamicCounts,
    rooms,
    roomsToday,
    customers,
    summaryStats,
    dateFilter,
    isCheckingAvailability,
    isLoadingProperties,
    isLoadingRooms,
    isInitialLoadDone,
    fetchProperties,
    fetchRoomsForProperty,
    addProperty,
    editProperty,
    deleteProperty,
    addRoom,
    editRoom,
    deleteRoom,
    checkInGuest,
    checkOutGuest,
    toggleRoomMaintenance,
    addCustomer,
    quickBookRoom,
    cancelBooking,
    checkRoomAvailability,
    updateBookingDates,
    searchAvailability,
    clearAvailabilityDates,
  };

  return (
    <PropertyManagementV2Context.Provider value={value}>
      {children}
    </PropertyManagementV2Context.Provider>
  );
}

export function PropertyManagementV2Provider({ children }) {
  return (
    <ToastProvider>
      <ContextProviderInner>{children}</ContextProviderInner>
    </ToastProvider>
  );
}

export function usePropertyManagementV2() {
  const context = useContext(PropertyManagementV2Context);
  if (!context) {
    throw new Error(
      "usePropertyManagementV2 must be used within a PropertyManagementV2Provider"
    );
  }
  return context;
}