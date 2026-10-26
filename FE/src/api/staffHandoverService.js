import apiClient from "./apiClient";

const staffHandoverService = {
  /**
   * STT 1: Kiểm tra hiện trạng ô kho khi bàn giao hoặc trả kho
   * POST /api/staff/handovers/units/{unitId}/check
   * @param {number|string} unitId
   * @param {object} payload
   */
  async checkUnit(unitId, payload = {}) {
    const response = await apiClient.post(`/staff/handovers/units/${encodeURIComponent(unitId)}/check`, payload);
    if (response?.success !== true) {
      throw new Error(response?.message || response?.errors?.join(", ") || "Unable to check unit handover condition.");
    }
    return response.data;
  },

  /**
   * STT 2: Lập biên bản sự cố và đề xuất phụ phí hư hại kèm ảnh
   * POST /api/staff/handovers/incident-fee
   * @param {{ agreementId?: number, unitId?: number, amount: number, reason: string, description?: string, photoUrl?: string }} payload
   */
  async reportIncidentFee(payload) {
    const response = await apiClient.post("/staff/handovers/incident-fee", payload);
    if (response?.success !== true) {
      throw new Error(response?.message || response?.errors?.join(", ") || "Unable to submit handover incident fee.");
    }
    return response.data;
  },
};

export default staffHandoverService;
