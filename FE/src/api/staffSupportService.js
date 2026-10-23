import apiClient from "./apiClient";

export default {
  async getTickets({ facilityId, category, status, onlyAssignedToMe } = {}) {
    const params = {};
    if (facilityId != null && facilityId !== "") params.facilityId = facilityId;
    if (category?.trim()) params.category = category.trim();
    if (status?.trim()) params.status = status.trim();
    if (onlyAssignedToMe != null) params.onlyAssignedToMe = onlyAssignedToMe;
    const response = await apiClient.get("/staff/tickets", { params });
    if (response?.success !== true) {
      throw new Error(response?.message || response?.errors?.join(", ") || "Unable to load tickets.");
    }
    if (response.data == null) return [];
    if (!Array.isArray(response.data)) throw new Error("The server returned an invalid ticket list.");
    return response.data;
  },

  async assignTicket(id) {
    const response = await apiClient.put(`/staff/tickets/${encodeURIComponent(id)}/assign`);
    if (response?.success !== true) {
      throw new Error(response?.message || response?.errors?.join(", ") || "Unable to assign this ticket.");
    }
    return response.data;
  },

  async proposeCharge(id, { description, reason, amount, photoUrl }) {
    const response = await apiClient.post(`/staff/tickets/${encodeURIComponent(id)}/propose-charge`, {
      amount,
      reason: reason || description || "Damage charge",
      description: description || reason || "Damage charge",
      photoUrl
    });
    if (response?.success !== true) {
      throw new Error(response?.message || response?.errors?.join(", ") || "Unable to propose this charge.");
    }
    if (!response.data || response.data.id == null) throw new Error("The server did not return the proposed charge.");
    return response.data;
  },

  async completeTicket(id, { resolution } = {}) {
    const response = await apiClient.put(`/staff/tickets/${encodeURIComponent(id)}/complete`, { resolution });
    if (response?.success !== true) {
      throw new Error(response?.message || response?.errors?.join(", ") || "Unable to complete this ticket.");
    }
    return response.data;
  },

  async resolveTicket(id, { resolution } = {}) {
    return this.completeTicket(id, { resolution });
  }
};
