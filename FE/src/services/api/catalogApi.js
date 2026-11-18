import apiClient from "../../api/apiClient";
import { enc, toList, unwrap, unwrapRequired } from "./apiResponse";

const catalogApi = {
  async getFacilities(params = {}) {
    const res = await apiClient.get("/v1/facilities", { params: { pageSize: 100, ...params } });
    return toList(unwrap(res, "Unable to load facilities."));
  },

  async getFacilitiesPaged(params = {}) {
    const res = await apiClient.get("/v1/facilities", { params });
    return unwrapRequired(res, "Unable to load facilities.");
  },

  async getFacilityDetail(facilityId) {
    const res = await apiClient.get(`/v1/facilities/${enc(facilityId)}`);
    return unwrap(res, "Unable to load facility details.");
  },

  async getUnitTypes() {
    const res = await apiClient.get("/v1/unit-types");
    return toList(unwrap(res, "Unable to load unit types."));
  },

  async getAvailableUnits(facilityId, params = {}) {
    const { facilityAreaId, ...rest } = params;
    const query = { ...rest };
    if (facilityAreaId != null && query.areaId == null) query.areaId = facilityAreaId;
    const res = await apiClient.get(`/v1/facilities/${enc(facilityId)}/units/available`, { params: query });
    return toList(unwrap(res, "Unable to load available units."));
  },

  async getPricingQuote(data) {
    const res = await apiClient.post("/v1/pricing/quote", data);
    return unwrapRequired(res, "Unable to calculate the pricing quote.");
  },
};

export default catalogApi;
