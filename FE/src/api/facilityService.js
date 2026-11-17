import catalogApi from "../services/api/catalogApi";

export const facilityService = {
  getFacilities: (params) => catalogApi.getFacilities(params),
  getFacilitiesPaged: (params) => catalogApi.getFacilitiesPaged(params),
  getFacilityDetail: (id) => catalogApi.getFacilityDetail(id),
  getUnitTypes: () => catalogApi.getUnitTypes(),
};

export default facilityService;
