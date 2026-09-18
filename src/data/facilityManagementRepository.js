// Data layer: content source for the Admin Facility & Unit Management page.
export function getStatusBanner() {
  return { label: "Hạ tầng kho thực tế", detail: "Mesh Gateway hoạt động" };
}

export function getOverviewHeader() {
  return { title: "Quản trị Căn kho & Mặt bằng Hub #04 Metro" };
}

export function getHeaderActions() {
  return [
    { id: "map", icon: "map", label: "Bản đồ số 2D/3D" },
    { id: "import", icon: "upload_file", label: "Nhập Excel" },
    { id: "new_unit", icon: "add", label: "Thêm căn kho mới" },
  ];
}

export function getKpis() {
  return [
    { id: "total", icon: "warehouse", label: "Tổng số kho Hub #04", value: "120", sub: "Diện tích: 4.850 m²" },
    { id: "occupied", icon: "check_circle", label: "Đang cho thuê", value: "92", trend: "76.7%", sub: "" },
    { id: "available", icon: "lock_open", label: "Sẵn sàng đón khách", value: "18", sub: "Đang niêm yết cho thuê" },
    { id: "pending", icon: "assignment", label: "Chờ bàn giao", value: "6", sub: "Check-in trong 48h tới" },
    { id: "maintenance", icon: "warning", label: "Bảo trì / Cần khắc phục", value: "4", sub: "Pin Latch yếu • Cảm biến lỗi", alert: true },
  ];
}

export function getFilters() {
  return {
    floors: [
      { id: "all", label: "Tất cả các tầng (G & M)" },
      { id: "floor1", label: "Tầng 1 (Trệt)" },
      { id: "floor2", label: "Tầng 2 (Lửng)" },
    ],
    zones: [
      { id: "all", label: "Tất cả phân khu (A, B, C, D)" },
      { id: "A", label: "Khu A - Tiêu chuẩn" },
      { id: "B", label: "Khu B - Máy lạnh" },
      { id: "C", label: "Khu C - Mini Box" },
      { id: "D", label: "Khu D - Garage & Drive-up" },
    ],
    sizes: [
      { id: "all", label: "Tất cả kích cỡ" },
      { id: "small", label: "5'x5' - 5'x10'" },
      { id: "medium", label: "10'x15' - 10'x20'" },
      { id: "large", label: "10'x30'" },
    ],
    statuses: [
      { id: "all", label: "Tất cả tình trạng (120)" },
      { id: "occupied", label: "Đang cho thuê" },
      { id: "available", label: "Đang trống" },
      { id: "pending", label: "Chờ bàn giao" },
      { id: "alert", label: "Cảnh báo kỹ thuật" },
    ],
  };
}

export function getUnits() {
  return [
    {
      id: "B-204",
      floor: "floor2",
      zone: "B",
      size: "medium",
      sizeLabel: "10'x15' (14m²)",
      locationLabel: "Tầng 2 (Lửng) • Khu B - Điều hòa",
      tenant: "Công ty TNHH LogicTech VN",
      contract: "HĐ: HD-2023-9941",
      status: "occupied",
      statusNote: null,
      price: "3,450,000 đ/tháng",
      sensor: "21.4°C • 52%",
    },
    {
      id: "A-101",
      floor: "floor1",
      zone: "A",
      size: "small",
      sizeLabel: "5'x10' (4.6m²)",
      locationLabel: "Tầng 1 (Trệt) • Khu A - Tiêu chuẩn",
      tenant: null,
      contract: null,
      status: "available",
      statusNote: "Đang trống • Sẵn sàng đón khách",
      price: "1,250,000 đ/tháng",
      sensor: "28.1°C • 58%",
    },
    {
      id: "C-301",
      floor: "floor1",
      zone: "C",
      size: "small",
      sizeLabel: "5'x5' (2.3m²)",
      locationLabel: "Tầng 1 (Trệt) • Khu C - Mini Box",
      tenant: "Bà Nguyễn Mai Anh",
      contract: "HĐ: HD-2024-0112",
      status: "occupied",
      statusNote: null,
      price: "750,000 đ/tháng",
      sensor: "26.0°C • 60%",
    },
    {
      id: "D-112",
      floor: "floor1",
      zone: "D",
      size: "large",
      sizeLabel: "10'x30' (28m²)",
      locationLabel: "Tầng 1 (Trệt) • Khu D - Garage & Kho hàng lớn",
      tenant: "Chuỗi Nhà hàng RedSun",
      contract: null,
      status: "alert",
      statusNote: "Cảnh báo: Pin khóa <12%",
      price: "6,200,000 đ/tháng",
      sensor: "31.5°C • 69%",
    },
    {
      id: "B-108",
      floor: "floor1",
      zone: "B",
      size: "medium",
      sizeLabel: "10'x20' (18.5m²)",
      locationLabel: "Tầng 1 (Trệt) • Khu B - Mặt bằng thương phẩm",
      tenant: "Dược phẩm Minh Châu",
      contract: null,
      status: "pending",
      statusNote: "Nhận bàn giao: 08:30 ngày mai",
      price: "4,900,000 đ/tháng",
      sensor: "22.0°C • 50%",
    },
  ];
}

export function getUnitDetails() {
  return {
    "B-204": {
      unit: "B-204",
      statusLabel: "Đang thuê",
      locationLabel: "Khu B Máy lạnh • Tầng 2 Lửng • Cửa cuốn tự động",
      camera: "Camera góc hành lang Hub04-Cam-14",
      lock: { name: "Latch BLE Pro", status: "Đang hoạt động", battery: "92%", signal: "-58dBm", firmware: "v2.1.4" },
      climate: { unit: "AHU-02", target: "22°C", temp: "21.4°C", humidity: "52% RH", note: "Bộ lọc HEPA đã kiểm tra 12 ngày trước • Đạt chuẩn" },
      accessLog: [
        { name: "Lê Quốc Tuấn", role: "Kỹ thuật viên", method: "Thẻ BLE Master #TL-88", time: "14:22 Hôm nay" },
        { name: "Nguyễn Văn Đạt", role: "Đại diện LogicTech", method: "VaultSpace Mobile App", time: "09:16 Hôm nay" },
        { name: "Mã PIN một lần (OTP giao hàng)", role: "GrabExpress Pro", method: "OTP", time: "16:40 Hôm qua" },
      ],
    },
  };
}
