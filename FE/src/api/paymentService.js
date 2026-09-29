import apiClient from "./apiClient";

export const paymentService = {
  /**
   * Khởi tạo thông tin thanh toán VietQR / SePay
   * @param {{ invoiceId: number, paymentMethod: string }} data
   */
  async createCheckout(data) {
    return await apiClient.post("/customer/payments/create-checkout", data);
  },

  /**
   * Kiểm tra trạng thái thanh toán của hóa đơn
   * @param {number|string} invoiceId
   */
  async getInvoiceStatus(invoiceId) {
    return await apiClient.get(`/customer/payments/invoice/${invoiceId}/status`);
  },
};

export default paymentService;
