// import api from "../../../services/api";
// import { formatMongoDate } from "../../AccessManagement/services/accessManagementApi";
// import { generateAuditDescription } from "../utils/descriptionHelper";

// /**
//  * Normalizes backend response envelope: { data, error, message, success }
//  */
// export const unwrapResponse = (response) => {
//   const body = response?.data !== undefined ? response.data : response;
//   if (body && typeof body === "object") {
//     if (body.success === false) {
//       throw new Error(body.message || "The request could not be completed.");
//     }
//     return body.data !== undefined ? body.data : body;
//   }
//   return body;
// };

// /**
//  * Computes dynamic before-and-after diffs from old_value and new_value objects
//  */
// export const computeChangedFields = (oldVal, newVal) => {
//   const diffs = [];
//   const oldObj = (typeof oldVal === "object" && oldVal !== null) ? oldVal : {};
//   const newObj = (typeof newVal === "object" && newVal !== null) ? newVal : {};
//   const allKeys = Array.from(new Set([...Object.keys(oldObj), ...Object.keys(newObj)]));

//   allKeys.forEach((key) => {
//     // Avoid showing password_hash or internal secrets
//     if (key.includes("password") || key.includes("token") || key.includes("secret")) return;

//     const o = oldObj[key];
//     const n = newObj[key];

//     if (JSON.stringify(o) !== JSON.stringify(n)) {
//       diffs.push({
//         field_name: key,
//         old_value: o !== undefined ? (typeof o === "object" ? JSON.stringify(o) : String(o)) : "—",
//         new_value: n !== undefined ? (typeof n === "object" ? JSON.stringify(n) : String(n)) : "—",
//       });
//     }
//   });

//   return diffs;
// };

// /**
//  * Maps raw backend audit record to frontend model
//  */
// export const mapAuditEventFromApi = (item) => {
//   if (!item) return null;

//   const actorDetails = item.user_details || {};
//   const actorFirstName = actorDetails.name || "";
//   const actorLastName = actorDetails.last_name || "";
//   const actorName = `${actorFirstName} ${actorLastName}`.trim() || actorDetails.email || "System / Automated";
  
//   const fInitial = actorFirstName ? actorFirstName[0].toUpperCase() : "";
//   const lInitial = actorLastName ? actorLastName[0].toUpperCase() : "";
//   const actorAvatar = (fInitial + lInitial) || (actorDetails.email ? actorDetails.email[0].toUpperCase() : "AD");

//   // Determine display record ID safely
//   const displayId =
//     item.new_value?.invoice_id ||
//     item.old_value?.invoice_id ||
//     (item.module_reference_id ? `Ref: ${item.module_reference_id.slice(-6).toUpperCase()}` : "Record");

//   const diffs = computeChangedFields(item.old_value, item.new_value);
//   const description = generateAuditDescription(item);

//   return {
//     audit_id: item.changes_history_id || item._id?.$oid || item._id || "—",
//     action: (item.changes_type || "view").toLowerCase(),
//     action_label: (item.changes_type || "View").charAt(0).toUpperCase() + (item.changes_type || "view").slice(1),
//     module_key: (item.module_name || "system").toLowerCase(),
//     module_name: (item.module_name || "System").charAt(0).toUpperCase() + (item.module_name || "system").slice(1),
//     resource_type: item.module_name || "record",
//     resource_display_id: displayId,
//     performed_by_user_id: actorDetails.user_id || item.created_by_user_id || "",
//     performed_by_name: actorName,
//     performed_by_email: actorDetails.email || "—",
//     performed_by_role: actorDetails.user_type === "admin" ? "Super Admin" : (actorDetails.user_type || "User"),
//     performed_by_avatar: actorAvatar,
//     description,
//     old_value: item.old_value || null,
//     new_value: item.new_value || null,
//     changed_fields: diffs,
//     status: item.error ? "failed" : "success",
//     ip_address: item.ip_address || "198.51.100.24",
//     location: item.location || "Internal Dashboard",
//     created_at: item.created_at,
//     formatted_date: formatMongoDate(item.created_at),
//     time_ago: "Recently",
//   };
// };

// /**
//  * GET /changes_history/list_changes_history - Fetch global audit logs
//  */
// export const fetchGlobalAuditLogs = async () => {
//   const response = await api.get("/changes_history/list_changes_history");
//   const data = unwrapResponse(response);

//   if (!Array.isArray(data)) return [];

//   return data.map(mapAuditEventFromApi);
// };

// /**
//  * GET /changes_history/list_changes_history?user_id=<UUID> - Fetch individual user's audit logs
//  */
// export const fetchUserAuditLogs = async (userId) => {
//   if (!userId) throw new Error("User ID is required.");

//   const response = await api.get("/changes_history/list_changes_history", {
//      params: { created_by_user_id: userId },
//   });

//   const data = unwrapResponse(response);

//   if (!Array.isArray(data)) return [];

//   return data.map(mapAuditEventFromApi);
// };













import api from "../../../services/api";
import { formatMongoDate } from "../../AccessManagement/services/accessManagementApi";
import { generateAuditDescription } from "../utils/descriptionHelper";

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
 * Computes dynamic before-and-after diffs from old_value and new_value objects
 */
export const computeChangedFields = (oldVal, newVal) => {
  const diffs = [];
  const oldObj = (typeof oldVal === "object" && oldVal !== null) ? oldVal : {};
  const newObj = (typeof newVal === "object" && newVal !== null) ? newVal : {};
  const allKeys = Array.from(new Set([...Object.keys(oldObj), ...Object.keys(newObj)]));

  allKeys.forEach((key) => {
    // Avoid showing password_hash or internal secrets
    if (key.includes("password") || key.includes("token") || key.includes("secret")) return;

    const o = oldObj[key];
    const n = newObj[key];

    if (JSON.stringify(o) !== JSON.stringify(n)) {
      diffs.push({
        field_name: key,
        old_value: o !== undefined ? (typeof o === "object" ? JSON.stringify(o) : String(o)) : "—",
        new_value: n !== undefined ? (typeof n === "object" ? JSON.stringify(n) : String(n)) : "—",
      });
    }
  });

  return diffs;
};

/**
 * Maps raw backend audit record to frontend model
 */
export const mapAuditEventFromApi = (item) => {
  if (!item) return null;

  const actorDetails = item.user_details || {};
  const actorFirstName = actorDetails.name || "";
  const actorLastName = actorDetails.last_name || "";
  const actorName = `${actorFirstName} ${actorLastName}`.trim() || actorDetails.email || "System / Automated";
  
  const fInitial = actorFirstName ? actorFirstName[0].toUpperCase() : "";
  const lInitial = actorLastName ? actorLastName[0].toUpperCase() : "";
  const actorAvatar = (fInitial + lInitial) || (actorDetails.email ? actorDetails.email[0].toUpperCase() : "AD");

  // Determine display record ID safely
  const displayId =
    item.new_value?.invoice_id ||
    item.old_value?.invoice_id ||
    (item.module_reference_id ? `Ref: ${item.module_reference_id.slice(-6).toUpperCase()}` : "Record");

  const diffs = computeChangedFields(item.old_value, item.new_value);
  const description = generateAuditDescription(item);

  // FIX: backend sends "changes_history_type", not "changes_type"
  const actionType = item.changes_history_type || item.changes_type || "view";

  return {
    audit_id: item.changes_history_id || item._id?.$oid || item._id || "—",
    action: actionType.toLowerCase(),
    action_label: actionType.charAt(0).toUpperCase() + actionType.slice(1).toLowerCase(),
    module_key: (item.module_name || "system").toLowerCase(),
    module_name: (item.module_name || "System").charAt(0).toUpperCase() + (item.module_name || "system").slice(1),
    resource_type: item.module_name || "record",
    resource_display_id: displayId,
    performed_by_user_id: actorDetails.user_id || item.created_by_user_id || "",
    performed_by_name: actorName,
    performed_by_email: actorDetails.email || "—",
    performed_by_role: actorDetails.user_type === "admin" ? "Super Admin" : (actorDetails.user_type || "User"),
    performed_by_avatar: actorAvatar,
    description,
    old_value: item.old_value || null,
    new_value: item.new_value || null,
    changed_fields: diffs,
    status: item.error ? "failed" : "success",
    created_at: item.created_at,
    created_ts: new Date(item.created_at?.$date ?? item.created_at).getTime() || 0,
    formatted_date: formatMongoDate(item.created_at),
  };
};

/**
 * GET /changes_history/list_changes_history - Fetch global audit logs
 */
// export const fetchGlobalAuditLogs = async () => {
//   const response = await api.get("/changes_history/list_changes_history");
//   const data = unwrapResponse(response);

//   if (!Array.isArray(data)) return [];

//   return data.map(mapAuditEventFromApi);
// };


/**
 * GET /changes_history/list_changes_history?page=1&per_page=10
 */
export const fetchGlobalAuditLogs = async ({ page = 1, per_page = 10 } = {}) => {
  const response = await api.get("/changes_history/list_changes_history", {
    params: { page, per_page },
  });

  const data = unwrapResponse(response);
  const meta = response?.data?.add_on_data || {};

  return {
    events: Array.isArray(data) ? data.map(mapAuditEventFromApi) : [],
    meta: {
      page: meta.page ?? page,
      per_page: meta.per_page ?? per_page,
      total: meta.total ?? 0,
      total_pages: meta.total_pages ?? 1,
      has_next: !!meta.has_next,
      has_prev: !!meta.has_prev,
    },
  };
};

/**
 * GET /changes_history/list_changes_history?user_id=<UUID> - Fetch individual user's audit logs
 */
export const fetchUserAuditLogs = async (userId) => {
  if (!userId) throw new Error("User ID is required.");

  const response = await api.get("/changes_history/list_changes_history", {
     params: { created_by_user_id: userId },
  });

  const data = unwrapResponse(response);

  if (!Array.isArray(data)) return [];

  return data.map(mapAuditEventFromApi);
};