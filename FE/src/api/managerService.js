import apiClient from "./apiClient";

// Service layer: wraps the backend "Manager" API group (facility-scoped operations console).
export const managerService = {
  // --- Units ---
  async getUnits(facilityId, params = {}) {
    const res = await apiClient.get(`/manager/facilities/${facilityId}/units`, { params });
    return res?.data ?? null;
  },
  async createUnit(facilityId, payload) {
    const res = await apiClient.post(`/manager/facilities/${facilityId}/units`, payload);
    return res?.data ?? null;
  },
  async updateUnit(unitId, payload) {
    const res = await apiClient.put(`/manager/units/${unitId}`, payload);
    return res?.data ?? null;
  },

  // --- Map layout ---
  async getMapLayout(facilityId) {
    const res = await apiClient.get(`/manager/facilities/${facilityId}/map-layout`);
    return res?.data ?? null;
  },
  async updateMapLayout(facilityId, positions) {
    const res = await apiClient.put(`/manager/facilities/${facilityId}/map-layout`, { positions });
    return res?.data ?? null;
  },

  // --- Transfer requests ---
  async getTransferRequests(facilityId) {
    const res = await apiClient.get(`/manager/facilities/${facilityId}/transfer-requests`);
    return res?.data ?? [];
  },
  /** @param {{ decision: string, targetUnitId?: number, reviewNotes?: string }} payload */
  async decideTransferRequest(id, payload) {
    const res = await apiClient.put(`/manager/transfer-requests/${id}/decide`, payload);
    return res?.data ?? null;
  },

  // --- Shifts & roster ---
  async getShifts(facilityId) {
    const res = await apiClient.get(`/manager/facilities/${facilityId}/shifts`);
    return res?.data ?? [];
  },
  /** @param {{ shiftName: string, startsAt: string, endsAt: string, status?: string }} payload */
  async createShift(facilityId, payload) {
    const res = await apiClient.post(`/manager/facilities/${facilityId}/shifts`, payload);
    return res?.data ?? null;
  },
  async getShiftRoster(facilityId, params = {}) {
    const res = await apiClient.get(`/manager/facilities/${facilityId}/shift-roster`, { params });
    return res?.data ?? [];
  },
  /** @param {{ shiftId: number, employeeId: number, dutyRole: string, status?: string }} payload */
  async createShiftAssignment(facilityId, payload) {
    const res = await apiClient.post(`/manager/facilities/${facilityId}/shift-assignments`, payload);
    return res?.data ?? null;
  },

  async deleteShiftAssignment(facilityId, shiftId, employeeId) {
    const res = await apiClient.delete(`/manager/facilities/${facilityId}/shift-assignments/${shiftId}/${employeeId}`);
    return res?.data ?? null;
  },
  async getFacilityStaff(facilityId) {
    const res = await apiClient.get(`/manager/facilities/${facilityId}/staff`);
    return res?.data ?? [];
  },

  // --- Tasks ---
  /** @param {{ assignedEmployeeId?: number, shiftId?: number, ticketId?: number, maintenanceWorkOrderId?: number, taskType: string, title: string, dueAt?: string, status?: string, progressPercent?: number }} payload */
  async createTask(facilityId, payload) {
    const res = await apiClient.post(`/manager/facilities/${facilityId}/tasks`, payload);
    return res?.data ?? null;
  },

  // --- Charge proposals ---
  async getChargeProposals(facilityId) {
    const res = await apiClient.get(`/manager/facilities/${facilityId}/charge-proposals`);
    return res?.data ?? [];
  },
  /** @param {{ decision: string, reason?: string }} payload */
  async decideChargeProposal(id, payload) {
    const res = await apiClient.put(`/manager/charge-proposals/${id}/decide`, payload);
    return res?.data ?? null;
  },

  // --- Refund approvals ---
  async getRefundApprovals(facilityId) {
    const res = await apiClient.get(`/manager/facilities/${facilityId}/refund-approvals`);
    return res?.data ?? [];
  },
  /** @param {{ decision: string, reason?: string, overrideAmount?: number }} payload */
  async decideRefundApproval(id, payload) {
    const res = await apiClient.put(`/manager/refund-approvals/${id}/decide`, payload);
    return res?.data ?? null;
  },

  // --- Agreements ---
  async getAgreements(facilityId, params = {}) {
    const res = await apiClient.get(`/manager/facilities/${facilityId}/agreements`, { params });
    return res?.data ?? null;
  },
  async getAgreementDetail(agreementId) {
    const res = await apiClient.get(`/manager/agreements/${agreementId}`);
    return res?.data ?? null;
  },

  // --- Delinquent cases ---
  async getDelinquentCases(facilityId) {
    const res = await apiClient.get(`/manager/facilities/${facilityId}/delinquent-cases`);
    return res?.data ?? [];
  },
  /** @param {{ actionType: string, note?: string, updateCaseStatus?: string }} payload */
  async createDelinquentCaseAction(id, payload) {
    const res = await apiClient.post(`/manager/delinquent-cases/${id}/actions`, payload);
    return res?.data ?? null;
  },

  // --- Dashboard ---
  async getDashboard(facilityId) {
    const res = await apiClient.get(`/manager/facilities/${facilityId}/dashboard`);
    return res?.data ?? null;
  },

  // --- Assigned Facilities Scope ---
  async getMyFacilities() {
    const res = await apiClient.get("/manager/my-facilities");
    return res?.data ?? [];
  },
};

export default managerService;
