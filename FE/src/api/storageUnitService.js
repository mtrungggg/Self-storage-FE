import apiClient from "./apiClient";

export const storageUnitService = {
  /**
   * Tìm các ô kho còn trống theo điểm kho / loại kho / khu vực
   * @param {{ facilityId?: number, unitTypeId?: number, facilityAreaId?: number }} [params]
   */
  async getAvailableUnits(params = {}) {
    const res = await apiClient.get("/customer/storage-units/available", { params });
    return res?.data ?? [];
  },
};

export default storageUnitService;
