import apiClient from "./apiClient";

export const paymentService = {
  /**
   * Khởi tạo thông tin thanh toán (VietQR / SePay) cho một đơn đặt chỗ
   * @param {{ reservationId: number, paymentMethod?: string }} data
   */
  async createCheckout(data) {
    const res = await apiClient.post("/customer/payments/create-checkout", data);
    return res?.data ?? null;
  },

  /**
   * Lấy lịch sử thanh toán của tài khoản đang đăng nhập
   */
  async getPaymentHistory() {
    const res = await apiClient.get("/customer/payments/my-history");
    return res?.data ?? [];
  },
};

export default paymentService;
