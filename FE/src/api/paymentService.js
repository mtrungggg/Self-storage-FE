import paymentApi from "../services/api/paymentApi";

export const paymentService = {
  createCheckout: (data) => paymentApi.createCheckout(data),
  getPaymentStatus: (paymentId) => paymentApi.getPaymentStatus(paymentId),
  getPaymentHistory: (params) => paymentApi.getPaymentHistory(params),
  getUnpaidInvoices: () => paymentApi.getUnpaidInvoices(),
};

export default paymentService;
