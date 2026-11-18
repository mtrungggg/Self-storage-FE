import staffRentalApi from "../services/api/staffRentalApi";

const staffInspectionService = {
  async submitInspection(id, payload) {
    return staffRentalApi.submitInspection(id, payload);
  },

  async getAssignedInspections({ facilityId, status, date } = {}) {
    const params = {};
    if (facilityId != null && facilityId !== "") params.facilityId = facilityId;
    if (status) params.status = status;
    if (date) params.date = date;

    const data = await staffRentalApi.getAssignedInspections(params);
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    return [];
  },
};

export default staffInspectionService;
