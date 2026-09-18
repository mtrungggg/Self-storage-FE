// Data layer: shared chrome (sidebar + topbar) content for all Admin console pages.
export function getAdminProfile() {
  return { name: "Minh Hoàng", role: "Quản trị Vận hành (Ops Director)" };
}

export function getActiveHub() {
  return "Hub #04 Downtown Metro";
}

export function getSystemStatusBanner() {
  return { label: "Hệ thống bình thường", detail: "Đang đồng bộ • 2 phút trước" };
}

export function getSidebarNav() {
  return [
    {
      id: "operations",
      label: "Điều hành & Khai thác",
      items: [
        { id: "overview", label: "Tổng quan & Báo cáo", icon: "dashboard", to: "/admin-overview" },
        { id: "facilities", label: "Quản lý Cơ sở & Kho", icon: "warehouse", to: "/admin-facilities" },
        { id: "contracts", label: "Hợp đồng & Khách hàng", icon: "description", to: "/admin-contracts" },
        { id: "staffing", label: "Phân công Nhân sự & Ca trực", icon: "groups", to: "/admin-staffing" },
      ],
    },
    {
      id: "system",
      label: "Hệ thống & Cấu hình",
      items: [
        { id: "pricing", label: "Cấu hình Giá & Chính sách", icon: "tune", to: "/admin-pricing" },
        { id: "security", label: "Phân quyền & Bảo mật", icon: "admin_panel_settings", to: "/admin-system" },
        { id: "users", label: "Quản lý Người dùng", icon: "manage_accounts", to: "/admin-users" },
        { id: "audit_log", label: "Lịch sử Hoạt động & Audit Log", icon: "history", to: "/admin-audit-log" },
      ],
    },
  ];
}

export function getSidebarSectionBadge() {
  return { label: "Phân hệ Quản trị", tag: "SYS-ROOT" };
}


export function getSidebarFooter() {
  return { version: "v4.8.2-PRO" };
}

export function getSidebarNetworkStatus() {
  return { label: "Encrypted Facility Net", detail: "TLS 1.3 • AES-256" };
}
