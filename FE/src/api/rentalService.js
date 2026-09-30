import apiClient from "./apiClient";

export const rentalService = {
  /**
   * Lấy danh sách hợp đồng thuê kho (đang hoạt động & lịch sử) của khách hàng
   */
  async getMyRentals() {
    const res = await apiClient.get("/customer/rentals");
    return res?.data ?? [];
  },

  /**
   * Lấy mã PIN / QR truy cập cho một hợp đồng thuê
   * @param {number|string} agreementId
   */
  async getAccessCredentials(agreementId) {
    const res = await apiClient.get(`/customer/rentals/${agreementId}/access-credentials`);
    return res?.data ?? null;
  },

  /**
   * Đổi mã PIN truy cập ô kho
   * @param {number|string} agreementId
   * @param {{ currentPin?: string, newPin: string }} data
   */
  async changePin(agreementId, data) {
    const res = await apiClient.put(`/customer/rentals/${agreementId}/change-pin`, data);
    return res?.data ?? null;
  },

  /**
   * Lấy biên bản bàn giao ô kho (nhận/trả kho)
   * @param {number|string} agreementId
   */
  async getHandoverRecord(agreementId) {
    const res = await apiClient.get(`/customer/rentals/${agreementId}/handover`);
    return res?.data ?? null;
  },
};

export default rentalService;
