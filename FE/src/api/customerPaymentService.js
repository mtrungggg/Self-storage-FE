import paymentApi from "../services/api/paymentApi";

export const customerPaymentService = {
  createCheckout: (data) => paymentApi.createCheckout(data),
  getPaymentStatus: (paymentId) => paymentApi.getPaymentStatus(paymentId),
  getPaymentHistory: (params) => paymentApi.getPaymentHistory(params),
  getUnpaidInvoices: () => paymentApi.getUnpaidInvoices(),
};

export default customerPaymentService;
