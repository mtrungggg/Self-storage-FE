// Data layer: shared chrome (sidebar + topbar) content for all Manager console pages.
export function getManagerProfile() {
  return { name: "Pham Thu Manager", role: "Facility Manager", email: "manager.hcm@example.test" };
}

export function getActiveHub() {
  return "Thu Duc & Cau Giay Hubs";
}

export function getSidebarNav() {
  return [
    {
      id: "operations",
      label: "Manager & Vận hành",
      items: [
        { id: "overview", label: "Doanh thu & Báo cáo", icon: "payments", to: "/manager-overview" },
        { id: "facilities", label: "Kho (Cơ sở & Ô kho)", icon: "warehouse", to: "/manager-facilities" },
        { id: "tickets", label: "Ticket Hỗ trợ", icon: "confirmation_number", to: "/manager-tickets" },
        { id: "staffing", label: "Phân công Lịch Staff", icon: "calendar_month", to: "/manager-staffing" },
        { id: "contracts", label: "Contracts & Customers", icon: "description", to: "/manager-contracts" },
      ],
    },
    {
      id: "system",
      label: "System & Configuration",
      items: [
        { id: "pricing", label: "Pricing & Policies", icon: "tune", to: "/manager-pricing" },
        { id: "security", label: "Access & Security", icon: "admin_panel_settings", to: "/manager-system" },
        { id: "users", label: "User Management", icon: "manage_accounts", to: "/manager-users" },
        { id: "audit_log", label: "Activity & Audit Log", icon: "history", to: "/manager-audit-log" },
      ],
    },
  ];
}

export function getSidebarSectionBadge() {
  return { label: "Manager Console", tag: "Online" };
}
