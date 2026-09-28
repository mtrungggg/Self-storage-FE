// Data layer: content source for the FacilityMap page.
export function getFloors() {
  return [
    { id: "floor1", label: "Tầng 1 (Mặt trệt & Drive-up)" },
    { id: "floor2", label: "Tầng 2 (Kho vi khí hậu máy lạnh)" },
    { id: "yard", label: "Bãi đỗ container ngoài trời" },
  ];
}

export function getLeftUnits() {
  return [
    { id: "A-101", top: 60, taken: false },
    { id: "A-102", top: 60, taken: false, col: 2 },
    { id: "A-103", top: 150, taken: true },
    { id: "A-104", top: 150, taken: true, col: 2 },
    { id: "A-105", top: 260, taken: false },
    { id: "A-106", top: 260, taken: true, col: 2 },
  ];
}

export function getRightUnits() {
  return [
    { id: "B-201", top: 30 },
    { id: "B-202", top: 30, col: 2 },
    { id: "B-207", top: 120 },
    { id: "B-208", top: 120, col: 2 },
    { id: "B-209", top: 210 },
    { id: "B-210", top: 210, col: 2 },
    { id: "B-205", top: 300 },
    { id: "B-206", top: 300, col: 2 },
  ];
}

export function getWayfindingSteps() {
  return [
    {
      title: "Cổng an ninh & Barrier phía Nam",
      tag: "Tầng trệt",
      text: "Quét mã PIN cá nhân #4829 hoặc dùng ứng dụng VaultSpace để mở cổng tự động 24/7.",
    },
    {
      title: "Bến bốc dỡ hàng tập trung (Dock số 2)",
      tag: "Miễn phí 45 phút",
      text: "Lùi xe vào khoang bốc dỡ có mái che, sàn bằng phẳng phù hợp xe tải nhỏ và SUV.",
    },
    {
      title: "Lấy xe đẩy & Đi thang máy công nghiệp số 2",
      tag: "Tải trọng 3.000kg",
      text: "Lấy xe đẩy 4 bánh tại sảnh thang. Chạm thẻ hoặc mã PIN để kích hoạt thang 2 Lầu.",
    },
    {
      title: "Đến cửa Kho #B-204 (Đích đến)",
      tag: "15 mét rẽ phải",
      text: "Rời thang máy, rẽ phải vào Hành lang Đông B-East. Kho #B-204 ở vị trí thứ 2 bên trái.",
    },
  ];
}

export function getFacilityAmenities() {
  return [
    {
      icon: "local_shipping",
      title: "Bãi đỗ xe tải dỡ hàng",
      text: "4 bến đỗ có mái che, trần cao 4.2m phù hợp xe tải 2.5 tấn.",
    },
    {
      icon: "elevator",
      title: "Thang máy tải hàng siêu trọng",
      text: "Lồng 2.4m x 2.8m, tải trọng tối đa 3.000 kg, chứa vừa pallet hàng lớn.",
    },
    {
      icon: "forklift",
      title: "Xe nâng pallet & Xe đẩy 4 bánh",
      text: "Trang bị sẵn tại sảnh thang và bãi đỗ hàng, sử dụng miễn phí.",
    },
    {
      icon: "schedule",
      title: "Thời gian ra vào & Trực ban",
      text: "Cổng mở 24/7 qua mã PIN. Nhân viên trực từ 07:00 đến 20:00 hàng ngày.",
    },
  ];
}

export function getFacilityMapTrustBadges() {
  return [
    { icon: "verified", title: "ISO 27001", text: "An ninh thông tin đạt chuẩn" },
    { icon: "lock", title: "SSL 256-Bit", text: "Mã hóa thanh toán ngân hàng" },
    { icon: "videocam", title: "CCTV 24/7", text: "Giám sát liên tục mọi hành lang" },
    { icon: "health_and_safety", title: "Bảo hiểm toàn diện", text: "Bảo vệ tài sản rủi ro tối đa" },
  ];
}
