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

export function getDepositPolicy() {
  return { depositPercent: "100", latePenaltyPercent: "5" };
}

export function getAutoLockPolicy() {
  return { graceDays: "5" };
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

export function getYieldRecommendation() {
  return {
    occupancy: "94.2%",
    suggestion: "+8.5%",
    note: "When zone occupancy exceeds 90%, dynamic pricing algorithm recommends a 5-8% rate increase to maximize peak GMV.",
  };
}
