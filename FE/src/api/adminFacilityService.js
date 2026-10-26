import apiClient from "./apiClient";

export default {
  /**
   * Get paginated facilities for Admin
   * @param {{ Search?: string, Status?: string, City?: string, PageNumber?: number, PageSize?: number }} query
   */
  async getFacilities({ Search, Status, City, PageNumber = 1, PageSize = 10 } = {}) {
    const params = { PageNumber, PageSize };
    for (const [key, value] of Object.entries({ Search, Status, City })) {
      if (value !== "" && value != null) params[key] = value;
    }

    const response = await apiClient.get("/admin/facilities", { params });
    if (response?.success !== true) {
      throw new Error(response?.message || "Failed to load facilities.");
    }
    if (!Array.isArray(response.data?.items)) {
      throw new Error("Invalid facilities list format returned by server.");
    }
    return response.data;
  },

  /**
   * Get facility details by ID
   * @param {number|string} id
   */
  async getFacility(id) {
    const response = await apiClient.get(`/admin/facilities/${encodeURIComponent(id)}`);
    if (response?.success !== true) {
      throw new Error(response?.message || "Failed to load facility details.");
    }
    return response.data;
  },

  /**
   * Create a new facility
   * @param {object} payload
   */
  async createFacility(payload) {
    const response = await apiClient.post("/admin/facilities", payload);
    if (response?.success !== true) {
      throw new Error(response?.message || "Failed to create facility.");
    }
    return response.data;
  },

  /**
   * Update facility by ID
   * @param {number|string} id
   * @param {object} payload
   */
  async updateFacility(id, payload) {
    const response = await apiClient.put(`/admin/facilities/${encodeURIComponent(id)}`, payload);
    if (response?.success !== true) {
      throw new Error(response?.message || "Failed to update facility.");
    }
    return response.data;
  },

  /**
   * Update facility status
   * @param {number|string} id
   * @param {{ status: string, reason?: string }} data
   */
  async updateStatus(id, { status, reason }) {
    const payload = { status };
    if (reason && reason.trim()) {
      payload.reason = reason.trim();
    }
    const response = await apiClient.put(`/admin/facilities/${encodeURIComponent(id)}/status`, payload);
    if (response?.success !== true) {
      throw new Error(response?.message || "Failed to update facility status.");
    }
    return response.data;
  },
};

