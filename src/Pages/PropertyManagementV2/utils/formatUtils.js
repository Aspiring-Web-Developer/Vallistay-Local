// src/Pages/PropertyManagementV2/utils/formatUtils.js

export function getInitials(name) {
  if (!name) return "G";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatStatusLabel(status) {
  if (!status) return "";
  const map = {
    available: "Available",
    occupied: "Occupied",
    booked: "Booked",
    due_out: "Due Out",
    maintenance: "Maintenance",
    active: "Active",
    inactive: "Inactive",
    confirmed: "Confirmed",
    checked_in: "Checked In",
    cancelled: "Cancelled",
  };
  return map[status.toLowerCase()] || status;
}

export function formatRoomId(id) {
  if (!id) return "";
  if (id.startsWith("#")) return id;
  return `#${id}`;
}
