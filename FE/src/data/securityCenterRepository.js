// Data layer: content source for the Admin Security Center (RBAC & IoT policy) page.
export function getSecurityBanner() {
  return { label: "VaultShield Security & Access Control Center", version: "Release #SEC-9082" };
}

export function getOverviewHeader() {
  return {
    title: "Access Permissions & Operational Security",
    subtitle: "Manage access privileges, control IoT smart locks, and monitor real-time security events.",
  };
}

export function getHeaderActions() {
  return [
    { id: "custom_role", icon: "add_moderator", label: "Create Custom Role" },
    { id: "new_user", icon: "person_add", label: "Add New User" },
  ];
}

export function getKpis() {
  return [
    { id: "encryption", icon: "lock", label: "Kiosk Lock Encryption", value: "AES-256 GCM", sub: "Active continuous protection • 100% Online" },
    { id: "iot", icon: "sensors", label: "IoT Cluster Security Rate", value: "99.98%", sub: "4,812 / 4,813 nodes active" },
    { id: "accounts", icon: "badge", label: "Authorized Staff Accounts", value: "24", sub: "6 permission tiers" },
    { id: "zeroday", icon: "verified_user", label: "Zero-Day Vulnerabilities", value: "0", sub: "Full vulnerability scan 04:00 today • Secure" },
  ];
}

export function getPermissionMatrixRoles() {
  return [
    { id: "ops_director", label: "Ops Director" },
    { id: "facility_manager", label: "Facility Manager" },
    { id: "receptionist", label: "Receptionist" },
    { id: "ktv", label: "Lead Technician" },
    { id: "cctv", label: "CCTV Operator" },
  ];
}

export function getPermissionMatrixModules() {
  return [
    {
      id: "finance",
      label: "Revenue Reports & B2B Financials",
      note: "Cashflow metrics, invoicing, accounts receivable",
      access: { ops_director: "View/Export/Full Control", facility_manager: "Hub-level View", receptionist: null, ktv: null, cctv: null },
    },
    {
      id: "pricing",
      label: "Pricing Matrix & Promo Policies",
      note: "Unit rates, climate control surcharges",
      access: { ops_director: "View/Edit/Approve", facility_manager: "Propose Changes", receptionist: null, ktv: null, cctv: null },
    },
    {
      id: "unlock",
      label: "Remote IoT Unit Unlock Dispatch",
      note: "Emergency override, main perimeter gate open",
      access: { ops_director: "Facility Master Unlock", facility_manager: "Hub-level Unlock", receptionist: null, ktv: "Requires 2-Factor OTP", cctv: null },
    },
    {
      id: "contracts_pii",
      label: "Export Contract & Customer PII Data",
      note: "PII records, ingress logs, scanned agreements",
      access: { ops_director: "View/Export/Purge", facility_manager: "View/Digital Sign", receptionist: "Read-only Profile", ktv: null, cctv: null },
    },
  ];
}

export function getOtpTtlOptions() {
  return [
    { id: "15m", label: "15 Mins" },
    { id: "60m", label: "60 Mins (Default)" },
    { id: "24h", label: "24 Hours" },
  ];
}

export function getGuestPinPolicyDefaults() {
  return { otpTtl: "60m", autoRevokeOnCheckout: true, limitUnlocksPerShift: true };
}

export function getIntrusionPolicyDefaults() {
  return { maxFailedPinAttempts: "5", sirenEnabled: true, notifyAuthoritiesEnabled: true };
}
