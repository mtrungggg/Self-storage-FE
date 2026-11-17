import apiClient from "../../api/apiClient";
import { enc, toList, unwrap, unwrapRequired } from "./apiResponse";

const paymentApi = {
  async createCheckout(data) {
    const res = await apiClient.post("/v1/payments/checkout", data);
    return unwrapRequired(res, "Unable to create the payment checkout.");
  },

  async getPaymentStatus(paymentId) {
    const res = await apiClient.get(`/v1/payments/${enc(paymentId)}/status`);
    return unwrap(res, "Unable to load the payment status.");
  },

  async getPaymentHistory(params = {}) {
    const res = await apiClient.get("/v1/payments/my-history", { params });
    return toList(unwrap(res, "Unable to load the payment history."));
  },

  async getUnpaidInvoices() {
    const res = await apiClient.get("/v1/invoices/unpaid");
    return toList(unwrap(res, "Unable to load unpaid invoices."));
  },
};

export default paymentApi;
