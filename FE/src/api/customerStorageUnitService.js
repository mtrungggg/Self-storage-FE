import catalogApi from "../services/api/catalogApi";

export const customerStorageUnitService = {
  async getAvailableUnits(params = {}) {
    if (params.facilityId) {
      const { facilityId, ...rest } = params;
      return catalogApi.getAvailableUnits(facilityId, rest);
    }
    const facilities = await catalogApi.getFacilities();
    if (!facilities.length) return [];
    const results = await Promise.all(
      facilities.map((f) => catalogApi.getAvailableUnits(f.id, params).catch(() => []))
    );
    return results.flat();
  },
};

export default customerStorageUnitService;
