/**
 * Extensible array of rules for generating user-friendly audit event descriptions
 */
export const descriptionRules = [
  {
    action: "update",
    module: "invoice",
    match: ({ oldValue, newValue }) => oldValue?.invoice_id || newValue?.invoice_id,
    getDescription: ({ oldValue, newValue }) =>
      `Updated invoice ID from ${oldValue?.invoice_id || "—"} to ${newValue?.invoice_id || "—"}.`,
  },
  {
    action: "update",
    module: "invoice",
    match: () => true,
    getDescription: ({ resourceId }) =>
      `Updated invoice record ${resourceId || ""}`.trim() + ".",
  },
  {
    action: "create",
    module: "invoice",
    match: () => true,
    getDescription: ({ resourceId, newValue }) =>
      newValue?.invoice_id
        ? `Created a new invoice ${newValue.invoice_id}.`
        : `Created a new invoice record ${resourceId || ""}`.trim() + ".",
  },
  {
    action: "delete",
    module: "invoice",
    match: () => true,
    getDescription: ({ resourceId, oldValue }) =>
      oldValue?.invoice_id
        ? `Deleted invoice ${oldValue.invoice_id}.`
        : `Deleted an invoice record ${resourceId || ""}`.trim() + ".",
  },
  {
    action: "update",
    module: "access_management",
    match: () => true,
    getDescription: () => "Updated access permissions.",
  },
  {
    action: "create",
    module: "users",
    match: () => true,
    getDescription: ({ newValue }) =>
      newValue?.name ? `Created user ${newValue.name}.` : "Created a new user.",
  },
  {
    action: "update",
    module: "users",
    match: () => true,
    getDescription: ({ newValue, oldValue }) =>
      newValue?.name || oldValue?.name
        ? `Updated user details for ${newValue?.name || oldValue?.name}.`
        : "Updated user details.",
  },
  {
    action: "delete",
    module: "users",
    match: () => true,
    getDescription: () => "Deleted a user.",
  },
  {
    action: "create",
    module: "customers",
    match: () => true,
    getDescription: ({ newValue }) =>
      newValue?.name
        ? `Created customer profile for ${newValue.name}.`
        : "Created a new customer profile.",
  },
  {
    action: "delete",
    module: "customers",
    match: () => true,
    getDescription: ({ oldValue, resourceId }) =>
      oldValue?.name
        ? `Deleted customer profile ${oldValue.name}.`
        : `Deleted customer record ${resourceId || ""}`.trim() + ".",
  },
  {
    action: "export",
    match: () => true,
    getDescription: ({ moduleName }) =>
      `Exported ${moduleName || "system"} report.`,
  },
  {
    action: "login",
    match: () => true,
    getDescription: ({ actorName }) =>
      `${actorName || "User"} logged in to dashboard.`,
  },
  {
    action: "logout",
    match: () => true,
    getDescription: ({ actorName }) =>
      `${actorName || "User"} logged out.`,
  },
];

/**
 * Generates human-friendly audit description from event data
 */
// export const generateAuditDescription = ({
//   changes_type,
//   module_name,
//   old_value,
//   new_value,
//   module_reference_id,
//   user_details,
// }) => {
//   const action = (changes_type || "").toLowerCase().trim();
export const generateAuditDescription = ({
  changes_history_type,
  module_name,
  old_value,
  new_value,
  module_reference_id,
  user_details,
}) => {
  const action = (changes_history_type || "").toLowerCase().trim();
  const moduleKey = (module_name || "").toLowerCase().trim();
  const actorName = user_details?.name ? `${user_details.name} ${user_details.last_name || ""}`.trim() : "";
  const resourceId = new_value?.invoice_id || old_value?.invoice_id || (module_reference_id ? module_reference_id.slice(-6).toUpperCase() : "");

  // Find matching rule
  for (const rule of descriptionRules) {
    if (rule.action && rule.action !== action) continue;
    if (rule.module && rule.module !== moduleKey && !moduleKey.includes(rule.module)) continue;
    if (rule.match && !rule.match({ oldValue: old_value, newValue: new_value })) continue;

    return rule.getDescription({
      oldValue: old_value,
      newValue: new_value,
      resourceId,
      actorName,
      moduleName: module_name,
    });
  }

  // Fallbacks
  if (action && moduleKey) {
    const formattedAction = action.charAt(0).toUpperCase() + action.slice(1);
    return `${formattedAction} operation performed on ${module_name || "module"}.`;
  }

  return "Performed an update on the system module.";
};
