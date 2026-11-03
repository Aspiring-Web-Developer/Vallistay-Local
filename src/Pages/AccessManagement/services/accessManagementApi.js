import api from "../../../services/api";

/**
 * Normalizes backend response envelope: { data, error, message, success }
 */
export const unwrapResponse = (response) => {
  const body = response?.data !== undefined ? response.data : response;
  if (body && typeof body === "object") {
    if (body.success === false) {
      throw new Error(body.message || "The request could not be completed.");
    }
    return body.data !== undefined ? body.data : body;
  }
  return body;
};

/**
 * Parses MongoDB $date, ISO string, or numeric timestamp into a formatted string
 */
export const formatMongoDate = (dateVal) => {
  if (!dateVal) return "—";
  try {
    let timestamp;
    if (typeof dateVal === "object" && dateVal?.$date) {
      timestamp = dateVal.$date;
    } else {
      timestamp = dateVal;
    }
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return "—";

    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "—";
  }
};

/**
 * Maps a raw backend user document to the frontend model
 */
export const mapUserFromApi = (user) => {
  if (!user) return null;

  const firstName = user.name || "";
  const lastName = user.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim() || user.email || "Unnamed User";

  // Initials for avatar
  const fInitial = firstName ? firstName[0].toUpperCase() : "";
  const lInitial = lastName ? lastName[0].toUpperCase() : "";
  const avatar = (fInitial + lInitial) || (user.email ? user.email[0].toUpperCase() : "U");

  // Determine user type label
  const rawRole = (user.user_type || "").toLowerCase();
  const isAdmin = rawRole === "admin" || rawRole === "administrator";
  const userTypeLabel = isAdmin ? "Admin" : "User";
  const roleTitle = isAdmin ? "Super Admin" : "Operator User";

  // Extract access modules from access_list
  const rawModules = user.access_list?.access_module_list || [];
  // const accessModuleList = rawModules.map((m) => ({
  //   module_name: m.module_name,
  //   view: Boolean(m.create || m.update || m.delete || m.export), // user has view if any permission granted
  //   create: Boolean(m.create),
  //   update: Boolean(m.update),
  //   delete: Boolean(m.delete),
  //   export: Boolean(m.export),
  // }));

    const accessModuleList = rawModules.map((m) => ({
    module_name: m.module_name,
    view: Boolean(m.view || m.create || m.update || m.delete || m.export),
    create: Boolean(m.create),
    update: Boolean(m.update),
    delete: Boolean(m.delete),
    export: Boolean(m.export),
  }));
  // Ensure default core modules exist in representation
  // const defaultModules = ["invoice", "customers", "departments", "access_management"];
  const defaultModules = ["invoice", "customers", "departments", "room_booking", "access_management", "audit_logs"];
  const completeModuleList = defaultModules.map((modName) => {
    const found = accessModuleList.find((m) => m.module_name?.toLowerCase() === modName);
    if (found) {
      return {
        ...found,
        label: modName.charAt(0).toUpperCase() + modName.slice(1).replace("_", " ") + " Module",
        status: "Enabled",
      };
    }
    return {
      module_name: modName,
      label: modName.charAt(0).toUpperCase() + modName.slice(1).replace("_", " ") + " Module",
      status: modName === "access_management" ? "Restricted" : "Disabled",
      view: false,
      create: false,
      update: false,
      delete: false,
      export: false,
    };
  });

  return {
    user_id: user.user_id,
    _id: user._id?.$oid || user._id,
    name: firstName,
    last_name: lastName,
    full_name: fullName,
    email: user.email || "—",
    mobile: user.mobile ? (user.mobile.startsWith("+") ? user.mobile : `+91 ${user.mobile}`) : "—",
    raw_mobile: user.mobile || "",
    is_active: user.is_active !== false,
    status: user.is_active !== false ? "active" : "inactive",
    user_type: isAdmin ? "admin" : "user",
    raw_user_type: user.user_type || "user1",
    role_title: roleTitle,
    avatar,
    created_at: formatMongoDate(user.created_at),
    last_updated: formatMongoDate(user.updated_at || user.created_at),
    display_user_id: `USR-${user.user_id ? user.user_id.slice(0, 7).toUpperCase() : "0000000"}`,
    access_module_list: completeModuleList,
  };
};

/**
 * GET /users - Fetch all users
 */
export const fetchUsers = async () => {
  const response = await api.get("/users/");
  const data = unwrapResponse(response);

  if (!Array.isArray(data)) return [];

  // Filter out soft-deleted users if deleted_status is true
  return data
    .filter((u) => !u.deleted_status)
    .map(mapUserFromApi);
};

/**
 * GET /users/get_user - Fetch single user by UUID
 */
export const fetchUserById = async (userId) => {
  if (!userId) throw new Error("User ID is required.");

  const response = await api.get("/users/get_user", {
    params: { user_id: userId },
  });

  const data = unwrapResponse(response);
  return mapUserFromApi(data);
};

/**
 * POST /users/create_user_access - Create user with access matrix
 */
export const createUserWithAccess = async (payload) => {
  const response = await api.post("/users/create_user_access", payload);
  return unwrapResponse(response);
};

/**
 * PUT /users/update_user - Update user and permissions
 */
export const updateUserWithAccess = async (payload) => {
  const response = await api.put("/users/update_user", payload);
  return unwrapResponse(response);
};

export const deleteUser = async (userId) => {
  if (!userId) throw new Error("User ID is required.");

  const response = await api.delete("/users/delete_user", {
    params: { user_id: userId },
  });
  return unwrapResponse(response);
};
