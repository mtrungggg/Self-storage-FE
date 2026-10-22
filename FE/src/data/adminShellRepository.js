// Data layer: shared chrome definitions for Admin console.
export function getAdminProfile() {
  return { name: "Quản trị viên", role: "Quản trị hệ thống (Admin)" };
}

export function getActiveHub() {
  return "Hệ thống trung tâm";
}

export function getSystemStatusBanner() {
  return { label: "Hệ thống trực tuyến", detail: "TLS 1.3 • Trực tuyến" };
}

export function getSidebarNav() {
  return [
    {
      id: "operations",
      label: "Quản trị hệ thống (Admin)",
      items: [
        { id: "overview", label: "Dashboard Admin", icon: "dashboard", to: "/admin-overview" },
        { id: "facilities", label: "Quản lý cơ sở kho", icon: "warehouse", to: "/admin-facilities" },
        { id: "pricing", label: "Bảng giá & Chính sách", icon: "tune", to: "/admin-pricing" },
        { id: "users", label: "Tài khoản & Phân quyền", icon: "manage_accounts", to: "/admin-users" },
        { id: "audit_log", label: "Nhật ký kiểm toán", icon: "history", to: "/admin-audit-log" },
        { id: "login_histories", label: "Lịch sử đăng nhập", icon: "login", to: "/admin-login-histories" },
      ],
    },
  ];
}

export function getSidebarSectionBadge() {
  return { label: "Admin Console", tag: "SYS-ROOT" };
}

export function getSidebarFooter() {
  return { version: "v2.0-UNIFIED" };
}

export function getSidebarNetworkStatus() {
  return { label: "Hệ thống kết nối", detail: "Bình thường" };
}
