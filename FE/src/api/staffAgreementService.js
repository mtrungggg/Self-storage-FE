import staffRentalApi from "../services/api/staffRentalApi";

const staffAgreementService = {
  async getOverdueAgreements(facilityId) {
    return staffRentalApi.getOverdueAgreements(facilityId);
  },

  async lockAccess(agreementId, reason) {
    return staffRentalApi.lockAccess(agreementId, reason);
  },
};

export default staffAgreementService;
