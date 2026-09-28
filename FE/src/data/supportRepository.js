// Data layer: content source for the Support page.
export function getUnitTabs() {
  return [
    { id: "all", label: "Tất cả kho (3)" },
    { id: "active", label: "Đang hoạt động (2)" },
    { id: "renew", label: "Cần gia hạn (1)" },
  ];
}

export function getSupportUnits() {
  return [
    {
      id: "A-102",
      location: "Tầng 1 • Khoang A • An Phú Central",
      status: "active",
      statusLabel: "Đang hoạt động",
      size: "5' x 10' (~4.6m²)",
      sizeNote: "Chiều cao trần 2.7 mét (Khoang thoáng)",
      climate: "23°C / 48% RH",
      contractLabel: "Thời hạn hợp đồng",
      contractDate: "Hạn đến 28/02/2026",
      contractLeft: "Còn 312 ngày",
      payment: "Tự động qua Visa ****8892",
      primaryAction: "Xem mã PIN / Khóa điện tử",
      footerLinks: ["Gia hạn thêm", "Đặt lịch trả kho"],
    },
    {
      id: "B-204",
      location: "Tầng 2 • Khoang B • An Phú Central",
      status: "renew",
      statusLabel: "Còn 3 ngày",
      warning: "Vui lòng gia hạn trước 31/10/2025 để tránh bị khóa mã PIN và tính phí giữ kho tạm.",
      size: "10' x 15' (~13.9m²)",
      sizeNote: "Đặc thù sử dụng: Chứa máy & Đồ đạc cồng kềnh",
      climate: "Lối xe nâng hàng rộng",
      autoPay: true,
      primaryAction: "Gia hạn hợp đồng ngay",
      footerLinks: ["Mã PIN kho", "Đặt lịch trả kho"],
    },
    {
      id: "D-118",
      location: "Garage mặt bằng xe ở An Phú",
      status: "active",
      statusLabel: "Đang hoạt động",
      size: "10' x 20' (~18.6m²)",
      sizeNote: "Mục đích sử dụng: Kho ô tô & Nội thất biệt thự",
      climate: "Cửa cuốn điện điều khiển từ xa",
      contractLabel: "Thời hạn hợp đồng",
      contractDate: "Hạn đến 15/12/2025",
      contractLeft: "Còn 45 ngày",
      payment: "Thanh toán theo quý",
      primaryAction: "Xem mã PIN / Khóa điện tử",
      footerLinks: ["Gia hạn thêm", "Đặt lịch trả kho"],
    },
  ];
}

export function getTicketTabs() {
  return [
    { id: "all", label: "Tất cả (3)" },
    { id: "pending", label: "Đang chờ (1)" },
    { id: "assigned", label: "Đã phân công (1)" },
    { id: "resolved", label: "Đã xử lý (1)" },
  ];
}

export function getSupportTickets() {
  return [
    {
      id: "#TK-8942",
      status: "pending",
      statusLabel: "Đang chờ xử lý",
      title: "Lỗi mã PIN bàn phím cơ khí #A-102 không nhận lệnh",
      unit: "Khoang: #A-102 (Tầng 1)",
      time: "Giờ báo: 14:15 (Hôm nay)",
      quote: "Bấm mã 4829 trên ổ khóa điện tử thì màn hình báo đỏ chớp 3 lần, không thể khóa khoang A-102.",
      footer: "Điều phối: Đang phân công kỹ thuật trực ca chiều",
      eta: "Dự kiến xử lý: Trong vòng 25 phút",
    },
    {
      id: "#TK-8891",
      status: "assigned",
      statusLabel: "Đã phân công nhân viên",
      title: "Cửa cuốn kho #D-118 bị rít khi mở và đèn cảm ứng chớp chờn",
      unit: "Khoang: #D-118 (Garage ngoài trời)",
      time: "Giờ báo: 09:30 (Hôm qua)",
      tech: "Trần Minh Quân",
      techNote: "Kỹ thuật viên trưởng ca 1 • Đã kiểm tra dầu ray & bóng LED",
      footer: "Trạng thái: Đang hoàn tất lắp đặt bóng LED dự phòng",
      eta: "Ưu tiên cao",
    },
    {
      id: "#TK-8720",
      status: "resolved",
      statusLabel: "Đã giải quyết",
      title: "Yêu cầu cấp lại hóa đơn GTGT điện tử tháng 10/2025",
      unit: "Khoang: #B-204",
      time: "Tạo ngày: 20/10/2025",
      quote: "Bộ phận kế toán đã xuất hóa đơn điện tử VAT mã số HD-2025-0899 và gửi file PDF qua email lúc 11:20 ngày 20/10.",
      footer: "Đánh giá dịch vụ",
      rating: 5,
      action: "Tải lại hóa đơn",
    },
  ];
}

export function getSupportTrustBadges() {
  return [
    { icon: "verified", title: "Chứng nhận ISO 27001", text: "Bảo vệ Dữ liệu & Cơ sở" },
    { icon: "lock", title: "Mã hóa SSL 256-Bit", text: "Khóa an toàn tuyệt đối" },
    { icon: "videocam", title: "Camera giám sát 24/7", text: "Hệ thống CCTV liên tục" },
    { icon: "health_and_safety", title: "Bảo hiểm toàn diện", text: "Bảo vệ tài sản lên đến $50,000" },
  ];
}
