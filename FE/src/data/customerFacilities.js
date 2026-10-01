export function parseCustomerFacilities(payload) {
  if (payload?.success !== true || !Array.isArray(payload.data)) throw new Error('Invalid facilities response');
  return payload.data.map((item) => {
    if (item?.id == null || typeof item.name !== 'string') throw new Error('Invalid facility');
    return { id: item.id, code: item.code, name: item.name, address_line: item.address, city: item.city, latitude: item.latitude, longitude: item.longitude, opening_time: item.openingTime, closing_time: item.closingTime, available_unit_count: item.availableUnitCount };
  });
}
