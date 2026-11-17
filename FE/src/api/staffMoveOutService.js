import staffRentalApi from "../services/api/staffRentalApi";

const staffMoveOutService = {
  async inspect(id, payload) {
    return staffRentalApi.inspectMoveOut(id, payload);
  },

  async getMoveOuts({ facilityId, date } = {}) {
    const params = {};
    if (facilityId) params.facilityId = facilityId;
    if (date) params.date = date;
    return staffRentalApi.getMoveOuts(params);
  },
};

export default staffMoveOutService;
