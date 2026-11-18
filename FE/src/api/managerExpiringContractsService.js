import managerDelinquencyApi from "../services/api/managerDelinquencyApi";

export const managerExpiringContractsService = {
  async getExpiringCases(params = {}) {
    const facilityId = params?.facilityId;
    if (!facilityId) return [];
    const data = await managerDelinquencyApi.getExpiringCases(facilityId);
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    return [];
  },

  async assignInspection(agreementId, payload) {
    if (!agreementId) {
      throw new Error("Mã hợp đồng là bắt buộc để phân công kiểm tra kho.");
    }
    const targetStaffId = Number(payload?.employeeId || payload?.staffId);
    if (!targetStaffId) {
      throw new Error("Vui lòng chọn nhân viên (Staff) để nghiệm thu kho.");
    }
    return managerDelinquencyApi.assignInspection(agreementId, {
      employeeId: targetStaffId,
      scheduledAt: payload?.scheduledAt,
      notes: payload?.notes?.trim() || "",
    });
  },
};

export default managerExpiringContractsService;
