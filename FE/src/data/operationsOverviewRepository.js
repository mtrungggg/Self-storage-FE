// Data layer: content source for the Admin Operations & Revenue Overview page.
export function getLiveBanner() {
  return { label: "LIVE CENTRAL OPERATIONS", detail: "Cập nhật 15 giây trước" };
}

export function getOverviewHeader() {
  return {
    title: "Tổng quan Quản lý Vận hành & Doanh thu Cơ sở",
    subtitle: "Báo cáo real-time chuỗi kho VaultSpace • Hub #04 Downtown Metro & toàn mạng lưới",
  };
}

export function getOverviewActions() {
  return [
    { id: "sync", icon: "sync", label: "Đồng bộ giá thị trường" },
    { id: "export", icon: "file_download", label: "Xuất báo cáo (Excel/PDF)" },
    { id: "add", icon: "add", label: "Thêm kho / cơ sở mới" },
  ];
}

export function getKpis() {
  return [
    { id: "total", icon: "warehouse", label: "Tổng số kho quản lý", value: "480", trend: "+12 kho", sub: "120 kho Hub #04 đang khai thác" },
    { id: "occupancy", icon: "pie_chart", label: "Tỷ lệ lấp đầy kho", value: "86.4%", trend: "+4.2%", sub: "415 thuê • 45 trống • 20 giữ chỗ" },
    { id: "mrr", icon: "payments", label: "Doanh thu định kỳ (MRR)", value: "1.845 tỷ đ", trend: "+12.8% YoY", sub: "ARPU 3,850,000 đ/hợp đồng" },
    { id: "overdue", icon: "lock_clock", label: "Nợ quá hạn & khóa chốt", value: "8 ca", trend: "cần xử lý", sub: "48,200,000 đ • 2 khóa Latch" },
  ];
}

export function getRevenueTrend() {
  return {
    months: ["T10/24", "T11/24", "T12/24", "T01/25", "T02/25", "T03/25 (Nay)"],
    hub04: [0.62, 0.64, 0.72, 0.7, 0.74, 0.82],
    otherHubs: [0.86, 0.88, 0.96, 0.98, 1.0, 1.0238],
    target: 2.1,
    growthLabel: "Tăng trưởng ròng Hub #04: +18.4%",
    gapLabel: "Khoảng trống doanh thu tới mục tiêu Q1: 255,000,000 đ",
  };
}

export function getRevenueMix() {
  return {
    yield: { label: "Hiệu suất sàn (Yield/m²)", value: "390,000 đ/m²/tháng", trend: "+6.8% MoM" },
    categories: [
      { id: "climate", label: "Kho Climate Control (Máy lạnh)", pct: 48, amount: "885 triệu đ" },
      { id: "standard", label: "Kho Tiêu chuẩn Căn hộ", pct: 28, amount: "516 triệu đ" },
      { id: "garage", label: "Garage Ô tô & Xe tải", pct: 18, amount: "332 triệu đ" },
      { id: "mini", label: "Kho Mini Box (1-2m²)", pct: 6, amount: "112 triệu đ" },
    ],
    recommendation: "Khuyến nghị: tăng tỷ lệ Climate Control thêm 15%",
  };
}

export function getFloorFilters() {
  return {
    sizes: [{ id: "5x10", label: "5'x10' (Tiêu chuẩn)" }],
    floors: [
      { id: "floor1", label: "Tầng 1 (Trệt)" },
      { id: "floor2", label: "Tầng 2 (Lửng máy lạnh)" },
    ],
  };
}

export function getFloorStatusTabs() {
  return [
    { id: "all", label: "Tất cả" },
    { id: "occupied", label: "Đã thuê" },
    { id: "available", label: "Trống" },
    { id: "alert", label: "Khóa/Nợ" },
  ];
}

export function getFloorZoneLabel() {
  return "Khu vực B - Dãy hành lang Trung tâm Hub #04";
}

export function getFloorUnits() {
  return [
    { id: "B-201", floor: "floor2", status: "occupied", size: "5'x10'", price: "2.58M", occupant: "Cty Logis..." },
    { id: "B-202", floor: "floor2", status: "occupied", size: "5'x10'", price: "2.58M", occupant: "Phạm Th..." },
    { id: "B-203", floor: "floor2", status: "available", size: "5'x10'", price: "2.58M", occupant: "Trống" },
    { id: "B-204", floor: "floor2", status: "occupied", size: "5'x10'", price: "2.58M", occupant: "Alex Mor..." },
    { id: "B-205", floor: "floor2", status: "occupied", size: "5'x10'", price: "2.58M", occupant: "Trịnh Gia..." },
    { id: "B-206", floor: "floor2", status: "alert", size: "5'x10'", price: "2.58M", occupant: "Khóa nợ..." },
    { id: "B-207", floor: "floor2", status: "occupied", size: "10'x15'", price: "4.2M", occupant: "David Va..." },
    { id: "B-208", floor: "floor2", status: "occupied", size: "10'x15'", price: "4.2M", occupant: "Studio N..." },
    { id: "B-209", floor: "floor2", status: "available", size: "5'x10'", price: "2.58M", occupant: "Trống" },
    { id: "B-210", floor: "floor2", status: "occupied", size: "5'x10'", price: "2.58M", occupant: "Nguyễn..." },
    { id: "B-211", floor: "floor2", status: "occupied", size: "5'x10'", price: "2.58M", occupant: "Cửa hàng..." },
    { id: "B-212", floor: "floor2", status: "alert", size: "5'x10'", price: "2.58M", occupant: "Bảo trì..." },
  ];
}

export function getUnitDetails() {
  return {
    "B-204": {
      unit: "B-204",
      operationalStatus: "Đang hoạt động",
      sizeLabel: "5'x10' Climate Controlled • Tầng 2 Khu B",
      tenant: "Alex Morgan",
      contract: "#CTR-2024-8890",
      term: "15/06/24 - 15/06/25",
      paidThrough: "Đã trả hết T03/25",
      price: "2,580,000 đ / tháng",
      sensor: "21.5°C • Độ ẩm 48%",
      lockStatus: "ĐÓNG",
      statusOption: "Đã cho thuê (Active Tenant)",
    },
  };
}

export function getFloorFootnote() {
  return { shown: "Hiển thị 12/120 kho thuộc Zone B Hub #04", breakdown: "68% Đã thuê • 24% Khả dụng • 8% Bất thường" };
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
      statusLabel: "Đang chạy",
      description: "Giảm 50% phí thuê tháng đầu tiên",
      used: 142,
      total: 200,
      note: "Hết hạn: 31/07/2025",
      actionLabel: "Tạm dừng",
    },
    {
      id: "BIZ-YEARLY20",
      status: "active",
      statusLabel: "Đang chạy",
      description: "Giảm 20% cho hợp đồng doanh nghiệp 1 năm",
      used: 28,
      total: null,
      note: "Khách B2B thanh toán trước",
      actionLabel: "Chi tiết",
    },
    {
      id: "EARLYBIRD-HUB04",
      status: "hub_only",
      statusLabel: "Riêng Hub #04",
      description: "Tặng 1 tháng miễn phí khi ký 6 tháng",
      used: 18,
      total: 50,
      note: "Khai trương phân khu B",
      actionLabel: "Sửa quy tắc",
    },
  ];
}
