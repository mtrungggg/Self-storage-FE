import apiClient from "./apiClient";

// Service layer: wraps the backend "Manager" API group (facility-scoped operations console).
export const managerService = {
  // STT 11: GET /api/manager/facilities/{facilityId}/dashboard
  // Bảng điều khiển thống kê tỷ lệ lấp đầy, doanh thu cơ sở
  async getDashboard(facilityId, params = {}) {
    const res = await apiClient.get(`/manager/facilities/${encodeURIComponent(facilityId)}/dashboard`, { params });
    return res?.data ?? null;
  },

  // STT 12: GET /api/manager/facilities/{facilityId}/agreements
  // Quản lý danh sách hợp đồng thuê tại cơ sở
  async getAgreements(facilityId, params = {}) {
    const res = await apiClient.get(`/manager/facilities/${encodeURIComponent(facilityId)}/agreements`, { params });
    return res?.data ?? null;
  },
  async getAgreementDetail(agreementId) {
    const res = await apiClient.get(`/manager/agreements/${encodeURIComponent(agreementId)}`);
    return res?.data ?? null;
  },

  // STT 13: GET /api/manager/facilities/{facilityId}/units
  // Danh mục thông số kỹ thuật ô kho
  async getUnits(facilityId, params = {}) {
    const res = await apiClient.get(`/manager/facilities/${encodeURIComponent(facilityId)}/units`, { params });
    return res?.data ?? null;
  },

  // STT 14: POST /api/manager/facilities/{facilityId}/units
  // Khởi tạo ô kho mới tại cơ sở
  async createUnit(facilityId, payload) {
    const res = await apiClient.post(`/manager/facilities/${encodeURIComponent(facilityId)}/units`, payload);
    return res?.data ?? null;
  },

  // STT 15: PUT /api/manager/units/{unitId}
  // Cập nhật thông số kỹ thuật ô kho
  async updateUnit(unitId, payload) {
    const res = await apiClient.put(`/manager/units/${encodeURIComponent(unitId)}`, payload);
    return res?.data ?? null;
  },

  // STT 16: GET /api/manager/facilities/{facilityId}/map-layout
  // Lấy dữ liệu sơ đồ bản đồ kho
  async getMapLayout(facilityId) {
    const res = await apiClient.get(`/manager/facilities/${encodeURIComponent(facilityId)}/map-layout`);
    return res?.data ?? null;
  },

  // STT 17: PUT /api/manager/facilities/{facilityId}/map-layout
  // Cập nhật tọa độ sơ đồ kho
  async updateMapLayout(facilityId, payloadOrPositions) {
    const payload = Array.isArray(payloadOrPositions) ? { positions: payloadOrPositions } : payloadOrPositions;
    const res = await apiClient.put(`/manager/facilities/${encodeURIComponent(facilityId)}/map-layout`, payload);
    return res?.data ?? null;
  },

  // STT 18: GET /api/manager/facilities/{facilityId}/transfer-requests
  // Danh sách yêu cầu chuyển kho liên cơ sở (nguồn & đích)
  async getTransferRequests(facilityId, params = {}) {
    const res = await apiClient.get(`/manager/facilities/${encodeURIComponent(facilityId)}/transfer-requests`, { params });
    return res?.data ?? [];
  },
  /** @param {{ decision: string, targetUnitId?: number, reviewNotes?: string }} payload */
  async decideTransferRequest(id, payload) {
    const res = await apiClient.put(`/manager/transfer-requests/${encodeURIComponent(id)}/decide`, payload);
    return res?.data ?? null;
  },

  // STT 19: GET /api/manager/facilities/{facilityId}/staff
  // Danh sách nhân viên trực thuộc cơ sở
  async getStaff(facilityId, params = {}) {
    const res = await apiClient.get(`/manager/facilities/${encodeURIComponent(facilityId)}/staff`, { params });
    return res?.data ?? [];
  },
  async getFacilityStaff(facilityId, params = {}) {
    return this.getStaff(facilityId, params);
  },

  // STT 20: POST /api/manager/facilities/{facilityId}/staff-tasks
  // Giao việc cho nhân viên (tự động đồng bộ sang SupportTickets)
  /** @param {{ assignedEmployeeId?: number, shiftId?: number, ticketId?: number, maintenanceWorkOrderId?: number, taskType: string, title: string, dueAt?: string, status?: string, progressPercent?: number }} payload */
  async createStaffTask(facilityId, payload) {
    const res = await apiClient.post(`/manager/facilities/${encodeURIComponent(facilityId)}/staff-tasks`, payload);
    return res?.data ?? null;
  },
  async createTask(facilityId, payload) {
    return this.createStaffTask(facilityId, payload);
  },

  // STT 21: GET /api/manager/facilities/{facilityId}/charge-proposals
  // Danh sách đề xuất phụ phí hư hại chờ duyệt
  async getChargeProposals(facilityId, params = {}) {
    const res = await apiClient.get(`/manager/facilities/${encodeURIComponent(facilityId)}/charge-proposals`, { params });
    return res?.data ?? [];
  },

  // STT 22: PUT /api/manager/charge-proposals/{id}/decide
  // Phê duyệt hoặc từ chối phụ phí hư hại
  /** @param {{ decision: string, reason?: string }} payload */
  async decideChargeProposal(id, payload) {
    const res = await apiClient.put(`/manager/charge-proposals/${encodeURIComponent(id)}/decide`, payload);
    return res?.data ?? null;
  },

  // STT 23: GET /api/manager/facilities/{facilityId}/refund-approvals
  // Danh sách các khoản chờ duyệt hoàn cọc
  async getRefundApprovals(facilityId, params = {}) {
    const res = await apiClient.get(`/manager/facilities/${encodeURIComponent(facilityId)}/refund-approvals`, { params });
    return res?.data ?? [];
  },

  // STT 24: PUT /api/manager/refund-approvals/{id}/decide
  // Duyệt hoàn cọc cấn trừ công nợ & hư hại
  /** @param {{ decision: string, reason?: string, overrideAmount?: number }} payload */
  async decideRefundApproval(id, payload) {
    const res = await apiClient.put(`/manager/refund-approvals/${encodeURIComponent(id)}/decide`, payload);
    return res?.data ?? null;
  },

  // STT 25: GET /api/manager/facilities/{facilityId}/pricing/rates
  // Xem biểu giá thuê cơ sở (Kiểm tra quyền cơ sở)
  async getPricingRates(facilityId, params = {}) {
    const res = await apiClient.get(`/manager/facilities/${encodeURIComponent(facilityId)}/pricing/rates`, { params });
    return res?.data ?? null;
  },

  // STT 26: PUT /api/manager/facilities/{facilityId}/pricing/rates
  // Điều chỉnh giá thuê cơ sở (Kiểm tra quyền cơ sở)
  async updatePricingRates(facilityId, payload) {
    const res = await apiClient.put(`/manager/facilities/${encodeURIComponent(facilityId)}/pricing/rates`, payload);
    return res?.data ?? null;
  },
  async updatePricingRate(facilityId, payload) {
    return this.updatePricingRates(facilityId, payload);
  },

  // STT 27: GET /api/manager/pricing/fees
  // Xem danh mục quy tắc tính phí chuẩn
  async getPricingFees(params = {}) {
    const res = await apiClient.get("/manager/pricing/fees", { params });
    return res?.data ?? null;
  },

  // PUT /api/manager/pricing/fees
  // Thiết lập / cập nhật quy tắc tính phí cơ sở hoặc toàn hệ thống
  async updatePricingFee(payload) {
    const res = await apiClient.put("/manager/pricing/fees", payload);
    return res?.data ?? res;
  },

  // STT 28: GET /api/manager/promotions
  // Danh sách chương trình khuyến mãi/voucher
  async getPromotions(params = {}) {
    const res = await apiClient.get("/manager/promotions", { params });
    return res?.data ?? null;
  },

  // STT 29: POST /api/manager/promotions
  // Tạo chiến dịch khuyến mãi cho cơ sở
  async createPromotion(payload) {
    const res = await apiClient.post("/manager/promotions", payload);
    return res?.data ?? null;
  },

  // STT 30: PUT /api/manager/promotions/{id}/status
  // Bật / Tắt trạng thái chương trình khuyến mãi
  async updatePromotionStatus(id, payloadOrIsActive) {
    const payload = typeof payloadOrIsActive === "boolean" ? { isActive: payloadOrIsActive } : payloadOrIsActive;
    const res = await apiClient.put(`/manager/promotions/${encodeURIComponent(id)}/status`, payload);
    return res?.data ?? null;
  },

  // --- Shifts & roster ---
  async getShifts(facilityId) {
    const res = await apiClient.get(`/manager/facilities/${encodeURIComponent(facilityId)}/shifts`);
    return res?.data ?? [];
  },
  /** @param {{ shiftName: string, startsAt: string, endsAt: string, status?: string }} payload */
  async createShift(facilityId, payload) {
    const res = await apiClient.post(`/manager/facilities/${encodeURIComponent(facilityId)}/shifts`, payload);
    return res?.data ?? null;
  },
  async getShiftRoster(facilityId, params = {}) {
    const res = await apiClient.get(`/manager/facilities/${encodeURIComponent(facilityId)}/shift-roster`, { params });
    return res?.data ?? [];
  },
  /** @param {{ shiftId: number, employeeId: number, dutyRole: string, status?: string }} payload */
  async createShiftAssignment(facilityId, payload) {
    const res = await apiClient.post(`/manager/facilities/${encodeURIComponent(facilityId)}/shift-assignments`, payload);
    return res?.data ?? null;
  },
  async deleteShiftAssignment(facilityId, shiftId, employeeId) {
    const res = await apiClient.delete(`/manager/facilities/${encodeURIComponent(facilityId)}/shift-assignments/${encodeURIComponent(shiftId)}/${encodeURIComponent(employeeId)}`);
    return res?.data ?? null;
  },
  /**
   * STT 31: Lưu hàng loạt phân công ca trực
   * POST /api/manager/facilities/{facilityId}/shift-assignments/batch-save
   */
  async batchSaveShiftAssignments(facilityId, payload) {
    const res = await apiClient.post(
      `/manager/facilities/${encodeURIComponent(facilityId)}/shift-assignments/batch-save`,
      payload
    );
    return res?.data ?? null;
  },

  // --- Delinquent cases ---
  async getDelinquentCases(facilityId) {
    const res = await apiClient.get(`/manager/facilities/${encodeURIComponent(facilityId)}/delinquent-cases`);
    return res?.data ?? [];
  },
  /** @param {{ actionType: string, note?: string, updateCaseStatus?: string }} payload */
  async createDelinquentCaseAction(id, payload) {
    const res = await apiClient.post(`/manager/delinquent-cases/${encodeURIComponent(id)}/actions`, payload);
    return res?.data ?? null;
  },

  // --- Assigned Facilities Scope ---
  async getMyFacilities() {
    const res = await apiClient.get("/manager/my-facilities");
    return res?.data ?? [];
  },
};

export default managerService;
