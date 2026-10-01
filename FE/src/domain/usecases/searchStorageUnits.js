const normalize = (value) => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();

export function validateStorageSearch(filters) {
  const min = filters.minArea === '' ? null : Number(filters.minArea);
  const max = filters.maxArea === '' ? null : Number(filters.maxArea);
  if ([min, max].some((value) => value !== null && (!Number.isFinite(value) || value < 0))) return 'Diện tích phải là số không âm.';
  if (min !== null && max !== null && min > max) return 'Diện tích tối đa phải lớn hơn hoặc bằng diện tích tối thiểu.';
  if (Boolean(filters.startDate) !== Boolean(filters.endDate)) return 'Vui lòng nhập cả ngày bắt đầu và ngày kết thúc.';
  if (filters.startDate && filters.endDate <= filters.startDate) return 'Ngày kết thúc phải sau ngày bắt đầu.';
  return '';
}

// Dates intentionally do not imply availability: booking/contract data is not supplied yet.
export function searchStorageUnits(data, filters) {
  const words = normalize(filters.location).split(/\s+/).filter(Boolean);
  return data.storage_units.flatMap((unit) => {
    const facility = data.facilities.find((item) => item.id === unit.facility_id);
    const type = data.unit_types.find((item) => item.id === unit.unit_type_id);
    const area = data.facility_areas.find((item) => item.id === unit.area_id && item.facility_id === unit.facility_id);
    if (!unit.is_listed || unit.physical_status !== 'Available' || facility?.status !== 'Active' || !type?.is_active) return [];
    if (unit.area_id != null && !area?.is_active) return [];
    const location = normalize([facility.code, facility.name, facility.address_line, facility.ward, facility.district, facility.city].join(' '));
    if (!words.every((word) => location.includes(word))) return [];
    if (filters.unitTypeId && type.id !== filters.unitTypeId) return [];
    if (filters.minArea !== '' && type.area_m2 < Number(filters.minArea)) return [];
    if (filters.maxArea !== '' && type.area_m2 > Number(filters.maxArea)) return [];
    if (filters.climateControlled && !type.climate_controlled) return [];
    return [{ ...unit, facility, type, area }];
  });
}
