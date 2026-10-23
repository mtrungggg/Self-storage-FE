import apiClient from "./apiClient";

// Wraps /api/manager/* (ManagerController) for Facility Manager & System Administrator.
const managerService = {
  // ----- Agreements (contracts) -----
  async getAgreements(facilityId, { status, search, pageNumber = 1, pageSize = 20 } = {}) {
    const params = { pageNumber, pageSize };
    if (status) params.status = status;
    if (search) params.search = search;
    const response = await apiClient.get(`/manager/facilities/${encodeURIComponent(facilityId)}/agreements`, { params });
    if (response?.success !== true) throw new Error(response?.message || "Không thể tải danh sách hợp đồng.");
    if (!Array.isArray(response.data?.items)) throw new Error("Danh sách hợp đồng trả về không hợp lệ.");
    return response.data;
  },
  async getAgreementDetail(agreementId) {
    const response = await apiClient.get(`/manager/agreements/${encodeURIComponent(agreementId)}`);
    if (response?.success !== true) throw new Error(response?.message || "Không thể tải chi tiết hợp đồng.");
    return response.data;
  },

  // ----- Staff shifts & roster -----
  async getShifts(facilityId) {
    const response = await apiClient.get(`/manager/facilities/${encodeURIComponent(facilityId)}/shifts`);
    if (response?.success !== true) throw new Error(response?.message || "Không thể tải danh sách ca trực.");
    if (response.data == null) return [];
    if (!Array.isArray(response.data)) throw new Error("Danh sách ca trực trả về không hợp lệ.");
    return response.data;
  },
  async createShift(facilityId, payload) {
    const response = await apiClient.post(`/manager/facilities/${encodeURIComponent(facilityId)}/shifts`, payload);
    if (response?.success !== true) throw new Error(response?.message || "Không thể tạo ca trực.");
    return response.data;
  },
  async getShiftRoster(facilityId, { fromDate, toDate, employeeId } = {}) {
    const params = {};
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    if (employeeId) params.employeeId = employeeId;
    const response = await apiClient.get(`/manager/facilities/${encodeURIComponent(facilityId)}/shift-roster`, { params });
    if (response?.success !== true) throw new Error(response?.message || "Không thể tải lịch trực nhân sự.");
    if (response.data == null) return [];
    if (!Array.isArray(response.data)) throw new Error("Lịch trực nhân sự trả về không hợp lệ.");
    return response.data;
  },
  async assignShift(facilityId, payload) {
    const response = await apiClient.post(`/manager/facilities/${encodeURIComponent(facilityId)}/shift-assignments`, payload);
    if (response?.success !== true) throw new Error(response?.message || "Không thể phân ca trực.");
    return response.data;
  },
};

export default managerService;
