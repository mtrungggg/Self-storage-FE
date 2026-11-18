import apiClient from "../../api/apiClient";
import { enc, toList, unwrap, unwrapRequired } from "./apiResponse";

const staffCheckInApi = {
  async getMyFacility() {
    const res = await apiClient.get("/v1/staff/my-facility");
    return unwrap(res, "Unable to load your assigned facility.");
  },

  async getUnits(params = {}) {
    const res = await apiClient.get("/v1/staff/units", { params });
    return toList(unwrap(res, "Unable to load facility units."));
  },

  async lookupReservations({ query, facilityId, status = "confirmed" } = {}) {
    const params = { query: query?.trim() || "", status };
    if (facilityId) params.facilityId = Number(facilityId);
    const res = await apiClient.get("/v1/staff/reservations/lookup", { params });
    return toList(unwrap(res, "Unable to look up reservations."));
  },

  async verifyQr(payload) {
    const res = await apiClient.post("/v1/staff/check-ins/verify-qr", payload);
    return unwrapRequired(res, "Unable to verify the check-in QR code.");
  },

  async assignUnit(reservationId, payload) {
    const res = await apiClient.post(`/v1/staff/reservations/${enc(reservationId)}/assign-unit`, {
      ...payload,
      storageUnitId: Number(payload?.storageUnitId),
    });
    return unwrapRequired(res, "Unable to assign the storage unit.");
  },

  assignReservationUnit(reservationId, storageUnitId, reason) {
    return staffCheckInApi.assignUnit(reservationId, { storageUnitId, reason: reason?.trim() || undefined });
  },

  async confirmCheckIn(payload) {
    const res = await apiClient.post("/v1/staff/check-ins/confirm", payload);
    return unwrapRequired(res, "Unable to confirm the check-in.");
  },

  async createTicket(payload) {
    const res = await apiClient.post("/v1/staff/tickets", payload);
    return unwrap(res, "Unable to create the incident ticket.");
  },
};

export default staffCheckInApi;
