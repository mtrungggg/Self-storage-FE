import { Link } from 'react-router-dom';
import { useState } from 'react';
import AvailableUnitsSearch from './AvailableUnitsSearch';
import PricingCalculator from './PricingCalculator';
import CreateReservation from './CreateReservation';
import { getStorageSearchData } from '../data/storageSearchRepository';

export default function StorageSearch({ records, loading = false, loadError = '', unitTypesError = '' }) {
  const data = getStorageSearchData(records);
  const [selectedUnit, setSelectedUnit] = useState(null);
  if (loading) return <p role="status" className="mt-6 rounded-xl border bg-white p-5">Đang tải cơ sở và loại kho…</p>;
  if (loadError) return <div role="alert" className="mt-6 rounded-xl border bg-white p-5"><p className="text-red-700">Không tải được dữ liệu danh mục kho.</p><p className="mt-1 text-sm text-[#58657a]">{loadError}</p><button onClick={() => window.location.reload()} className="mt-3 text-blue-700 underline">Tải lại trang</button></div>;
  if (!records) return <p role="status" className="mt-6 rounded-xl border bg-white p-5 text-amber-800">Chưa cấu hình nguồn dữ liệu kho.</p>;

  return <div className="mt-6 space-y-6">
    <AvailableUnitsSearch facilities={data.facilities} unitTypes={data.unit_types} onSelectUnit={setSelectedUnit} />
    <PricingCalculator facilities={data.facilities} unitTypes={data.unit_types} />
    <CreateReservation key={selectedUnit?.storageUnitId ?? 'none'} facilities={data.facilities} unitTypes={data.unit_types} selection={selectedUnit} />

    <section className="rounded-xl border bg-white p-5">
      <h2 className="text-lg font-bold">Loại kho ({data.unit_types.length})</h2>
      {unitTypesError && <p role="alert" className="mt-2 text-red-700">{unitTypesError}</p>}
      {!unitTypesError && data.unit_types.length === 0 && <p className="mt-3">Chưa có loại kho.</p>}
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {data.unit_types.map((type) => <article key={type.id} className="rounded-xl border border-[#dfe7f5] bg-[#f8faff] p-5">
          <h3 className="font-bold">{type.name}</h3>
          <p className="text-sm text-[#58657a]">Mã: {type.code}</p>
          <p className="mt-3">Dài × rộng × cao: {type.length_m} × {type.width_m} × {type.height_m} m</p>
          <p>Diện tích: {type.area_m2} m² · Thể tích: {type.volume_m3} m³</p>
          <p>Tải trọng tối đa: {type.max_weight_kg ?? 'Chưa cập nhật'} kg</p>
          <p>{type.climate_controlled === true ? 'Có kiểm soát khí hậu' : type.climate_controlled === false ? 'Không kiểm soát khí hậu' : 'Chưa cập nhật kiểm soát khí hậu'}</p>
          {type.description && <p className="mt-2 text-sm text-[#58657a]">{type.description}</p>}
        </article>)}
      </div>
    </section>

    <section className="rounded-xl border bg-white p-5">
      <h2 className="text-lg font-bold">Cơ sở kho ({data.facilities.length})</h2>
      {data.facilities.length === 0 && <p className="mt-3">Chưa có cơ sở kho.</p>}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {data.facilities.map((facility) => <article key={facility.id} className="rounded-xl border border-[#dfe7f5] p-5">
          <h3 className="font-bold">{facility.name}</h3>
          <p className="text-sm text-[#58657a]">{facility.code}</p>
          <p className="mt-2">{[facility.address_line, facility.city].filter(Boolean).join(', ')}</p>
          <p>Giờ mở cửa: {facility.opening_time ?? 'Chưa cập nhật'} – {facility.closing_time ?? 'Chưa cập nhật'}</p>
          <p className="mt-2 font-semibold">Số ô đang khả dụng: {facility.available_unit_count ?? 'Chưa cập nhật'}</p>
          <Link to={`/facilities/${encodeURIComponent(facility.id)}`} className="mt-4 inline-block rounded-lg bg-[#0b1c30] px-4 py-2 text-sm font-semibold text-white">Xem cơ sở</Link>
        </article>)}
      </div>
    </section>
  </div>;
}
