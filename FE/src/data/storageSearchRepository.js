// Demo records shaped after core.*. Status values are provisional until API integration.
export function getStorageSearchData() {
  return {
    facilities: [
      { id: 'f1', code: 'HCM01', name: 'Kho Bình Thạnh', address_line: '120 Điện Biên Phủ', ward: 'Phường 17', district: 'Bình Thạnh', city: 'Hồ Chí Minh', status: 'Active' },
      { id: 'f2', code: 'HN01', name: 'Kho Cầu Giấy', address_line: '45 Duy Tân', ward: 'Dịch Vọng Hậu', district: 'Cầu Giấy', city: 'Hà Nội', status: 'Active' },
    ],
    facility_areas: [
      { id: 'a1', facility_id: 'f1', parent_area_id: null, code: 'A', name: 'Tầng trệt • Dãy A', area_type: 'Zone', display_order: 1, is_active: true },
      { id: 'a2', facility_id: 'f2', parent_area_id: null, code: 'B', name: 'Tầng 1 • Dãy B', area_type: 'Zone', display_order: 1, is_active: true },
    ],
    unit_types: [
      { id: 't1', code: 'SMALL', name: 'Kho cá nhân nhỏ', width_m: 2, length_m: 2, height_m: 3, area_m2: 4, volume_m3: 12, climate_controlled: false, max_weight_kg: 500, description: 'Phù hợp thùng đồ và vật dụng cá nhân.', is_active: true },
      { id: 't2', code: 'CLIMATE', name: 'Kho kiểm soát khí hậu', width_m: 2, length_m: 5, height_m: 3, area_m2: 10, volume_m3: 30, climate_controlled: true, max_weight_kg: 1000, description: 'Có kiểm soát khí hậu cho đồ cần bảo quản.', is_active: true },
      { id: 't3', code: 'LARGE', name: 'Kho hàng lớn', width_m: 4, length_m: 5, height_m: 3, area_m2: 20, volume_m3: 60, climate_controlled: false, max_weight_kg: 2000, description: 'Phù hợp nội thất và hàng hóa cồng kềnh.', is_active: true },
    ],
    storage_units: [
      { id: 'u1', facility_id: 'f1', unit_type_id: 't1', area_id: 'a1', unit_code: 'HCM-A01', floor_label: 'Trệt', zone_label: 'A', physical_status: 'Available', is_listed: true },
      { id: 'u2', facility_id: 'f1', unit_type_id: 't2', area_id: 'a1', unit_code: 'HCM-A02', floor_label: 'Trệt', zone_label: 'A', physical_status: 'Available', is_listed: true },
      { id: 'u3', facility_id: 'f2', unit_type_id: 't2', area_id: 'a2', unit_code: 'HN-B01', floor_label: '1', zone_label: 'B', physical_status: 'Available', is_listed: true },
      { id: 'u4', facility_id: 'f2', unit_type_id: 't3', area_id: 'a2', unit_code: 'HN-B02', floor_label: '1', zone_label: 'B', physical_status: 'Available', is_listed: true },
      { id: 'u5', facility_id: 'f1', unit_type_id: 't3', area_id: 'a1', unit_code: 'HCM-A03', physical_status: 'Rented', is_listed: true },
      { id: 'u6', facility_id: 'f2', unit_type_id: 't1', area_id: 'a2', unit_code: 'HN-B03', physical_status: 'Maintenance', is_listed: true },
      { id: 'u7', facility_id: 'f1', unit_type_id: 't1', area_id: 'a1', unit_code: 'HCM-A04', physical_status: 'Available', is_listed: false },
    ],
  };
}
