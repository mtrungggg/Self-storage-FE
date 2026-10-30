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

export const CAPABILITIES = Object.freeze({
  SHIFT_VIEW: "shift:view",
  HANDOVER_CHECK: "handover:check",
  QR_VERIFY: "qr:verify",
  QR_CONFIRM: "qr:confirm",
  UNIT_LIST: "unit:list",
  UNIT_VIEW: "unit:view",
  UNIT_UPDATE_STATUS: "unit:update_status",
  UNIT_LOCK: "unit:lock",
  TICKET_LIST: "ticket:list",
  TICKET_ASSIGN: "ticket:assign",
  TICKET_PROPOSE_CHARGE: "ticket:propose_charge",
  TICKET_COMPLETE: "ticket:complete",
  CATALOG_VIEW: "catalog:view",
  RESERVATION_CREATE: "reservation:create",
  AGREEMENT_VIEW: "agreement:view",
  UNIT_ACCESS: "unit:access",
  UNIT_TRANSFER: "unit:transfer",
  UNIT_MOVE_OUT: "unit:move_out",
  INVOICE_VIEW: "invoice:view",
  PAYMENT_CREATE: "payment:create",
  SUPPORT_TICKET: "support:ticket",
  FACILITY_DASHBOARD: "facility:dashboard",
  FACILITY_RENTALS: "facility:rentals",
  FACILITY_UNITS: "facility:units",
  FACILITY_STAFF_TASKS: "facility:staff_tasks",
  FACILITY_REFUND_APPROVALS: "facility:refund_approvals",
  FACILITY_CHARGE_PROPOSALS: "facility:charge_proposals",
  FACILITY_DEBTS: "facility:debts",
  USERS_MANAGE: "users:manage",
  FACILITIES_MANAGE: "facilities:manage",
  STAFF_ASSIGNMENT_MANAGE: "staff_assignment:manage",
  PRICING_POLICY_MANAGE: "pricing_policy:manage",
});

export function hasCapability(user, capability) {
  if (!user) return false;
  const permissions = (user?.permissions || []).map((p) => String(p).toLowerCase());
  if (permissions.includes("*") || permissions.includes(capability.toLowerCase())) {
    return true;
  }
  const roles = (user?.roles || []).map((r) => String(r).toLowerCase());
  if (hasAnyRole(roles, ADMIN_ROLES)) return true;
  if (capability === CAPABILITIES.SHIFT_VIEW && (hasAnyRole(roles, STAFF_ROLES) || hasAnyRole(roles, MANAGER_ROLES))) {
    return true;
  }
  return false;
}
