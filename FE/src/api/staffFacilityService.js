import apiClient from "./apiClient";
import staffCheckInApi from "../services/api/staffCheckInApi";

const staffFacilityService = {
  async getMyFacility() {
    return await staffCheckInApi.getMyFacility();
  },

  async getUnits(facilityId) {
    return await staffCheckInApi.getUnits(facilityId ? { facilityId: Number(facilityId) } : {});
  },

  /**
   * STT 10: Cập nhật trạng thái vật lý ô kho
   * PUT /api/staff/facilities/{facilityId}/units/{unitId}/physical-status
   */
  async updatePhysicalStatus(facilityId, unitId, payload) {
    if (!facilityId) {
      throw new Error("Facility ID is required to update unit physical status.");
    }
    const body = typeof payload === "string" ? { physicalStatus: payload } : payload;
    const response = await apiClient.put(
      `/staff/facilities/${encodeURIComponent(facilityId)}/units/${encodeURIComponent(unitId)}/physical-status`,
      body
    );
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
