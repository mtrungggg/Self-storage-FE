// Data layer: content & listing source for the Home (storage search & reservation) page.

export function getSizeFilters() {
  return [
    { id: "all", label: "All Sizes", subtext: "Any square meters" },
    { id: "small", label: "Small", subtext: "Personal lockers, seasonal items" },
    { id: "medium", label: "Medium", subtext: "1-2 bedroom apartments" },
    { id: "large", label: "Large", subtext: "3-bedroom home, townhouse" },
    { id: "vehicle", label: "Extra Large", subtext: "Vehicles, business inventory" },
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
    { id: "studio", label: "5' x 10' (4.6 m²)", title: "Studio / 1-Bedroom Apartment", desc: "Fits queen bed, sofa, coffee table, wardrobe, and 15-20 moving boxes." },
    { id: "1-2br", label: "10' x 10' (9.3 m²)", title: "2-Bedroom Apartment", desc: "Fits entire 2-bedroom furnishings, refrigerator, washer, dining set, and bikes." },
    { id: "house", label: "10' x 20' (18.6 m²)", title: "Entire House / Townhouse", desc: "Equivalent to 1-car garage. Fits entire 3-4 bedroom home or business commercial goods." },
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
      icon: "local_shipping",
      title: "Moving Support",
      text: "Free 2-hour moving truck voucher for agreements from 3 months.",
    },
    {
      icon: "lock",
      title: "Digital Keypad PIN",
      text: "Keyless 24/7 access to facility gate and unit via personal numeric PIN.",
    },
  ];
}
