import apiClient from "../../api/apiClient";
import { enc, toList, unwrap, unwrapRequired } from "./apiResponse";

const base = (agreementId) => `/v1/rentals/${enc(agreementId)}`;

const rentalApi = {
  async getMyRentals(status) {
    const res = await apiClient.get("/v1/rentals/my", { params: status ? { status } : {} });
    return toList(unwrap(res, "Unable to load your rentals."));
  },

  async getRentalDetail(agreementId) {
    const res = await apiClient.get(base(agreementId));
    return unwrapRequired(res, "Unable to load the rental details.");
  },

  async getAccessCredentials(agreementId) {
    const res = await apiClient.get(`${base(agreementId)}/access-credentials`);
    return unwrapRequired(res, "Unable to load access credentials.");
  },

  async changePin(agreementId, data) {
    const res = await apiClient.put(`${base(agreementId)}/pin`, data);
    return unwrapRequired(res, "Unable to change PIN.");
  },

  async unlockUnit(agreementId, pin, accessPointId) {
    const body = { pin };
    if (accessPointId != null) body.accessPointId = accessPointId;
    const res = await apiClient.post(`${base(agreementId)}/unlock`, body);
    return unwrapRequired(res, "Unable to unlock the storage unit.");
  },

  async getAccessLogs(agreementId, params = {}) {
    const res = await apiClient.get(`${base(agreementId)}/access-logs`, { params });
    return unwrap(res, "Unable to load access logs.");
  },

  async getHandoverRecord(agreementId) {
    const res = await apiClient.get(`${base(agreementId)}/handover-record`);
    return unwrapRequired(res, "Unable to load the handover record.");
  },

  async getAuthorizedMembers(agreementId) {
    const res = await apiClient.get(`${base(agreementId)}/authorized-members`);
    return toList(unwrap(res, "Unable to load authorized members."));
  },

  async addAuthorizedMember(agreementId, payload) {
    const res = await apiClient.post(`${base(agreementId)}/authorized-members`, payload);
    return unwrapRequired(res, "Unable to add the authorized member.");
  },

  async revokeAuthorizedMember(agreementId, memberId) {
    const res = await apiClient.delete(`${base(agreementId)}/authorized-members/${enc(memberId)}`);
    return unwrap(res, "Unable to revoke the authorized member.") ?? true;
  },

  async getStoredItems(agreementId, params = {}) {
    const res = await apiClient.get(`${base(agreementId)}/items`, { params });
    return unwrapRequired(res, "Unable to load stored items.");
  },

  async declareStoredItems(agreementId, data) {
    const res = await apiClient.post(`${base(agreementId)}/items`, data);
    return unwrapRequired(res, "Unable to declare stored items.");
  },

  async updateStoredItem(agreementId, itemId, data) {
    const res = await apiClient.put(`${base(agreementId)}/items/${enc(itemId)}`, data);
    return unwrapRequired(res, "Unable to update the stored item.");
  },

  async deleteStoredItem(agreementId, itemId) {
    const res = await apiClient.delete(`${base(agreementId)}/items/${enc(itemId)}`);
    return unwrap(res, "Unable to delete the stored item.");
  },

  async getRefundPreview(agreementId, requestedMoveOutDate) {
    const res = await apiClient.get(`${base(agreementId)}/move-out/refund-preview`, {
      params: requestedMoveOutDate ? { requestedMoveOutDate } : {},
    });
    return unwrapRequired(res, "Unable to load the refund estimate.");
  },

  async requestMoveOut(agreementId, payload) {
    const res = await apiClient.post(`${base(agreementId)}/move-out`, payload);
    return unwrapRequired(res, "Unable to request move-out.");
  },

  async getPendingBankInfoRefunds() {
    const res = await apiClient.get("/v1/rentals/refunds/pending-bank-info");
    return toList(unwrap(res, "Unable to load pending refunds."));
  },

  async submitRefundBankInfo(refundId, data) {
    const res = await apiClient.post(`/v1/rentals/refunds/${enc(refundId)}/bank-info`, data);
    return unwrap(res, "Unable to submit refund bank info.") ?? true;
  },

  async getTransferPreview(agreementId, params = {}) {
    const requestedFacilityId = params.requestedFacilityId ?? params.targetFacilityId;
    const requestedUnitTypeId = params.requestedUnitTypeId ?? params.targetUnitTypeId;
    const moveOutDate = params.moveOutDate ?? params.targetMoveDate;
    const query = {};
    if (requestedFacilityId) query.requestedFacilityId = requestedFacilityId;
    if (requestedUnitTypeId) query.requestedUnitTypeId = requestedUnitTypeId;
    if (moveOutDate) query.moveOutDate = moveOutDate;
    const res = await apiClient.get(`${base(agreementId)}/transfer/preview`, { params: query });
    return unwrapRequired(res, "Unable to load transfer preview.");
  },

  async requestUnitTransfer(agreementId, payload) {
    const res = await apiClient.post(`${base(agreementId)}/transfer`, payload);
    return unwrapRequired(res, "Unable to request a unit transfer.");
  },

  // A missing transfer is a normal state (404), not an error.
  async getLatestTransferRequest(agreementId) {
    try {
      const res = await apiClient.get(`${base(agreementId)}/transfer`);
      return unwrap(res, "Unable to check transfer payment status.");
    } catch (err) {
      if (err?.status === 404) return null;
      throw err;
    }
  },

  async cancelTransferRequest(transferId) {
    const res = await apiClient.post(`/v1/rentals/transfers/${enc(transferId)}/cancel`);
    return unwrap(res, "Unable to cancel the transfer request.") ?? true;
  },

  async renewAgreement(agreementId, renewalMonths, promotionCode) {
    if (!Number.isInteger(renewalMonths) || renewalMonths < 1 || renewalMonths > 12) {
      throw new Error("Select 1–12 renewal months.");
    }
    const body = { renewalMonths };
    if (promotionCode) body.promotionCode = promotionCode;
    const res = await apiClient.post(`${base(agreementId)}/renew`, body);
    return unwrapRequired(res, "Unable to request renewal.");
  },

  async cancelRenewal(renewalId) {
    const res = await apiClient.post(`/v1/renewals/${enc(renewalId)}/cancel`);
    return unwrap(res, "Unable to cancel the renewal.") ?? true;
  },
};

export default rentalApi;
