// Data layer: content source for the Admin System Activity & Audit Log page.
export function getBreadcrumb() {
  return {
    parent: "System Administration",
    current: "System Activity & Audit Logs",
    siemStatus: "SIEM STREAM: TLS 1.3 ACTIVE",
    ledgerHash: "LedgerHash: #0x8f4c...c29b",
  };
}

export function getOverviewHeader() {
  return {
    title: "System Activity & Audit Trail Logs",
    subtitle:
      "Capturing 100% of data mutations, IoT lock access events, rate adjustments, and intrusion alerts with immutable SHA-256 hashing per SOC 2 Type II standards.",
  };
}

export function getHeaderActions() {
  return [
    { id: "live", icon: "sensors", label: "Live Stream: Active" },
    { id: "verify", icon: "verified", label: "Verify SHA-256 Integrity" },
    { id: "export", icon: "download", label: "Export Log (.CSV/.JSON/Syslog)" },
  ];
}

export function getSectionTabs() {
  return [
    { id: "users", label: "User Management Table", count: "3,842", active: false },
    { id: "audit", label: "System-wide Audit Logs", badge: "Live Stream", active: true },
  ];
}

export function getKpis() {
  return [
    { id: "events", icon: "database", label: "Today's Events", value: "18,940", sub: "4.2 events/sec • 99.94% OK" },
    { id: "iot", icon: "lock", label: "IoT Smart Lock Actions", value: "342 orders", sub: "Lockouts: 18 • OTP Issued: 312 • BLE: 12" },
    { id: "waf", icon: "shield", label: "Security & WAF Alerts", value: "02 threats", sub: "Tor Exit Node & Bruteforce • IP auto-dropped", alert: true },
    { id: "hash", icon: "verified_user", label: "Cryptographic Hash Chain", value: "100% Valid", sub: "0 block errors • SHA-256 Validated" },
  ];
}

export function getFilterOptions() {
  return {
    timeRanges: [{ id: "today", label: "Today (Real-time)" }],
    categories: [
      { id: "all", label: "All Operational Categories" },
      { id: "storage", label: "Storage Management" },
      { id: "pricing", label: "Rate Configurations" },
      { id: "iot", label: "IoT Automation" },
      { id: "intrusion", label: "Intrusion Alerts" },
      { id: "hardware", label: "Hardware Controls" },
    ],
    statuses: [
      { id: "all", label: "All Response Statuses" },
      { id: "success", label: "Success" },
      { id: "blocked", label: "Blocked" },
    ],
    actors: [
      { id: "all", label: "All Actors / Initiators" },
      { id: "staff", label: "Internal Staff" },
      { id: "system", label: "Automated Daemon" },
      { id: "unknown", label: "Unknown / Suspicious" },
    ],
  };
}

export function getQuickFilters() {
  return [
    { id: "unit", label: "#B-204 (Metro)", value: "#B-204" },
    { id: "iot_force", label: "IoT Forced Lock", value: "forced" },
    { id: "blocked_ip", label: "Blocked IPs (2)", value: "block" },
    { id: "fee_q4", label: "Q4 Fee Adjustment", value: "fee" },
  ];
}

export function getAuditEvents() {
  return [
    {
      id: "evt-1",
      time: "14:32:15.820",
      date: "15/10/2023",
      actor: "Vu Phuong Thao",
      actorRole: "Hub #04 Manager",
      actorType: "staff",
      category: "storage",
      categoryLabel: "Storage Ops",
      action: "Assigned unit #B-204 to tenant Alex Morgan. Contract #CTR-2024-8890 • 12 months • Diamond Safe Insurance $50,000 USD.",
      ip: "192.168.4.11",
      device: "Hub #04 Kiosk",
      status: "success",
    },
    {
      id: "evt-2",
      time: "14:15:00.104",
      date: "15/10/2023",
      actor: "Nguyen Hoang Nam",
      actorRole: "Super Admin Root",
      actorType: "staff",
      category: "pricing",
      categoryLabel: "Rate Policy",
      action: "Increased late penalty 3% → 5% for Q4/2025. Per Board Resolution #VSP-RES-2025-09 • Applied across all 04 Hubs.",
      ip: "113.161.42.9",
      device: "HQ Executive Network",
      status: "success",
    },
    {
      id: "evt-3",
      time: "13:58:44.200",
      date: "15/10/2023",
      actor: "VaultAI Daemon",
      actorRole: "Automated Cron Daemon",
      actorType: "system",
      category: "iot",
      categoryLabel: "IoT Automation",
      action: "Forced electrical lock engagement on unit #D-112 due to 7 days overdue balance, auto-revoked tenant PIN credentials.",
      ip: "10.0.1.254",
      device: "Cloud Internal VPC",
      status: "success",
    },
    {
      id: "evt-4",
      time: "13:42:09.914",
      date: "15/10/2023",
      actor: "Unknown / Brute Force IP",
      actorRole: "Tor Exit Node Alert",
      actorType: "unknown",
      category: "intrusion",
      categoryLabel: "Intrusion Alert",
      action: "Failed login exceeded 5 attempts on API Gateway /auth/v2/admin-login. WAF rule #882 blocked IP for 24h, alerted SOC Telegram.",
      ip: "203.113.152.88",
      device: "Frankfurt DE (Tor Exit Node)",
      status: "blocked",
    },
    {
      id: "evt-5",
      time: "12:11:30.012",
      date: "15/10/2023",
      actor: "Tran Tuan Anh",
      actorRole: "Hub #01 Kiosk Tech",
      actorType: "staff",
      category: "hardware",
      categoryLabel: "Hardware Control",
      action: "Emergency dock override for Dock #02 at Hub #01 for fleet #TK-DISPATCH-990. Sensor verified departure after 18 mins.",
      ip: "192.168.1.55",
      device: "Hub #01 Subnet Control",
      status: "success",
    },
  ];
}

export function getAuditFootnote() {
  return "Showing 1-20 of 18,940 cryptographically logged events";
}

export function getComplianceCards() {
  return [
    { id: "syslog", icon: "cloud_sync", title: "Syslog SIEM Forwarder", detail: "UDP Port 514 • Splunk & Datadog Relay", status: "connected", statusLabel: "Connected" },
    { id: "certified", icon: "workspace_premium", title: "Security Standards Certification", detail: "SOC 2 Type II • ISO 27001", status: "audited", statusLabel: "Audited 2025" },
    { id: "worm", icon: "inventory_2", title: "WORM Storage Archive", detail: "10-year immutable archive on Cloud HSM", status: "locked", statusLabel: "Locked" },
  ];
}
