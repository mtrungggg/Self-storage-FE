import apiClient from "../../api/apiClient";
import { enc, toList, unwrap, unwrapRequired } from "./apiResponse";

const reservationApi = {
  async createReservation(data) {
    const res = await apiClient.post("/v1/reservations", data);
    return unwrapRequired(res, "Unable to create the reservation.");
  },

  async getMyReservations(params = {}) {
    const res = await apiClient.get("/v1/reservations/my", { params });
    return toList(unwrap(res, "Unable to load reservations."));
  },

  async getReservationDetail(reservationId) {
    const res = await apiClient.get(`/v1/reservations/${enc(reservationId)}`);
    return unwrapRequired(res, "Unable to load reservation details.");
  },

  async cancelReservation(reservationId, reason) {
    const res = await apiClient.post(`/v1/reservations/${enc(reservationId)}/cancel`, { reason });
    return unwrap(res, "Unable to cancel the reservation.") ?? true;
  },
};

export default reservationApi;
