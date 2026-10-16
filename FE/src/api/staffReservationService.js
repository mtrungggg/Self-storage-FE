import apiClient from "./apiClient";

const staffReservationService = {
  async lookup(query, facilityId) {
    const params = { query: query.trim() };
    if (facilityId) params.facilityId = Number(facilityId);

    const response = await apiClient.get("/staff/reservations/lookup", { params });
    if (response?.success !== true) {
      throw new Error(response?.message || "Unable to look up reservations.");
    }
    if (response.data == null) return [];
    if (!Array.isArray(response.data)) {
      throw new Error("The server returned an invalid reservation list.");
    }
    return response.data;
  },

  async assignUnit(reservationId, storageUnitId) {
    const response = await apiClient.post(
      `/staff/reservations/${encodeURIComponent(reservationId)}/assign-unit`,
      { storageUnitId: Number(storageUnitId) },
    );
    if (response?.success !== true) {
      throw new Error(response?.message || "Unable to assign the storage unit.");
    }
    return response.data;
  },

  async createHandover(payload) {
    const response = await apiClient.post("/staff/handovers", payload);
    if (response?.success !== true) {
      throw new Error(response?.message || "Unable to create the handover record.");
    }
    if (!response.data) throw new Error("The server did not return the handover record.");
    return response.data;
  },
};

export default staffReservationService;
