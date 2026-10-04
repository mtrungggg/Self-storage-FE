import apiClient from "./apiClient";

export default {
  async getTickets({ facilityId, status } = {}) {
    const params = {};
    if (facilityId != null && facilityId !== "") params.facilityId = facilityId;
    if (status?.trim()) params.status = status.trim();
    const response = await apiClient.get("/staff/support-tickets", { params });
    if (response?.success !== true) {
      throw new Error(response?.message || response?.errors?.join(", ") || "Unable to load support tickets.");
    }
    if (response.data == null) return [];
    if (!Array.isArray(response.data)) throw new Error("The server returned an invalid ticket list.");
    return response.data;
  },
};
