import apiClient from "./apiClient";
import { getFacilities as getMockFacilities } from "../data/homeRepository";

export const facilityService = {
  /**
   * Lấy danh sách các điểm kho (Cơ sở)
   * Tự động fallback về dữ liệu mẫu nếu Backend chưa triển khai endpoint này.
   */
  async getFacilities() {
    try {
      const res = await apiClient.get("/facilities");
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
      return getMockFacilities();
    } catch {
      return getMockFacilities();
    }
  },

  /**
   * Lấy chi tiết một điểm kho theo ID
   * @param {string|number} id
   */
  async getFacilityDetail(id) {
    try {
      const res = await apiClient.get(`/facilities/${id}`);
      return res?.data || null;
    } catch {
      const all = getMockFacilities();
      return all.find((f) => String(f.id) === String(id)) || null;
    }
  },
};

export default facilityService;
