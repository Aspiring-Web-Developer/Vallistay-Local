// import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
// import { fetchUserById } from "../Pages/AccessManagement/services/accessManagementApi";

// const AccessContext = createContext({
//   loading: true,
//   isAdmin: false,
//   canView: () => false,
//   refresh: () => {},
// });

// export function AccessProvider({ children }) {
//   const [modules, setModules] = useState([]);
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [loading, setLoading] = useState(true);

//   const refresh = useCallback(async () => {
//     const userId = localStorage.getItem("user_id");
//     if (!userId) {
//       setModules([]);
//       setIsAdmin(false);
//       setLoading(false);
//       return;
//     }
//     setLoading(true);
//     try {
//       const user = await fetchUserById(userId);
//       setIsAdmin(user?.user_type === "admin");
//       setModules(user?.access_module_list || []);
//     } catch (err) {
//       console.error("Failed to load access:", err);
//       setModules([]);
//       setIsAdmin(false);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     refresh();
//   }, [refresh]);

//   const canView = useCallback(
//     (moduleKey) => {
//       if (!moduleKey) return true; // items with no module (Dashboard etc.) always show
//       if (isAdmin) return true;
//       return Boolean(modules.find((m) => m.module_name === moduleKey)?.view);
//     },
//     [modules, isAdmin]
//   );

//   return (
//     <AccessContext.Provider value={{ loading, isAdmin, canView, refresh }}>
//       {children}
//     </AccessContext.Provider>
//   );
// }

// export const useAccess = () => useContext(AccessContext);




import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { fetchUserById } from "../Pages/AccessManagement/services/accessManagementApi";

const AccessContext = createContext({
  loading: true,
  isAdmin: false,
  canView: () => false,
  can: () => false,
  refresh: () => {},
});

export function AccessProvider({ children }) {
  const [modules, setModules] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      setModules([]);
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const user = await fetchUserById(userId);
      setIsAdmin(user?.user_type === "admin");
      setModules(user?.access_module_list || []);
    } catch (err) {
      console.error("Failed to load access:", err);
      setModules([]);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // action: "view" | "create" | "update" | "delete" | "export"
  const can = useCallback(
    (moduleKey, action = "view") => {
      if (!moduleKey) return true;
      if (isAdmin) return true;
      const mod = modules.find((m) => m.module_name === moduleKey);
      return Boolean(mod?.[action]);
    },
    [modules, isAdmin]
  );

  const canView = useCallback((moduleKey) => can(moduleKey, "view"), [can]);

  return (
    <AccessContext.Provider value={{ loading, isAdmin, canView, can, refresh }}>
      {children}
    </AccessContext.Provider>
  );
}

export const useAccess = () => useContext(AccessContext);