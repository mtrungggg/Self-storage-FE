import apiClient from "./apiClient";

/**
 * Chuẩn hóa giá trị status và progressPercent theo đúng ràng buộc DB của bảng staff_tasks:
 * - status IN ('todo', 'in_progress', 'blocked', 'done', 'cancelled')
 * - CHECK ((status = 'done' AND progress_percent = 100) OR status <> 'done')
 */
function normalizeTaskStatusPayload(status, progressPercent) {
  const raw = (status || "").trim().toLowerCase().replace(/\s+/g, "_");
  if (raw === "completed" || raw === "done") {
    return {
      status: "done",
      progressPercent: 100,
    };
  }
  if (raw === "in_progress") {
    const pct =
      progressPercent !== undefined && progressPercent !== null
        ? Math.min(99, Math.max(1, Number(progressPercent)))
        : 50;
    return {
      status: "in_progress",
      progressPercent: pct,
    };
  }
  if (raw === "blocked") {
    const pct =
      progressPercent !== undefined && progressPercent !== null
        ? Math.min(99, Math.max(0, Number(progressPercent)))
        : 0;
    return {
      status: "blocked",
      progressPercent: pct,
    };
  }
  return {
    status: raw || "todo",
    progressPercent: progressPercent ?? 0,
  };
}

export const staffService = {
  /**
   * Lấy danh sách nhiệm vụ trong ca trực tại cơ sở phân công
   * (Lịch check-in nhận kho, lịch kiểm tra trả kho, ticket cần xử lý, nhiệm vụ vệ sinh/bảo trì)
   * GET /api/staff/tasks
   * @param {{ facilityId?: number }} [params]
   */
  async getStaffTasks(params = {}) {
    const queryParams = {};
    if (params.facilityId) {
      queryParams.facilityId = params.facilityId;
    }
    const res = await apiClient.get("/staff/tasks", { params: queryParams });
    return res?.data ?? [];
  },

  /**
   * Cập nhật tiến độ nhiệm vụ (In Progress, Completed, Blocked)
   * PUT /api/staff/tasks/{id}/status
   * @param {number|string} taskId
   * @param {{ status: string, progressPercent?: number }} data
   */
  async updateTaskStatus(taskId, data) {
    const payload = normalizeTaskStatusPayload(data?.status, data?.progressPercent);
    const res = await apiClient.put(`/staff/tasks/${taskId}/status`, payload);
    return res?.data ?? null;
  },
};

export default staffService;
