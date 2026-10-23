import apiClient from "./apiClient";

const staffBookingService = {
  async createWalkInBooking(payload) {
    const response = await apiClient.post("/staff/walk-in-bookings", payload);
    if (response?.success !== true) {
      throw new Error(response?.message || "Unable to create walk-in booking.");
    }
    return response.data;
  },
};

export default staffBookingService;
