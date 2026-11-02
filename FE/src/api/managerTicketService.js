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
  async assignStaff(ticketId, { staffId, notes }) {
    const payload = {
      staffId: Number(staffId),
      assignedEmployeeId: Number(staffId),
      notes: notes?.trim() || "",
    };

    try {
      const res = await apiClient.post(
        `/manager/tickets/${encodeURIComponent(ticketId)}/assign-staff`,
        payload
      );
      if (res?.success === true) return res.data;
    } catch (err) {
      if (err.status !== 404) throw err;
    }

    // Fallback: POST /manager/facilities/{facilityId}/staff-tasks hoặc PUT /staff/tickets/{id}/assign
    const taskPayload = {
      ticketId: Number(ticketId),
      assignedEmployeeId: Number(staffId),
      taskType: "ticket_resolution",
      title: `Xử lý Ticket #${ticketId}`,
      notes: notes?.trim() || "",
    };
    try {
      const taskRes = await apiClient.post("/manager/staff-tasks", taskPayload);
      if (taskRes?.success === true) return taskRes.data;
    } catch {
      // Continue
    }

    throw new Error("Không thể phân công nhân viên cho ticket này.");
  },

  /**
   * Đổi kho khẩn cấp tương đương 0 VNĐ cho khách hàng
   * POST /api/manager/agreements/{agreementId}/reassign-unit
   */
  async reassignUnit(agreementId, payload) {
    const body = {
      newUnitId: Number(payload.newUnitId),
      reason: payload.reason || "Severe_Need_Relocation - Sự cố kho nghiêm trọng cần đổi kho",
      priceAdjustment: 0, // Đổi kho tương đương 0 VNĐ
      notes: payload.notes || "Đổi kho khẩn cấp 0 VNĐ do hư hỏng nặng tại kho cũ.",
      ticketId: payload.ticketId ? Number(payload.ticketId) : undefined,
    };

    try {
      const res = await apiClient.post(
        `/manager/agreements/${encodeURIComponent(agreementId)}/reassign-unit`,
        body
      );
      if (res?.success === true) return res.data;
    } catch (err) {
      if (err.status !== 404) throw err;
    }

    // Fallback: POST /manager/tickets/{ticketId}/reassign-unit
    if (payload.ticketId) {
      const res = await apiClient.post(
        `/manager/tickets/${encodeURIComponent(payload.ticketId)}/reassign-unit`,
        body
      );
      if (res?.success === true) return res.data;
    }

    throw new Error("Không thể thực hiện đổi ô kho khẩn cấp.");
  },
};

export default managerTicketService;
