import apiClient from "./apiClient";

export const reservationService = {
  /**
   * Tạo đơn đặt chỗ ô kho online (giữ chỗ có thời hạn)
   * @param {{ facilityId: number, unitTypeId: number, storageUnitId?: number, startDate: string, durationMonths: number, promotionCode?: string }} data
   */
  async createReservation(data) {
    const res = await apiClient.post("/customer/reservations", data);
    return res?.data ?? null;
  },

  /**
   * Lấy danh sách các đơn đặt chỗ của tài khoản đang đăng nhập
   * @param {string} [status]
   */
  async getMyReservations(status) {
    const res = await apiClient.get("/customer/reservations/my", {
      params: status ? { status } : {},
    });
    return res?.data ?? [];
  },

  /**
   * Xem chi tiết đơn đặt chỗ & mã QR check-in
   * @param {number|string} id
   */
  async getReservationDetail(id) {
    const res = await apiClient.get(`/customer/reservations/${id}`);
    return res?.data ?? null;
  },

  /**
   * Hủy đơn đặt chỗ đang chờ thanh toán
   * @param {number|string} id
   * @param {string} [reason]
   */
  async cancelReservation(id, reason) {
    return await apiClient.post(`/customer/reservations/${id}/cancel`, { reason });
  },
};

export default reservationService;
