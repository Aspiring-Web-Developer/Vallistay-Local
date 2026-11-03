import { Navigate } from "react-router-dom";
import { useAccess } from "./AccessContext";

export default function RequireModule({ module, action = "view", children }) {
  const { can, loading } = useAccess();
  if (loading) return null;
  return can(module, action) ? children : <Navigate to="/" replace />;
}