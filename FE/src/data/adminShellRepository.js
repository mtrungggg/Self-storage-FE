// Data layer: shared chrome definitions for Admin console.
export function getAdminProfile() {
  return { name: "Administrator", role: "System Administrator (Admin)" };
}

export function getActiveHub() {
  return "Central System";
}

export function getSystemStatusBanner() {
  return { label: "System Online", detail: "TLS 1.3 • Operational" };
}

export function getSidebarNav() {
  return [
    {
      id: "operations",
      label: "System Administration (Admin)",
      items: [
        { id: "overview", label: "Admin Dashboard", icon: "dashboard", to: "/admin-overview" },
        { id: "facilities", label: "Facilities Management", icon: "warehouse", to: "/admin-facilities" },
        { id: "pricing", label: "Pricing & Policies", icon: "tune", to: "/admin-pricing" },
        { id: "users", label: "Users & Permissions", icon: "manage_accounts", to: "/admin-users" },
        { id: "audit_log", label: "Audit Logs", icon: "history", to: "/admin-audit-log" },
        { id: "login_histories", label: "Login History", icon: "login", to: "/admin-login-histories" },
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
  return { label: "Network Security", detail: "Online • Normal" };
}
