// // src/Pages/PropertyManagementV2/components/V2AvailabilityFilter.jsx
// import React, { useState, useRef, useEffect } from "react";
// import {
//   CalendarDays,
//   ArrowRight,
//   Filter,
//   X,
//   ChevronLeft,
//   ChevronRight,
//   RefreshCw,
// } from "lucide-react";
// import {
//   formatDisplayDate,
//   formatShortDate,
//   calculateNights,
//   MONTH_FULL_NAMES,
//   toDateString,
// } from "../utils/dateUtils";

// // Lightweight custom calendar popover
// function CustomCalendarPopover({
//   selectedDate,
//   minDate,
//   onSelectDate,
//   onClose,
// }) {
//   const [currentYear, setCurrentYear] = useState(() => {
//     return selectedDate ? parseInt(selectedDate.split("-")[0], 10) : 2026;
//   });
//   const [currentMonth, setCurrentMonth] = useState(() => {
//     return selectedDate ? parseInt(selectedDate.split("-")[1], 10) - 1 : 9; // Oct = index 9
//   });

//   const popoverRef = useRef(null);

//   useEffect(() => {
//     function handleClickOutside(e) {
//       if (popoverRef.current && !popoverRef.current.contains(e.target)) {
//         onClose();
//       }
//     }
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [onClose]);

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

//   // Days in month
//   const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
//   const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday

//   const days = [];
//   for (let i = 0; i < firstDayOfWeek; i++) {
//     days.push(null);
//   }
//   for (let d = 1; d <= daysInMonth; d++) {
//     days.push(d);
//   }

//   const handleDayClick = (day) => {
//     const formatted = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
//     onSelectDate(formatted);
//     onClose();
//   };

//   return (
//     <div className="pmv2-calendar-popover" ref={popoverRef}>
//       <div className="pmv2-calendar-nav">
//         <button
//           type="button"
//           className="pmv2-btn-icon"
//           style={{ width: 28, height: 28 }}
//           onClick={handlePrevMonth}
//         >
//           <ChevronLeft size={14} />
//         </button>
//         <span className="pmv2-calendar-month-title">
//           {MONTH_FULL_NAMES[currentMonth]} {currentYear}
//         </span>
//         <button
//           type="button"
//           className="pmv2-btn-icon"
//           style={{ width: 28, height: 28 }}
//           onClick={handleNextMonth}
//         >
//           <ChevronRight size={14} />
//         </button>
//       </div>

//       <div className="pmv2-calendar-grid">
//         {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
//           <div key={day} className="pmv2-calendar-day-header">
//             {day}
//           </div>
//         ))}

//         {days.map((day, idx) => {
//           if (day === null) {
//             return <div key={`empty-${idx}`} />;
//           }

//           const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
//           const isSelected = selectedDate === dateStr;
//           const isDisabled = minDate && dateStr <= minDate;

//           return (
//             <button
//               key={day}
//               type="button"
//               disabled={isDisabled}
//               className={`pmv2-calendar-day-cell ${isSelected ? "selected" : ""}`}
//               onClick={() => handleDayClick(day)}
//             >
//               {day}
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// }



// const fmtDMY = (s) => {
//   if (!s) return "";
//   const [y, m, d] = s.split("-");
//   return `${d}/${m}/${y}`;
// };


// export default function V2AvailabilityFilter({
//   dateFilter,
//   isChecking,
//   availableCount = 0,
//   onSearch,
//   onClear,
// }) {
//   const [localCheckIn, setLocalCheckIn] = useState(dateFilter?.checkIn || "");
//   const [localCheckOut, setLocalCheckOut] = useState(dateFilter?.checkOut || "");
//   const [activePicker, setActivePicker] = useState(null); // 'checkIn' | 'checkOut' | null
//   const [validationError, setValidationError] = useState("");

//   useEffect(() => {
//     setLocalCheckIn(dateFilter?.checkIn || "");
//     setLocalCheckOut(dateFilter?.checkOut || "");
//   }, [dateFilter]);

//   const handleCheckInSelect = (dateStr) => {
//     setLocalCheckIn(dateStr);
//     setValidationError("");
//     // If checkOut is earlier or equal to new checkIn, reset checkout
//     if (localCheckOut && localCheckOut <= dateStr) {
//       setLocalCheckOut("");
//     }
//   };

//   const handleCheckOutSelect = (dateStr) => {
//     setLocalCheckOut(dateStr);
//     setValidationError("");
//   };

//   const handleSearchClick = () => {
//     if (!localCheckIn && !localCheckOut) {
//       setValidationError("Select both check-in and check-out dates.");
//       return;
//     }
//     if (!localCheckIn || !localCheckOut) {
//       setValidationError("Select both check-in and check-out dates.");
//       return;
//     }
//     if (localCheckOut <= localCheckIn) {
//       setValidationError("Check-out must be after check-in.");
//       return;
//     }
//     setValidationError("");
//     onSearch(localCheckIn, localCheckOut);
//   };

//   const handleClearClick = () => {
//     setLocalCheckIn("");
//     setLocalCheckOut("");
//     setValidationError("");
//     onClear();
//   };

//   const nights =
//     localCheckIn && localCheckOut ? calculateNights(localCheckIn, localCheckOut) : 0;
//   const isSearchDisabled = !localCheckIn || !localCheckOut;
//   const isClearDisabled = !localCheckIn && !localCheckOut && !dateFilter?.isApplied;

//   return (
//     <div className="pmv2-availability-card">
//       <div className="pmv2-availability-header">
//         <h4 className="pmv2-availability-title">Check Room Availability</h4>
//         <p className="pmv2-availability-subtitle">
//           Choose your stay dates to see which rooms can be booked.
//         </p>
//       </div>

//       <div className="pmv2-availability-controls">
//         {/* Check-In Date Field */}
//         <div className="pmv2-date-box">
//           <button
//             type="button"
//             className={`pmv2-date-btn ${activePicker === "checkIn" ? "active" : ""}`}
//             onClick={() =>
//               setActivePicker((prev) => (prev === "checkIn" ? null : "checkIn"))
//             }
//           >
//             <CalendarDays size={18} style={{ color: "#2563EB" }} />
//             <div className="pmv2-date-text-wrap">
//               <span className="pmv2-date-label">Check-In</span>
//               {localCheckIn ? (
//                 <span className="pmv2-date-value">
//                   {formatDisplayDate(localCheckIn)}
//                 </span>
//               ) : (
//                 <span className="pmv2-date-placeholder">Select check-in date</span>
//               )}
//             </div>
//           </button>

//           {activePicker === "checkIn" && (
//             <CustomCalendarPopover
//               selectedDate={localCheckIn}
//               onSelectDate={handleCheckInSelect}
//               onClose={() => setActivePicker(null)}
//             />
//           )}
//         </div>

//         <div className="pmv2-date-arrow">
//           <ArrowRight size={18} />
//         </div>

//         {/* Check-Out Date Field */}
//         <div className="pmv2-date-box">
//           <button
//             type="button"
//             className={`pmv2-date-btn ${activePicker === "checkOut" ? "active" : ""}`}
//             onClick={() =>
//               setActivePicker((prev) => (prev === "checkOut" ? null : "checkOut"))
//             }
//           >
//             <CalendarDays size={18} style={{ color: "#2563EB" }} />
//             <div className="pmv2-date-text-wrap">
//               <span className="pmv2-date-label">Check-Out</span>
//               {localCheckOut ? (
//                 <span className="pmv2-date-value">
//                   {formatDisplayDate(localCheckOut)}
//                 </span>
//               ) : (
//                 <span className="pmv2-date-placeholder">Select check-out date</span>
//               )}
//             </div>
//           </button>

//           {activePicker === "checkOut" && (
//             <CustomCalendarPopover
//               selectedDate={localCheckOut}
//               minDate={localCheckIn}
//               onSelectDate={handleCheckOutSelect}
//               onClose={() => setActivePicker(null)}
//             />
//           )}
//         </div>

//         {/* Search Availability Button */}
//         <button
//           type="button"
//           className="pmv2-btn pmv2-btn-primary"
//           disabled={isSearchDisabled || isChecking}
//           onClick={handleSearchClick}
//         >
//           {isChecking ? (
//             <>
//               <RefreshCw size={15} style={{ animation: "spin 1s linear infinite" }} />
//               <span>Checking...</span>
//             </>
//           ) : (
//             <>
//               <Filter size={15} />
//               <span>Filter Dates</span>
//             </>
//           )}
//         </button>

//         {/* Clear Button */}
//         <button
//           type="button"
//           className="pmv2-btn-icon"
//           title="Clear Dates"
//           disabled={isClearDisabled}
//           onClick={handleClearClick}
//         >
//           <X size={16} />
//         </button>

//         {/* Live Filter Result Banner */}
// {dateFilter?.isApplied && dateFilter.checkIn && dateFilter.checkOut && (
//   <div
//     className="pmv2-availability-banner"
//     style={
//       availableCount === 0
//         ? { background: "#FEF2F2", borderColor: "#FECACA", color: "#B91C1C" }
//         : undefined
//     }
//   >
//     <span
//       className="pmv2-availability-banner-dot"
//       style={availableCount === 0 ? { background: "#EF4444" } : undefined}
//     />
// <span>
//   {availableCount === 0
//     ? `No rooms available for ${fmtDMY(dateFilter.checkIn)} – ${fmtDMY(dateFilter.checkOut)} (${nights} Nights)`
//     : `${availableCount} room${availableCount > 1 ? "s" : ""} available for ${fmtDMY(dateFilter.checkIn)} – ${fmtDMY(dateFilter.checkOut)} (${nights} Nights)`}
// </span>
//   </div>
// )}
//       </div>

//       {validationError && (
//         <div style={{ color: "#EF4444", fontSize: 12.5, marginTop: 8, fontWeight: 500 }}>
//           {validationError}
//         </div>
//       )}
//     </div>
//   );
// }





































// src/Pages/PropertyManagementV2/components/V2AvailabilityFilter.jsx
import React, { useState, useRef, useEffect } from "react";
import { CalendarDays, ArrowRight, Filter, X, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { calculateNights, MONTH_FULL_NAMES } from "../utils/dateUtils";

const fmtDMY = (s) => {
  if (!s) return "";
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
};

const toStr = (y, m, d) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

/* ── Range calendar (single popover, start + end) ── */
function RangeCalendar({ start, end, onPick }) {
  const base = start ? new Date(start + "T00:00:00") : new Date();
  const [year, setYear] = useState(base.getFullYear());
  const [month, setMonth] = useState(base.getMonth());
  const [hover, setHover] = useState("");
    const now = new Date();
  const today = toStr(now.getFullYear(), now.getMonth(), now.getDate());

  const prev = () => (month === 0 ? (setMonth(11), setYear((y) => y - 1)) : setMonth((m) => m - 1));
  const next = () => (month === 11 ? (setMonth(0), setYear((y) => y + 1)) : setMonth((m) => m + 1));

  // build cells: leading days from previous month, month days, trailing days from next month
  const first = new Date(year, month, 1).getDay();
  const dim = new Date(year, month + 1, 0).getDate();
  const prevDim = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = first - 1; i >= 0; i--) cells.push({ day: prevDim - i, inMonth: false });
  for (let d = 1; d <= dim; d++) cells.push({ day: d, inMonth: true, str: toStr(year, month, d) });
  let t = 1;
  while (cells.length % 7 !== 0) cells.push({ day: t++, inMonth: false });

  const rangeEnd = end || (start && hover > start ? hover : "");
  const hasBand = Boolean(start && rangeEnd && rangeEnd > start);

  return (
    <div className="pmv2-rc-popover" onMouseLeave={() => setHover("")}>
      <div className="pmv2-rc-head">
        <button type="button" className="pmv2-rc-nav" onClick={prev}><ChevronLeft size={18} /></button>
        <span className="pmv2-rc-title">{MONTH_FULL_NAMES[month]} {year}</span>
        <button type="button" className="pmv2-rc-nav" onClick={next}><ChevronRight size={18} /></button>
      </div>

      <div className="pmv2-rc-weekdays">
        {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => <span key={d}>{d}</span>)}
      </div>

      <div className="pmv2-rc-grid">
        {cells.map((c, i) => {
          const col = i % 7;
          if (!c.inMonth) {
            return (
              <div key={i} className="pmv2-rc-cell">
                <span className="pmv2-rc-day faded">{c.day}</span>
              </div>
            );
          }


          
          const isPast = c.str < today;
          const isStart = c.str === start;
          const isEnd = hasBand && c.str === rangeEnd;
          const inBand = hasBand && c.str >= start && c.str <= rangeEnd;

          let cls = "pmv2-rc-cell";
          if (inBand) {
            cls += " band";
            if (isStart || col === 0) cls += " round-l";
            if (isEnd || col === 6) cls += " round-r";
          }
          let dayCls = "pmv2-rc-day";
          if (isPast) dayCls += " past";
          else if (hasBand && (isStart || isEnd)) dayCls += " edge";
          else if (isStart) dayCls += " solo";
          else if (inBand) dayCls += " in";

          return (
            <div key={i} className={cls}>
              <button
                type="button"
                className={dayCls}
                disabled={isPast}
                onMouseEnter={() => !isPast && setHover(c.str)}
                onClick={() => !isPast && onPick(c.str)}
              >
                {c.day}
              </button>
            </div>
          );
        })}
      </div>

      <div className="pmv2-rc-foot">
        {!start
          ? "Select check-in date"
          : !end
          ? "Now select check-out date"
          : `${calculateNights(start, end)} night${calculateNights(start, end) > 1 ? "s" : ""} selected`}
      </div>
    </div>
  );
}

export default function V2AvailabilityFilter({
  dateFilter,
  isChecking,
  availableCount = 0,
  onSearch,
  onClear,
}) {
  const [localCheckIn, setLocalCheckIn] = useState(dateFilter?.checkIn || "");
  const [localCheckOut, setLocalCheckOut] = useState(dateFilter?.checkOut || "");
  const [open, setOpen] = useState(false);
  const [validationError, setValidationError] = useState("");
  const wrapRef = useRef(null);

  useEffect(() => {
    setLocalCheckIn(dateFilter?.checkIn || "");
    setLocalCheckOut(dateFilter?.checkOut || "");
  }, [dateFilter]);

  useEffect(() => {
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

const handlePick = (d) => {
    const n = new Date();
    if (d < toStr(n.getFullYear(), n.getMonth(), n.getDate())) return; // no past dates
  setValidationError("");
  if (!localCheckIn || (localCheckIn && localCheckOut) || d <= localCheckIn) {
    setLocalCheckIn(d);
    setLocalCheckOut("");
  } else {
    setLocalCheckOut(d);
    setOpen(false);
    onSearch(localCheckIn, d); // instant filter, no button
  }
};

  const handleSearchClick = () => {
    if (!localCheckIn || !localCheckOut) {
      setValidationError("Select both check-in and check-out dates.");
      return;
    }
    if (localCheckOut <= localCheckIn) {
      setValidationError("Check-out must be after check-in.");
      return;
    }
    setValidationError("");
    onSearch(localCheckIn, localCheckOut);
  };

  const handleClearClick = () => {
    setLocalCheckIn("");
    setLocalCheckOut("");
    setValidationError("");
    onClear();
  };

  const nights = localCheckIn && localCheckOut ? calculateNights(localCheckIn, localCheckOut) : 0;
  const isSearchDisabled = !localCheckIn || !localCheckOut;
  const isClearDisabled = !localCheckIn && !localCheckOut && !dateFilter?.isApplied;
  return (
    <div className="pmv2-availability-card pmv2-av-row">
      <h4 className="pmv2-availability-title pmv2-av-title">Check Room Availability</h4>

      <div className="pmv2-av-controls">
        {/* Single range field */}
        <div className="pmv2-rc-wrap" ref={wrapRef}>
          <button
            type="button"
            className={`pmv2-rc-field ${open ? "active" : ""}`}
            onClick={() => setOpen((o) => !o)}
          >
            <CalendarDays size={18} style={{ color: "#2563EB", flexShrink: 0 }} />
            <div className="pmv2-date-text-wrap">
              <span className="pmv2-date-label">Check-In – Check-Out</span>
              {localCheckIn ? (
                <span className="pmv2-date-value">
                  {fmtDMY(localCheckIn)}
                  <ArrowRight size={13} style={{ margin: "0 6px", verticalAlign: "-2px", color: "#9CA3AF" }} />
                  {localCheckOut ? fmtDMY(localCheckOut) : "Select"}
                </span>
              ) : (
                <span className="pmv2-date-placeholder">Select check-in & check-out</span>
              )}
            </div>
          </button>

          {open && <RangeCalendar start={localCheckIn} end={localCheckOut} onPick={handlePick} />}
        </div>

        {(localCheckIn || localCheckOut || dateFilter?.isApplied) && (
          <button
            type="button"
            className="pmv2-btn-icon"
            title="Clear Dates"
            onClick={handleClearClick}
          >
            <X size={16} />
          </button>
        )}

        {/* Loading animation */}
        {isChecking && (
          <div className="pmv2-checking">
            <span className="pmv2-checking-spinner" />
            <div className="pmv2-checking-text">
              <span>Checking availability…</span>
              <span className="pmv2-checking-bar"><i /></span>
            </div>
          </div>
        )}

        {/* Result banner */}
        {!isChecking && dateFilter?.isApplied && dateFilter.checkIn && dateFilter.checkOut && (
          <div
            className="pmv2-availability-banner"
            style={
              availableCount === 0
                ? { background: "#FEF2F2", borderColor: "#FECACA", color: "#B91C1C" }
                : undefined
            }
          >
            <span
              className="pmv2-availability-banner-dot"
              style={availableCount === 0 ? { background: "#EF4444" } : undefined}
            />
            <span>
              {availableCount === 0
                ? `No rooms available for ${fmtDMY(dateFilter.checkIn)} – ${fmtDMY(dateFilter.checkOut)} (${nights} Nights)`
                : `${availableCount} room${availableCount > 1 ? "s" : ""} available for ${fmtDMY(dateFilter.checkIn)} – ${fmtDMY(dateFilter.checkOut)} (${nights} Nights)`}
            </span>
          </div>
        )}
      </div>

      {validationError && (
        <div className="pmv2-av-error">{validationError}</div>
      )}
    </div>
  );
}