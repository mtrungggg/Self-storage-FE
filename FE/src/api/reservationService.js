import apiClient from "./apiClient";

export const reservationService = {
  /**
   * Tạo đơn đặt chỗ ô kho online (15-min hold)
   * @param {{ unitId: number, durationMonths: number, intendedStartDate: string, accessMethod?: string, insurancePackage?: string, customerNotes?: string }} data
   */
  async createReservation(data) {
    return await apiClient.post("/customer/reservations", data);
  },

  /**
   * Lấy danh sách các đơn đặt chỗ của tài khoản đang đăng nhập
   * @param {string} [status]
   */
  async getMyReservations(status) {
    return await apiClient.get("/customer/reservations/my", {
      params: status ? { status } : {},
    });
  },

  /**
   * Xem chi tiết đơn đặt chỗ & mã QR check-in
   * @param {number|string} id
   */
  async getReservationDetail(id) {
    return await apiClient.get(`/customer/reservations/${id}`);
  },

  /**
   * Hủy đơn đặt chỗ đang chờ thanh toán
   * @param {number|string} id
   */
  async cancelReservation(id) {
    return await apiClient.delete(`/customer/reservations/${id}`);
  },
};

export default reservationService;
