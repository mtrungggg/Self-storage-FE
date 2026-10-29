import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Formats a numeric VND amount consistently across all manager pages (e.g. 21000 -> "21,000 ₫")
export function formatVnd(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return "—";
  return `${Number(amount).toLocaleString("en-US")} ₫`;
}

// Canonical status dictionary mapping Vietnamese or snake_case status strings to clean English labels
const STATUS_DICTIONARY = Object.freeze({
  // Unit & Inventory Statuses
  "available": "Available",
  "sẵn sàng": "Available",
  "trống": "Available",
  "occupied": "Occupied",
  "đang thuê": "Occupied",
  "reserved": "Reserved",
  "đã đặt": "Reserved",
  "đã đặt trước": "Reserved",
  "giữ chỗ": "Reserved",
  "maintenance": "Maintenance",
  "bảo trì": "Maintenance",
  "under_inspection": "Under Inspection",
  "pending_inspection": "Under Inspection",
  "chờ kiểm tra": "Under Inspection",
  "out_of_service": "Out of Service",
  "ngừng hoạt động": "Out of Service",
  "blocked": "Blocked",
  "khoá": "Blocked",
  "khóa": "Blocked",

  // Approval & Decision Statuses
  "pending": "Pending",
  "chờ duyệt": "Pending",
  "chờ xử lý": "Pending",
  "approved": "Approved",
  "đã duyệt": "Approved",
  "rejected": "Rejected",
  "từ chối": "Rejected",

  // Agreement & Rental Statuses
  "active": "Active",
  "đang hiệu lực": "Active",
  "overdue": "Overdue",
  "quá hạn": "Overdue",
  "terminated": "Terminated",
  "đã kết thúc": "Terminated",
  "completed": "Completed",
  "hoàn thành": "Completed",
  "cancelled": "Cancelled",
  "hủy": "Cancelled",
  "draft": "Draft",

  // Delinquency Statuses
  "grace": "Grace Period",
  "trong hạn ân hạn": "Grace Period",
  "delinquent": "Delinquent",
  "cured": "Cured / Settled",
  "đã khắc phục": "Cured / Settled",
  "waived": "Waived",
  "đã miễn giảm": "Waived",
  "termination_started": "Termination Started",
});

export function formatStatusToEnglish(status) {
  if (!status) return "—";
  const normalized = String(status).trim().toLowerCase();
  if (STATUS_DICTIONARY[normalized]) {
    return STATUS_DICTIONARY[normalized];
  }
  // Fallback: convert snake_case or hyphen-case to Title Case
  return normalized
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default cn;
