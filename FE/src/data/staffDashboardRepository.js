// Data layer: content source for the Staff Dashboard (Facility Operations) page.
export function getStaffProfile() {
  return {
    name: "Nguyễn Thành Long",
    code: "#STAFF-409",
    role: "Trưởng ca",
    facility: "Hub #04 Downtown Metro",
  };
}

export function getNavTabs() {
  return [
    { id: "map", label: "Sơ đồ & Trạng thái kho" },
    { id: "handover", label: "Bàn giao & Tác vụ", count: 11 },
    { id: "iot", label: "Báo cáo IoT", count: 3 },
    { id: "logs", label: "Nhật ký lưu kho" },
  ];
}

export function getKpis() {
  return [
    { id: "total", icon: "warehouse", label: "Tổng kho", value: "120", sub: "92 đang thuê • 76.7% lấp đầy" },
    { id: "pending", icon: "vpn_key", label: "Chờ bàn giao", value: "6", sub: "1 trễ lịch • 8 lịch nhận hôm nay" },
    { id: "return", icon: "assignment_return", label: "Trả & kiểm kho", value: "3", sub: "2 đã tất toán • 1 cần đối chiếu" },
    { id: "iot", icon: "warning", label: "Cảnh báo IoT", value: "3", sub: "1 pin thấp • 1 lỗi cảm biến" },
  ];
}

export function getZones() {
  return [
    { id: "all", label: "Tất cả" },
    { id: "A", label: "Khu A" },
    { id: "B", label: "Khu B - Lạnh" },
    { id: "C", label: "Khu C - Mini" },
    { id: "D", label: "Khu D - Ngoài trời" },
  ];
}

export function getFloors() {
  return [
    { id: "floor1", label: "Tầng 1 (Trệt)" },
    { id: "floor2", label: "Tầng 2 (Lửng)" },
  ];
}

export function getUnits() {
  return [
    { id: "A-101", zone: "A", floor: "floor1", size: "5'x5'", status: "available", note: "Khóa 99%" },
    { id: "A-102", zone: "A", floor: "floor1", size: "5'x10'", status: "available", note: "Khóa 95%" },
    { id: "A-103", zone: "A", floor: "floor1", size: "10'x10'", status: "alert", note: "Vệ sinh" },
    { id: "A-104", zone: "A", floor: "floor1", size: "10'x10'", status: "occupied", note: "Pin 93%" },
    { id: "A-105", zone: "A", floor: "floor1", size: "10'x15'", status: "occupied", note: "Nhận 09:42" },
    { id: "B-201", zone: "B", floor: "floor1", size: "5'x10'", status: "available", note: "22°C · 48%" },
    { id: "B-202", zone: "B", floor: "floor1", size: "10'x10'", status: "occupied", note: "21°C" },
    { id: "B-203", zone: "B", floor: "floor1", size: "10'x15'", status: "occupied", note: "22°C" },
    { id: "B-204", zone: "B", floor: "floor1", size: "5'x10'", status: "handover", note: "Alex Morgan" },
    { id: "B-205", zone: "B", floor: "floor1", size: "10'x20'", status: "occupied", note: "22°C" },
    { id: "B-206", zone: "B", floor: "floor1", size: "10'x20'", status: "occupied", note: "22°C" },
    { id: "B-210", zone: "B", floor: "floor1", size: "10'x20'", status: "alert", note: "Xe 15:00" },
    { id: "C-301", zone: "C", floor: "floor2", size: "5'x5'", status: "occupied", note: "Mini Box" },
    { id: "C-302", zone: "C", floor: "floor2", size: "5'x5'", status: "occupied", note: "Mini Box" },
    { id: "D-112", zone: "D", floor: "floor1", size: "10'x30'", status: "alert", note: "Hẹn 13:30" },
    { id: "D-118", zone: "D", floor: "floor1", size: "10'x25'", status: "occupied", note: "Cần kiểm tra" },
  ];
}

export function getLegend() {
  return [
    { id: "available", label: "Sẵn sàng", color: "#2dd4a0" },
    { id: "occupied", label: "Đang thuê", color: "#1d5fe5" },
    { id: "handover", label: "Chờ bàn giao", color: "#f5a524" },
    { id: "alert", label: "Cần rà soát", color: "#e5484d" },
  ];
}

export function getHandover() {
  return {
    unit: "B-204",
    code: "#BK-9821",
    customer: "Alex Morgan",
    size: "5'x10' · 22°C · 48% RH",
    deposit: "2,580,000 đ",
    payment: "Visa ****8892",
    pin: "849201#",
    battery: "94%",
    checklist: [
      { id: "kit", label: "MasterLock + 5 thùng carton" },
      { id: "insurance", label: "Gói bảo hiểm VaultGuard 500K" },
    ],
    handoffNote: "Ca chiều 15:00: KTV Vũ Văn Sơn (#412) tiếp nhận",
  };
}

export function getScheduleTabs() {
  return [
    { id: "checkin", label: "Nhận kho", count: 8 },
    { id: "checkout", label: "Trả kho", count: 3 },
    { id: "maintenance", label: "Bảo trì", count: 3 },
  ];
}

export function getScheduleItems() {
  return [
    { id: "BK-9821", type: "checkin", name: "Alex Morgan", status: "Đang tới", unit: "B-204 · 5'x10' Lạnh", time: "11:00 (sớm 15p)", action: "Bàn giao ngay" },
    { id: "BB-4421", type: "checkout", name: "Trần Thị Bích", status: "Hoàn tất 09:42", unit: "A-105 · 10'x15'", time: "Đã xong", action: "Xem biên bản" },
    { id: "BK-9825", type: "checkin", name: "Lê Hoàng Nam", status: "Dự kiến 13:30", unit: "D-112 · 10'x30'", time: "13:30", action: "Chi tiết" },
    { id: "BK-9818", type: "maintenance", name: "Cty FastTrack", status: "Chờ xe 15:00", unit: "D-210 · 10'x20'", time: "15:00", action: "Xếp bến Dock" },
  ];
}
