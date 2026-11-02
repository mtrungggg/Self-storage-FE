import { useAuth } from "../context/AuthContext";
import { useManagerFacility } from "../context/ManagerFacilityContext";
import { ADMIN_ROLES, MANAGER_ROLES, hasAnyRole } from "../constants/roles";

/**
 * Hook thống nhất shell dữ liệu cho giao diện Quản trị (Admin & Manager).
 * - Tự động nhận diện quyền của người dùng (Admin / Manager).
 * - Phân chia rõ ràng 2 khối: "Quản trị hệ thống (Admin)" và "Vận hành cơ sở kho (Manager)".
 * - Tách riêng Dashboard Admin (/admin-overview) và Dashboard Manager (/manager-dashboard).
 * - Cập nhật số lượng thông báo (badge) cho các mục cần duyệt (như Transfers).
 */
export function useManagementShell() {
  const { user, logout } = useAuth();
  const { activeFacility, loading: facilityLoading, pendingTransferCount, pendingTransfers } = useManagerFacility();

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
      { id: "admin-users", label: "Users & Permissions", icon: "manage_accounts", to: "/admin-users" },
      { id: "admin-audit-log", label: "Audit & Logs", icon: "history", to: "/admin-audit-log" },
      { id: "admin-pricing", label: "Bảng giá & Biểu phí", icon: "payments", to: "/manager-pricing" },
    ],
  };

  // Manager Facility Operations Group
  const managerGroupOperations = {
    id: "manager-operations",
    label: "OPERATIONS",
    badge: "FACILITY",
    items: [
      { id: "manager-dashboard", label: "Dashboard", to: "/manager-dashboard" },
      { id: "manager-units", label: "Units & Layout", to: "/manager-units" },
      {
        id: "manager-transfer-requests",
        label: "Transfers",
        to: "/manager-transfer-requests",
        badge: pendingTransferCount > 0 ? pendingTransferCount : undefined,
      },
      { id: "manager-shifts", label: "Shifts", to: "/manager-shifts" },
      { id: "manager-tickets", label: "Tickets", to: "/manager-tickets" },
      { id: "manager-expiring-contracts", label: "Hết hạn & Trả kho", to: "/manager-expiring-contracts" },
      { id: "manager-users", label: "Staff & Customers", to: "/manager-users" },
    ],
  };

  // Manager Finance Group
  const managerGroupFinance = {
    id: "manager-finance",
    label: "FINANCE",
    badge: "OPERATIONS",
    items: [
      { id: "manager-charge-proposals", label: "Fee Approvals", to: "/manager-charge-proposals" },
      { id: "manager-refund-approvals", label: "Refund Approvals", to: "/manager-refund-approvals" },
      { id: "manager-agreements", label: "Agreements", to: "/manager-agreements" },
      { id: "manager-delinquent-cases", label: "Overdue", to: "/manager-delinquent-cases" },
      { id: "manager-pricing", label: "Biểu giá (Chỉ xem)", to: "/manager-pricing" },
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

export default useManagementShell;
