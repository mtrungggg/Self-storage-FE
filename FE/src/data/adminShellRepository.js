// Data layer: shared chrome (sidebar + topbar) content for all Admin console pages.
export function getAdminProfile() {
  return { name: "Minh Hoang", role: "Operations Director" };
}

export function getActiveHub() {
  return "Hub #04 Downtown Metro";
}

export function getSystemStatusBanner() {
  return { label: "System Operational", detail: "Synced • 2 mins ago" };
}

export function getSidebarNav() {
  return [
    {
      id: "operations",
      label: "Quản lý & Vận hành",
      items: [
        { id: "overview", label: "Dashboard", icon: "dashboard", to: "/admin-overview" },
        { id: "facilities", label: "Quản lý kho", icon: "warehouse", to: "/admin-facilities" },
        { id: "pricing", label: "Bảng giá & Chính sách", icon: "tune", to: "/admin-pricing" },
      ],
    },
    {
      id: "system",
      label: "Hệ thống & Tài khoản",
      items: [
        { id: "users", label: "Người dùng (Manager & Staff)", icon: "manage_accounts", to: "/admin-users" },
        { id: "login_histories", label: "Lịch sử đăng nhập", icon: "login", to: "/admin-login-histories" },
        { id: "audit_log", label: "Nhật ký kiểm toán", icon: "history", to: "/admin-audit-log" },
      ],
    },
  ];
}

export function getSidebarSectionBadge() {
  return { label: "Admin Console", tag: "Online" };
}

export function getSidebarFooter() {
  return { version: "v1.0" };
}

export function getSidebarNetworkStatus() {
  return { label: "Hệ thống kết nối", detail: "Bình thường" };
}
