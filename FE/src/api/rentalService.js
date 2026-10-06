import apiClient from "./apiClient";

export const rentalService = {
  async getAuthorizedMembers(agreementId) {
    const res = await apiClient.get(`/customer/rentals/${encodeURIComponent(agreementId)}/authorized-members`);
    if (res?.success !== true) throw new Error(res?.message || res?.errors?.join(", ") || "Unable to load authorized members.");
    if (res.data == null) return [];
    if (!Array.isArray(res.data)) throw new Error("The server returned an invalid member list.");
    return res.data;
  },
  async renewAgreement(agreementId, renewalMonths) {
    if (!Number.isInteger(renewalMonths) || renewalMonths < 1 || renewalMonths > 12) throw new Error("Select 1–12 renewal months.");
    const res = await apiClient.post(`/customer/rentals/${encodeURIComponent(agreementId)}/renew`, { renewalMonths });
    if (res?.success !== true) throw new Error(res?.message || res?.errors?.join(", ") || "Unable to request renewal.");
    if (!res.data || res.data.renewalId == null) throw new Error("The server did not return renewal details.");
    return res.data;
  },
  async getRefundPreview(agreementId) {
    const res = await apiClient.get(`/customer/rentals/${encodeURIComponent(agreementId)}/refund-preview`);
    if (res?.success !== true) throw new Error(res?.message || res?.errors?.join(", ") || "Unable to load the refund estimate.");
    if (!res.data || res.data.agreementId == null) throw new Error("The server did not return a refund estimate.");
    return res.data;
  },
  async requestMoveOut(agreementId, { requestedMoveOutDate, reason }) {
    const res = await apiClient.post(`/customer/rentals/${encodeURIComponent(agreementId)}/move-out`, { requestedMoveOutDate, reason });
    if (res?.success !== true) throw new Error(res?.message || res?.errors?.join(", ") || "Unable to request move-out.");
    if (!res.data || res.data.id == null) throw new Error("The server did not return the move-out request.");
    return res.data;
  },
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
    if (res?.success !== true || !res.data) throw new Error(res?.message || "Unable to load access credentials.");
    return res?.data ?? null;
  },

  /**
   * Đổi mã PIN truy cập ô kho
   * @param {number|string} agreementId
   * @param {{ currentPin?: string, newPin: string }} data
   */
  async changePin(agreementId, data) {
    const res = await apiClient.put(`/customer/rentals/${agreementId}/change-pin`, data);
    if (res?.success !== true || res?.data?.success !== true) throw new Error(res?.data?.message || res?.message || "Unable to change PIN.");
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
