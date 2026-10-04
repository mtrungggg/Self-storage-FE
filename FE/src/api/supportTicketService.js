import apiClient from "./apiClient";

export const supportTicketService = {
  /**
   * Tạo yêu cầu hỗ trợ hoặc báo cáo hư hại mới
   * POST /api/customer/support-tickets
   * @param {{
   *   facilityId: number,
   *   agreementId?: number | null,
   *   storageUnitId?: number | null,
   *   category: string,
   *   priority?: string,
   *   subject: string,
   *   description: string,
   *   attachments?: Array<{
   *     fileName: string,
   *     mimeType: string,
   *     fileSizeBytes: number,
   *     objectUrl: string,
   *     sha256?: string | null
   *   }> | null
   * }} payload
   */
  async createTicket(payload) {
    const res = await apiClient.post("/customer/support-tickets", payload);
    return res?.data ?? null;
  },

  /**
   * Lấy danh sách các yêu cầu hỗ trợ cá nhân cùng tiến độ/trạng thái
   * GET /api/customer/support-tickets
   * @param {{ status?: string }} [params]
   */
  async getMyTickets(params = {}) {
    const queryParams = {};
    if (params.status && params.status !== "all") {
      queryParams.status = params.status;
    }
    const res = await apiClient.get("/customer/support-tickets", { params: queryParams });
    return res?.data ?? [];
  },

  /**
   * Xem chi tiết phản hồi và lịch sử trao đổi tin nhắn (chat/message) với Nhân viên (Staff)
   * GET /api/customer/support-tickets/{id}
   * @param {number|string} ticketId
   */
  async getTicketDetail(ticketId) {
    const res = await apiClient.get(`/customer/support-tickets/${ticketId}`);
    return res?.data ?? null;
  },

  /**
   * Gửi tin nhắn phản hồi trực tiếp cho Nhân viên (Staff) trong ticket
   * POST /api/customer/support-tickets/{id}/messages
   * @param {number|string} ticketId
   * @param {{
   *   body: string,
   *   attachments?: Array<{
   *     fileName: string,
   *     mimeType: string,
   *     fileSizeBytes: number,
   *     objectUrl: string,
   *     sha256?: string | null
   *   }> | null
   * }} payload
   */
  async addTicketMessage(ticketId, payload) {
    const res = await apiClient.post(`/customer/support-tickets/${ticketId}/messages`, payload);
    return res?.data ?? null;
  },

  /**
   * Khách hàng xác nhận kết quả xử lý và đánh giá chất lượng dịch vụ (Rating)
   * POST /api/customer/support-tickets/{id}/confirm-and-rate
   * @param {number|string} ticketId
   * @param {{ score: number, comment?: string | null }} payload
   */
  async confirmAndRateTicket(ticketId, payload) {
    const res = await apiClient.post(`/customer/support-tickets/${ticketId}/confirm-and-rate`, payload);
    return res?.data ?? res;
  },
};

export default supportTicketService;
