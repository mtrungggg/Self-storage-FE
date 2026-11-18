import apiClient from "./apiClient";
import staffCheckInApi from "../services/api/staffCheckInApi";

const staffReservationService = {
  async lookup(query, facilityId, status = "confirmed") {
    return await staffCheckInApi.lookupReservations({ query, facilityId, status });
  },

  async assignUnit(reservationId, storageUnitId, reason) {
    return await staffCheckInApi.assignReservationUnit(reservationId, storageUnitId, reason);
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
