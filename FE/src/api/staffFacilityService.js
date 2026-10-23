import apiClient from "./apiClient";

const staffFacilityService = {
  async getMyFacility() {
    const response = await apiClient.get("/staff/my-facility");
    if (response?.success !== true) {
      throw new Error(response?.message || "Unable to load assigned facility.");
    }
    return response.data;
  },

  async getUnits(facilityId, filters = {}) {
    const params = { ...filters };
    if (facilityId != null && facilityId !== "") params.facilityId = facilityId;
    const response = await apiClient.get("/staff/units", { params });
    if (response?.success !== true) {
      throw new Error(response?.message || "Unable to load facility units.");
    }
    if (response.data == null) return [];
    if (!Array.isArray(response.data)) {
      throw new Error("The server returned an invalid unit list.");
    }
    return response.data;
  },

  async getUnitDetail(unitId) {
    const response = await apiClient.get(`/staff/units/${encodeURIComponent(unitId)}`);
    if (response?.success !== true) {
      throw new Error(response?.message || "Unable to load unit detail.");
    }
    return response.data;
  },
};

export default staffFacilityService;
