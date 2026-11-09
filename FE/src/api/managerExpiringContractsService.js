import apiClient from "./apiClient";

export const managerExpiringContractsService = {
  /**
   * GET /api/manager/agreements/expiring-cases
   * Danh sách hợp đồng sắp / đã hết hạn hoặc có yêu cầu trả kho
   */
  async getExpiringCases(params = {}) {
    const res = await apiClient.get("/manager/agreements/expiring-cases", { params });
    if (res?.success === true) {
      const data = res.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.items)) return data.items;
      return [];
    }
    return [];
  },

  /**
   * POST /api/manager/agreements/{id}/assign-inspection
   * Phân công kiểm tra kho cho Staff cùng cơ sở
   * @param {string|number} agreementId
   * @param {{ staffId: number, notes?: string }} payload
   */
  async assignInspection(agreementId, payload) {
    if (!agreementId) {
      throw new Error("Mã hợp đồng là bắt buộc để phân công kiểm tra kho.");
    }
    if (!payload?.staffId) {
      throw new Error("Vui lòng chọn nhân viên (Staff) để nghiệm thu kho.");
    }

    const targetStaffId = Number(payload.employeeId || payload.staffId);
    const body = {
      employeeId: targetStaffId,
      staffId: targetStaffId,
      assignedEmployeeId: targetStaffId,
      assignedStaffId: targetStaffId,
      notes: payload.notes?.trim() || "",
    };

    const res = await apiClient.post(
      `/manager/agreements/${encodeURIComponent(agreementId)}/assign-inspection`,
      body
    );
    if (res?.success === true) return res.data;
    return res;
  },
};

export default managerExpiringContractsService;
