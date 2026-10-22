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
    ? "Quản trị viên (Admin)"
    : isManager
    ? "Quản lý cơ sở (Manager)"
    : "Vận hành hệ thống";

  const profile = {
    name: user?.fullName || user?.email?.split("@")[0] || "Quản trị viên",
    email: user?.email || "",
    role: roleLabel,
    roles: user?.roles || [],
    isAdmin,
    isManager,
  };

  const activeHub = facilityLoading
    ? "Đang tải kho..."
    : isAdmin
    ? "Hệ thống trung tâm"
    : activeFacility
    ? `${activeFacility.code} — ${activeFacility.name}`
    : "Toàn bộ hệ thống";

  const statusBanner = {
    label: isAdmin ? "System Active" : "Manager Console",
    detail: "TLS 1.3 • Trực tuyến",
  };

  // Nhóm chức năng Quản trị hệ thống (Dành riêng cho Admin)
  const adminGroupOperations = {
    id: "admin-operations",
    label: "Quản trị hệ thống (Admin)",
    badge: "SYS-ROOT",
    items: [
      { id: "admin-overview", label: "Dashboard Admin", icon: "dashboard", to: "/admin-overview" },
      { id: "admin-facilities", label: "Quản lý cơ sở kho", icon: "warehouse", to: "/admin-facilities" },
      { id: "admin-pricing", label: "Bảng giá & Chính sách", icon: "tune", to: "/admin-pricing" },
      { id: "admin-users", label: "Tài khoản & Phân quyền", icon: "manage_accounts", to: "/admin-users" },
      { id: "admin-audit-log", label: "Nhật ký kiểm toán", icon: "history", to: "/admin-audit-log" },
      { id: "admin-login-histories", label: "Lịch sử đăng nhập", icon: "login", to: "/admin-login-histories" },
    ],
  };

  // Nhóm chức năng Vận hành kho (Dành cho Manager và Admin)
  const managerGroupOperations = {
    id: "manager-operations",
    label: "Vận hành kho (Manager)",
    badge: "FACILITY",
    hideHeader: true,
    items: [
      { id: "manager-units", label: "Sơ đồ & Ô kho", icon: "grid_view", to: "/manager-units" },
      { id: "manager-transfer-requests", label: "Yêu cầu chuyển ô", icon: "swap_horiz", to: "/manager-transfer-requests" },
      { id: "manager-shifts", label: "Phân ca trực kho", icon: "badge", to: "/manager-shifts" },
      { id: "manager-tickets", label: "Sự cố & Ticket kho", icon: "support_agent", to: "/manager-tickets" },
      { id: "manager-move-outs", label: "Lịch trả kho & Kiểm tra", icon: "output", to: "/manager-move-outs" },
    ],
  };

  // Nhóm chức năng Tài chính & Hợp đồng cơ sở (Dành cho Manager và Admin)
  const managerGroupFinance = {
    id: "manager-finance",
    label: "Tài chính & Hợp đồng kho",
    badge: "OPERATIONS",
    items: [
      { id: "manager-charge-proposals", label: "Duyệt phụ phí phát sinh", icon: "receipt_long", to: "/manager-charge-proposals" },
      { id: "manager-refund-approvals", label: "Duyệt hoàn tiền", icon: "currency_exchange", to: "/manager-refund-approvals" },
      { id: "manager-agreements", label: "Hợp đồng thuê tại kho", icon: "assignment", to: "/manager-agreements" },
      { id: "manager-delinquent-cases", label: "Xử lý nợ quá hạn", icon: "report_problem", to: "/manager-delinquent-cases" },
      { id: "manager-pricing", label: "Bảng giá & Chính sách", icon: "tune", to: "/manager-pricing" },
    ],
  };

  // Xây dựng danh sách menu theo vai trò người dùng:
  // - Admin: Nhìn thấy cả chức năng Admin và chức năng Manager (phân nhóm rạch ròi).
  // - Manager: Chỉ nhìn thấy các chức năng vận hành cơ sở kho.
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
  const sidebarNetworkStatus = { label: "Hệ thống bảo mật", detail: "TLS 1.3 • AES-256" };

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
