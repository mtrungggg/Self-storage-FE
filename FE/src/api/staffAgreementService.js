import apiClient from "./apiClient";

const staffAgreementService = {
  async getOverdueAgreements(facilityId) {
    const response = await apiClient.get("/staff/overdue-agreements", {
      params: facilityId ? { facilityId: Number(facilityId) } : {},
    });
    if (response?.success !== true) throw new Error(response?.message || "Unable to load overdue agreements.");
    if (response.data == null) return [];
    if (!Array.isArray(response.data)) throw new Error("The server returned an invalid overdue agreement list.");
    return response.data;
  },
};

export default staffAgreementService;
