import { useAuth } from "../context/AuthContext";
import { useManagerFacility } from "../context/ManagerFacilityContext";
import { useLanguage } from "../context/LanguageContext";
import { ADMIN_ROLES, MANAGER_ROLES, hasAnyRole } from "../constants/roles";

/**
 * Hook thống nhất shell dữ liệu cho giao diện Quản trị (Admin & Manager).
 * - Hỗ trợ đa ngôn ngữ (VIE & ENG) đồng bộ tự động.
 * - Tự động nhận diện quyền của người dùng (Admin / Manager).
 * - Cập nhật số lượng thông báo (badge) cho các mục cần duyệt.
 */
export function useManagementShell() {
  const { user, logout } = useAuth();
  const { activeFacility, loading: facilityLoading, pendingTransferCount, pendingTransfers } = useManagerFacility();
  const { t } = useLanguage();

  const userRoles = (user?.roles || []).map((r) => r.toLowerCase());
  const isAdmin = hasAnyRole(userRoles, ADMIN_ROLES);
  const isManager = hasAnyRole(userRoles, MANAGER_ROLES);

  const roleLabel = isAdmin
    ? t("nav.system_admin_group", "System Administrator (Admin)")
    : isManager
    ? t("nav.manager_ops", "Facility Manager")
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
    ? t("common.loading", "Loading facility...")
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
    label: t("nav.system_admin_group", "System Administration (Admin)"),
    badge: "SYS-ROOT",
    items: [
      { id: "admin-overview", label: t("nav.admin_dashboard", "Admin Dashboard"), icon: "dashboard", to: "/admin-overview" },
      { id: "admin-facilities", label: t("nav.facilities", "Facilities Management"), icon: "warehouse", to: "/admin-facilities" },
      { id: "admin-users", label: t("nav.users_permissions", "Users & Permissions"), icon: "manage_accounts", to: "/admin-users" },
      { id: "admin-audit-log", label: t("nav.audit_logs", "Audit & Logs"), icon: "history", to: "/admin-audit-log" },
      { id: "admin-pricing", label: t("nav.pricing", "Pricing Table"), icon: "payments", to: "/admin-pricing" },
    ],
  };

  // Manager Facility Operations Group
  const managerGroupOperations = {
    id: "manager-operations",
    label: t("nav.operations_group", "OPERATIONS"),
    badge: "FACILITY",
    items: [
      { id: "manager-dashboard", label: t("nav.dashboard", "Dashboard"), to: "/manager-dashboard" },
      { id: "manager-units", label: t("nav.units_layout", "Units & Layout"), to: "/manager-units" },
      {
        id: "manager-transfer-requests",
        label: t("nav.transfers", "Transfers"),
        to: "/manager-transfer-requests",
        badge: pendingTransferCount > 0 ? pendingTransferCount : undefined,
      },
      { id: "manager-shifts", label: t("nav.shifts", "Shifts"), to: "/manager-shifts" },
      { id: "manager-tickets", label: t("nav.tickets", "Tickets"), to: "/manager-tickets" },
      { id: "manager-expiring-contracts", label: t("nav.expiring_moveout", "Expiring & Move-out"), to: "/manager-expiring-contracts" },
      { id: "manager-users", label: t("nav.staff_customers", "Staff & Customers"), to: "/manager-users" },
    ],
  };

  // Manager Finance Group
  const managerGroupFinance = {
    id: "manager-finance",
    label: t("nav.finance_group", "FINANCE"),
    badge: "OPERATIONS",
    items: [
      { id: "manager-charge-proposals", label: t("nav.fee_approvals", "Fee Approvals"), to: "/manager-charge-proposals" },
      { id: "manager-refund-approvals", label: t("nav.refund_approvals", "Refund Approvals"), to: "/manager-refund-approvals" },
      { id: "manager-agreements", label: t("nav.agreements", "Agreements"), to: "/manager-agreements" },
      { id: "manager-delinquent-cases", label: t("nav.overdue", "Overdue"), to: "/manager-delinquent-cases" },
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
    pendingTransferCount,
    pendingTransfers,
  };
}
