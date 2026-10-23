import { useAuth } from "../context/AuthContext";
import { useManagerFacility } from "../context/ManagerFacilityContext";
import { ADMIN_ROLES, MANAGER_ROLES, hasAnyRole } from "../constants/roles";

/**
 * Hook thống nhất shell dữ liệu cho giao diện Quản trị (Admin & Manager).
 * - Tự động nhận diện quyền của người dùng (Admin / Manager).
 * - Phân chia rõ ràng 2 khối: "Quản trị hệ thống (Admin)" và "Vận hành cơ sở kho (Manager)".
 * - Tách riêng Dashboard Admin (/admin-overview) và Dashboard Manager (/manager-dashboard).
 */
export function useManagementShell() {
  const { user, logout } = useAuth();
  const { activeFacility, loading: facilityLoading } = useManagerFacility();

  const userRoles = (user?.roles || []).map((r) => r.toLowerCase());
  const isAdmin = hasAnyRole(userRoles, ADMIN_ROLES);
  const isManager = hasAnyRole(userRoles, MANAGER_ROLES);

  const roleLabel = isAdmin
    ? "System Administrator (Admin)"
    : isManager
    ? "Facility Manager"
    : "System Operations";

  const profile = {
    name: user?.fullName || user?.email?.split("@")[0] || "Administrator",
    email: user?.email || "",
    role: roleLabel,
    roles: user?.roles || [],
    isAdmin,
    isManager,
  };

  const activeHub = facilityLoading
    ? "Loading facility..."
    : isAdmin
    ? "Central System"
    : activeFacility
    ? `${activeFacility.code} — ${activeFacility.name}`
    : "All Facilities";

  const statusBanner = {
    label: isAdmin ? "System Active" : "Manager Console",
    detail: "TLS 1.3 • Online",
  };

  // Admin System Governance Group
  const adminGroupOperations = {
    id: "admin-operations",
    label: "System Administration (Admin)",
    badge: "SYS-ROOT",
    items: [
      { id: "admin-overview", label: "Admin Dashboard", icon: "dashboard", to: "/admin-overview" },
      { id: "admin-facilities", label: "Facilities Management", icon: "warehouse", to: "/admin-facilities" },
      { id: "admin-pricing", label: "Pricing & Policies", icon: "tune", to: "/admin-pricing" },
      { id: "admin-users", label: "Users & Permissions", icon: "manage_accounts", to: "/admin-users" },
      { id: "admin-audit-log", label: "Audit Logs", icon: "history", to: "/admin-audit-log" },
      { id: "admin-login-histories", label: "Login History", icon: "login", to: "/admin-login-histories" },
    ],
  };

  // Manager Facility Operations Group
  const managerGroupOperations = {
    id: "manager-operations",
    label: "Facility Operations (Manager)",
    badge: "FACILITY",
    hideHeader: true,
    items: [
      { id: "manager-units", label: "Units & Layout", icon: "grid_view", to: "/manager-units" },
      { id: "manager-transfer-requests", label: "Unit Transfer Requests", icon: "swap_horiz", to: "/manager-transfer-requests" },
      { id: "manager-move-outs", label: "Move-Out Schedule & Inspection", icon: "output", to: "/manager-move-outs" },
    ],
  };

  // Manager Finance Group
  const managerGroupFinance = {
    id: "manager-finance",
    label: "Finance & Contracts",
    badge: "OPERATIONS",
    items: [
      { id: "manager-charge-proposals", label: "Ancillary Fee Approvals", icon: "receipt_long", to: "/manager-charge-proposals" },
      { id: "manager-refund-approvals", label: "Refund Approvals", icon: "currency_exchange", to: "/manager-refund-approvals" },
      { id: "manager-agreements", label: "Rental Agreements", icon: "assignment", to: "/manager-agreements" },
      { id: "manager-delinquent-cases", label: "Overdue & Delinquency", icon: "report_problem", to: "/manager-delinquent-cases" },
      { id: "manager-pricing", label: "Pricing & Policies", icon: "tune", to: "/manager-pricing" },
    ],
  };

  let sidebarNav = [];
  if (isAdmin) {
    sidebarNav = [adminGroupOperations];
  } else {
    sidebarNav = [managerGroupOperations, managerGroupFinance];
  }

  const sidebarFooter = { version: "v2.0-UNIFIED" };
  const sidebarSectionBadge = isAdmin
    ? { label: "Admin Console", tag: "SYS-ROOT" }
    : { label: "Manager Console", tag: "FACILITY" };
  const sidebarNetworkStatus = { label: "System Security", detail: "TLS 1.3 • AES-256" };

  return {
    user,
    logout,
    isAdmin,
    isManager,
    profile,
    activeHub,
    statusBanner,
    sidebarNav,
    sidebarFooter,
    sidebarSectionBadge,
    sidebarNetworkStatus,
  };
}

export default useManagementShell;
