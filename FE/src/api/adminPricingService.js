import apiClient from "./apiClient";
import PAGINATION from "../constants/pagination";

export default {
  /**
   * Get operational pricing fees
   * @param {{ FacilityId?: number, GlobalOnly?: boolean, Search?: string, FeeType?: string, IsActive?: boolean, EffectiveOn?: string, PageNumber?: number, PageSize?: number }} query
   */
  async getPricingFees({
    FacilityId,
    GlobalOnly,
    Search,
    FeeType,
    IsActive,
    EffectiveOn,
    PageNumber = 1,
    PageSize = PAGINATION.DEFAULT_PAGE_SIZE,
  } = {}) {
    const params = { PageNumber, PageSize };
    for (const [key, value] of Object.entries({
      FacilityId,
      GlobalOnly,
      Search,
      FeeType,
      IsActive,
      EffectiveOn,
    })) {
      if (value !== "" && value != null) params[key] = value;
    }

    const response = await apiClient.get("/admin/pricing/fees", { params });
    if (response?.success !== true) {
      throw new Error(response?.message || "Failed to load pricing fees.");
    }
    if (!Array.isArray(response.data?.items)) {
      throw new Error("Invalid pricing fees data format returned by server.");
    }
    return response.data;
  },

  /**
   * Create or update operational fee policy
   * @param {object} payload
   */
  async updatePricingFee(payload) {
    const response = await apiClient.put("/admin/pricing/fees", payload);
    if (response?.success !== true) {
      throw new Error(response?.message || "Failed to save pricing fee.");
    }
    return response.data;
  },
};

