// Data layer: content source for the Admin Contracts & Customers CRM page.
export function getStatusBanner() {
  return { label: "Tenant Records & Asset Agreements", detail: "Branch Hub #04 Downtown Metro" };
}

export function getOverviewHeader() {
  return { title: "Contracts & Customer CRM" };
}

export function getHeaderActions() {
  return [
    { id: "debt_report", icon: "receipt_long", label: "Export Debt Report" },
    { id: "remind", icon: "campaign", label: "Send Batch Reminders (28)" },
    { id: "new_contract", icon: "add", label: "New Contract" },
  ];
}

export function getKpis() {
  return [
    { id: "active", icon: "verified_user", label: "Active Contracts", value: "415", trend: "+98.2%", sub: "Storage occupancy rate • 2024 cumulative" },
    { id: "expiring", icon: "event_upcoming", label: "Expiring (≤30 days)", value: "28", sub: "12 contracts within 7 days • Renewal required", alert: true },
    { id: "overdue", icon: "lock_clock", label: "Overdue Accounts", value: "08", sub: "Outstanding balance: 48,600,000 ₫ • 3 Latch locked", alert: true },
    { id: "new_sales", icon: "trending_up", label: "New Signings This Month", value: "+145.2M ₫", trend: "+22.4%", sub: "MoM increase • 19 new contracts" },
  ];
}

export function getFilterOptions() {
  return {
    audiences: [
      { id: "all", label: "All Customer Types" },
      { id: "b2b", label: "Business (B2B)" },
      { id: "b2c", label: "Individual (B2C)" },
    ],
    cycles: [
      { id: "all", label: "All Billing Cycles" },
      { id: "monthly", label: "Monthly" },
      { id: "quarterly", label: "Quarterly" },
      { id: "biannual", label: "Semi-Annual (6 mo)" },
      { id: "yearly", label: "Annual Prepaid (12 mo)" },
    ],
    validity: [
      { id: "all", label: "All Statuses" },
      { id: "active", label: "Active / Normal" },
      { id: "renewal", label: "Expiring Soon" },
      { id: "locked", label: "Locked / Delinquent" },
    ],
  };
}

export function getContractLegend() {
  return [
    { id: "active", label: "Active / Normal", color: "#2dd4a0" },
    { id: "renewal", label: "Expiring Soon", color: "#f5a524" },
    { id: "locked", label: "Locked / Delinquent", color: "#e5484d" },
  ];
}

export function getContracts() {
  return [
    {
      id: "#CTR-2024-8890",
      signMethod: "E-Signed • eKYC Verified",
      customer: "TechLogix Vietnam LLC",
      audience: "b2b",
      contact: "Vu Hai Dang • 0918.423.889",
      taxOrEmail: "Tax ID: 0314986231 • contact@techlogix.vn",
      unit: "Unit B-204",
      unitNote: "Floor 2 • 24/7 Climate • #LC-9902",
      term: "15/05/2023 → 14/05/2024",
      daysLeft: "4 days left",
      alertNote: "Renewal notice pending",
      cycle: "monthly",
      value: "16,500,000 ₫",
      totalValue: "33,000,000 ₫",
      cycleNote: "6-month billing cycle • Electronic VAT 10%",
      depositStatus: "Deposit Held",
      validity: "renewal",
    },
    {
      id: "#CTR-2024-8821",
      signMethod: "Notarized Office Agreement",
      customer: "An Lac Architecture JSC",
      audience: "b2b",
      contact: "Le Hoang Long • 0903.112.556",
      taxOrEmail: "Tax ID: 0108992144 • ketoan@anlacarch.com",
      unit: "Unit A-102",
      unitNote: "Ground Floor • Container Drive-up • #LC-1004",
      term: "01/01/2024 → 31/12/2024",
      daysLeft: "234 days left",
      alertNote: "2-year term commitment",
      cycle: "yearly",
      value: "24,000,000 ₫",
      totalValue: "48,000,000 ₫",
      cycleNote: "12-month prepaid • 10% discount applied",
      depositStatus: "Deposit Held",
      validity: "active",
    },
    {
      id: "#CTR-2024-7712",
      signMethod: "Smart App Digital Agreement",
      customer: "Nguyen Thao Ly",
      audience: "b2c",
      contact: "0986.761.320 • Personal Storage",
      taxOrEmail: "National ID: 079194002931 • thaoly.art@gmail.com",
      unit: "Unit D-118",
      unitNote: "Floor 1 • Dehumidified & LED sensor • #LC-4419",
      term: "20/11/2023 → 19/05/2024",
      daysLeft: "11 days left",
      alertNote: "SMS reminder sent",
      cycle: "monthly",
      value: "5,800,000 ₫",
      totalValue: "5,800,000 ₫",
      cycleNote: "Monthly cycle • Auto-debit via Napas",
      depositStatus: "Deposit Held",
      validity: "renewal",
    },
    {
      id: "#CTR-2024-6510",
      signMethod: "Corporate Master Lease",
      customer: "Nam Do Medical Devices & Pharma",
      audience: "b2b",
      contact: "Pharm. Tran Quoc Tuan • 0972.909.111",
      taxOrEmail: "Tax ID: 0300918872 • supply@namdopharma.vn",
      unit: "Cluster Units C-01 & C-02",
      unitNote: "GDP Certified • 18-22°C, Dual Smart Locks • #LC-3011, #LC-3012",
      term: "15/02/2024 → 14/02/2025",
      daysLeft: "279 days left",
      alertNote: "Periodic sensor calibration OK",
      cycle: "quarterly",
      value: "42,500,000 ₫",
      totalValue: "85,000,000 ₫",
      cycleNote: "Quarterly cycle • VietQR PRO transfer",
      depositStatus: "Deposit Held",
      validity: "active",
    },
    {
      id: "#CTR-2024-5109",
      signMethod: "Front Desk Walk-in Hub #04",
      customer: "Pham Thanh Dat",
      audience: "b2c",
      contact: "0933.456.789 • Relocation Holding",
      taxOrEmail: "National ID: 001085007421 • dat.pham@outlook.com",
      unit: "Unit B-108",
      unitNote: "Floor 1 • Standard Dry, Dedicated Camera • #LC-2198",
      term: "10/10/2023 → 09/10/2024",
      daysLeft: "151 days left",
      alertNote: "Extended once",
      cycle: "quarterly",
      value: "7,200,000 ₫",
      totalValue: "7,200,000 ₫",
      cycleNote: "Quarterly cycle • Initial invoice issued",
      depositStatus: "Deposit Held",
      validity: "locked",
    },
  ];
}

export function getContractFootnote() {
  return { totalDeposit: "Total Security Deposits in Escrow: 2,840,000,000 ₫" };
}

export function getEmergencyActions() {
  return [
    { id: "lockout", icon: "lock", label: "Forced Lockout (Latch Lockout)" },
    { id: "bulk_renew", icon: "autorenew", label: "Batch Renew B2B Contracts" },
    { id: "handover_report", icon: "description", label: "Handover & Deposit Refund Record" },
  ];
}

export function getIotStatusNote() {
  return "Online (100% IoT Locks Connected) • Port 8084";
}

export function getActivityLog() {
  return [
    {
      id: "log-1",
      type: "success",
      title: "Successfully extended #CTR-2023-4...",
      detail: "Unit A-109 • Tran Nhat Minh (+12 months)",
      time: "10 mins ago",
      actor: "Ops Tran Minh Hoang",
    },
    {
      id: "log-2",
      type: "failed",
      title: "Rejected contract activation #B-204",
      detail: "TechLogix Vietnam LLC • Past due 5 days",
      time: "42 mins ago",
      actor: "Automated System",
    },
  ];
}

export function getComplianceInfo() {
  return {
    badge: "Real Estate Law 2024",
    title: "eKYC & Digital Contract Archive",
    note: "100% of new contracts adhere to digital compliance standards, integrating VNPT-CA signatures and SHA-256 encryption.",
    tags: ["Digital CA", "IoT Verified"],
  };
}
