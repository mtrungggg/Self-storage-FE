import apiClient from "./apiClient";

const staffFacilityService = {
  /**
   * STT 9: Danh sách ô kho và hiện trạng vật lý tại cơ sở
   * GET /api/staff/facilities/{facilityId}/units
   */
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

  /**
   * STT 10: Cập nhật trạng thái vật lý ô kho
   * PUT /api/staff/facilities/{facilityId}/units/{unitId}/physical-status
   */
  async updatePhysicalStatus(facilityId, unitId, payload) {
    const body = typeof payload === "string" ? { physicalStatus: payload } : payload;
    if (facilityId) {
      try {
        const response = await apiClient.put(
          `/staff/facilities/${encodeURIComponent(facilityId)}/units/${encodeURIComponent(unitId)}/physical-status`,
          body
        );
        if (response?.success === true) return response.data;
      } catch (err) {
        if (err.status !== 404) throw err;
      }
    }
    const response = await apiClient.put(`/staff/units/${encodeURIComponent(unitId)}/status`, body);
    if (response?.success !== true) {
      throw new Error(response?.message || response?.errors?.join(", ") || "Unable to update unit physical status.");
    }
    return response.data;
  },

  async updateUnitStatus(unitId, status, facilityId) {
    return this.updatePhysicalStatus(facilityId, unitId, status);
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
