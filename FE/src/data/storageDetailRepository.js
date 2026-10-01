// Data layer: content & pricing config source for the StorageDetail (booking) page.
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
      text: "Bảo hiểm tài sản đến 48.000.000 đ: ngập nước, hỏa hoạn, mất cắp.",
      price: 288000,
    },
    {
      id: "premium",
      badge: "MỞ RỘNG",
      name: "Bảo hiểm Cao cấp Cộng",
      text: "Bảo hiểm thay thế đến 120.000.000 đ, khấu trừ 0 đ.",
      price: 576000,
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
