import apiClient from "./apiClient";
import { getAvailableUnits as getMockUnits } from "../data/homeRepository";

export const storageUnitService = {
  /**
   * Tìm kiếm & lọc ô kho trống (Bước i & Bước ii)
   * @param {{ facilityId?: string, type?: string, sizeCategory?: string, keyword?: string }} params
   */
  async searchUnits(params = {}) {
    try {
      const res = await apiClient.get("/storage-units/search", { params });
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
      return this.filterMockUnits(params);
    } catch {
      return this.filterMockUnits(params);
    }
  },

  /**
   * Lấy thông tin chi tiết của một ô kho trống
   * @param {string|number} id
   */
  async getUnitDetail(id) {
    try {
      const res = await apiClient.get(`/storage-units/${id}`);
      return res?.data || null;
    } catch {
      const all = getMockUnits();
      return all.find((u) => String(u.id) === String(id)) || null;
    }
  },

  filterMockUnits({ facilityId, type, sizeCategory, keyword }) {
    let units = getMockUnits();
    if (facilityId && facilityId !== "all") {
      units = units.filter((u) => u.facilityId === facilityId);
    }
    if (type && type !== "all") {
      units = units.filter((u) => u.type === type);
    }
    if (sizeCategory && sizeCategory !== "all") {
      units = units.filter((u) => u.sizeCategory === sizeCategory);
    }
    if (keyword?.trim()) {
      const q = keyword.toLowerCase();
      units = units.filter(
        (u) =>
          u.unitCode.toLowerCase().includes(q) ||
          u.facilityName.toLowerCase().includes(q) ||
          u.typeName.toLowerCase().includes(q)
      );
    }
    return units;
  },
};

export default storageUnitService;
