// Data layer: content source for the AccessControl (PIN & smart lock) page.
export function getWallets() {
  return [
    { icon: "account_balance_wallet", title: "Apple Wallet", status: "Đã thêm pass", active: true },
    { icon: "wallet", title: "Google Wallet", status: "Chưa liên kết", active: false },
    { icon: "credit_card", title: "Thẻ từ NFC", status: "Sẵn sàng quét", active: true },
  ];
}

export function getGuestPins() {
  return [
    {
      id: "express",
      name: "Đơn vị giao vận Express",
      tag: "Dùng 1 lần (OTP)",
      status: "active",
      schedule: "Hiệu lực: 14:00 – 17:00 ngày 24/10/2025 • Giới hạn chỉ mở kho B-204",
      code: "481903#",
      action: "Hủy tức thì",
    },
    {
      id: "family",
      name: "Gia đình (Vũ Phương Thảo)",
      tag: "Lịch định kỳ",
      status: "active",
      schedule: "Hiệu lực: Thứ 7 & Chủ Nhật hàng tuần (08:00 – 20:00)",
      code: "773201#",
      action: "Chỉnh sửa",
    },
    {
      id: "tech",
      name: "Thợ bảo trì điện lạnh",
      tag: "Đã hết hạn",
      status: "expired",
      schedule: "Đã sử dụng mở kho 1 lần lúc 11:20 ngày 23/10/2025",
      code: "119042#",
      action: "Kích hoạt lại",
    },
  ];
}

export function getAccessControlLogs() {
  return [
    {
      icon: "lock_open",
      title: "Mở chốt kho #B-204",
      time: "14:45 Hôm nay",
      note: "Bằng Bluetooth LE qua ứng dụng di động (Alex Morgan)",
      dot: "#2dd4a0",
    },
    {
      icon: "directions_car",
      title: "Xe qua Barrier Cổng Nam",
      time: "14:41 Hôm nay",
      note: "Quét Apple Wallet tại trạm kiểm soát #01",
      dot: "#1d5fe5",
    },
    {
      icon: "dialpad",
      title: "Mở kho #B-204",
      time: "18/10 10:12",
      note: "Bằng Mã PIN tạm thời khách (GrabExpress)",
      dot: "#8996a9",
    },
    {
      icon: "key",
      title: "Mở chốt khóa cơ học",
      time: "10/10 09:30",
      note: "Nhập bàn phím PIN chính tại mặt cửa",
      dot: "#8996a9",
    },
  ];
}

export function getAccessControlTrustBadges() {
  return [
    { icon: "verified", title: "ISO 27001", text: "An ninh thông tin đạt chuẩn" },
    { icon: "lock", title: "SSL 256-Bit", text: "Mã hóa thanh toán ngân hàng" },
    { icon: "videocam", title: "CCTV 24/7", text: "Giám sát liên tục mọi hành lang" },
    { icon: "health_and_safety", title: "Bảo hiểm toàn diện", text: "Bảo vệ tài sản rủi ro tối đa" },
  ];
}
