import apiClient from "./apiClient";

export const facilityService = {
  /**
   * Lấy danh sách các điểm kho (cơ sở) đang hoạt động
   */
  async getFacilities() {
    const res = await apiClient.get("/customer/facilities");
    return res?.data ?? [];
  },

  /**
   * Lấy chi tiết một điểm kho theo ID
   * @param {string|number} id
   */
  async getFacilityDetail(id) {
    const res = await apiClient.get(`/customer/facilities/${id}`);
    return res?.data ?? null;
  },

  /**
   * Lấy danh sách loại ô kho (kích thước, có/không máy lạnh...)
   */
  async getUnitTypes() {
    const res = await apiClient.get("/customer/unit-types");
    return res?.data ?? [];
  },
};

export default facilityService;
