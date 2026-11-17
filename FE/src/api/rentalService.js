import rentalApi from "../services/api/rentalApi";

export const rentalService = {
  async getLatestTransferRequest(agreementId) {
    return rentalApi.getLatestTransferRequest(agreementId);
  },

  async getTransferPreview(agreementId, params = {}) {
    return rentalApi.getTransferPreview(agreementId, params);
  },

  async requestUnitTransfer(agreementId, payload) {
    return rentalApi.requestUnitTransfer(agreementId, payload);
  },

  async renewAgreement(agreementId, renewalMonths, promotionCode) {
    return rentalApi.renewAgreement(agreementId, renewalMonths, promotionCode);
  },

  async cancelTransferRequest(requestId) {
    return rentalApi.cancelTransferRequest(requestId);
  },

  async cancelRenewal(renewalId) {
    return rentalApi.cancelRenewal(renewalId);
  },

  async cancelInvoice(invoiceId) {
    const { default: apiClient } = await import("./apiClient");
    const res = await apiClient.post(`/customer/rentals/invoices/${encodeURIComponent(invoiceId)}/cancel`);
    return res?.data;
  },

  async getRefundPreview(agreementId, requestedMoveOutDate) {
    return rentalApi.getRefundPreview(agreementId, requestedMoveOutDate);
  },

  async requestMoveOut(agreementId, payload) {
    const cleanPayload = {
      requestedMoveOutDate: payload.requestedMoveOutDate,
      reason: payload.reason || null,
    };
    if (payload.bankName) cleanPayload.bankName = payload.bankName;
    if (payload.bankAccountNumber) cleanPayload.bankAccountNumber = payload.bankAccountNumber;
    if (payload.bankAccountHolder) cleanPayload.bankAccountHolder = payload.bankAccountHolder;
    return rentalApi.requestMoveOut(agreementId, cleanPayload);
  },

  async submitRefundBankInfo(refundId, data) {
    return rentalApi.submitRefundBankInfo(refundId, data);
  },

  async getPendingBankInfoRefunds() {
    return rentalApi.getPendingBankInfoRefunds();
  },

  async getMyRentals(status) {
    return rentalApi.getMyRentals(status);
  },

  async getRentalDetail(agreementId) {
    return rentalApi.getRentalDetail(agreementId);
  },

  async getAccessCredentials(agreementId) {
    return rentalApi.getAccessCredentials(agreementId);
  },

  async changePin(agreementId, data) {
    return rentalApi.changePin(agreementId, data);
  },

  async getHandoverRecord(agreementId) {
    return rentalApi.getHandoverRecord(agreementId);
  },

  async unlockUnit(agreementId, pin, accessPointId) {
    return rentalApi.unlockUnit(agreementId, pin, accessPointId);
  },

  async getAccessLogs(agreementId, params) {
    return rentalApi.getAccessLogs(agreementId, params);
  },

  async getAuthorizedMembers(agreementId) {
    return rentalApi.getAuthorizedMembers(agreementId);
  },

  async addAuthorizedMember(agreementId, payload) {
    return rentalApi.addAuthorizedMember(agreementId, payload);
  },

  async revokeAuthorizedMember(agreementId, memberId) {
    return rentalApi.revokeAuthorizedMember(agreementId, memberId);
  },

  async getStoredItems(agreementId, params) {
    return rentalApi.getStoredItems(agreementId, params);
  },

  async declareStoredItems(agreementId, data) {
    return rentalApi.declareStoredItems(agreementId, data);
  },

  async updateStoredItem(agreementId, itemId, data) {
    return rentalApi.updateStoredItem(agreementId, itemId, data);
  },

  async deleteStoredItem(agreementId, itemId) {
    return rentalApi.deleteStoredItem(agreementId, itemId);
  },
};

export default rentalService;
