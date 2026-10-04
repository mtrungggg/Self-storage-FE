import { normalizeTaskCategory } from "../domain/usecases/filterScheduleByType";

// Data layer: content source & metadata helpers for the Staff Dashboard (Facility Operations) page.
export function getStaffProfile() {
  return {
    name: "Nguyễn Thành Long",
    code: "#STAFF-409",
    role: "Trưởng ca",
    facility: "Hub #04 Downtown Metro",
  };
}

export function getNavTabs(activeTaskCount = 11) {
  return [
    { id: "map", label: "Sơ đồ & Trạng thái kho" },
    { id: "handover", label: "Bàn giao & Tác vụ", count: activeTaskCount },
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

export function getTaskTypeMeta(taskType) {
  const t = (taskType || "").toLowerCase();
  switch (t) {
    case "check_in":
    case "checkin":
      return {
        category: "checkin",
        label: "Check-in nhận kho",
        icon: "vpn_key",
        badgeClass: "bg-[#eef4ff] text-[#1d5fe5]",
      };
    case "check_out":
    case "checkout":
      return {
        category: "checkout",
        label: "Trả kho",
        icon: "assignment_return",
        badgeClass: "bg-[#fef3c7] text-[#b45309]",
      };
    case "inspection":
      return {
        category: "checkout",
        label: "Kiểm tra trả kho",
        icon: "fact_check",
        badgeClass: "bg-[#fef3c7] text-[#b45309]",
      };
    case "support":
      return {
        category: "support",
        label: "Ticket hỗ trợ",
        icon: "support_agent",
        badgeClass: "bg-[#fdecec] text-[#c0362c]",
      };
    case "maintenance":
      return {
        category: "maintenance",
        label: "Vệ sinh / Bảo trì",
        icon: "build",
        badgeClass: "bg-[#f3e8ff] text-[#7e22ce]",
      };
    default:
      return {
        category: "maintenance",
        label: "Nhiệm vụ khác",
        icon: "task",
        badgeClass: "bg-[#f1f5f9] text-[#475569]",
      };
  }
}

export function getTaskStatusMeta(status) {
  const s = (status || "").toLowerCase();
  if (s === "in_progress" || s === "in progress") {
    return {
      key: "in_progress",
      displayLabel: "In Progress",
      viLabel: "Đang thực hiện",
      badgeClass: "bg-[#eef4ff] text-[#1d5fe5]",
    };
  }
  if (s === "done" || s === "completed") {
    return {
      key: "done",
      displayLabel: "Completed",
      viLabel: "Đã hoàn tất",
      badgeClass: "bg-[#e7f8ee] text-[#0e7b4c]",
    };
  }
  if (s === "blocked") {
    return {
      key: "blocked",
      displayLabel: "Blocked",
      viLabel: "Bị chặn / Tạm hoãn",
      badgeClass: "bg-[#fdecec] text-[#c0362c]",
    };
  }
  if (s === "cancelled") {
    return {
      key: "cancelled",
      displayLabel: "Cancelled",
      viLabel: "Đã hủy",
      badgeClass: "bg-[#e2e8f0] text-[#475569]",
    };
  }
  return {
    key: "todo",
    displayLabel: "Todo",
    viLabel: "Chờ thực hiện",
    badgeClass: "bg-[#fff2d8] text-[#a15c00]",
  };
}

export function getScheduleTabs(tasks = []) {
  const countByCat = (cat) =>
    tasks.filter((item) => normalizeTaskCategory(item.taskType || item.type) === cat).length;

  return [
    { id: "all", label: "Tất cả", count: tasks.length },
    { id: "checkin", label: "Check-in nhận kho", count: countByCat("checkin") },
    { id: "checkout", label: "Kiểm tra trả kho", count: countByCat("checkout") },
    { id: "support", label: "Ticket cần xử lý", count: countByCat("support") },
    { id: "maintenance", label: "Vệ sinh / Bảo trì", count: countByCat("maintenance") },
  ];
}

export function getScheduleItems() {
  return [
    {
      id: 9821,
      taskType: "check_in",
      title: "Check-in bàn giao kho #B-204 cho KH Alex Morgan",
      facilityCode: "FAC-01",
      assignedEmployeeName: "Nguyễn Thành Long",
      status: "in_progress",
      progressPercent: 50,
      dueAt: new Date().toISOString(),
    },
    {
      id: 4421,
      taskType: "inspection",
      title: "Kiểm tra hiện trạng trả kho #A-105 (Trần Thị Bích)",
      facilityCode: "FAC-01",
      assignedEmployeeName: "Nguyễn Thành Long",
      status: "done",
      progressPercent: 100,
      dueAt: new Date().toISOString(),
    },
    {
      id: 8942,
      taskType: "support",
      title: "Xử lý Ticket lỗi bàn phím mã PIN kho #A-102",
      facilityCode: "FAC-01",
      assignedEmployeeName: "Trần Minh Quân",
      status: "todo",
      progressPercent: 0,
      dueAt: new Date().toISOString(),
    },
    {
      id: 9818,
      taskType: "maintenance",
      title: "Vệ sinh & bảo dưỡng định kỳ hệ thống hút ẩm Khu B",
      facilityCode: "FAC-01",
      assignedEmployeeName: "Vũ Văn Sơn",
      status: "blocked",
      progressPercent: 20,
      dueAt: new Date().toISOString(),
    },
  ];
}
