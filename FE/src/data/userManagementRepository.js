// Data layer: content source for the Admin User Management (identity & RBAC) page.
export function getBreadcrumb() {
  return { parent: "System Administration", current: "User Management" };
}

export function getOverviewHeader() {
  return {
    title: "User Management & Role Permissions",
    subtitle: "Identity control, facility/branch RBAC permissions, 2FA/FIDO credentialing, and lifecycle management for 3,842 accounts.",
  };
}

export function getHeaderActions() {
  return [
    { id: "export", icon: "file_download", label: "Export Report" },
    { id: "import", icon: "upload_file", label: "Import Excel/CSV" },
    { id: "new_user", icon: "person_add", label: "Add New User" },
  ];
}

export function getSectionTabs() {
  return [
    { id: "users", label: "User Management Table", count: "3,842", badge: "Active", active: true },
    { id: "audit", label: "System-wide Audit Logs", active: false },
  ];
}

export function getKpis() {
  return [
    { id: "total", icon: "groups", label: "Total System Accounts", value: "3,842", trend: "+12 this week", sub: "3,420 B2B/B2C • 422 Staff" },
    { id: "active", icon: "check_circle", label: "Active Accounts", value: "3,795", trend: "98.8% SLA", sub: "SSO Okta authenticated" },
    { id: "twofa", icon: "verified_user", label: "2FA/FIDO2 Enforced", value: "3,680", trend: "95.7% compliant", sub: "FIDO2 / Hardware / ISO 27001" },
    { id: "suspended", icon: "lock", label: "Suspended / Locked", value: "47", sub: "31 overdue • 16 audit alert", alert: true },
  ];
}

export function getFilterOptions() {
  return {
    roles: [
      { id: "all", label: "All Roles (Root/OPS/Hub)" },
      { id: "root", label: "Super Admin Root" },
      { id: "hub_manager", label: "Hub Manager" },
      { id: "ops", label: "Operations Manager" },
      { id: "staff", label: "Front Desk Staff" },
      { id: "iot", label: "IoT Technician" },
      { id: "tenant", label: "B2B/B2C Customer" },
    ],
    facilities: [
      { id: "all", label: "All Facilities (Nationwide)" },
      { id: "hq", label: "Full Network (HQ & All Hubs)" },
      { id: "hub04", label: "Hub #04 Downtown Metro" },
      { id: "multi_south", label: "Southern Hub Cluster" },
      { id: "iot_multi", label: "Hubs 01, 02, 04" },
    ],
    statuses: [
      { id: "all", label: "All Statuses" },
      { id: "active", label: "Active" },
      { id: "pending_2fa", label: "Pending 2FA Setup" },
      { id: "locked", label: "Suspended (Audit)" },
    ],
    twoFactorMethods: [
      { id: "all", label: "All 2FA Security Methods" },
      { id: "yubikey", label: "YubiKey NFC" },
      { id: "touchid", label: "TouchID FIDO2" },
      { id: "vault_auth", label: "Vault Authenticator" },
      { id: "sms_otp", label: "SMS OTP" },
      { id: "fido2_suspended", label: "FIDO2 (Suspended)" },
    ],
  };
}

export function getUsers() {
  return [
    {
      id: "u1",
      code: "#ADM-001",
      name: "Minh Hoang",
      email: "minh.hoang@vaultspace.vn",
      phone: "0918.234.888",
      role: "root",
      roleLabel: "Super Admin Root",
      facility: "hq",
      facilityLabel: "Full Network (HQ & All Hubs)",
      facilityNote: "14 facility hubs • 12,400 active users",
      twoFactorMethod: "yubikey",
      twoFactorLabel: "YubiKey 5C",
      status: "active",
      statusLabel: "Active",
      lastLogin: "Today 14:40",
      device: "14.162.88.59 • macOS App",
    },
    {
      id: "u2",
      code: "#OPS-104",
      name: "Tran Thu Ha",
      email: "ha.tran@vaultspace.vn",
      phone: "0903.555.122",
      role: "hub_manager",
      roleLabel: "Hub Manager",
      facility: "hub04",
      facilityLabel: "Hub #04 Downtown Metro",
      facilityNote: "Zone B - 428 self-storage units",
      twoFactorMethod: "touchid",
      twoFactorLabel: "TouchID FIDO2",
      status: "active",
      statusLabel: "Active",
      lastLogin: "Today 14:15",
      device: "118.69.182.11 • Hub Kiosk",
    },
    {
      id: "u3",
      code: "#OPS-002",
      name: "Le Khac Nam",
      email: "nam.le@vaultspace.vn",
      phone: "0978.112.900",
      role: "ops",
      roleLabel: "Operations Manager",
      facility: "multi_south",
      facilityLabel: "Hub #04 & Hub #05 Tan Binh",
      facilityNote: "Southern Hub Cluster",
      twoFactorMethod: "vault_auth",
      twoFactorLabel: "Vault Authenticator",
      status: "active",
      statusLabel: "Active",
      lastLogin: "Today 13:50",
      device: "14.162.88.52 • Chrome HQ",
    },
    {
      id: "u4",
      code: "#STF-391",
      name: "Nguyen Phuong Thao",
      email: "thao.nguyen@vaultspace.vn",
      phone: "0933.789.444",
      role: "staff",
      roleLabel: "Front Desk Staff",
      facility: "hub04",
      facilityLabel: "Hub #04 Downtown Metro",
      facilityNote: "Ground Floor Service Desk",
      twoFactorMethod: "sms_otp",
      twoFactorLabel: "SMS OTP (Legacy)",
      status: "pending_2fa",
      statusLabel: "Pending 2FA",
      lastLogin: "Yesterday 17:02",
      device: "118.69.182.11 • POS Desk",
    },
    {
      id: "u5",
      code: "#TC-088",
      name: "Do Anh Dung",
      email: "dung.do@vaultspace.vn",
      phone: "0912.443.555",
      role: "iot",
      roleLabel: "IoT Lead Technician",
      facility: "iot_multi",
      facilityLabel: "Hubs 01, 02, 04",
      facilityNote: "Sensors & Mesh Gateway maintenance",
      twoFactorMethod: "vault_auth",
      twoFactorLabel: "Vault Authenticator",
      status: "active",
      statusLabel: "Active",
      lastLogin: "Today 11:20",
      device: "14.238.10.12 • Mobile App",
    },
    {
      id: "u6",
      code: "#TNT-892",
      name: "Asia Logistics (Rep: Vu Hung)",
      email: "contact@aslatransport.com",
      phone: "Tax ID: 0314892211",
      role: "tenant",
      roleLabel: "VIP Corporate Tenant",
      facility: "hub04",
      facilityLabel: "Hub #04 Downtown Metro",
      facilityNote: "Units D-14, D-15 (45m² Bay)",
      twoFactorMethod: "fido2_suspended",
      twoFactorLabel: "FIDO2 (Suspended)",
      status: "locked",
      statusLabel: "Locked (Audit)",
      lastLogin: "Yesterday 22:14",
      device: "183.98.21.99 • Failed OTP x5",
      flagged: true,
    },
  ];
}

export function getFootnote() {
  return "Showing 1-6 of 3,842 system accounts";
}

export function getSelectedUserDetail() {
  return {
    code: "#ADM-001",
    name: "Minh Hoang",
    roleLabel: "Super Admin Root",
    email: "minh.hoang@vaultspace.vn",
    facilityLabel: "Full Network HQ & All Hubs",
    permissionGroups: [
      {
        id: "storage",
        title: "Storage & IoT Smart Locks Control",
        tag: "Highest Tier",
        items: ["Remote unit unlocking via IoT Gateway", "Issue 24/7 facility access PINs", "Emergency Room Override (Emergency Lockout)"],
      },
      {
        id: "revenue",
        title: "Hub Revenue & Contract CRM",
        tag: "Full Control",
        items: ["View revenue and cash flow reports", "Sign B2B/B2C Digital Smart Contracts", "Approve custom discount rates & policies"],
      },
      {
        id: "security",
        title: "Security & Facility Configurations",
        tag: "Root Only",
        items: ["Provision FIDO2 YubiKey hardware tokens", "Revoke active login sessions & edit RBAC", "Access CCTV feeds & cryptographic Audit Trail"],
      },
    ],
  };
}

export function getComplianceFootnote() {
  return {
    left: "RBAC Authentication complies with ISO/IEC 27001:2022 • IAM Enforced by VaultSpace Root Engine",
    right: "Audit Token: 0x7E9A...9942B • Last Synchronized: 14:46:12",
  };
}
