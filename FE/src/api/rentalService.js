import apiClient from "./apiClient";

export const rentalService = {
  /**
   * Lấy danh sách hợp đồng thuê kho (đang hoạt động & lịch sử) của khách hàng
   * GET /api/customer/rentals
   */
  async getMyRentals() {
    const res = await apiClient.get("/customer/rentals");
    return res?.data ?? [];
  },

  /**
   * Lấy mã PIN / QR truy cập cho một hợp đồng thuê
   * GET /api/customer/rentals/{agreementId}/access-credentials
   * @param {number|string} agreementId
   */
  async getAccessCredentials(agreementId) {
    const res = await apiClient.get(`/customer/rentals/${agreementId}/access-credentials`);
    return res?.data ?? null;
  },

  /**
   * Đổi mã PIN truy cập ô kho
   * PUT /api/customer/rentals/{agreementId}/change-pin
   * @param {number|string} agreementId
   * @param {{ currentPin?: string, newPin: string }} data
   */
  async changePin(agreementId, data) {
    const res = await apiClient.put(`/customer/rentals/${agreementId}/change-pin`, data);
    return res?.data ?? null;
  },

  /**
   * Lấy biên bản bàn giao ô kho (nhận/trả kho)
   * GET /api/customer/rentals/{agreementId}/handover
   * @param {number|string} agreementId
   */
  async getHandoverRecord(agreementId) {
    const res = await apiClient.get(`/customer/rentals/${agreementId}/handover`);
    return res?.data ?? null;
  },

  /**
   * Xem danh sách người được ủy quyền ra vào ô kho
   * GET /api/customer/rentals/{agreementId}/authorized-members
   * @param {number|string} agreementId
   */
  async getAuthorizedMembers(agreementId) {
    const res = await apiClient.get(`/customer/rentals/${agreementId}/authorized-members`);
    return res?.data ?? [];
  },

  /**
   * Thêm người được ủy quyền ra vào kho kèm thông tin định danh (CCCD/CMND) và số điện thoại
   * POST /api/customer/rentals/{agreementId}/authorized-members
   * @param {number|string} agreementId
   * @param {{
   *   fullName: string,
   *   identityFingerprint?: string | null,
   *   relationshipToCustomer?: string | null,
   *   validTo?: string | null
   * }} data
   */
  async addAuthorizedMember(agreementId, data) {
    const res = await apiClient.post(`/customer/rentals/${agreementId}/authorized-members`, data);
    return res?.data ?? null;
  },

  /**
   * Thu hồi / hủy quyền ủy quyền ra vào kho
   * DELETE /api/customer/rentals/{agreementId}/authorized-members/{memberId}
   * @param {number|string} agreementId
   * @param {number|string} memberId
   */
  async revokeAuthorizedMember(agreementId, memberId) {
    const res = await apiClient.delete(
      `/customer/rentals/${agreementId}/authorized-members/${memberId}`
    );
    return res?.data ?? res;
  },
};

export default rentalService;
