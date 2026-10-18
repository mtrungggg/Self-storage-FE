/**
 * Constants strictly aligned with database CHECK constraints & BE domain constants.
 * DB Constraints:
 * - duty_role IN ('staff', 'shift_lead', 'manager_on_call')
 * - task_type IN ('check_in', 'check_out', 'inspection', 'maintenance', 'support', 'other')
 * - status IN ('todo', 'in_progress', 'blocked', 'done', 'cancelled')
 */

export const DUTY_ROLES = [
  { value: "staff", label: "Nhân viên trực ca (staff)" },
  { value: "shift_lead", label: "Trưởng ca trực (shift_lead)" },
  { value: "manager_on_call", label: "Quản lý trực ca (manager_on_call)" },
];

export const STAFF_TASK_TYPES = [
  { value: "other", label: "Công việc chung / Khác (other)" },
  { value: "maintenance", label: "Bảo trì ô kho (maintenance)" },
  { value: "inspection", label: "Kiểm tra cơ sở (inspection)" },
  { value: "support", label: "Hỗ trợ khách hàng (support)" },
  { value: "check_in", label: "Thủ tục nhận kho (check_in)" },
  { value: "check_out", label: "Thủ tục trả kho (check_out)" },
];

export const STAFF_TASK_STATUSES = [
  { value: "todo", label: "Cần làm" },
  { value: "in_progress", label: "Đang thực hiện" },
  { value: "blocked", label: "Bị chặn" },
  { value: "done", label: "Hoàn thành" },
];

export const UNIT_PHYSICAL_STATUS_OPTIONS = [
  ["available", "Sẵn sàng"],
  ["reserved", "Đã đặt trước"],
  ["occupied", "Đang thuê"],
  ["maintenance", "Bảo trì"],
  ["blocked", "Khoá"],
];

export const DELINQUENT_ACTION_TYPES = [
  ["reminder_call", "Gọi nhắc nợ"],
  ["warning_letter", "Gửi thư cảnh báo"],
  ["payment_plan", "Lập kế hoạch trả nợ"],
  ["lock_access", "Khoá quyền truy cập ô kho"],
  ["escalate", "Chuyển xử lý pháp lý"],
];

export const DECISION_STATUS = {
  APPROVED: "approved",
  REJECTED: "rejected",
  PENDING: "pending",
};
