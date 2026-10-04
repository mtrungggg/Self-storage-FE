import { normalizeTaskCategory } from "../domain/usecases/filterScheduleByType";

// Data layer: pure metadata & status helpers for the Staff Dashboard page (no hardcoded mock data).
export function getNavTabs({ pendingTaskCount = 0, openTicketCount = 0 } = {}) {
  return [
    { id: "map", label: "Sơ đồ & Trạng thái kho" },
    { id: "handover", label: "Bàn giao & Tác vụ", count: pendingTaskCount },
    { id: "tickets", label: "Ticket cơ sở", count: openTicketCount },
  ];
}

export function getLegend() {
  return [
    { id: "available", label: "Sẵn sàng", color: "#2dd4a0" },
    { id: "occupied", label: "Đang thuê", color: "#1d5fe5" },
    { id: "handover", label: "Đặt giữ chỗ", color: "#f5a524" },
    { id: "alert", label: "Bảo trì / Rà soát", color: "#e5484d" },
  ];
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
