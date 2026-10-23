// Data layer: content & listing source for the Home & Storage booking pages.

export const STORAGE_SIZE_TIERS = [
  {
    id: "mini",
    unitTypeId: 5,
    name: "Mini Locker",
    areaM2: 1.0,
    dimensions: "1.0m × 1.0m",
    height: "2.8m",
    volume: "2.8 m³",
    capacityLabel: "Cá nhân (1–2 người)",
    fitsSummary: "Vali du lịch, 4–6 thùng hồ sơ, đồ công nghệ, đồ cá nhân",
    fitsDetail: "Phù hợp để vali du lịch, tài liệu quan trọng, thiết bị công nghệ, vật dụng cá nhân nhỏ gọn.",
    icon: "inventory_2",
    badge: "Tiết kiệm",
    image: "https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?auto=format&fit=crop&w=800&q=80",
    baseRateEstimate: 800000,
  },
  {
    id: "small",
    unitTypeId: 1,
    name: "Small",
    areaM2: 3.0,
    dimensions: "1.5m × 2.0m",
    height: "2.8m",
    volume: "8.4 m³",
    capacityLabel: "Phòng trọ / Studio nhỏ",
    fitsSummary: "15–20 thùng carton, 1 xe máy, tủ lạnh mini, nệm gấp",
    fitsDetail: "Phù hợp dọn đồ phòng trọ, căn hộ studio. Đủ chỗ chứa 1 xe máy, quạt máy, nệm, thùng đồ sinh hoạt.",
    icon: "home_mini",
    badge: "Phổ biến",
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80",
    baseRateEstimate: 2000000,
  },
  {
    id: "medium",
    unitTypeId: 2,
    name: "Medium",
    areaM2: 6.0,
    dimensions: "2.0m × 3.0m",
    height: "2.8m",
    volume: "16.8 m³",
    capacityLabel: "Căn hộ 1–2 PN (+100% diện tích)",
    fitsSummary: "Sofa phòng khách, giường nệm, tủ lớn, tủ lạnh, 30–40 thùng",
    fitsDetail: "Gấp đôi diện tích kho nhỏ (+100%)! Chứa trọn gói nội thất căn hộ 1-2 phòng ngủ, máy giặt, bàn làm việc.",
    icon: "apartment",
    badge: "Khuyên dùng",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    baseRateEstimate: 3600000,
  },
  {
    id: "large",
    unitTypeId: 3,
    name: "Large",
    areaM2: 10.0,
    dimensions: "2.5m × 4.0m",
    height: "2.8m",
    volume: "28.0 m³",
    capacityLabel: "Nhà phố 3–4 PN (+233% diện tích)",
    fitsSummary: "Toàn bộ nội thất nhà phố, bàn ăn lớn, giường tủ cồng kềnh",
    fitsDetail: "Không gian rộng rãi vượt bậc (+233%). Đủ chỗ lưu trữ toàn bộ nhà phố khi xây sửa: bàn ăn 6 ghế, tủ gỗ lớn, xe máy.",
    icon: "holiday_village",
    badge: "Rất rộng",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
    baseRateEstimate: 5500000,
  },
  {
    id: "xlarge",
    unitTypeId: 4,
    name: "Extra Large",
    areaM2: 16.0,
    dimensions: "4.0m × 4.0m",
    height: "3.0m",
    volume: "48.0 m³",
    capacityLabel: "Kho kinh doanh / Doanh nghiệp (+433% diện tích)",
    fitsSummary: "Hàng hóa kinh doanh thương mại, pallet kho vận, kho thiết bị",
    fitsDetail: "Thể tích lên tới 48 m³. Phù hợp lưu kho pallet hàng hóa, vật tư trưng bày, thiết bị văn phòng lớn của công ty.",
    icon: "warehouse",
    badge: "Kho đại",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
    baseRateEstimate: 8000000,
  },
];

export function getStorageSizeTiers() {
  return STORAGE_SIZE_TIERS;
}

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
