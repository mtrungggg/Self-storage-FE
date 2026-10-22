/**
 * User roles and route helpers aligned with Backend RoleConstants
 */
export const USER_ROLES = {
  SYSTEM_ADMINISTRATOR: "system_administrator",
  BUSINESS_OPERATIONS_MANAGER: "business_operations_manager",
  FACILITY_MANAGER: "facility_manager",
  FACILITY_STAFF: "facility_staff",
  CUSTOMER: "storage_customer",
  // Kept only so persisted sessions created by older frontend versions continue to work.
  LEGACY_CUSTOMER: "customer",
  // Aliases for legacy compatibility
  ADMIN: "admin",
  SYSTEM_ADMIN: "system_admin",
  MANAGER: "manager",
  STAFF: "staff",
};

export const ADMIN_ROLES = [
  USER_ROLES.SYSTEM_ADMINISTRATOR,
  USER_ROLES.ADMIN,
  USER_ROLES.SYSTEM_ADMIN,
];

export const MANAGER_ROLES = [
  USER_ROLES.FACILITY_MANAGER,
  USER_ROLES.SYSTEM_ADMINISTRATOR,
  USER_ROLES.MANAGER,
];

export const STAFF_ROLES = [
  USER_ROLES.FACILITY_STAFF,
  USER_ROLES.STAFF,
];

export const CUSTOMER_ROLES = [
  USER_ROLES.CUSTOMER,
  USER_ROLES.LEGACY_CUSTOMER,
];

export function hasAnyRole(userRoles = [], targetRoles = []) {
  return userRoles.some((role) => targetRoles.includes(role.toLowerCase()));
}

export function getDefaultRouteForUser(user) {
  const roles = (user?.roles || []).map((r) => r.toLowerCase());
  if (hasAnyRole(roles, ADMIN_ROLES)) return "/admin-overview";
  if (hasAnyRole(roles, MANAGER_ROLES)) return "/manager-units";
  if (hasAnyRole(roles, STAFF_ROLES)) return "/staff-dashboard";
  return "/home";
}
