// Data layer: content source for the Admin Pricing & Policy Configuration page.
export function getPolicyVersionBanner() {
  return {
    version: "Operating Policy Release 2024.Q3",
    scope: "Applied across 14 Hub facilities & B2B Managed Hubs",
    editor: "Tran Minh Hoang",
    timestamp: "14:32 - 18/10/2024",
  };
}

export function getOverviewHeader() {
  return {
    title: "Pricing & Operating Policies Configuration",
    subtitle: "Adjust rental rate ceilings, service fees, automated Latch PIN lockout thresholds, and B2B discount tiers.",
  };
}

export function getHeaderActions() {
  return [
    { id: "reset", icon: "restart_alt", label: "Reset to Default" },
    { id: "history", icon: "history", label: "Audit History" },
    { id: "save", icon: "save", label: "Save Policy Changes" },
  ];
}

export function getPriceTerms() {
  return [
    { id: "m1", label: "1 Month", note: "Flexible", discountPercent: 0 },
    { id: "m3", label: "3 Months", note: "-5% quarterly", discountPercent: 5 },
    { id: "m6", label: "6 Months", note: "-10% semi-annual", discountPercent: 10 },
    { id: "m12", label: "12 Months", note: "B2B Annual Corporate", discountPercent: 15, highlight: true },
  ];
}

export function getPriceUnits() {
  return [
    { id: "locker", label: "Personal Mini Box (Locker S)", spec: "1m x 1m x 1.2m • Floor 2 & Hub", volume: "1.2 m³", basePrice: 650000 },
    { id: "xs", label: "Standard Unit 5'x5' (XS)", spec: "1.5m x 1.5m x 2.4m • Wardrobe capacity", volume: "5.4 m³", basePrice: 1450000 },
    { id: "medium", label: "Standard Unit 10'x10' (Medium)", spec: "3.0m x 3.0m x 2.6m • 2-Bedroom Apartment capacity", volume: "23.4 m³", basePrice: 3800000 },
    {
      id: "climate",
      label: "Climate Controlled Storage",
      spec: "Secure archive, artwork, wine, luxury goods standard",
      volume: "18.0 m³",
      badge: "20-22°C • 50% RH",
      basePrice: 5200000,
    },
    { id: "garage", label: "Vehicle & Heavy Truck Garage", spec: "Direct Drive-up entrance • 6.0m x 3.5m x 3.2m", volume: "67.2 m³", basePrice: 8500000 },
  ];
}

export function getDepositPolicy() {
  return { depositPercent: "100", latePenaltyPercent: "5" };
}

export function getAutoLockPolicy() {
  return { graceDays: "5" };
}

export function getServiceFees() {
  return [
    { id: "cleanup", label: "Unit cleanup fee upon move-out", value: "250,000 ₫/unit" },
    { id: "nfc", label: "Replacement NFC access card", value: "150,000 ₫/card" },
    { id: "forklift", label: "Peak hour pallet forklift assistance", value: "350,000 ₫/hour" },
  ];
}

export function getCancellationPolicy() {
  return [
    { id: "flexible", label: "Notice ≥ 48 hours", note: "Cancelled > 2 days before move-in", refundPercent: 100 },
    { id: "midrange", label: "Within 24h - 48h", note: "Short-term hold fee incurred", refundPercent: 50 },
    { id: "late", label: "Less than 24h before move-in", note: "Non-refundable hold deposit", refundPercent: 0 },
  ];
}

export function getCancellationNote() {
  return "B2B refund procedure: credited to corporate bank account within 24 business hours.";
}

export function getVoucherStats() {
  return [
    { id: "revenue", label: "Voucher Revenue", value: "1,480,500,000 ₫", sub: "+24.8% vs baseline" },
    { id: "usage", label: "Vouchers Redeemed", value: "428 redemptions", sub: "Remaining quota: 572" },
    { id: "discount", label: "Discounts Issued", value: "112,400,000 ₫", sub: "7.6% of gross GMV" },
    { id: "renewal", label: "Post-promo Renewal Rate", value: "82.4%", sub: "Converted to 6-12 mo plans" },
  ];
}

export function getVouchers() {
  return [
    {
      id: "VAULT-SUMMER50",
      tag: "New Customer",
      active: true,
      description: "50% off first month rent for Mini Box & 5x5 units",
      used: 246,
      total: 300,
      revenue: "685,000,000 ₫",
      expiry: "31/10/2024",
      condition: "Condition: Lease ≥ 3 months",
    },
    {
      id: "BIZ-YEARLY20",
      tag: "Corporate Client",
      active: true,
      description: "Extra 20% off 1-year contract + 1 complimentary forklift service",
      used: 118,
      total: 150,
      revenue: "540,500,000 ₫",
      expiry: "31/12/2024",
      condition: "Condition: Corporate Tax ID required",
    },
    {
      id: "EARLYBIRD-HUB04",
      tag: "Downtown Metro Hub",
      active: true,
      description: "500,000 ₫ voucher for first 100 tenants at Hub #04",
      used: 64,
      total: 100,
      revenue: "255,000,000 ₫",
      expiry: "15/11/2024",
      condition: "Scope: Hub #04 only",
    },
  ];
}

export function getYieldRecommendation() {
  return {
    occupancy: "94.2%",
    suggestion: "+8.5%",
    note: "When zone occupancy exceeds 90%, dynamic pricing algorithm recommends a 5-8% rate increase to maximize peak GMV.",
  };
}
