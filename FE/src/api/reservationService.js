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

  /**
   * [BỔ SUNG - PHẦN 5]: Thực hiện thanh toán trực tuyến cho đơn đặt chỗ
   * @param {number|string} reservationId
   * @param {{ paymentMethod: string, amount: number }} paymentData
   */
  async payReservation(reservationId, paymentData) {
    return await apiClient.post(`/customer/reservations/${reservationId}/pay`, paymentData);
  },

  /**
   * [BỔ SUNG - PHẦN 6]: Ghi nhận thành công, sinh mã đặt chỗ và gửi xác nhận qua Email/SMS/App
   * @param {number|string} reservationId
   */
  async confirmAndNotifyReservation(reservationId) {
    return await apiClient.post(`/customer/reservations/${reservationId}/confirm`);
  },
};

export default reservationService;