import React from "react";

export default function PermissionBadge({ type, count }) {
  if (type === "all") {
    return (
      <span className="am-perm-badge am-perm-all">
        Full 16 Scopes
      </span>
    );
  }

  if (type === "more") {
    return (
      <span className="am-perm-badge am-perm-more">
        +{count} more
      </span>
    );
  }

  const normalized = (type || "").toLowerCase();
  let badgeClass = "am-perm-view";
  let label = type;

  switch (normalized) {
    case "create":
      badgeClass = "am-perm-create";
      label = "Create";
      break;
    case "update":
      badgeClass = "am-perm-update";
      label = "Update";
      break;
    case "delete":
      badgeClass = "am-perm-delete";
      label = "Delete";
      break;
    case "export":
      badgeClass = "am-perm-export";
      label = "Export";
      break;
    case "view":
      badgeClass = "am-perm-view";
      label = "View";
      break;
    default:
      badgeClass = "am-perm-more";
      label = type;
  }

  return (
    <span className={`am-perm-badge ${badgeClass}`}>
      {label}
    </span>
  );
}
