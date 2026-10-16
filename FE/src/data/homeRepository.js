// Data layer: content & listing source for the Home (storage search & reservation) page.

export function getSizeFilters() {
  return [
    { id: "all", label: "All Sizes", subtext: "Any square meters" },
    { id: "mini", label: "Mini Locker (1 m²)", subtext: "Personal items, gadgets" },
    { id: "small", label: "Small (3 m²)", subtext: "Dry goods & seafood cold storage" },
    { id: "medium", label: "Medium (6 m²)", subtext: "Dry, warm & deep freeze units" },
    { id: "large", label: "Large (10 m²)", subtext: "Heated warm storage (22°C–26°C)" },
    { id: "xlarge", label: "Extra Large (16 m²)", subtext: "Commercial dual climate logistics" },
  ];
}

export function getRentalTerms() {
  return [
    { id: "month", label: "Month-to-Month", discount: "0%" },
    { id: "quarter", label: "3 Months (5% OFF)", discount: "5%" },
    { id: "half-year", label: "6 Months (10% OFF)", discount: "10%" },
    { id: "year", label: "12 Months (15% OFF)", discount: "15%" },
  ];
}

export function getSizeGuideTabs() {
  return [
    {
      id: "mini",
      label: "1.0m × 1.0m (1 m²)",
      title: "Mini Smart Dry Locker",
      desc: "Compact high-security dry locker. Ideal for luggage, confidential documents, electronic devices, and personal items.",
    },
    {
      id: "small",
      label: "1.5m × 2.0m (3 m²)",
      title: "Small Storage (Dry Goods & Chilled Seafood)",
      desc: "Ambient dry goods storage (S-DRY) or chilled cold storage (S-SEAFOOD). Fits 15-20 boxes, small furniture, or fresh fishery samples.",
    },
    {
      id: "medium",
      label: "2.0m × 3.0m (6 m²)",
      title: "Medium Storage (Dry, Deep Freeze & Warm)",
      desc: "Spacious dry storage (M-DRY), sub-zero seafood freezer (M-SEAFOOD), or heated warm room (M-WARM). Fits 1-2 room apartment furniture or frozen seafood stock.",
    },
    {
      id: "large",
      label: "2.5m × 4.0m (10 m²)",
      title: "Large Heated Warm Storage (22°C–26°C)",
      desc: "Heated constant-temperature storage (L-WARM). Protects wooden musical instruments, delicate audio gear, and art crafts against humidity.",
    },
    {
      id: "xlarge",
      label: "4.0m × 4.0m (16 m²)",
      title: "Extra Large Climate-Controlled Storage",
      desc: "Commercial enterprise dual climate-controlled storage (XL-CLIMATE) with 48 m³ volume. Fits commercial palletized inventory and logistic supplies.",
    },
  ];
}

export function getHomeHighlights() {
  return [
    {
      icon: "event_available",
      title: "Flexible Leases",
      text: "Rent month-to-month, cancel anytime online without cancellation penalties.",
    },
    {
      icon: "toll",
      title: "100% Transparent",
      text: "No hidden fees, security deposits refunded promptly upon move-out.",
    },
    {
      icon: "ac_unit",
      title: "Specialized Climate & Cold",
      text: "Dedicated sub-zero seafood freezer, 22°C–26°C heated rooms, and dual climate control.",
    },
    {
      icon: "lock",
      title: "Digital Keypad PIN",
      text: "Keyless 24/7 access to facility gate and unit via personal numeric PIN.",
    },
  ];
}
