// src/Pages/PropertyRooms/components/RoomStatusBadge.jsx
import React from "react";

export default function RoomStatusBadge({ status }) {
  const getBadgeClass = () => {
    switch (status?.toUpperCase()) {
      case "AVAILABLE":
        return "pr-status-chip available";
      case "OCCUPIED":
        return "pr-status-chip occupied";
      case "RESERVED":
        return "pr-status-chip reserved";
      case "DUE_OUT":
      case "DUE OUT":
        return "pr-status-chip due_out";
      default:
        return "pr-status-chip";
    }
  };

  const getLabel = () => {
    switch (status?.toUpperCase()) {
      case "AVAILABLE":
        return "AVAILABLE";
      case "OCCUPIED":
        return "OCCUPIED";
      case "RESERVED":
        return "RESERVED";
      case "DUE_OUT":
      case "DUE OUT":
        return "DUE OUT TODAY";
      default:
        return status;
    }
  };

  return <span className={getBadgeClass()}>{getLabel()}</span>;
}
