// Data layer: content source for the FacilityMap page.
export function getFloors() {
  return [
    { id: "floor1", label: "Tầng 1 • Trệt & Drive-up" },
    { id: "floor2", label: "Tầng 2 • Điều hòa nhiệt độ" },
    { id: "yard", label: "Bãi ngoài trời" },
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

export function getWayfindingSteps(unitCode = "A-101") {
  return [
    {
      title: "Cổng an ninh cơ sở",
      tag: "Tầng trệt",
      text: "Quét mã PIN hoặc dùng ứng dụng để mở barrier tự động 24/7.",
    },
    {
      title: "Bến bốc dỡ hàng (Dock 1)",
      tag: "Miễn phí 45p",
      text: "Lùi xe vào khoang dỡ có mái che, sàn phẳng thuận tiện chuyển đồ.",
    },
    {
      title: "Hành lang Khoang Zone A",
      tag: "Tầng 1",
      text: "Xe đẩy sẵn có tại sảnh. Đi thẳng theo biển chỉ dẫn vào dãy kho.",
    },
    {
      title: `Đến kho #${unitCode}`,
      tag: "Dãy A",
      text: `Đi vào Hành lang Zone A. Kho #${unitCode} nằm ở vị trí thuận tiện gần lối đi chính.`,
    },
  ];
}

export function getFacilityAmenities() {
  return [
    {
      icon: "local_shipping",
      title: "Bến dỡ xe tải",
      text: "4 bến có mái che, phù hợp xe tải đến 2.5 tấn.",
    },
    {
      icon: "elevator",
      title: "Thang máy chở hàng",
      text: "Tải trọng 3.000 kg, chứa vừa pallet hàng lớn.",
    },
    {
      icon: "forklift",
      title: "Xe đẩy & Xe nâng",
      text: "Sẵn có tại sảnh thang và bến bốc dỡ, sử dụng miễn phí.",
    },
    {
      icon: "schedule",
      title: "Thời gian ra vào",
      text: "Cổng mở 24/7 qua mã PIN. Nhân viên hỗ trợ 07:00 – 20:00.",
    },
  ];
}
