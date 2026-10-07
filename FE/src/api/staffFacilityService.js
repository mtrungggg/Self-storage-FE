import apiClient from "./apiClient";

const staffFacilityService = {
  async getUnits(facilityId) {
    const response = await apiClient.get(`/staff/facilities/${encodeURIComponent(facilityId)}/units`);
    if (response?.success !== true) {
      throw new Error(response?.message || "Unable to load facility units.");
    }
    if (response.data == null) return [];
    if (!Array.isArray(response.data)) {
      throw new Error("The server returned an invalid unit list.");
    }
    return response.data;
  },

  async updateUnitStatus(unitId, status) {
    const response = await apiClient.put(`/staff/units/${encodeURIComponent(unitId)}/status`, { status });
    if (response?.success !== true) {
      throw new Error(response?.message || "Unable to update the unit status.");
    }
    return response.data;
  },

  async createMaintenanceOrder(unitId, payload) {
    const response = await apiClient.post(`/staff/units/${encodeURIComponent(unitId)}/maintenance-orders`, payload);
    if (response?.success !== true) {
      throw new Error(response?.message || "Unable to create the maintenance order.");
    }
    if (!response.data) throw new Error("The server did not return the maintenance order.");
    return response.data;
  },
};

export default staffFacilityService;
