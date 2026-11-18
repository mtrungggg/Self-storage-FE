import reservationApi from "../services/api/reservationApi";

export const customerReservationService = {
  createReservation: (data) => reservationApi.createReservation(data),
  getMyReservations: (status) => reservationApi.getMyReservations(status ? { status } : {}),
  getReservationDetail: (id) => reservationApi.getReservationDetail(id),
  cancelReservation: (id, reason) => reservationApi.cancelReservation(id, reason),
};

export default customerReservationService;
