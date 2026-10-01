// Data layer: content source for the Admin Operations & Revenue Overview page.
export function getLiveBanner() {
  return { label: "LIVE CENTRAL OPERATIONS", detail: "Updated 15 seconds ago" };
}

export function getOverviewHeader() {
  return {
    title: "Facility Operations & Revenue Overview",
    subtitle: "Real-time reports across VaultSpace chain • Hub #04 Downtown Metro & network-wide",
  };
}

export function getOverviewActions() {
  return [
    { id: "sync", icon: "sync", label: "Sync Market Rates" },
    { id: "export", icon: "file_download", label: "Export Report (Excel/PDF)" },
    { id: "add", icon: "add", label: "Add Unit / Facility" },
  ];
}

export function getKpis() {
  return [
    { id: "total", icon: "warehouse", label: "Total Managed Units", value: "480", trend: "+12 units", sub: "120 units at Hub #04 active" },
    { id: "occupancy", icon: "pie_chart", label: "Occupancy Rate", value: "86.4%", trend: "+4.2%", sub: "415 rented • 45 vacant • 20 reserved" },
    { id: "mrr", icon: "payments", label: "Monthly Recurring Revenue (MRR)", value: "1.845B ₫", trend: "+12.8% YoY", sub: "ARPU 3,850,000 ₫/contract" },
    { id: "overdue", icon: "lock_clock", label: "Overdue & Locked Units", value: "8 units", trend: "Action required", sub: "48,200,000 ₫ • 2 Latch locked" },
  ];
}

export function getRevenueTrend() {
  return {
    months: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar (Now)"],
    hub04: [0.62, 0.64, 0.72, 0.7, 0.74, 0.82],
    otherHubs: [0.86, 0.88, 0.96, 0.98, 1.0, 1.0238],
    target: 2.1,
    growthLabel: "Net growth Hub #04: +18.4%",
    gapLabel: "Revenue gap to Q1 target: 255,000,000 ₫",
  };
}

export function getRevenueMix() {
  return {
    yield: { label: "Floor Yield (Yield/m²)", value: "390,000 ₫/m²/mo", trend: "+6.8% MoM" },
    categories: [
      { id: "climate", label: "Climate Controlled Units", pct: 48, amount: "885M ₫" },
      { id: "standard", label: "Standard Apartment Storage", pct: 28, amount: "516M ₫" },
      { id: "garage", label: "Vehicle & Truck Garage", pct: 18, amount: "332M ₫" },
      { id: "mini", label: "Mini Box Storage (1-2m²)", pct: 6, amount: "112M ₫" },
    ],
    recommendation: "Recommendation: increase Climate Control ratio by 15%",
  };
}

export function getFloorFilters() {
  return {
    sizes: [{ id: "5x10", label: "5'x10' (Standard)" }],
    floors: [
      { id: "floor1", label: "Floor 1 (Ground)" },
      { id: "floor2", label: "Floor 2 (Climate Mezzanine)" },
    ],
  };
}

export function getFloorStatusTabs() {
  return [
    { id: "all", label: "All" },
    { id: "occupied", label: "Occupied" },
    { id: "available", label: "Available" },
    { id: "alert", label: "Locked/Delinquent" },
  ];
}

export function getFloorZoneLabel() {
  return "Zone B - Central Corridor Hub #04";
}

export function getFloorUnits() {
  return [
    { id: "B-201", floor: "floor2", status: "occupied", size: "5'x10'", price: "2.58M", occupant: "Logis Corp..." },
    { id: "B-202", floor: "floor2", status: "occupied", size: "5'x10'", price: "2.58M", occupant: "Pham Th..." },
    { id: "B-203", floor: "floor2", status: "available", size: "5'x10'", price: "2.58M", occupant: "Available" },
    { id: "B-204", floor: "floor2", status: "occupied", size: "5'x10'", price: "2.58M", occupant: "Alex Mor..." },
    { id: "B-205", floor: "floor2", status: "occupied", size: "5'x10'", price: "2.58M", occupant: "Trinh Gia..." },
    { id: "B-206", floor: "floor2", status: "alert", size: "5'x10'", price: "2.58M", occupant: "Past due..." },
    { id: "B-207", floor: "floor2", status: "occupied", size: "10'x15'", price: "4.2M", occupant: "David Va..." },
    { id: "B-208", floor: "floor2", status: "occupied", size: "10'x15'", price: "4.2M", occupant: "Studio N..." },
    { id: "B-209", floor: "floor2", status: "available", size: "5'x10'", price: "2.58M", occupant: "Available" },
    { id: "B-210", floor: "floor2", status: "occupied", size: "5'x10'", price: "2.58M", occupant: "Nguyen..." },
    { id: "B-211", floor: "floor2", status: "occupied", size: "5'x10'", price: "2.58M", occupant: "Storefront..." },
    { id: "B-212", floor: "floor2", status: "alert", size: "5'x10'", price: "2.58M", occupant: "Maintenance..." },
  ];
}

export function getUnitDetails() {
  return {
    "B-204": {
      unit: "B-204",
      operationalStatus: "Active",
      sizeLabel: "5'x10' Climate Controlled • Floor 2 Zone B",
      tenant: "Alex Morgan",
      contract: "#CTR-2024-8890",
      term: "15/06/24 - 15/06/25",
      paidThrough: "Paid through Mar 2025",
      price: "2,580,000 ₫ / month",
      sensor: "21.5°C • 48% RH",
      lockStatus: "LOCKED",
      statusOption: "Rented (Active Tenant)",
    },
  };
}

export function getFloorFootnote() {
  return { shown: "Displaying 12/120 units in Zone B Hub #04", breakdown: "68% Occupied • 24% Available • 8% Alert" };
}

export function getPolicyDefaults() {
  return {
    depositPercent: "100",
    exemptB2B: true,
    penaltyPercent: "5.0",
    autoLockEnabled: true,
    cancellationPolicy: "flexible",
  };
}

export function getVouchers() {
  return [
    {
      id: "VAULT-SUMMER50",
      status: "active",
      statusLabel: "Active",
      description: "50% off first month rental",
      used: 142,
      total: 200,
      note: "Expires: Jul 31, 2025",
      actionLabel: "Pause",
    },
    {
      id: "BIZ-YEARLY20",
      status: "active",
      statusLabel: "Active",
      description: "20% off 1-year corporate contracts",
      used: 28,
      total: null,
      note: "Prepaid B2B clients",
      actionLabel: "Details",
    },
    {
      id: "EARLYBIRD-HUB04",
      status: "hub_only",
      statusLabel: "Hub #04 Only",
      description: "1 free month when signing 6 months",
      used: 18,
      total: 50,
      note: "Zone B grand opening",
      actionLabel: "Edit Rules",
    },
  ];
}
