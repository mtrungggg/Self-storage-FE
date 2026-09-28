// Data layer: content & pricing config source for the StorageDetail (booking) page.
export function getMoveInOptions() {
  return [
    { id: "today", label: "Hôm nay (Ngay lập tức)" },
    { id: "tomorrow", label: "Ngày mai" },
    { id: "fri", label: "Thứ 6, 01/11/2025" },
    { id: "custom", label: "Chọn ngày khác" },
  ];
}

export function getTimeSlots() {
  return [
    { id: "morning", label: "09:00 SA – 11:00 SA", note: "Khoảng sáng vắng vẻ" },
    { id: "noon", label: "11:00 SA – 01:00 CH", note: "Khuyến nghị", highlight: true },
    { id: "afternoon", label: "02:00 CH – 04:00 CH", note: "Buổi chiều" },
    { id: "anytime", label: "Tự check-in (Bất kỳ lúc nào)", note: "Mã PIN 100% qua điện thoại" },
  ];
}

export function getProtectionPlans() {
  return [
    {
      id: "standard",
      badge: "PHỔ BIẾN",
      name: "Bảo vệ Tiêu chuẩn",
      text: "Bảo hiểm tài sản đến $2,000: ngập nước, hỏa hoạn, mất cắp.",
      price: 12,
    },
    {
      id: "premium",
      badge: "MỞ RỘNG",
      name: "Bảo hiểm Cao cấp Cộng",
      text: "Bảo hiểm thay thế đến $5,000, khấu trừ $0.",
      price: 24,
    },
    {
      id: "own",
      badge: "TỰ CÓ BẢO HIỂM",
      name: "Bảo hiểm nhà ở / người thuê riêng",
      text: "Nộp giấy chứng nhận bảo hiểm riêng trong 7 ngày.",
      price: 0,
    },
  ];
}
