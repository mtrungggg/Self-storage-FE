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
      label: "Operations & Management",
      items: [
        { id: "overview", label: "Dashboard", icon: "dashboard", to: "/admin-overview" },
        { id: "facilities", label: "Quản lý kho", icon: "warehouse", to: "/admin-facilities" },
        { id: "tickets", label: "Quản lý ticket", icon: "support_agent", to: "/admin-tickets" },
        { id: "notifications", label: "Gửi thông báo", icon: "notifications_active", to: "/admin-notifications" },
        { id: "contracts", label: "Contracts & Customers", icon: "description", to: "/admin-contracts" },
        { id: "staffing", label: "Staff Scheduling & Shifts", icon: "groups", to: "/admin-staffing" },
      ],
    },
    {
      id: "system",
      label: "System & Configuration",
      items: [
        { id: "pricing", label: "Pricing & Policies", icon: "tune", to: "/admin-pricing" },
        { id: "security", label: "Access & Security", icon: "admin_panel_settings", to: "/admin-system" },
        { id: "users", label: "Manager & Staff", icon: "manage_accounts", to: "/admin-users" },
        { id: "audit_log", label: "Activity & Audit Log", icon: "history", to: "/admin-audit-log" },
      ],
    },
  ];
}

export function getSidebarSectionBadge() {
  return { label: "Admin Console", tag: "SYS-ROOT" };
}

export function getSidebarFooter() {
  return { version: "v4.8.2-PRO" };
}

export function getSidebarNetworkStatus() {
  return { label: "Encrypted Facility Net", detail: "TLS 1.3 • AES-256" };
}
