import React from "react";
import {
  Edit3,
  PlusCircle,
  Trash2,
  Download,
  LogIn,
  LogOut,
  AlertCircle,
  Eye,
  ShieldAlert,
} from "lucide-react";

export default function AuditActionBadge({ action }) {
  const norm = (action || "").toLowerCase();

  switch (norm) {
    case "create":
      return (
        <span className="al-action-badge al-action-create">
          <PlusCircle size={13} />
          Create
        </span>
      );
    case "update":
      return (
        <span className="al-action-badge al-action-update">
          <Edit3 size={13} />
          Update
        </span>
      );
    case "delete":
      return (
        <span className="al-action-badge al-action-delete">
          <Trash2 size={13} />
          Delete
        </span>
      );
    case "export":
      return (
        <span className="al-action-badge al-action-export">
          <Download size={13} />
          Export
        </span>
      );
    case "login":
      return (
        <span className="al-action-badge al-action-login">
          <LogIn size={13} />
          Login
        </span>
      );
    case "logout":
      return (
        <span className="al-action-badge al-action-login">
          <LogOut size={13} />
          Logout
        </span>
      );
    case "failed":
      return (
        <span className="al-action-badge al-action-failed">
          <AlertCircle size={13} />
          Failed
        </span>
      );
    case "permission_changed":
    case "permission changed":
      return (
        <span className="al-action-badge al-action-perm">
          <ShieldAlert size={13} />
          Perm Changed
        </span>
      );
    case "view":
    default:
      return (
        <span className="al-action-badge al-action-view">
          <Eye size={13} />
          {action || "View"}
        </span>
      );
  }
}
