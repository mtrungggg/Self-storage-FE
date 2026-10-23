import apiClient from "./apiClient";

const staffShiftService = {
  async getMyShifts(params = {}) {
    const res = await apiClient.get("/staff/shifts", { params });
    const items = res?.data ?? res ?? [];
    return Array.isArray(items) ? items : [];
  },

  async checkIn(shiftId) {
    const res = await apiClient.post(`/staff/shifts/${encodeURIComponent(shiftId)}/check-in`);
    return res?.data ?? res ?? null;
  },

  async checkOut(shiftId) {
    const res = await apiClient.post(`/staff/shifts/${encodeURIComponent(shiftId)}/check-out`);
    return res?.data ?? res ?? null;
  },
};

export default staffShiftService;
