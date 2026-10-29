/**
 * User roles and route helpers aligned with Backend RoleConstants
 */
export const USER_ROLES = Object.freeze({
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
});

export const ROLE_OPTIONS = Object.freeze([
  [USER_ROLES.CUSTOMER, "Customer"],
  [USER_ROLES.FACILITY_STAFF, "Facility Staff"],
  [USER_ROLES.FACILITY_MANAGER, "Facility Manager"],
  [USER_ROLES.BUSINESS_OPERATIONS_MANAGER, "Operations Manager"],
  [USER_ROLES.SYSTEM_ADMINISTRATOR, "System Administrator"],
]);

export const USER_STATUS = Object.freeze({
  ACTIVE: "active",
  DISABLED: "disabled",
  LOCKED: "locked",
});

export const USER_STATUS_OPTIONS = Object.freeze([
  [USER_STATUS.ACTIVE, "Active"],
  [USER_STATUS.DISABLED, "Disabled"],
  [USER_STATUS.LOCKED, "Locked"],
]);

export const ADMIN_ROLES = Object.freeze([
  USER_ROLES.SYSTEM_ADMINISTRATOR,
  USER_ROLES.ADMIN,
  USER_ROLES.SYSTEM_ADMIN,
]);

export const MANAGER_ROLES = Object.freeze([
  USER_ROLES.FACILITY_MANAGER,
  USER_ROLES.BUSINESS_OPERATIONS_MANAGER,
  USER_ROLES.SYSTEM_ADMINISTRATOR,
  USER_ROLES.MANAGER,
  USER_ROLES.ADMIN,
]);

export const STAFF_ROLES = Object.freeze([
  USER_ROLES.FACILITY_STAFF,
  USER_ROLES.STAFF,
]);

export const CUSTOMER_ROLES = Object.freeze([
  USER_ROLES.CUSTOMER,
  USER_ROLES.LEGACY_CUSTOMER,
]);

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
