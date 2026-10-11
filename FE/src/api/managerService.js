import apiClient from "./apiClient";

export const managerService = {
  // ==========================================
  // 1. REVENUE & INVOICES CRUD
  // ==========================================
  getRevenueOverview(facilityId) {
    const params = facilityId && facilityId !== "all" ? { facilityId } : {};
    return apiClient.get("/manager/revenue/overview", { params });
  },

  createInvoice(payload) {
    return apiClient.post("/manager/revenue/invoices", payload);
  },

  updateInvoice(id, payload) {
    return apiClient.put(`/manager/revenue/invoices/${id}`, payload);
  },

  deleteInvoice(id) {
    return apiClient.delete(`/manager/revenue/invoices/${id}`);
  },

  createPromotion(payload) {
    return apiClient.post("/manager/revenue/promotions", payload);
  },

  updatePromotion(id, payload) {
    return apiClient.put(`/manager/revenue/promotions/${id}`, payload);
  },

  deletePromotion(id) {
    return apiClient.delete(`/manager/revenue/promotions/${id}`);
  },

  // ==========================================
  // 2. WAREHOUSE / STORAGE CRUD
  // ==========================================
  getWarehouseOverview(facilityId) {
    const params = facilityId && facilityId !== "all" ? { facilityId } : {};
    return apiClient.get("/manager/warehouse", { params });
  },

  createFacility(payload) {
    return apiClient.post("/manager/warehouse/facilities", payload);
  },

  updateFacility(id, payload) {
    return apiClient.put(`/manager/warehouse/facilities/${id}`, payload);
  },

  deleteFacility(id) {
    return apiClient.delete(`/manager/warehouse/facilities/${id}`);
  },

  createStorageUnit(payload) {
    return apiClient.post("/manager/warehouse/units", payload);
  },

  updateStorageUnit(id, payload) {
    return apiClient.put(`/manager/warehouse/units/${id}`, payload);
  },

  deleteStorageUnit(id) {
    return apiClient.delete(`/manager/warehouse/units/${id}`);
  },

  // ==========================================
  // 3. SUPPORT TICKETS CRUD
  // ==========================================
  getTicketsOverview(facilityId, status) {
    const params = {};
    if (facilityId && facilityId !== "all") params.facilityId = facilityId;
    if (status && status !== "all") params.status = status;
    return apiClient.get("/manager/tickets", { params });
  },

  createTicket(payload) {
    return apiClient.post("/manager/tickets", payload);
  },

  updateTicket(id, payload) {
    return apiClient.put(`/manager/tickets/${id}`, payload);
  },

  deleteTicket(id) {
    return apiClient.delete(`/manager/tickets/${id}`);
  },

  addTicketMessage(id, payload) {
    return apiClient.post(`/manager/tickets/${id}/messages`, payload);
  },

  decideChargeProposal(proposalId, payload) {
    return apiClient.post(`/manager/tickets/charge-proposals/${proposalId}/decide`, payload);
  },

  // ==========================================
  // 4. STAFF SCHEDULING & TASKS CRUD
  // ==========================================
  getStaffingOverview(facilityId, weekStart) {
    const params = {};
    if (facilityId && facilityId !== "all") params.facilityId = facilityId;
    if (weekStart) params.weekStart = weekStart;
    return apiClient.get("/manager/staffing", { params });
  },

  assignStaffCellShift(payload) {
    return apiClient.post("/manager/staffing/assign-cell", payload);
  },

  createStaffMember(payload) {
    return apiClient.post("/manager/staffing/employees", payload);
  },

  createStaffTask(payload) {
    return apiClient.post("/manager/staffing/tasks", payload);
  },

  updateStaffTask(id, payload) {
    return apiClient.put(`/manager/staffing/tasks/${id}`, payload);
  },

  deleteStaffTask(id) {
    return apiClient.delete(`/manager/staffing/tasks/${id}`);
  },
};

export default managerService;
