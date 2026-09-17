// Data layer: content source for the Staff Dashboard page.
export function getStaffProfile() {
  return {
    name: "Trần Minh Quân",
    role: "Kỹ thuật viên trưởng ca 1",
    shift: "06:00 - 14:00",
    facility: "An Phú Central",
  };
}

export function getFacilityStats() {
  return [
    { id: "units", label: "Khoang đang quản lý", value: "128 kho", icon: "warehouse", note: "112 đang hoạt động" },
    { id: "tickets", label: "Yêu cầu hỗ trợ hôm nay", value: "9 yêu cầu", icon: "support_agent", note: "3 đang chờ xử lý" },
    { id: "patrol", label: "Tuần tra an ninh", value: "Đúng lịch", icon: "shield", note: "Lượt gần nhất: 08:40" },
    { id: "sla", label: "Tỉ lệ tuân thủ SLA", value: "97.5%", icon: "verified", note: "Mục tiêu: ≥ 95%" },
  ];
}

export function getTicketTabs() {
  return [
    { id: "all", label: "Tất cả (3)" },
    { id: "pending", label: "Đang chờ (1)" },
    { id: "in_progress", label: "Đang xử lý (1)" },
    { id: "resolved", label: "Đã xử lý (1)" },
  ];
}

export function getAssignedTickets() {
  return [
    {
      id: "#TK-8942",
      status: "pending",
      statusLabel: "Đang chờ xử lý",
      title: "Lỗi mã PIN bàn phím cơ khí #A-102 không nhận lệnh",
      unit: "#A-102 (Tầng 1)",
      time: "14:15 hôm nay",
      priority: "Khẩn cấp",
    },
    {
      id: "#TK-8891",
      status: "in_progress",
      statusLabel: "Đang xử lý",
      title: "Cửa cuốn kho #D-118 bị rít khi mở và đèn cảm ứng chớp chờn",
      unit: "#D-118 (Garage ngoài trời)",
      time: "09:30 hôm qua",
      priority: "Ưu tiên cao",
    },
    {
      id: "#TK-8720",
      status: "resolved",
      statusLabel: "Đã xử lý",
      title: "Cấp lại hóa đơn GTGT điện tử tháng 10/2025",
      unit: "#B-204",
      time: "20/10/2025",
      priority: "Bình thường",
    },
  ];
}

export function getShiftSchedule() {
  return [
    { time: "06:00 - 08:00", task: "Tuần tra an ninh vòng ngoài & kiểm tra camera" },
    { time: "08:00 - 12:00", task: "Xử lý yêu cầu hỗ trợ kỹ thuật khách thuê" },
    { time: "12:00 - 13:00", task: "Nghỉ trưa / bàn giao ca tạm thời" },
    { time: "13:00 - 14:00", task: "Báo cáo cuối ca & bàn giao ca chiều" },
  ];
}
