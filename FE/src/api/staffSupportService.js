import apiClient from "./apiClient";

export default {
  async sendMessage(id, { body, isInternal }) {
    const response = await apiClient.post(`/staff/support-tickets/${encodeURIComponent(id)}/messages`, { body, isInternal });
    if (response?.success !== true) {
      throw new Error(response?.message || response?.errors?.join(", ") || "Unable to send this message.");
    }
    if (!response.data || response.data.id == null) throw new Error("The server did not return the sent message.");
    return response.data;
  },
  async assignTicket(id) {
    const response = await apiClient.put(`/staff/support-tickets/${encodeURIComponent(id)}/assign`);
    if (response?.success !== true) {
      throw new Error(response?.message || response?.errors?.join(", ") || "Unable to assign this ticket.");
    }
    return response.data;
  },
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
