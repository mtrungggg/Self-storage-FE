import apiClient from "./apiClient";

export default {
  /**
   * Complete / resolve ticket
   * STT 6: PUT /api/staff/tickets/{id}/complete
   */
  async completeTicket(id, payload = {}) {
    const body = {
      resolution: payload.resolution?.trim() || "Work completed",
    };
    try {
      const response = await apiClient.put(`/staff/tickets/${encodeURIComponent(id)}/complete`, body);
      if (response?.success === true) return response.data;
    } catch (err) {
      if (err.status !== 404) throw err;
    }
    // Fallback to legacy support-tickets resolve
    const response = await apiClient.put(`/staff/support-tickets/${encodeURIComponent(id)}/resolve`, body);
    if (response?.success !== true) {
      throw new Error(response?.message || response?.errors?.join(", ") || "Unable to complete this ticket.");
    }
    return response.data;
  },

  async resolveTicket(id, payload = {}) {
    return this.completeTicket(id, payload);
  },

  /**
   * Propose incident/damage charge
   * STT 5: POST /api/staff/tickets/{id}/propose-charge
   */
  async proposeCharge(id, { amount, reason, description, photoUrl }) {
    const payload = {
      amount: Number(amount),
      reason: reason?.trim() || description?.trim() || "Incident fee",
      description: description?.trim() || "",
      photoUrl: photoUrl?.trim() || undefined,
    };
    try {
      const response = await apiClient.post(`/staff/tickets/${encodeURIComponent(id)}/propose-charge`, payload);
      if (response?.success === true) return response.data;
    } catch (err) {
      if (err.status !== 404) throw err;
    }
    const response = await apiClient.post(`/staff/support-tickets/${encodeURIComponent(id)}/propose-charge`, payload);
    if (response?.success !== true) {
      throw new Error(response?.message || response?.errors?.join(", ") || "Unable to propose this charge.");
    }
    if (!response.data || response.data.id == null) throw new Error("The server did not return the proposed charge.");
    return response.data;
  },

  /**
   * Send ticket message
   * POST /api/staff/tickets/{id}/messages
   */
  async sendMessage(id, { body, isInternal }) {
    const response = await apiClient.post(`/staff/tickets/${encodeURIComponent(id)}/messages`, {
      body,
      isInternal,
    });
    if (response?.success !== true) {
      throw new Error(response?.message || response?.errors?.join(", ") || "Unable to send this message.");
    }
    if (!response.data || response.data.id == null) throw new Error("The server did not return the sent message.");
    return response.data;
  },

  /**
   * Staff accepts / claims assignment
   * STT 4: PUT /api/staff/tickets/{id}/assign
   */
  async assignTicket(id) {
    try {
      const response = await apiClient.put(`/staff/tickets/${encodeURIComponent(id)}/assign`);
      if (response?.success === true) return response.data;
    } catch (err) {
      if (err.status !== 404) throw err;
    }
    const response = await apiClient.put(`/staff/support-tickets/${encodeURIComponent(id)}/assign`);
    if (response?.success !== true) {
      throw new Error(response?.message || response?.errors?.join(", ") || "Unable to assign this ticket.");
    }
    return response.data;
  },

  /**
   * Get tickets list
   * STT 3: GET /api/staff/tickets?facilityId=&category=&status=&onlyAssignedToMe=
   */
  async getTickets({ facilityId, category, status, onlyAssignedToMe } = {}) {
    const params = {};
    if (facilityId != null && facilityId !== "") params.facilityId = facilityId;
    if (category?.trim()) params.category = category.trim();
    if (status?.trim()) params.status = status.trim();
    if (onlyAssignedToMe != null && onlyAssignedToMe !== "") params.onlyAssignedToMe = onlyAssignedToMe;

    try {
      const response = await apiClient.get("/staff/tickets", { params });
      if (response?.success === true) {
        const data = response.data;
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.items)) return data.items;
        return [];
      }
    } catch (err) {
      if (err.status !== 404) throw err;
    }

    // Fallback to /staff/support-tickets if backend has not migrated route yet
    const response = await apiClient.get("/staff/support-tickets", { params });
    if (response?.success !== true) {
      throw new Error(response?.message || response?.errors?.join(", ") || "Unable to load support tickets.");
    }
    if (response.data == null) return [];
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response.data?.items)) return response.data.items;
    return [];
  },
};
