export function parseCustomerUnitTypes(payload) {
  if (payload?.success !== true || !Array.isArray(payload.data)) throw new Error('Invalid unit types response');
  return payload.data.map((item) => {
    if (item?.id == null || typeof item.name !== 'string') throw new Error('Invalid unit type');
    return { id: item.id, code: item.code, name: item.name, width_m: item.widthM, length_m: item.lengthM, height_m: item.heightM, area_m2: item.areaM2, volume_m3: item.volumeM3, max_weight_kg: item.maxWeightKg, climate_controlled: item.climateControlled, description: item.description };
  });
}
