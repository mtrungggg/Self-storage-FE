import apiClient from "../../api/apiClient";
import { enc, toList, unwrap, unwrapRequired } from "./apiResponse";

const staffRentalApi = {
  async getOverdueAgreements(facilityId) {
    const res = await apiClient.get("/v1/staff/overdue-agreements", {
      params: facilityId ? { facilityId: Number(facilityId) } : {},
    });
    return toList(unwrap(res, "Unable to load overdue agreements."));
  },

  async lockAccess(agreementId, reason) {
    const res = await apiClient.post(`/v1/staff/agreements/${enc(agreementId)}/lock-access`, { reason });
    return unwrap(res, "Unable to lock agreement access.");
  },

  async getMoveOuts(params = {}) {
    const res = await apiClient.get("/v1/staff/move-outs", { params });
    return toList(unwrap(res, "Unable to load move-out requests."));
  },

  async inspectMoveOut(moveOutId, payload) {
    const res = await apiClient.post(`/v1/staff/move-outs/${enc(moveOutId)}/inspect`, payload);
    return unwrapRequired(res, "Unable to save the inspection.");
  },

  async getAssignedInspections(params = {}) {
    const res = await apiClient.get("/v1/staff/inspections", { params });
    return unwrap(res, "Unable to load assigned inspections.");
  },

  async submitInspection(inspectionId, payload) {
    const res = await apiClient.post(`/v1/staff/inspections/${enc(inspectionId)}/submit`, payload);
    return unwrap(res, "Unable to submit the inspection report.");
  },

  async getAccessEvents(params = {}) {
    const res = await apiClient.get("/v1/staff/access-events", { params });
    return unwrap(res, "Unable to load access events.");
  },

  async counterCashPayout(refundId, payload = {}) {
    const res = await apiClient.post(`/v1/staff/refunds/${enc(refundId)}/counter-cash-payout`, payload);
    return unwrap(res, "Unable to confirm the counter cash payout.") ?? true;
  },
};

export default staffRentalApi;
