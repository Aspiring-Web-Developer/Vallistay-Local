// src/Pages/PropertyManagementV2/utils/dateUtils.js

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const MONTH_FULL_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

/**
 * Format "2026-10-05" to "05 Oct 2026"
 */
export function formatDisplayDate(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parts[2].padStart(2, "0");
  const monthName = MONTH_NAMES[monthIdx] || parts[1];
  return `${day} ${monthName} ${year}`;
}

/**
 * Format "2026-10-05" to "05 Oct"
 */
export function formatShortDate(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parts[2].padStart(2, "0");
  const monthName = MONTH_NAMES[monthIdx] || parts[1];
  return `${day} ${monthName}`;
}

/**
 * Calculate difference in days (nights) between two YYYY-MM-DD strings
 */
export function calculateNights(checkInStr, checkOutStr) {
  if (!checkInStr || !checkOutStr) return 0;
  const inDate = new Date(checkInStr);
  const outDate = new Date(checkOutStr);
  const diffTime = outDate.getTime() - inDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Validate stay date range
 */
export function isValidDateRange(checkIn, checkOut) {
  if (!checkIn && !checkOut) {
    return { valid: false, error: "Select both check-in and check-out dates." };
  }
  if (!checkIn || !checkOut) {
    return { valid: false, error: "Select both check-in and check-out dates." };
  }
  if (checkOut <= checkIn) {
    return { valid: false, error: "Check-out must be after check-in." };
  }
  const nights = calculateNights(checkIn, checkOut);
  if (nights < 1) {
    return { valid: false, error: "Select at least one night." };
  }
  return { valid: true, error: null };
}

/**
 * Convert Date object to "YYYY-MM-DD"
 */
export function toDateString(d) {
  if (!d) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export { MONTH_NAMES, MONTH_FULL_NAMES };
