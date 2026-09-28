// Data layer: content source for the Admin Pricing & Policy Configuration page.
export function getPolicyVersionBanner() {
  return {
    version: "Phiên bản chính sách vận hành 2024.Q3",
    scope: "Áp dụng cho 14 cụm cơ sở Hub & B2B Managed Hubs",
    editor: "Trần Minh Hoàng",
    timestamp: "14:32 - 18/10/2024",
  };
}

export function getOverviewHeader() {
  return {
    title: "Cấu hình Giá & Chính sách Vận hành",
    subtitle: "Điều chỉnh trần giá thuê, phí dịch vụ, ngưỡng phạt tự động PIN Latch và chiến dịch giảm giá B2B.",
  };
}

export function getHeaderActions() {
  return [
    { id: "reset", icon: "restart_alt", label: "Khôi phục mặc định" },
    { id: "history", icon: "history", label: "Nhật ký điều chỉnh" },
    { id: "save", icon: "save", label: "Lưu thay đổi chính sách" },
  ];
}

export function getPriceTerms() {
  return [
    { id: "m1", label: "1 tháng", note: "Linh hoạt", discountPercent: 0 },
    { id: "m3", label: "3 tháng", note: "-5% thanh toán kỳ", discountPercent: 5 },
    { id: "m6", label: "6 tháng", note: "-10% bán niên", discountPercent: 10 },
    { id: "m12", label: "12 tháng", note: "B2B đại lý doanh nghiệp", discountPercent: 15, highlight: true },
  ];
}

export function getPriceUnits() {
  return [
    { id: "locker", label: "Mini Box Cá Nhân (Locker S)", spec: "1m x 1m x 1.2m • Tầng 2 & Hub", volume: "1.2 m³", basePrice: 650000 },
    { id: "xs", label: "Kho Tiêu Chuẩn 5'x5' (XS)", spec: "1.5m x 1.5m x 2.4m • Tương đương 1 tủ quần áo lớn", volume: "5.4 m³", basePrice: 1450000 },
    { id: "medium", label: "Kho Tiêu Chuẩn 10'x10' (Medium)", spec: "3.0m x 3.0m x 2.6m • Đủ chỗ căn hộ 2PN", volume: "23.4 m³", basePrice: 3800000 },
    {
      id: "climate",
      label: "Kho Máy Lạnh Vi Khí Hậu (Climate Control)",
      spec: "Quy chuẩn tài liệu bảo mật, tranh ảnh, rượu, đồ cao cấp",
      volume: "18.0 m³",
      badge: "20-22°C • 50% RH",
      basePrice: 5200000,
    },
    { id: "garage", label: "Garage Xe Hơi & Xe Tải Trọng Lớn", spec: "Lối vào Drive-up trực tiếp • 6.0m x 3.5m x 3.2m", volume: "67.2 m³", basePrice: 8500000 },
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
    { id: "cleanup", label: "Phí dọn kho khi trả mặt bằng", value: "250,000 đ/lượt" },
    { id: "nfc", label: "Cấp lại thẻ từ NFC bị thất lạc", value: "150,000 đ/thẻ" },
    { id: "forklift", label: "Xe nâng Pallet cao điểm", value: "350,000 đ/giờ" },
  ];
}

export function getCancellationPolicy() {
  return [
    { id: "flexible", label: "Báo trước ≥ 48 giờ", note: "Hủy trước 2 ngày bàn giao kho", refundPercent: 100 },
    { id: "midrange", label: "Trong vòng 24h - 48h", note: "Phí giữ kho ngắn hạn đã phát sinh", refundPercent: 50 },
    { id: "late", label: "Dưới 24 giờ nhận kho", note: "Không hoàn lại cọc giữ chỗ", refundPercent: 0 },
  ];
}

export function getCancellationNote() {
  return "Quy trình xử lý hoàn tiền B2B: chuyển vào tài khoản doanh nghiệp trong 24 giờ làm việc.";
}

export function getVoucherStats() {
  return [
    { id: "revenue", label: "Doanh thu qua voucher", value: "1,480,500,000 đ", sub: "+24.8% so với trước" },
    { id: "usage", label: "Lượt voucher áp dụng", value: "428 lượt", sub: "Hạn ngạch còn lại: 572" },
    { id: "discount", label: "Chiết khấu thực cấp", value: "112,400,000 đ", sub: "Chiếm 7.6% tổng GMV" },
    { id: "renewal", label: "Tỷ lệ gia hạn sau promo", value: "82.4%", sub: "Chuyển sang gói 6-12 tháng" },
  ];
}

export function getVouchers() {
  return [
    {
      id: "VAULT-SUMMER50",
      tag: "Khách hàng mới",
      active: true,
      description: "Giảm 50% tiền thuê tháng đầu tiên cho kho Mini Box & 5x5",
      used: 246,
      total: 300,
      revenue: "685,000,000 đ",
      expiry: "31/10/2024",
      condition: "Điều kiện: HĐ ≥ 3 tháng",
    },
    {
      id: "BIZ-YEARLY20",
      tag: "Khách Doanh nghiệp",
      active: true,
      description: "Giảm thêm 20% khi ký hợp đồng 1 năm + tặng 1 lượt xe nâng cố định",
      used: 118,
      total: 150,
      revenue: "540,500,000 đ",
      expiry: "31/12/2024",
      condition: "Điều kiện: có MST công ty",
    },
    {
      id: "EARLYBIRD-HUB04",
      tag: "Cơ sở Downtown Metro",
      active: true,
      description: "Tặng voucher 500,000 đ cho 100 khách đầu tiên thuê tại Hub #04",
      used: 64,
      total: 100,
      revenue: "255,000,000 đ",
      expiry: "15/11/2024",
      condition: "Giới hạn: Hub #04",
    },
  ];
}

export function getYieldRecommendation() {
  return {
    occupancy: "94.2%",
    suggestion: "+8.5%",
    note: "Khi công suất phân khu vượt ngưỡng 90%, thuật toán đề xuất tăng 5-8% để tối ưu GMV mùa cao điểm.",
  };
}
