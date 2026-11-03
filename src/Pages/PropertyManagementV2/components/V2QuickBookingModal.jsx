

// // src/Pages/PropertyManagementV2/components/V2QuickBookingModal.jsx
// import React, { useState, useEffect } from "react";
// import {
//   X,
//   BedDouble,
//   CalendarDays,
//   CheckCircle2,
//   Info,
//   Check,
//   ChevronLeft,
//   ChevronRight,
//   UserPlus,
//   Users,
// } from "lucide-react";
// import V2CustomerPicker from "./V2CustomerPicker";
// import {
//   formatDisplayDate,
//   calculateNights,
//   MONTH_FULL_NAMES,
// } from "../utils/dateUtils";
// import { isDateOverlap } from "../utils/availabilityUtils";


// const pad = (n) => String(n).padStart(2, "0");
// const toDateStr = (d) =>
//   `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
// const getToday = () => toDateStr(new Date());
// const addDays = (dateStr, n) => {
//   const [y, m, d] = dateStr.split("-").map(Number);
//   return toDateStr(new Date(y, m - 1, d + n));
// };



// // Lightweight Calendar Popover for modal
// function ModalCalendarPopover({ selectedDate, minDate, onSelectDate, onClose }) {
  
//   const base = selectedDate || minDate || getToday();
//   const [currentYear, setCurrentYear] = useState(parseInt(base.split("-")[0], 10));
//   const [currentMonth, setCurrentMonth] = useState(parseInt(base.split("-")[1], 10) - 1);

//   // block going to months fully before minDate
//   const minY = minDate ? parseInt(minDate.split("-")[0], 10) : null;
//   const minM = minDate ? parseInt(minDate.split("-")[1], 10) - 1 : null;
//   const canGoPrev =
//     minY === null || currentYear > minY || (currentYear === minY && currentMonth > minM);


//   const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
//   const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

//   const days = [];
//   for (let i = 0; i < firstDayOfWeek; i++) {
//     days.push(null);
//   }
//   for (let d = 1; d <= daysInMonth; d++) {
//     days.push(d);
//   }

//   const handlePrevMonth = () => {
//     if (currentMonth === 0) {
//       setCurrentMonth(11);
//       setCurrentYear((y) => y - 1);
//     } else {
//       setCurrentMonth((m) => m - 1);
//     }
//   };

//   const handleNextMonth = () => {
//     if (currentMonth === 11) {
//       setCurrentMonth(0);
//       setCurrentYear((y) => y + 1);
//     } else {
//       setCurrentMonth((m) => m + 1);
//     }
//   };

//   return (
//     <div
//       className="pmv2-calendar-popover"
//       style={{ top: "calc(100% + 4px)", zIndex: 10001 }}
//     >
//       <div className="pmv2-calendar-nav">
// <button type="button" className="pmv2-btn-icon" style={{ width: 26, height: 26, opacity: canGoPrev ? 1 : 0.35 }}
//   disabled={!canGoPrev} onClick={handlePrevMonth}>
//           <ChevronLeft size={13} />
//         </button>
//         <span className="pmv2-calendar-month-title">
//           {MONTH_FULL_NAMES[currentMonth]} {currentYear}
//         </span>
//         <button
//           type="button"
//           className="pmv2-btn-icon"
//           style={{ width: 26, height: 26 }}
//           onClick={handleNextMonth}
//         >
//           <ChevronRight size={13} />
//         </button>
//       </div>

//       <div className="pmv2-calendar-grid">
//         {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
//           <div key={day} className="pmv2-calendar-day-header">
//             {day}
//           </div>
//         ))}
//         {days.map((day, idx) => {
//           if (day === null) return <div key={`empty-${idx}`} />;
//           const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
//           const isSelected = selectedDate === dateStr;
//           const isDisabled = minDate && dateStr <= minDate;

//           return (
//             <button
//               key={day}
//               type="button"
//               disabled={isDisabled}
//               className={`pmv2-calendar-day-cell ${isSelected ? "selected" : ""}`}
//               onClick={() => {
//                 onSelectDate(dateStr);
//                 onClose();
//               }}
//             >
//               {day}
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// const fieldStyle = {
//   width: "100%",
//   height: 40,
//   padding: "0 12px",
//   border: "1px solid #E5E7EB",
//   borderRadius: 8,
//   fontSize: 13.5,
//   outline: "none",
//   boxSizing: "border-box",
//   background: "#fff",
// };

// const fieldLabelStyle = {
//   fontSize: 10.5,
//   fontWeight: 700,
//   color: "#6B7280",
//   textTransform: "uppercase",
//   marginBottom: 4,
// };

// export default function V2QuickBookingModal({
//   isOpen,
//   room,
//   initialDates,
//   customers = [],
//   onClose,
//   onConfirmBooking,
//   onAddNewCustomer, // no longer used here - customer is created by the booking API
//   onCheckAvailability,
// }) {
//   const [customerMode, setCustomerMode] = useState("existing"); // 'existing' | 'new'
//   const [selectedCustomer, setSelectedCustomer] = useState( null);
//   const [newCustomer, setNewCustomer] = useState({ name: "", email: "", phone: "", countryCode: "91" });
//   const [checkIn, setCheckIn] = useState(initialDates?.checkIn || "");
//   const [checkOut, setCheckOut] = useState(initialDates?.checkOut || "");
//   const [pickerOpen, setPickerOpen] = useState(null); // 'in' | 'out' | null
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [conflictError, setConflictError] = useState("");
//   const [remoteBlocked, setRemoteBlocked] = useState(false);
//   const [isChecking, setIsChecking] = useState(false);
//   const [datesTouched, setDatesTouched] = useState(false);


//   const datesSelected = checkIn && checkOut && checkOut > checkIn;

//   // useEffect(() => {
//   //   if (initialDates?.checkIn) setCheckIn(initialDates.checkIn);
//   //   if (initialDates?.checkOut) setCheckOut(initialDates.checkOut);
//   //   setConflictError("");
//   // }, [initialDates, isOpen]);




//   useEffect(() => {
//   if (!isOpen) return;
//   const today = getToday();
//   // only accept dates passed in from the grid if they're not in the past
//   const inDate = initialDates?.checkIn && initialDates.checkIn >= today ? initialDates.checkIn : "";
//   const outDate = inDate && initialDates?.checkOut && initialDates.checkOut > inDate ? initialDates.checkOut : "";

//   setCustomerMode("existing");
//   setSelectedCustomer(null);
//   setNewCustomer({ name: "", email: "", phone: "", countryCode: "91" });
//   setCheckIn(inDate);
//   setCheckOut(outDate);
//   setPickerOpen(null);
//   setConflictError("");
//   setRemoteBlocked(false);
//   setDatesTouched(false);
//   // eslint-disable-next-line react-hooks/exhaustive-deps
// }, [isOpen]);



//   // Reset form each time the modal opens
// useEffect(() => {
//   if (isOpen) {
//     setCustomerMode("existing");
//     setSelectedCustomer(null); // <- add this
//     setNewCustomer({ name: "", email: "", phone: "", countryCode: "91" });
//     setConflictError("");
//     setRemoteBlocked(false);
//     setDatesTouched(false);
//   }
// }, [isOpen]);

//   // Live server-side availability check whenever dates change
//   useEffect(() => {
//     if (!isOpen || !room || !onCheckAvailability) return;
//     if (!checkIn || !checkOut || checkOut <= checkIn) {
//       setRemoteBlocked(false);
//       return;
//     }
//     let cancelled = false;
//     setIsChecking(true);
//     const t = setTimeout(async () => {
//       const res = await onCheckAvailability(room.id, checkIn, checkOut, {
//         notify: datesTouched, // toast only after the user changes a date
//       });
//       if (!cancelled) {
//         setRemoteBlocked(!res.available);
//         setIsChecking(false);
//       }
//     }, 300);
//     return () => {
//       cancelled = true;
//       clearTimeout(t);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isOpen, room?.id, checkIn, checkOut]);

//   // Preselect first customer once customers load
//   // useEffect(() => {
//   //   if (!selectedCustomer && customers.length > 0) {
//   //     setSelectedCustomer(customers[0]);
//   //   }
//   // }, [customers, selectedCustomer]);

//   if (!isOpen || !room) return null;

//   const nights = checkIn && checkOut ? calculateNights(checkIn, checkOut) : 0;
//   const isNewMode = customerMode === "new";

//   // Real-time conflict check
//   const isAvailableForSelected = () => {
//     if (!checkIn || !checkOut || checkOut <= checkIn) return false;
//     if (room.activeBooking) {
//       if (
//         isDateOverlap(
//           checkIn,
//           checkOut,
//           room.activeBooking.checkIn,
//           room.activeBooking.checkOut
//         )
//       ) {
//         return false;
//       }
//     }
//     return true;
//   };

//   const available = isAvailableForSelected() && !remoteBlocked;

//   const updateNew = (field, value) => {
//     setNewCustomer((prev) => ({ ...prev, [field]: value }));
//     setConflictError("");
//   };

//   const handleConfirm = async () => {
//     let customerPayload;

//     if (isNewMode) {
//       const name = newCustomer.name.trim();
//       const email = newCustomer.email.trim();
//       const phone = newCustomer.phone.replace(/\D/g, "");
//       const countryCode = newCustomer.countryCode.replace(/\D/g, "") || "91";

//       if (!name) return setConflictError("Enter the customer name.");
//       if (!EMAIL_RE.test(email)) return setConflictError("Enter a valid email address.");
//       // International numbers: no fixed length, just a sane range
//       if (phone.length < 5 || phone.length > 15) {
//         return setConflictError("Enter a valid phone number.");
//       }
//       if (!checkIn || !checkOut) {
//   return setConflictError("Select both check-in and check-out dates.");
// }
// if (checkIn < getToday()) {
//   return setConflictError("Check-in date can't be in the past.");
// }
// if (checkOut <= checkIn) {
//   return setConflictError("Check-out must be after check-in.");
// }

//       // isNew = true -> service sends customer_data so backend creates the customer
//       customerPayload = { isNew: true, name, email, phone, countryCode };
//     } else {
//       if (!selectedCustomer) {
//         return setConflictError("Please select a customer for this booking.");
//       }
//       customerPayload = selectedCustomer;
//     }

//     if (!checkIn || !checkOut) {
//       return setConflictError("Select both check-in and check-out dates.");
//     }
//     if (checkOut <= checkIn) {
//       return setConflictError("Check-out must be after check-in.");
//     }
//     if (!available) {
//       return setConflictError(
//         "This room is no longer available for the selected dates. Please choose different dates."
//       );
//     }

//     setIsSubmitting(true);
//     setConflictError("");
//     try {
//       const ok = await onConfirmBooking({
//         roomId: room.id,
//         customer: customerPayload,
//         checkIn,
//         checkOut,
//       });
//       if (ok !== false) onClose(); // stays open on failure so the user can retry
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const summaryName = isNewMode
//     ? newCustomer.name.trim() || "New customer"
//     : selectedCustomer
//     ? selectedCustomer.name
//     : "Not selected";

//   const toggleBtn = (active) => ({
//     flex: 1,
//     height: 38,
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 6,
//     borderRadius: 8,
//     border: `1px solid ${active ? "#2563EB" : "#E5E7EB"}`,
//     background: active ? "#EFF6FF" : "#fff",
//     color: active ? "#1D4ED8" : "#4B5563",
//     fontSize: 13,
//     fontWeight: 600,
//     cursor: "pointer",
//   });

//   return (
//     <div className="pmv2-modal-backdrop" onClick={onClose}>
//       <div className="pmv2-modal" onClick={(e) => e.stopPropagation()}>
//         {/* Header */}
//         <div className="pmv2-modal-header">
//           <div>
//             <h3 className="pmv2-modal-title">Quick Booking</h3>
//             <p className="pmv2-modal-subtitle">
//               Reserve {room.roomNumber} for a customer.
//             </p>
//           </div>
//           <button
//             type="button"
//             className="pmv2-btn-icon"
//             onClick={onClose}
//             style={{ width: 34, height: 34 }}
//           >
//             <X size={16} />
//           </button>
//         </div>

//         {/* Modal Body */}
//         <div className="pmv2-modal-body">
//           {/* Selected Room Banner */}
//           <div className="pmv2-booking-room-banner">
//             <div className="pmv2-booking-room-banner-left">
//               <div className="pmv2-booking-room-banner-icon">
//                 <BedDouble size={20} />
//               </div>
//               <div>
//                 <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
//                   Room: {room.roomNumber}{" "}
//                   <span style={{ fontWeight: 500, color: "#6B7280" }}>
//                     ({room.roomType})
//                   </span>
//                 </div>
//                 <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
//                   Property: {room.propertyName || "Property"} • Room ID:{" "}
//                   {room.roomId || `#RM-${room.roomNumber}`}
//                 </div>
//               </div>
//             </div>
//             <span className="pmv2-badge pmv2-badge-available">
//               <span className="pmv2-badge-dot" />
//               STATUS: AVAILABLE
//             </span>
//           </div>

//           {/* Customer Details */}
//           <div>
//             <div className="pmv2-form-label" style={{ marginBottom: 8 }}>
//               <span>Customer Details</span>
//               <span className="pmv2-form-label-tag">Required Step</span>
//             </div>

//             {/* Existing / New toggle */}
//             <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
//               <button
//                 type="button"
//                 style={toggleBtn(!isNewMode)}
//                 onClick={() => {
//                   setCustomerMode("existing");
//                   setConflictError("");
//                 }}
//               >
//                 <Users size={15} />
//                 Existing customer
//               </button>
//               <button
//                 type="button"
//                 style={toggleBtn(isNewMode)}
//                 onClick={() => {
//                   setCustomerMode("new");
//                   setConflictError("");
//                 }}
//               >
//                 <UserPlus size={15} />
//                 New customer
//               </button>
//             </div>

//             {!isNewMode ? (
//               <V2CustomerPicker
//                 customers={customers}
//                 selectedCustomer={selectedCustomer}
//                 onSelectCustomer={(c) => {
//                   setSelectedCustomer(c);
//                   setConflictError("");
//                 }}
//               />
//             ) : (
//               <div style={{ display: "grid", gap: 10 }}>
//                 <div>
//                   <div style={fieldLabelStyle}>Full Name</div>
//                   <input
//                     type="text"
//                     style={fieldStyle}
//                     placeholder="Customer name"
//                     value={newCustomer.name}
//                     onChange={(e) => updateNew("name", e.target.value)}
//                   />
//                 </div>
//                 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
//                   <div>
//                     <div style={fieldLabelStyle}>Email</div>
//                     <input
//                       type="email"
//                       style={fieldStyle}
//                       placeholder="name@example.com"
//                       value={newCustomer.email}
//                       onChange={(e) => updateNew("email", e.target.value)}
//                     />
//                   </div>
//                   <div>
//                     <div style={fieldLabelStyle}>Phone (with country code)</div>
//                     <div style={{ display: "flex", gap: 6 }}>
//                       <input
//                         type="tel"
//                         inputMode="numeric"
//                         style={{ ...fieldStyle, width: 64, textAlign: "center", flexShrink: 0 }}
//                         placeholder="+91"
//                         value={"+" + newCustomer.countryCode}
//                         onChange={(e) =>
//                           updateNew("countryCode", e.target.value.replace(/\D/g, "").slice(0, 4))
//                         }
//                       />
//                       <input
//                         type="tel"
//                         inputMode="numeric"
//                         style={fieldStyle}
//                         placeholder="Mobile number"
//                         value={newCustomer.phone}
//                         onChange={(e) =>
//                           updateNew("phone", e.target.value.replace(/\D/g, "").slice(0, 15))
//                         }
//                       />
//                     </div>
//                   </div>
//                 </div>
//                 <div style={{ fontSize: 12, color: "#6B7280" }}>
//                   This customer will be created when you confirm the booking.
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Stay Duration & Dates */}
//           <div>
//             <div className="pmv2-form-label" style={{ marginBottom: 8 }}>
//               <span>Stay Duration & Dates</span>
//             </div>

//             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
//               {/* Check-In */}
//               <div style={{ position: "relative" }}>
//                 <div style={fieldLabelStyle}>Check-In Date</div>
//                 <button
//                   type="button"
//                   className={`pmv2-date-btn ${pickerOpen === "in" ? "active" : ""}`}
//                   onClick={() =>
//                     setPickerOpen((prev) => (prev === "in" ? null : "in"))
//                   }
//                 >
//                   <CalendarDays size={16} style={{ color: "#2563EB" }} />
//                   <span className="pmv2-date-value">
//                     {checkIn ? formatDisplayDate(checkIn) : "Select check-in"}
//                   </span>
//                 </button>
//                 {pickerOpen === "in" && (
// <ModalCalendarPopover
//   selectedDate={checkIn}
//   minDate={getToday()}                      // today onwards only
//   onSelectDate={(d) => {
//     setCheckIn(d);
//     setDatesTouched(true);
//     if (checkOut && checkOut <= d) setCheckOut("");
//   }}
//   onClose={() => setPickerOpen(null)}
// />
//                 )}
//               </div>

//               {/* Check-Out */}
//               <div style={{ position: "relative" }}>
//                 <div style={fieldLabelStyle}>Check-Out Date</div>
//                 <button
//                   type="button"
//                   className={`pmv2-date-btn ${pickerOpen === "out" ? "active" : ""}`}
//                   onClick={() =>
//                     setPickerOpen((prev) => (prev === "out" ? null : "out"))
//                   }
//                 >
//                   <CalendarDays size={16} style={{ color: "#2563EB" }} />
//                   <span className="pmv2-date-value">
//                     {checkOut ? formatDisplayDate(checkOut) : "Select check-out"}
//                   </span>
//                 </button>
//                 {pickerOpen === "out" && (
// <ModalCalendarPopover
//   selectedDate={checkOut}
//   minDate={checkIn ? addDays(checkIn, 1) : addDays(getToday(), 1)}  // at least 1 night
//   onSelectDate={(d) => { setCheckOut(d); setDatesTouched(true); }}
//   onClose={() => setPickerOpen(null)}
// />
//                 )}
//               </div>
//             </div>

//             {/* Verification Status Banner */}
//             <div style={{ marginTop: 10 }}>
//               {available ? (
//                 <div
//                   style={{
//                     background: "#ECFDF5",
//                     border: "1px solid #A7F3D0",
//                     borderRadius: 8,
//                     padding: "8px 12px",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "space-between",
//                     fontSize: 12.5,
//                     color: "#065F46",
//                     fontWeight: 600,
//                   }}
//                 >
//                   <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
//                     <CheckCircle2 size={16} style={{ color: "#10B981" }} />
//                     <span>
//                       Room {room.roomNumber} is verified available for these dates
//                     </span>
//                   </div>
//                   <span
//                     style={{
//                       background: "#D1FAE5",
//                       padding: "2px 8px",
//                       borderRadius: 12,
//                       fontSize: 11,
//                     }}
//                   >
//                     {nights} Nights stay
//                   </span>
//                 </div>
//               ) : (
//                 <div
//                   style={{
//                     background: "#FEF2F2",
//                     border: "1px solid #FECDD3",
//                     borderRadius: 8,
//                     padding: "8px 12px",
//                     fontSize: 12.5,
//                     color: "#B91C1C",
//                     fontWeight: 600,
//                   }}
//                 >
//                   Room {room.roomNumber} is unavailable for these dates.
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Stay Summary */}
//           <div className="pmv2-stay-summary-box">
//             <div className="pmv2-stay-summary-header">
//               <span>Stay Summary</span>
//               <span
//                 style={{
//                   background: "#EFF6FF",
//                   color: "#2563EB",
//                   padding: "2px 6px",
//                   borderRadius: 4,
//                   fontSize: 10,
//                   fontWeight: 700,
//                 }}
//               >
//                 Instant Lock
//               </span>
//             </div>
//             <div className="pmv2-stay-summary-grid">
//               <div className="pmv2-stay-summary-item">
//                 <span className="pmv2-stay-summary-label">Room</span>
//                 <span className="pmv2-stay-summary-val">{room.roomNumber}</span>
//               </div>
//               <div className="pmv2-stay-summary-item">
//                 <span className="pmv2-stay-summary-label">Customer</span>
//                 <span className="pmv2-stay-summary-val">{summaryName}</span>
//               </div>
//               <div className="pmv2-stay-summary-item">
//                 <span className="pmv2-stay-summary-label">Check-In</span>
//                 <span className="pmv2-stay-summary-val">
//                   {checkIn ? formatDisplayDate(checkIn) : "-"}
//                 </span>
//               </div>
//               <div className="pmv2-stay-summary-item">
//                 <span className="pmv2-stay-summary-label">Check-Out</span>
//                 <span className="pmv2-stay-summary-val">
//                   {checkOut ? formatDisplayDate(checkOut) : "-"}
//                 </span>
//               </div>
//             </div>
//           </div>

//           {conflictError && (
//             <div style={{ color: "#EF4444", fontSize: 13, fontWeight: 500 }}>
//               {conflictError}
//             </div>
//           )}
//         </div>

//         {/* Footer */}
//         <div className="pmv2-modal-footer">
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: 6,
//               fontSize: 12,
//               color: "#6B7280",
//             }}
//           >
//             <Info size={15} style={{ color: "#2563EB", flexShrink: 0 }} />
//             <span>The room will be reserved for this customer for the selected dates.</span>
//           </div>

//           <div className="pmv2-modal-footer-right">
//             <button
//               type="button"
//               className="pmv2-btn pmv2-btn-secondary"
//               onClick={onClose}
//             >
//               Cancel
//             </button>
//             <button
//               type="button"
//               className="pmv2-btn pmv2-btn-primary"
//               disabled={!available || isSubmitting || isChecking || (!isNewMode && !selectedCustomer)}
//               onClick={handleConfirm}
//             >
//               <Check size={16} />
//               <span>{isSubmitting ? "Confirming..." : "Confirm Booking"}</span>
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }




















// src/Pages/PropertyManagementV2/components/V2QuickBookingModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { useToast } from "./V2ToastMessages";
import V2CountryCodeDropdown from "./V2CountryCodeDropdown";
import { COUNTRY_CODES } from "../../Customer/Create_Customer";
import {
  X,
  BedDouble,
  CalendarDays,
  CheckCircle2,
  Info,
  Check,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Users,
} from "lucide-react";
import V2CustomerPicker from "./V2CustomerPicker";
import {
  formatDisplayDate,
  calculateNights,
  MONTH_FULL_NAMES,
} from "../utils/dateUtils";
import { isDateOverlap } from "../utils/availabilityUtils";

/* ── Local date helpers (local time, safe for IST) ── */
const pad = (n) => String(n).padStart(2, "0");
const toDateStr = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const getToday = () => toDateStr(new Date());
const addDays = (dateStr, n) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  return toDateStr(new Date(y, m - 1, d + n));
};

// Lightweight Calendar Popover for modal
// Lightweight Calendar Popover for modal
function ModalCalendarPopover({ selectedDate, minDate, onSelectDate, onClose }) {
  const base = selectedDate || minDate || getToday();
  const [currentYear, setCurrentYear] = useState(parseInt(base.split("-")[0], 10));
  const [currentMonth, setCurrentMonth] = useState(parseInt(base.split("-")[1], 10) - 1);
  const popoverRef = useRef(null);

  // Auto-scroll so the popover is fully visible inside the scrolling modal body
  useEffect(() => {
    const el = popoverRef.current;
    if (!el) return;
    const raf = requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    });
    return () => cancelAnimationFrame(raf);
  }, [currentMonth, currentYear]);

  // block going to months fully before minDate
  const minY = minDate ? parseInt(minDate.split("-")[0], 10) : null;
  const minM = minDate ? parseInt(minDate.split("-")[1], 10) - 1 : null;
  const canGoPrev =
    minY === null ||
    currentYear > minY ||
    (currentYear === minY && currentMonth > minM);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const days = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  return (
    <div
      ref={popoverRef}
      className="pmv2-calendar-popover"
      style={{
        top: "calc(100% + 4px)",
        zIndex: 10001,
        scrollMarginBottom: 16, // small gap above the footer after scrolling
      }}
    >
      <div className="pmv2-calendar-nav">
        <button
          type="button"
          className="pmv2-btn-icon"
          style={{ width: 26, height: 26, opacity: canGoPrev ? 1 : 0.35 }}
          disabled={!canGoPrev}
          onClick={handlePrevMonth}
        >
          <ChevronLeft size={13} />
        </button>
        <span className="pmv2-calendar-month-title">
          {MONTH_FULL_NAMES[currentMonth]} {currentYear}
        </span>
        <button
          type="button"
          className="pmv2-btn-icon"
          style={{ width: 26, height: 26 }}
          onClick={handleNextMonth}
        >
          <ChevronRight size={13} />
        </button>
      </div>

      <div className="pmv2-calendar-grid">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div key={day} className="pmv2-calendar-day-header">
            {day}
          </div>
        ))}
        {days.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} />;
          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isSelected = selectedDate === dateStr;
          const isDisabled = minDate && dateStr < minDate; // inclusive minDate

          return (
            <button
              key={day}
              type="button"
              disabled={isDisabled}
              className={`pmv2-calendar-day-cell ${isSelected ? "selected" : ""}`}
              onClick={() => {
                onSelectDate(dateStr);
                onClose();
              }}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fieldStyle = {
  width: "100%",
  height: 40,
  padding: "0 12px",
  border: "1px solid #E5E7EB",
  borderRadius: 8,
  fontSize: 13.5,
  outline: "none",
  boxSizing: "border-box",
  background: "#fff",
};

const fieldLabelStyle = {
  fontSize: 10.5,
  fontWeight: 700,
  color: "#6B7280",
  textTransform: "uppercase",
  marginBottom: 4,
};

export default function V2QuickBookingModal({
  isOpen,
  room,
  initialDates,
  customers = [],
  onClose,
  onConfirmBooking,
  onAddNewCustomer, // no longer used here - customer is created by the booking API
  onCheckAvailability,
}) {
  const [customerMode, setCustomerMode] = useState("existing"); // 'existing' | 'new'
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [newCustomer, setNewCustomer] = useState({ name: "", email: "", phone: "", countryCode: "91", customerType: "" });
  const [checkIn, setCheckIn] = useState(initialDates?.checkIn || "");
  const [checkOut, setCheckOut] = useState(initialDates?.checkOut || "");
  const [pickerOpen, setPickerOpen] = useState(null); // 'in' | 'out' | null
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflictError, setConflictError] = useState("");
  const [remoteBlocked, setRemoteBlocked] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [datesTouched, setDatesTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
const { toast } = useToast();
  const datesSelected = Boolean(checkIn && checkOut && checkOut > checkIn);

  // Reset form each time the modal opens (ONE reset effect only)
  useEffect(() => {
    if (!isOpen) return;
    const today = getToday();
    // only accept dates passed in from the grid if they're not in the past
    const inDate =
      initialDates?.checkIn && initialDates.checkIn >= today
        ? initialDates.checkIn
        : "";
    const outDate =
      inDate && initialDates?.checkOut && initialDates.checkOut > inDate
        ? initialDates.checkOut
        : "";

    setCustomerMode("existing");
    setSelectedCustomer(null);
setNewCustomer({ name: "", email: "", phone: "", countryCode: "91", customerType: "" });
setPhoneTouched(false);
    setCheckIn(inDate);
    setCheckOut(outDate);
    setPickerOpen(null);
    setConflictError("");
    setRemoteBlocked(false);
    setDatesTouched(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Live server-side availability check whenever dates change
  useEffect(() => {
    if (!isOpen || !room || !onCheckAvailability) return;
    if (!checkIn || !checkOut || checkOut <= checkIn) {
      setRemoteBlocked(false);
      return;
    }
    let cancelled = false;
    setIsChecking(true);
    const t = setTimeout(async () => {
      const res = await onCheckAvailability(room.id, checkIn, checkOut, {
        notify: datesTouched, // toast only after the user changes a date
      });
      if (!cancelled) {
        setRemoteBlocked(!res.available);
        setIsChecking(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, room?.id, checkIn, checkOut]);

  if (!isOpen || !room) return null;

  const nights = checkIn && checkOut ? calculateNights(checkIn, checkOut) : 0;
  const isNewMode = customerMode === "new";
const activeCountry = COUNTRY_CODES.find((c) => c.code === newCustomer.countryCode);
const phoneMax = activeCountry ? activeCountry.len : 15;
const isDomestic = newCustomer.customerType === "domestic";
const phoneInvalid =
  phoneTouched && newCustomer.phone.length > 0 && newCustomer.phone.length !== phoneMax;
  // Real-time conflict check
  const isAvailableForSelected = () => {
    if (!checkIn || !checkOut || checkOut <= checkIn) return false;
    if (room.activeBooking) {
      if (
        isDateOverlap(
          checkIn,
          checkOut,
          room.activeBooking.checkIn,
          room.activeBooking.checkOut
        )
      ) {
        return false;
      }
    }
    return true;
  };

  const available = isAvailableForSelected() && !remoteBlocked;

  const updateNew = (field, value) => {
    setNewCustomer((prev) => ({ ...prev, [field]: value }));
    setConflictError("");
  };

  // const handleConfirm = async () => {
  //   let customerPayload;

  //   if (isNewMode) {
  //     const name = newCustomer.name.trim();
  //     const email = newCustomer.email.trim();
  //     const phone = newCustomer.phone.replace(/\D/g, "");
  //     const countryCode = newCustomer.countryCode.replace(/\D/g, "") || "91";

  //     if (!name) return setConflictError("Enter the customer name.");
  //     if (!EMAIL_RE.test(email)) return setConflictError("Enter a valid email address.");
  //     // International numbers: no fixed length, just a sane range
  //     if (phone.length < 5 || phone.length > 15) {
  //       return setConflictError("Enter a valid phone number.");
  //     }

  //     // isNew = true -> service sends customer_data so backend creates the customer
  //     customerPayload = { isNew: true, name, email, phone, countryCode };
  //   } else {
  //     if (!selectedCustomer) {
  //       return setConflictError("Please select a customer for this booking.");
  //     }
  //     customerPayload = selectedCustomer;
  //   }

  //   // Date checks run for BOTH existing and new customers
  //   if (!checkIn || !checkOut) {
  //     return setConflictError("Select both check-in and check-out dates.");
  //   }
  //   if (checkIn < getToday()) {
  //     return setConflictError("Check-in date can't be in the past.");
  //   }
  //   if (checkOut <= checkIn) {
  //     return setConflictError("Check-out must be after check-in.");
  //   }
  //   if (!available) {
  //     return setConflictError(
  //       "This room is no longer available for the selected dates. Please choose different dates."
  //     );
  //   }

  //   setIsSubmitting(true);
  //   setConflictError("");
  //   try {
  //     const ok = await onConfirmBooking({
  //       roomId: room.id,
  //       customer: customerPayload,
  //       checkIn,
  //       checkOut,
  //     });
  //     if (ok !== false) onClose(); // stays open on failure so the user can retry
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };










    const fail = (msg) => {
    setConflictError(msg);
    toast.error(msg);
    return false;
  };

  const handleConfirm = async () => {
    let customerPayload;

if (isNewMode) {
  const name = newCustomer.name.trim();
  const email = newCustomer.email.trim();
  const phone = newCustomer.phone.replace(/\D/g, "");
  const countryCode = newCustomer.countryCode;
  const customerType = newCustomer.customerType;
  const country = COUNTRY_CODES.find((c) => c.code === countryCode);

  if (!name) return fail("Please enter the customer's full name.");
  if (!customerType) return fail("Please choose a customer type: Domestic or International.");
  if (!email) return fail("Please enter the customer's email address.");
  if (!EMAIL_RE.test(email)) return fail("That email doesn't look right. Please check it.");
  if (!countryCode || !country) return fail("Please select the country code.");
  if (customerType === "domestic" && countryCode !== "91")
    return fail("Domestic customers must use the +91 country code.");
  if (customerType === "international" && countryCode === "91")
    return fail("International customers can't use +91. Please change the country code.");
  if (!phone) return fail("Please enter the mobile number.");
  if (phone.length !== country.len)
    return fail(`Enter a valid ${country.len}-digit mobile number for ${country.country}.`);

  customerPayload = { isNew: true, name, email, phone, countryCode, customerType };
} else {
      if (!selectedCustomer) return fail("Please select a customer for this booking.");
      customerPayload = selectedCustomer;
    }

    if (!checkIn) return fail("Please select the check-in date.");
    if (!checkOut) return fail("Please select the check-out date.");
    if (checkIn < getToday()) return fail("Check-in date can't be in the past.");
    if (checkOut <= checkIn) return fail("Check-out must be after the check-in date.");
    if (!available)
      return fail("This room is not available for the selected dates. Please choose different dates.");

    setIsSubmitting(true);
    setConflictError("");
    try {
      const ok = await onConfirmBooking({
        roomId: room.id,
        customer: customerPayload,
        checkIn,
        checkOut,
      });
      if (ok !== false) onClose();
    } finally {
      setIsSubmitting(false);
    }
  };


  const summaryName = isNewMode
    ? newCustomer.name.trim() || "New customer"
    : selectedCustomer
    ? selectedCustomer.name
    : "Not selected";

  const toggleBtn = (active) => ({
    flex: 1,
    height: 38,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 8,
    border: `1px solid ${active ? "#2563EB" : "#E5E7EB"}`,
    background: active ? "#EFF6FF" : "#fff",
    color: active ? "#1D4ED8" : "#4B5563",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  });

  return (
    <div className="pmv2-modal-backdrop" onClick={onClose}>
      <div className="pmv2-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="pmv2-modal-header">
          <div>
            <h3 className="pmv2-modal-title">Quick Booking</h3>
            <p className="pmv2-modal-subtitle">
              Reserve {room.roomNumber} for a guest.
            </p>
          </div>
          <button
            type="button"
            className="pmv2-btn-icon"
            onClick={onClose}
            style={{ width: 34, height: 34 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="pmv2-modal-body">
          {/* Selected Room Banner */}
          <div className="pmv2-booking-room-banner">
            <div className="pmv2-booking-room-banner-left">
              <div className="pmv2-booking-room-banner-icon">
                <BedDouble size={20} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
                  Room: {room.roomNumber}{" "}
                  <span style={{ fontWeight: 500, color: "#6B7280" }}>
                    ({room.roomType})
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                  Property: {room.propertyName || "Property"} • Room ID:{" "}
                  {room.roomId || `#RM-${room.roomNumber}`}
                </div>
              </div>
            </div>
            <span className="pmv2-badge pmv2-badge-available">
              <span className="pmv2-badge-dot" />
              STATUS: AVAILABLE
            </span>
          </div>

          {/* Customer Details */}
          <div>
            <div className="pmv2-form-label" style={{ marginBottom: 8 }}>
              <span>Guest Details</span>
              <span className="pmv2-form-label-tag">Required Step</span>
            </div>

            {/* Existing / New toggle */}
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <button
                type="button"
                style={toggleBtn(!isNewMode)}
                onClick={() => {
                  setCustomerMode("existing");
                  setConflictError("");
                }}
              >
                <Users size={15} />
                Existing guest
              </button>
              <button
                type="button"
                style={toggleBtn(isNewMode)}
                onClick={() => {
                  setCustomerMode("new");
                  setConflictError("");
                }}
              >
                <UserPlus size={15} />
                New guest
              </button>
            </div>

            {!isNewMode ? (
              <V2CustomerPicker
                customers={customers}
                selectedCustomer={selectedCustomer}
                onSelectCustomer={(c) => {
                  setSelectedCustomer(c);
                  setConflictError("");
                }}
              />
            ) : (
  
  <div style={{ display: "grid", gap: 12 }}>
    {/* Full name */}
    <div>
      <div style={fieldLabelStyle}>
        Full Name <span style={{ color: "#EF4444" }}>*</span>
      </div>
      <input
        type="text"
        style={fieldStyle}
        placeholder="Guest name"
        value={newCustomer.name}
        onChange={(e) => updateNew("name", e.target.value)}
      />
    </div>

    {/* Customer type */}
    <div>
      <div style={fieldLabelStyle}>
        Guest Type <span style={{ color: "#EF4444" }}>*</span>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          style={toggleBtn(newCustomer.customerType === "domestic")}
          onClick={() => {
            setNewCustomer((p) => ({
              ...p,
              customerType: "domestic",
              countryCode: "91",
              phone: p.phone.slice(0, 10),
            }));
            setConflictError("");
          }}
        >
          Domestic
        </button>
        <button
          type="button"
          style={toggleBtn(newCustomer.customerType === "international")}
          onClick={() => {
            setNewCustomer((p) => {
              const wasIndia = p.countryCode === "91";
              return {
                ...p,
                customerType: "international",
                countryCode: wasIndia ? "" : p.countryCode,
                phone: wasIndia ? "" : p.phone,
              };
            });
            setPhoneTouched(false);
            setConflictError("");
          }}
        >
          International
        </button>
      </div>
    </div>

    {/* Email */}
    <div>
      <div style={fieldLabelStyle}>
        Email <span style={{ color: "#EF4444" }}>*</span>
      </div>
      <input
        type="email"
        style={fieldStyle}
        placeholder="name@example.com"
        value={newCustomer.email}
        onChange={(e) => updateNew("email", e.target.value)}
      />
    </div>

    {/* Mobile: country code dropdown + number */}
    <div>
      <div style={fieldLabelStyle}>
        Mobile Number <span style={{ color: "#EF4444" }}>*</span>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
        <div style={{ width: 104, flexShrink: 0 }}>
          <V2CountryCodeDropdown
            value={newCustomer.countryCode}
            disabled={!newCustomer.customerType || isDomestic}
            excludeCodes={newCustomer.customerType === "international" ? ["91"] : []}
            error={false}
            onChange={(code) => {
              const c = COUNTRY_CODES.find((x) => x.code === code);
              setNewCustomer((p) => ({
                ...p,
                countryCode: code,
                phone: c ? p.phone.slice(0, c.len) : p.phone,
              }));
              setConflictError("");
            }}
          />
        </div>
        <input
          type="tel"
          inputMode="numeric"
          style={{
            ...fieldStyle,
            flex: 1,
            minWidth: 0,
            borderColor: phoneInvalid ? "#EF4444" : "#E5E7EB",
            background:
              !newCustomer.customerType || !newCustomer.countryCode ? "#F3F4F6" : "#fff",
          }}
          disabled={!newCustomer.customerType || !newCustomer.countryCode}
          placeholder={
            !newCustomer.customerType
              ? "Select customer type first"
              : !newCustomer.countryCode
              ? "Select country code first"
              : `${phoneMax}-digit number`
          }
          maxLength={phoneMax}
          value={newCustomer.phone}
          onBlur={() => setPhoneTouched(true)}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, phoneMax);
            updateNew("phone", v);
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 4,
          fontSize: 11.5,
          color: phoneInvalid ? "#EF4444" : "#6B7280",
        }}
      >
        <span>
          {phoneInvalid
            ? `Enter a valid ${phoneMax}-digit number for ${activeCountry?.country}`
            : activeCountry
            ? `${activeCountry.country} numbers have ${phoneMax} digits`
            : "Choose guest type to continue"}
        </span>
        {activeCountry && (
          <span>
            {newCustomer.phone.length}/{phoneMax}
          </span>
        )}
      </div>
    </div>

    <div style={{ fontSize: 12, color: "#6B7280" }}>
      This guest will be created when you confirm the booking.
    </div>
  </div>
)}
          </div>

          {/* Stay Duration & Dates */}
          <div>
            <div className="pmv2-form-label" style={{ marginBottom: 8 }}>
              <span>Stay Duration & Dates</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {/* Check-In */}
              <div style={{ position: "relative" }}>
                <div style={fieldLabelStyle}>Check-In Date</div>
                <button
                  type="button"
                  className={`pmv2-date-btn ${pickerOpen === "in" ? "active" : ""}`}
                  onClick={() =>
                    setPickerOpen((prev) => (prev === "in" ? null : "in"))
                  }
                >
                  <CalendarDays size={16} style={{ color: "#2563EB" }} />
                  <span className="pmv2-date-value">
                    {checkIn ? formatDisplayDate(checkIn) : "Select check-in"}
                  </span>
                </button>
                {pickerOpen === "in" && (
                  <ModalCalendarPopover
                    selectedDate={checkIn}
                    minDate={getToday()} // today onwards only
                    onSelectDate={(d) => {
                      setCheckIn(d);
                      setDatesTouched(true);
                      if (checkOut && checkOut <= d) setCheckOut("");
                    }}
                    onClose={() => setPickerOpen(null)}
                  />
                )}
              </div>

              {/* Check-Out */}
              <div style={{ position: "relative" }}>
                <div style={fieldLabelStyle}>Check-Out Date</div>
                <button
                  type="button"
                  className={`pmv2-date-btn ${pickerOpen === "out" ? "active" : ""}`}
                  onClick={() =>
                    setPickerOpen((prev) => (prev === "out" ? null : "out"))
                  }
                >
                  <CalendarDays size={16} style={{ color: "#2563EB" }} />
                  <span className="pmv2-date-value">
                    {checkOut ? formatDisplayDate(checkOut) : "Select check-out"}
                  </span>
                </button>
                {pickerOpen === "out" && (
                  <ModalCalendarPopover
                    selectedDate={checkOut}
                    minDate={checkIn ? addDays(checkIn, 1) : addDays(getToday(), 1)} // at least 1 night
                    onSelectDate={(d) => {
                      setCheckOut(d);
                      setDatesTouched(true);
                    }}
                    onClose={() => setPickerOpen(null)}
                  />
                )}
              </div>
            </div>

            {/* Verification Status Banner */}
            <div style={{ marginTop: 10 }}>
              {!datesSelected ? (
                <div
                  style={{
                    background: "#F9FAFB",
                    border: "1px solid #E5E7EB",
                    borderRadius: 8,
                    padding: "8px 12px",
                    fontSize: 12.5,
                    color: "#6B7280",
                    fontWeight: 500,
                  }}
                >
                  Select check-in and check-out dates to check availability.
                </div>
              ) : available ? (
                <div
                  style={{
                    background: "#ECFDF5",
                    border: "1px solid #A7F3D0",
                    borderRadius: 8,
                    padding: "8px 12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: 12.5,
                    color: "#065F46",
                    fontWeight: 600,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <CheckCircle2 size={16} style={{ color: "#10B981" }} />
                    <span>
                      Room {room.roomNumber} is verified available for these dates
                    </span>
                  </div>
                  <span
                    style={{
                      background: "#D1FAE5",
                      padding: "2px 8px",
                      borderRadius: 12,
                      fontSize: 11,
                    }}
                  >
                    {nights} Nights stay
                  </span>
                </div>
              ) : (
                <div
                  style={{
                    background: "#FEF2F2",
                    border: "1px solid #FECDD3",
                    borderRadius: 8,
                    padding: "8px 12px",
                    fontSize: 12.5,
                    color: "#B91C1C",
                    fontWeight: 600,
                  }}
                >
                  Room {room.roomNumber} is unavailable for these dates.
                </div>
              )}
            </div>
          </div>

          {/* Stay Summary */}
          <div className="pmv2-stay-summary-box">
            <div className="pmv2-stay-summary-header">
              <span>Stay Summary</span>
              <span
                style={{
                  background: "#EFF6FF",
                  color: "#2563EB",
                  padding: "2px 6px",
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 700,
                }}
              >
                Instant Lock
              </span>
            </div>
            <div className="pmv2-stay-summary-grid">
              <div className="pmv2-stay-summary-item">
                <span className="pmv2-stay-summary-label">Room</span>
                <span className="pmv2-stay-summary-val">{room.roomNumber}</span>
              </div>
              <div className="pmv2-stay-summary-item">
                <span className="pmv2-stay-summary-label">Guest</span>
                <span className="pmv2-stay-summary-val">{summaryName}</span>
              </div>
              <div className="pmv2-stay-summary-item">
                <span className="pmv2-stay-summary-label">Check-In</span>
                <span className="pmv2-stay-summary-val">
                  {checkIn ? formatDisplayDate(checkIn) : "-"}
                </span>
              </div>
              <div className="pmv2-stay-summary-item">
                <span className="pmv2-stay-summary-label">Check-Out</span>
                <span className="pmv2-stay-summary-val">
                  {checkOut ? formatDisplayDate(checkOut) : "-"}
                </span>
              </div>
            </div>
          </div>

          {conflictError && (
            <div style={{ color: "#EF4444", fontSize: 13, fontWeight: 500 }}>
              {conflictError}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pmv2-modal-footer">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: "#6B7280",
            }}
          >
            <Info size={15} style={{ color: "#2563EB", flexShrink: 0 }} />
            <span>The room will be reserved for this guest for the selected dates.</span>
          </div>

          <div className="pmv2-modal-footer-right">
            <button
              type="button"
              className="pmv2-btn pmv2-btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="pmv2-btn pmv2-btn-primary"
              disabled={
                !datesSelected ||
                !available ||
                isSubmitting ||
                isChecking ||
                (!isNewMode && !selectedCustomer) ||
                (isNewMode && !newCustomer.customerType)
              }
              onClick={handleConfirm}
            >
              <Check size={16} />
              <span>{isSubmitting ? "Confirming..." : "Confirm Booking"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}