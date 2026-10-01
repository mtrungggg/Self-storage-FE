// Receive API records without substituting demonstration data.
export function getStorageSearchData(records = {}) {
  return {
    facilities: records?.facilities ?? [],
    facility_areas: records?.facility_areas ?? [],
    unit_types: records?.unit_types ?? [],
    storage_units: records?.storage_units ?? [],
  };
}
