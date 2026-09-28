// Data layer: content source for the CustomerDashboard ("Kho của tôi") page.
export function getDashboardAccessLogs() {
  return [
    {
      icon: "lock_open",
      title: "Mở chốt kho #B-204",
      time: "Hôm nay 14:45",
      note: "Mạng Bluetooth di động • Alex Morgan (Chủ sở hữu)",
    },
    {
      icon: "directions_car",
      title: "Xe vào Cổng Nam",
      time: "Hôm nay 14:41",
      note: "Quét thẻ Apple Wallet NFC • Đã cấp quyền",
    },
    {
      icon: "local_shipping",
      title: "Mã PIN chuyển đồ thanh thực đúng",
      time: "18/10, 10:12",
      note: "Đơn vị vận chuyển • Khóa hết hạn sau 24h",
    },
    {
      icon: "receipt_long",
      title: "Tự động gia hạn hợp đồng thuê hàng tháng",
      time: "01/10, 00:00",
      note: "$101.00 USD đã thanh toán qua Visa • Hóa đơn #VS-3918",
    },
  ];
}

export function getDashboardQuickActions() {
  return [
    { icon: "expand", title: "Nâng cấp diện tích", text: "Đổi hoặc thuê thêm kho" },
    { icon: "shopping_cart", title: "Cửa hàng phụ kiện dọn kho", text: "Thùng, khóa, xe đẩy" },
    { icon: "event_note", title: "Thông báo trả kho", text: "Hẹn ngày trả kho" },
    { icon: "support_agent", title: "Hỗ trợ trực tiếp tại kho", text: "Điều phối công trực tiếp 24/7" },
  ];
}

export function getDashboardTrustBadges() {
  return [
    { icon: "verified", title: "Chứng nhận ISO 27001", text: "Bảo mật dữ liệu & cơ sở" },
    { icon: "lock", title: "Mã hóa SSL 256-Bit", text: "Truy cập khóa thiết bị quản trị" },
    { icon: "videocam", title: "Camera giám sát 24/7", text: "Giám sát liên tục các khoang" },
    { icon: "health_and_safety", title: "Bảo hiểm toàn diện", text: "Bảo vệ tài sản lên đến $50,000" },
  ];
}

export function getClimateChartData() {
  return {
    temperature: [21.0, 21.3, 21.5, 21.2, 21.0, 20.8, 21.1, 21.4, 21.6, 21.3, 21.1, 21.2],
    humidity: [46, 47, 48, 49, 48, 47, 46, 47, 48, 49, 48, 48],
  };
}
