import apiClient from "./apiClient";

export const managerTicketService = {
  /**
   * Lấy danh sách Ticket tại cơ sở cho Manager điều phối
   * GET /api/manager/tickets?facilityId=...
   */
  async getTickets(params = {}) {
    const query = {};
    if (params.facilityId != null && params.facilityId !== "") query.facilityId = Number(params.facilityId);
    if (params.status) query.status = params.status;
    if (params.category) query.category = params.category;
    if (params.search) query.search = params.search.trim();

    try {
      const res = await apiClient.get("/manager/tickets", { params: query });
      if (res?.success === true) {
        const data = res.data;
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.items)) return data.items;
        return [];
      }
    } catch (err) {
      if (err.status !== 404) throw err;
    }

    // Fallback nếu backend dùng /staff/tickets
    try {
      const fallbackRes = await apiClient.get("/staff/tickets", { params: query });
      if (fallbackRes?.success === true) {
        const data = fallbackRes.data;
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.items)) return data.items;
      }
    } catch {
      // ignore
    }

    return [];
  },

  /**
   * Manager giao việc cho Staff xử lý ticket
   * POST /api/manager/tickets/{id}/assign-staff
   */
  async assignStaff(ticketId, { staffId, notes } = {}) {
    const numericStaffId = Number(staffId);
    if (!numericStaffId || isNaN(numericStaffId) || numericStaffId <= 0) {
      throw new Error("Mã nhân viên (Staff ID) không hợp lệ.");
    }

    const payload = {
      employeeId: numericStaffId,
      staffId: numericStaffId,
      assignedEmployeeId: numericStaffId,
      notes: notes?.trim() || "",
    };

    const res = await apiClient.post(
      `/manager/tickets/${encodeURIComponent(ticketId)}/assign-staff`,
      payload
    );

    if (res?.success === true) return res.data;
    if (res?.data) return res.data;
    throw new Error(res?.message || "Không thể phân công nhân viên xử lý ticket.");
  },

  /**
   * Đổi kho khẩn cấp tương đương 0 VNĐ cho khách hàng
   * POST /api/manager/agreements/{agreementId}/reassign-unit
   */
  async reassignUnit(agreementId, payload) {
    const body = {
      newUnitId: Number(payload.newUnitId),
      newStorageUnitId: Number(payload.newUnitId),
      reason: payload.reason || "Severe_Need_Relocation - Sự cố kho nghiêm trọng cần đổi kho",
      priceAdjustment: 0, // Đổi kho tương đương 0 VNĐ
      notes: payload.notes || "Đổi kho khẩn cấp 0 VNĐ do hư hỏng nặng tại kho cũ.",
      ticketId: payload.ticketId,
    };

    if (!agreementId) {
      throw new Error("Mã hợp đồng (agreementId) là bắt buộc để đổi ô kho.");
    }

    const res = await apiClient.post(
      `/manager/agreements/${encodeURIComponent(agreementId)}/reassign-unit`,
      body
    );

    if (res?.success === true) return res.data;
    if (res?.data) return res.data;
    throw new Error(res?.message || "Không thể thực hiện đổi ô kho khẩn cấp.");
  },

  /**
   * Hủy hợp đồng và hoàn tiền 100% khi kho gặp sự cố và cơ sở hết kho thay thế
   * POST /api/manager/agreements/{agreementId}/emergency-cancel-refund
   */
  async emergencyCancelAndRefund(agreementId, payload) {
    if (!agreementId) {
      throw new Error("Mã hợp đồng là bắt buộc để hủy hợp đồng và hoàn tiền.");
    }
    const res = await apiClient.post(
      `/manager/agreements/${encodeURIComponent(agreementId)}/emergency-cancel-refund`,
      payload
    );
    if (res?.success === true) return res.data;
    return res?.data ?? res;
  },

  /**
   * Manager đóng Ticket sự cố sau khi đã giải quyết xong
   * POST /api/manager/tickets/{ticketId}/close
   */
  async closeTicket(ticketId) {
    if (!ticketId) {
      throw new Error("Mã ticket là bắt buộc để đóng ticket.");
    }
    const res = await apiClient.post(`/manager/tickets/${encodeURIComponent(ticketId)}/close`);
    if (res?.success === true) return res.data;
    return res?.data ?? res;
  },

  /**
   * Lấy lịch sử tin nhắn / trao đổi nội bộ của ticket
   * GET /api/manager/tickets/{ticketId}/messages
   */
  async getTicketMessages(ticketId) {
    if (!ticketId) return [];
    try {
      const res = await apiClient.get(`/manager/tickets/${encodeURIComponent(ticketId)}/messages`);
      if (res?.success === true && Array.isArray(res.data)) return res.data;
    } catch {
      try {
        const fallback = await apiClient.get(`/staff/tickets/${encodeURIComponent(ticketId)}/messages`);
        if (fallback?.success === true && Array.isArray(fallback.data)) return fallback.data;
      } catch {
        // ignore
      }
    }
    return [];
  },

  /**
   * Lấy danh sách đề xuất phụ phí của một ticket cụ thể
   * GET /api/manager/tickets/{ticketId}/charge-proposals
   */
  async getTicketChargeProposals(ticketId) {
    if (!ticketId) return [];
    try {
      const res = await apiClient.get(`/manager/tickets/${encodeURIComponent(ticketId)}/charge-proposals`);
      if (res?.success === true && Array.isArray(res.data)) return res.data;
    } catch {
      // ignore
    }
    return [];
  },

  /**
   * Manager tạo mới Ticket sự cố tại cơ sở (vd: khách báo tại quầy)
   * POST /api/manager/tickets
   */
  async createTicket(payload) {
    const res = await apiClient.post("/manager/tickets", payload);
    if (res?.success === true) return res.data;
    return res?.data ?? res;
  },
};

export default managerTicketService;
