import apiClient from "../../api/apiClient";
import { enc, unwrap, unwrapRequired } from "./apiResponse";

const managerIncidentApi = {
  async reassignUnit(agreementId, payload) {
    const res = await apiClient.post(`/v1/manager/agreements/${enc(agreementId)}/reassign-unit`, payload);
    return unwrapRequired(res, "Unable to reassign the storage unit.");
  },

  async emergencyCancelAndRefund(agreementId, payload) {
    const res = await apiClient.post(`/v1/manager/agreements/${enc(agreementId)}/emergency-cancel-refund`, payload);
    return unwrap(res, "Unable to cancel the agreement and refund.");
  },
};

export default managerIncidentApi;
