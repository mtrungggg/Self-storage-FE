import { useState } from 'react';
import StorageTerms from './StorageTerms';
import { getStorageTermsData } from '../data/storageTermsRepository';
import { getStorageSearchData } from '../data/storageSearchRepository';
import { searchStorageUnits, validateStorageSearch } from '../domain/usecases/searchStorageUnits';

const data = getStorageSearchData();
const termsData = getStorageTermsData();
const initialFilters = { location: '', unitTypeId: '', minArea: '', maxArea: '', startDate: '', endDate: '', climateControlled: false };
const inputClass = 'mt-1 w-full rounded-lg border border-[#dfe7f5] bg-[#f8faff] p-3 text-sm text-[#0b1c30] outline-none focus:border-blue-500';

export default function StorageSearch() {
  const [draft, setDraft] = useState(initialFilters);
  const [applied, setApplied] = useState(initialFilters);
  const [error, setError] = useState('');
  const [sort, setSort] = useState('code');
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const pricingDate = applied.startDate || today;
  const update = (key, value) => { setDraft((previous) => ({ ...previous, [key]: value })); setError(''); };
  const results = searchStorageUnits(data, applied).sort((a, b) => sort === 'area' ? a.type.area_m2 - b.type.area_m2 : a.unit_code.localeCompare(b.unit_code));
  const submit = (event) => {
    event.preventDefault();
    const message = validateStorageSearch(draft);
    setError(message);
    if (!message) setApplied({ ...draft });
  };
  const reset = () => { setDraft(initialFilters); setApplied(initialFilters); setError(''); setSort('code'); };

  return <section aria-label="Tìm kiếm kho" className="mt-6">
    <form onSubmit={submit} className="rounded-2xl border border-[#dfe7f5] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold">Tìm kho phù hợp</h2>
      <p className="mt-1 text-sm text-[#58657a]">Dữ liệu minh họa, chưa kết nối hệ thống kho thực tế.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="text-sm font-semibold">Vị trí
          <input className={inputClass} value={draft.location} onChange={(e) => update('location', e.target.value)} placeholder="Tên cơ sở, địa chỉ, quận hoặc thành phố" />
        </label>
        <label className="text-sm font-semibold">Loại kho
          <select className={inputClass} value={draft.unitTypeId} onChange={(e) => update('unitTypeId', e.target.value)}>
            <option value="">Tất cả loại kho</option>
            {data.unit_types.filter((type) => type.is_active).map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm font-semibold">Diện tích từ (m²)<input type="number" min="0" step="any" className={inputClass} value={draft.minArea} onChange={(e) => update('minArea', e.target.value)} placeholder="Không giới hạn" /></label>
          <label className="text-sm font-semibold">Đến (m²)<input type="number" min="0" step="any" className={inputClass} value={draft.maxArea} onChange={(e) => update('maxArea', e.target.value)} placeholder="Không giới hạn" /></label>
        </div>
        <label className="text-sm font-semibold">Ngày bắt đầu thuê<input type="date" className={inputClass} value={draft.startDate} onChange={(e) => update('startDate', e.target.value)} /></label>
        <label className="text-sm font-semibold">Ngày kết thúc thuê<input type="date" className={inputClass} value={draft.endDate} onChange={(e) => update('endDate', e.target.value)} /></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.climateControlled} onChange={(e) => update('climateControlled', e.target.checked)} />Có kiểm soát khí hậu</label>
      </div>
      <p className="mt-3 text-xs text-[#58657a]">Thời gian thuê chỉ ghi nhận nhu cầu; chưa kiểm tra được lịch trống khi chưa có dữ liệu đặt chỗ/hợp đồng.</p>
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      <div className="mt-4 flex gap-3">
        <button type="submit" className="rounded-lg bg-[#0b1c30] px-6 py-3 text-sm font-bold text-white hover:bg-[#132741]">Tìm kho ngay</button>
        <button type="button" onClick={reset} className="rounded-lg border border-[#dfe7f5] px-4 py-3 text-sm">Xóa bộ lọc</button>
      </div>
    </form>
    <div className="my-5 flex flex-wrap items-center justify-between gap-3">
      <div role="status" className="text-sm">
        <p><strong>{results.length} ô kho</strong> phù hợp bộ lọc tại {new Set(results.map((unit) => unit.facility_id)).size} cơ sở (dữ liệu mẫu).</p>
        {applied.startDate && <p className="mt-1 text-amber-800">Yêu cầu thuê: {applied.startDate} → {applied.endDate}. Chưa xác nhận lịch trống.</p>}
      </div>
      <label className="text-sm">Sắp xếp theo <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-lg border border-[#dfe7f5] bg-white p-2"><option value="code">Mã kho</option><option value="area">Diện tích tăng dần</option></select></label>
    </div>
    {results.length === 0 && <div className="rounded-xl border border-dashed border-[#dfe7f5] bg-white p-8 text-center"><h3 className="font-bold">Không tìm thấy ô kho phù hợp</h3><p className="mt-2 text-sm">Thử đổi vị trí, loại kho hoặc mở rộng khoảng diện tích.</p><button onClick={reset} className="mt-3 text-blue-700 underline">Xóa bộ lọc</button></div>}
    {results.length > 0 && <p className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-[#58657a]">Giá, phí và chính sách là dữ liệu minh họa. Đơn vị: VND. Tra cứu hiệu lực tại {pricingDate} ({applied.startDate ? 'ngày bắt đầu thuê' : 'hôm nay'}), bao gồm ngày kết thúc hiệu lực. Chưa tính tổng tiền thuê hoặc giá theo ngày.</p>}
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {results.map((unit) => <article key={unit.id} className="rounded-xl border border-[#dfe7f5] bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold text-blue-700">{unit.facility.name}</p>
        <h3 className="mt-1 text-lg font-bold">{unit.unit_code} · {unit.type.name}</h3>
        <p className="mt-2 text-sm text-[#58657a]">{[unit.facility.address_line, unit.facility.ward, unit.facility.district, unit.facility.city].filter(Boolean).join(', ')}</p>
        <p className="mt-2 text-sm">Khu vực: {unit.area?.name ?? 'Chưa phân khu'}</p>
        <p className="mt-3 font-bold">{unit.type.area_m2} m² · {unit.type.volume_m3} m³</p>
        <p className="mt-1 text-sm">Rộng × dài × cao: {unit.type.width_m} × {unit.type.length_m} × {unit.type.height_m} m</p>
        <p className="mt-1 text-sm">Tải trọng tối đa: {unit.type.max_weight_kg} kg</p>
        <p className="mt-1 text-sm">{unit.type.climate_controlled ? 'Có kiểm soát khí hậu' : 'Không kiểm soát khí hậu'}</p>
        <p className="mt-3 text-sm text-[#58657a]">{unit.type.description}</p>
        <p className="mt-3 text-xs font-semibold text-emerald-800">Trạng thái hiện tại: Available (dữ liệu mẫu)</p>
        <StorageTerms data={termsData} unit={unit} date={pricingDate} />
      </article>)}
    </div>
  </section>;
}
