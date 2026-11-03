import { Navigate } from "react-router-dom";
import { useAccess } from "../services/AccessContext";

export default function RequireAccess({ module, action = "view", children }) {
  const { can, loading } = useAccess();
  if (loading) return null;
  if (!can(module, action)) return <Navigate to="/" replace />;
  return children;
}