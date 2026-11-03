



// src/Pages/PropertyManagementV2/services/propertyManagementV2Service.js
import api from "../../../services/api";

// Backend booking status words (must match RoomBooking.status on the backend)
export const BOOKING_STATUS = {
  CHECKED_IN: "checkin",
  CHECKED_OUT: "checkout",
};

// Accept both spellings so the UI never breaks if backend uses either
const CHECKED_IN_STATUSES = ["checkin", "checked_in"];
const CHECKED_OUT_STATUSES = ["checkout", "checked_out"];

/**
 * Helper to parse date from Mongo ($date: timestamp) or ISO/string to YYYY-MM-DD
 */
export function parseApiDate(val) {
  if (!val) return "";
  if (typeof val === "object" && val.$date) {
    const d = new Date(val.$date);
    return d.toISOString().split("T")[0];
  }
  if (typeof val === "number") {
    const d = new Date(val);
    return d.toISOString().split("T")[0];
  }
  if (typeof val === "string") {
    // If format is "2026-10-21 16:30" or "2026-10-21"
    return val.split(" ")[0];
  }
  return "";
}

/**
 * Helper to parse Mongo date to readable audit string
 */
export function parseApiDateTime(val) {
  if (!val) return "Just now";
  let d;
  if (typeof val === "object" && val.$date) {
    d = new Date(val.$date);
  } else if (typeof val === "number") {
    d = new Date(val);
  } else {
    d = new Date(val);
  }
  if (isNaN(d.getTime())) return "Recently";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Transform Backend Property Room Record -> UI Property Object
 */
export function mapBackendProperty(item) {
  const roomId = item.room_id || (item._id?.$oid || item._id);
  const name = item.room_name || "Unnamed Property";
  const address = item.address || "";

  // Derive a short code like G1, H1 from name or id
  const nameParts = name.trim().split(/\s+/);
  const code = nameParts.length > 1 ? nameParts[nameParts.length - 1].toUpperCase() : name.slice(0, 3).toUpperCase();

  const summary = item.summary || {};
  const total = summary.total_rooms ?? (item.total_rooms || 0);
  const available = summary.available_rooms ?? 0;
  const occupied = summary.occupied_rooms ?? 0;
  const upcoming = summary.upcoming_booked_rooms ?? 0;

  return {
    id: roomId,
    code: code,
    name: name,
    shortName: name,
    propertyCodeTag: `#${code}-01`,
    location: address,
    city: address,
    // type: "Boutique Hotel",
    status: item.is_active !== false ? "Active" : "Inactive",
    totalRooms: total,
    availableRooms: available,
    occupiedRooms: occupied,
    activeBookings: upcoming,
    liveSync: true,
    createdAt: parseApiDateTime(item.created_at),
    updatedAt: "Just now",
    raw: item,
  };
}

/**
 * Transform Backend Sub-Room Record -> UI Room Object
 */





function calcNights(from, to) {
  if (!from || !to) return 1;
  const diff = Math.round((new Date(to) - new Date(from)) / 86400000);
  return diff > 0 ? diff : 1;
}

function buildBooking(occ) {
  const isCheckedIn = CHECKED_IN_STATUSES.includes(occ.status || "booked");
  const checkIn = parseApiDate(occ.booking_check_in_date);
  const checkOut = parseApiDate(occ.booking_check_out_date);
  return {
    bookingId: occ.booking_number || occ.room_booking_id || "BK-001",
    bookingFolio: occ.booking_number || "BK-001",
    roomBookingId: occ.room_booking_id,
    customer: {
      id: occ.customer_id || "CUST-001",
      name: occ.name || "Guest",
      phone: occ.phone || "",
      email: occ.email || "",
      initials: (occ.name || "G")
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    },
    checkIn,
    checkOut,
    nights: calcNights(checkIn, checkOut),
    status: isCheckedIn ? "checked_in" : "confirmed",
    stayIndicator: isCheckedIn ? "Current Stay" : "Upcoming Stay",
  };
}

/**
 * Transform Backend Sub-Room Record -> UI Room Object
 */
export function mapBackendSubRoom(sub, propertyName = "") {
  const subId = sub.sub_room_id || (sub._id?.$oid || sub._id);
  const roomId = sub.room_id;
  const name = sub.sub_room_name || "Room";

  // ALL live bookings of this room (not cancelled, not checked out), earliest first
  const bookings = (Array.isArray(sub.occupants) ? sub.occupants : [])
    .filter((o) => !o.cancelled && !CHECKED_OUT_STATUSES.includes(o.status))
    .map(buildBooking)
    .sort((a, b) => (a.checkIn || "").localeCompare(b.checkIn || ""));

  // Fallback only. The Rooms page re-scopes this by the date being viewed.
  const activeBooking = bookings[0] || null;

  let roomStatus = "available";
  if (sub.is_maintenance) roomStatus = "maintenance";
  else if (activeBooking)
    roomStatus = activeBooking.status === "checked_in" ? "occupied" : "booked";
  else if (sub.is_occupied) roomStatus = "occupied";

  return {
    id: subId,
    sub_room_id: subId,
    roomId: `#RM-${name.replace(/[^0-9]/g, "") || String(subId).slice(0, 4)}`,
    roomNumber: name,
    roomName: name,
    roomType: sub.room_type || "Deluxe Suite",
    floor: "Floor 1",
    wing: "Main Wing",
    propertyId: roomId,
    propertyName: propertyName,
    pricePerDay: sub.price_per_day || 0,
    maxAdults: sub.max_adults || 2,
    maxChildren: sub.max_children || 0,
    totalRooms: sub.total_rooms || 1,
    status: roomStatus,
    // features: [
    //   `Max ${sub.max_adults || 2} Adults`,
    //   `₹${sub.price_per_day || 2500}/day`,
    //   "Keyless RF",
    // ],
        features: [
      `Max ${sub.max_adults || 2} Adults`,
      ...(sub.price_per_day ? [`₹${sub.price_per_day}/day`] : []),
    ],
    checkoutNote: activeBooking ? `Checkout: ${activeBooking.checkOut}` : null,
    createdAt: parseApiDateTime(sub.created_at),
    updatedAt: "Just now",
    activeBooking,
    bookings,
    raw: sub,
  };
}
// export function mapBackendSubRoom(sub, propertyName = "") {
//   const subId = sub.sub_room_id || (sub._id?.$oid || sub._id);
//   const roomId = sub.room_id;
//   const name = sub.sub_room_name || "Room";

//   // Determine active booking from occupants
//   let activeBooking = null;
//   let roomStatus = "available";

//   if (sub.is_maintenance) {
//     roomStatus = "maintenance";
//   }

//   if (Array.isArray(sub.occupants) && sub.occupants.length > 0) {
//     const activeOcc = sub.occupants.find(
//       (o) => !o.cancelled && !CHECKED_OUT_STATUSES.includes(o.status)
//     );
//     if (activeOcc) {
//       const occStatus = activeOcc.status || "booked";
//       const isCheckedIn = CHECKED_IN_STATUSES.includes(occStatus);
//       roomStatus = isCheckedIn ? "occupied" : "booked";

//       const checkInDate = parseApiDate(activeOcc.booking_check_in_date);
//       const checkOutDate = parseApiDate(activeOcc.booking_check_out_date);

//       activeBooking = {
//         bookingId: activeOcc.booking_number || activeOcc.room_booking_id || "BK-001",
//         bookingFolio: activeOcc.booking_number || "BK-001",
//         roomBookingId: activeOcc.room_booking_id,
//         customer: {
//           id: activeOcc.customer_id || "CUST-001",
//           name: activeOcc.name || "Guest",
//           phone: activeOcc.phone || "",
//           email: activeOcc.email || "",
//           initials: (activeOcc.name || "G")
//             .split(" ")
//             .map((p) => p[0])
//             .join("")
//             .slice(0, 2)
//             .toUpperCase(),
//         },
//         checkIn: checkInDate,
//         checkOut: checkOutDate,
//         nights: 1,
//         status: isCheckedIn ? "checked_in" : "confirmed",
//         stayIndicator: isCheckedIn ? "Current Stay" : "Upcoming Stay",
//       };
//     }
//   } else if (sub.is_occupied) {
//     roomStatus = "occupied";
//   }

//   return {
//     id: subId,
//     sub_room_id: subId,
//     roomId: `#RM-${name.replace(/[^0-9]/g, "") || subId.slice(0, 4)}`,
//     roomNumber: name,
//     roomName: name,
//     roomType: sub.room_type || "Deluxe Suite",
//     floor: "Floor 1",
//     wing: "Main Wing",
//     propertyId: roomId,
//     propertyName: propertyName,
//     pricePerDay: sub.price_per_day || 0,
//     maxAdults: sub.max_adults || 2,
//     maxChildren: sub.max_children || 0,
//     totalRooms: sub.total_rooms || 1,
//     status: roomStatus,
//     features: [
//       `Max ${sub.max_adults || 2} Adults`,
//       `₹${sub.price_per_day || 2500}/day`,
//       "Keyless RF",
//     ],
//     checkoutNote: activeBooking ? `Checkout: ${activeBooking.checkOut}` : null,
//     createdAt: parseApiDateTime(sub.created_at),
//     updatedAt: "Just now",
//     activeBooking: activeBooking,
//     raw: sub,
//   };
// }

/* ─────────────────────────────────────────────────────────────
   API CALLS
───────────────────────────────────────────────────────────── */

export function getApiErrorMessage(err, fallback = "Something went wrong") {
  const d = err?.response?.data;
  return d?.message || d?.error || d?.detail || err?.message || fallback;
}

// 1. Properties (Rooms) API
export const propertyApi = {
  // GET /api/rooms/list_rooms
  async listProperties() {
    const res = await api.get("/rooms/list_rooms");
    const list = res.data?.data || [];
    return list.map(mapBackendProperty);
  },

  // GET /api/rooms/get_rooms?room_id=...
  async getProperty(roomId) {
    const res = await api.get(`/rooms/get_rooms?room_id=${roomId}`);
    const item = res.data?.data;
    return item ? mapBackendProperty(item) : null;
  },

  // POST /api/rooms/create_rooms
  async createProperty({ name, address }) {
    const payload = {
      room_name: name,
      address: address || "",
    };
    const res = await api.post("/rooms/create_rooms", payload);
    return res.data;
  },

  // PUT /api/rooms/update_rooms
  async updateProperty(arg1, arg2) {
    const { roomId, name, address } =
      typeof arg1 === "object" && arg1 !== null
        ? arg1
        : { roomId: arg1, ...(arg2 || {}) };

    const payload = {
      room_id: roomId,
      room_name: name,
      address: address ?? "",
    };

    console.log("update_rooms payload:", payload); // remove after testing

    try {
      const res = await api.put("/rooms/update_rooms", payload);
      if (res.data?.success === false) {
        throw new Error(res.data.message || "Could not update property");
      }
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err, "Could not update property"));
    }
  },
};

// 2. Sub-Rooms (Individual Rooms) API
export const subRoomApi = {
  // GET /api/sub_rooms/list_subrooms?room_id=...&from_date=...&end_date=...
  async listSubRooms(roomId, fromDate, endDate, propertyName = "") {
    let url = `/sub_rooms/list_subrooms?room_id=${roomId}`;
    if (fromDate && endDate) {
      url += `&from_date=${encodeURIComponent(fromDate + " 00:00")}&end_date=${encodeURIComponent(endDate + " 00:00")}`;
    }
    const res = await api.get(url);
    const subRoomsData = res.data?.data?.sub_rooms || [];
    return subRoomsData.map((sub) => mapBackendSubRoom(sub, propertyName));
  },

  // GET /api/sub_rooms/list_subrooms?room_id=...&sub_room_id=...
  async getSubRoom(roomId, subRoomId, propertyName = "") {
    const res = await api.get(`/sub_rooms/list_subrooms?room_id=${roomId}&sub_room_id=${subRoomId}`);
    const subRoomsData = res.data?.data?.sub_rooms || [];
    const item = subRoomsData.find((s) => s.sub_room_id === subRoomId) || subRoomsData[0];
    return item ? mapBackendSubRoom(item, propertyName) : null;
  },

  // POST /api/sub_rooms/create_subrooms
  async createSubRoom({ roomId, subRoomName, maxAdults = 3, maxChildren = 2, pricePerDay }) {
    const payload = {
      room_id: roomId,
      sub_room_name: subRoomName,
      max_adults: Number(maxAdults),
      max_children: Number(maxChildren),
    };
    if (pricePerDay !== undefined && pricePerDay !== null && pricePerDay !== "") {
      payload.price_per_day = Number(pricePerDay);
    }
    const res = await api.post("/sub_rooms/create_subrooms", payload);
    return res.data;
  },

  // PUT /api/sub_rooms/update_subrooms
  async updateSubRoom(payload) {
    const res = await api.put("/sub_rooms/update_subrooms", payload);
    return res.data;
  },


    async deleteSubRoom(subRoomId) {
    try {
      const res = await api.delete("/sub_rooms/delete_subrooms", {
        data: { sub_room_id: subRoomId },
      });
      if (res.data?.success === false) {
        throw new Error(res.data.message || "Could not delete room");
      }
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err, "Could not delete room"));
    }
  },
};

// 3. Bookings API
export const bookingApi = {
  // POST /api/room_booking/create_customer_booking
  async createBooking({
    roomId,
    subRoomId,
    customer,
    checkIn,
    checkOut,
    adults = 2,
    children = 0,
  }) {
    const formattedCheckIn = checkIn.includes(" ") ? checkIn : `${checkIn} 12:00`;
    const formattedCheckOut = checkOut.includes(" ") ? checkOut : `${checkOut} 11:00`;

    // No length restriction (international numbers supported)
    const phone = (customer.phone || "").replace(/\D/g, "");
    const countryCode =
      String(customer.countryCode || customer.mobile_country_code || "91").replace(/\D/g, "") || "91";
    const email = (customer.email || "").trim();

    const bookingData = {
      room_id: roomId,
      sub_room_id: subRoomId,
      booking_check_in_date: formattedCheckIn,
      booking_check_out_date: formattedCheckOut,
      name: customer.name,
      email,
      phone,
      adults,
      children,
      room_count: 1,
    };

    const payload = { booking_data: bookingData };

    if (customer.isNew) {
      // New customer -> backend creates it
      payload.customer_data = {
        name: customer.name,
        email,
        mobile_country_code: countryCode,
        mobile: phone,
customer_type: customer.customerType || (countryCode === "91" ? "domestic" : "international"),
      };
    } else {
      // Existing customer -> no customer_data, just link by id
      bookingData.customer_id = customer.id;
    }

    try {
      const res = await api.post("/room_booking/create_customer_booking", payload);
      if (res.data?.success === false) {
        throw new Error(res.data.message || "Booking failed");
      }
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err, "Booking failed"));
    }
  },

  // POST /api/room_booking/check_availability_basedon_roomid
  async checkAvailability({ roomId, subRoomId, checkIn, checkOut }) {
    const from = checkIn.includes(" ") ? checkIn : `${checkIn} 12:00`;
    const to = checkOut.includes(" ") ? checkOut : `${checkOut} 11:00`;
    try {
      const res = await api.post("/room_booking/check_availability_basedon_roomid", {
        room_id: roomId,
        sub_room_id: subRoomId,
        from_date: from,
        to_date: to,
      });
      const item = res.data?.data?.sub_rooms?.[0];
      return {
        available: Boolean(item?.is_available),
        availableRooms: item?.available_rooms ?? 0,
      };
    } catch (err) {
      throw new Error(getApiErrorMessage(err, "Could not check availability"));
    }
  },

  // PUT /api/room_booking/update_booking  (edit stay dates)
  async updateBookingDates(roomBookingId, checkIn, checkOut) {
    const from = checkIn.includes(" ") ? checkIn : `${checkIn} 12:00`;
    const to = checkOut.includes(" ") ? checkOut : `${checkOut} 11:00`;
    try {
      const res = await api.put("/room_booking/update_booking", {
        room_booking_id: roomBookingId,
        booking_check_in_date: from,
        booking_check_out_date: to,
      });
      if (res.data?.success === false) {
        throw new Error(res.data.message || "Could not update dates");
      }
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err, "Could not update dates"));
    }
  },

    // PUT /api/room_booking/change_payment_status
  async markPaid(roomBookingId) {
    try {
      const res = await api.put("/room_booking/change_payment_status", {
        room_booking_id: roomBookingId,
      });
      if (res.data?.success === false) {
        throw new Error(res.data.message || "Payment update failed");
      }
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err, "Payment update failed"));
    }
  },




    // POST /api/room_booking/send_confirmation_mail
  async sendConfirmationMail(roomBookingId) {
    try {
      const res = await api.post("/room_booking/send_confirmation_mail", {
        room_booking_id: roomBookingId,
      });
      if (res.data?.success === false) {
        throw new Error(res.data.message || "Could not send confirmation mail");
      }
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err, "Could not send confirmation mail"));
    }
  },

  
  // PUT /api/room_booking/change_booking_status  (check-in / check-out)
  async changeStatus(roomBookingId, status) {
    try {
      const res = await api.put("/room_booking/change_booking_status", {
        room_booking_id: roomBookingId,
        status,
      });
      if (res.data?.success === false) {
        throw new Error(res.data.message || "Status update failed");
      }
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err, "Status update failed"));
    }
  },

  // PUT /api/room_booking/cancel_booking
  async cancelBooking(roomBookingId) {
    try {
      const res = await api.put("/room_booking/cancel_booking", {
        room_booking_id: roomBookingId,
      });
      if (res.data?.success === false) {
        throw new Error(res.data.message || "Cancellation failed");
      }
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err, "Cancellation failed"));
    }
  },



};

// 4. Customers API
export const customerApi = {
  // GET /api/customers/
  async listCustomers() {
    const res = await api.get("/customers/");
    const list = res.data?.data || [];
    return list.map((c) => ({
      id: c.customer_id || c._id?.$oid || c._id,
      name: c.name || "Guest",
      email: c.email || "",
      phone: c.mobile || "",
      mobile_country_code: c.mobile_country_code || "91",
      customer_type: c.customer_type || "domestic",
      initials: (c.name || "G")
        .trim()
        .split(/\s+/)
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      avatarBg: "#2563EB",
      raw: c,
    }));
  },
};