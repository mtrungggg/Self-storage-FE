/**
 * User roles and route helpers aligned with Backend RoleConstants
 */
export const USER_ROLES = {
  SYSTEM_ADMINISTRATOR: "system_administrator",
  BUSINESS_OPERATIONS_MANAGER: "business_operations_manager",
  FACILITY_MANAGER: "facility_manager",
  FACILITY_STAFF: "facility_staff",
  CUSTOMER: "customer",
  // Aliases for legacy compatibility
  ADMIN: "admin",
  SYSTEM_ADMIN: "system_admin",
  MANAGER: "manager",
  STAFF: "staff",
};

export const ADMIN_ROLES = [
  USER_ROLES.SYSTEM_ADMINISTRATOR,
  USER_ROLES.BUSINESS_OPERATIONS_MANAGER,
  USER_ROLES.ADMIN,
  USER_ROLES.SYSTEM_ADMIN,
];

export const MANAGER_ROLES = [
  USER_ROLES.FACILITY_MANAGER,
  USER_ROLES.MANAGER,
];

export const STAFF_ROLES = [
  USER_ROLES.FACILITY_STAFF,
  USER_ROLES.STAFF,
];

export function hasAnyRole(userRoles = [], targetRoles = []) {
  return userRoles.some((role) => targetRoles.includes(role.toLowerCase()));
}

export function getDefaultRouteForUser(user) {
  const roles = (user?.roles || []).map((r) => r.toLowerCase());
  if (hasAnyRole(roles, ADMIN_ROLES)) return "/admin-overview";
  if (hasAnyRole(roles, MANAGER_ROLES)) return "/manager-dashboard";
  if (hasAnyRole(roles, STAFF_ROLES)) return "/staff-dashboard";
  return "/home";
}
