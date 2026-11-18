import apiClient from "../../api/apiClient";
import { enc, toList, unwrap } from "./apiResponse";

const managerDelinquencyApi = {
  async getDelinquencyCases(facilityId, status) {
    const res = await apiClient.get(`/v1/manager/facilities/${enc(facilityId)}/delinquency-cases`, {
      params: status ? { status } : {},
    });
    return toList(unwrap(res, "Unable to load delinquency cases."));
  },

  async addDelinquencyAction(caseId, payload) {
    const res = await apiClient.post(`/v1/manager/delinquency-cases/${enc(caseId)}/actions`, payload);
    return unwrap(res, "Unable to record the delinquency action.");
  },

  async liquidateAgreement(agreementId, payload) {
    const res = await apiClient.post(`/v1/manager/agreements/${enc(agreementId)}/liquidate`, payload);
    return unwrap(res, "Unable to liquidate the agreement.");
  },

  async getExpiringCases(facilityId) {
    const res = await apiClient.get(`/v1/manager/facilities/${enc(facilityId)}/expiring-cases`);
    return toList(unwrap(res, "Unable to load expiring contracts."));
  },

  async assignInspection(agreementId, payload) {
    const res = await apiClient.post(`/v1/manager/agreements/${enc(agreementId)}/assign-inspection`, payload);
    return unwrap(res, "Unable to assign the inspection.");
  },
};

export default managerDelinquencyApi;
