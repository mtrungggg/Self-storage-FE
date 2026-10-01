import { useEffect, useRef, useState } from 'react';

export default function AvailableUnitsSearch({ facilities, unitTypes }) {
  const [filters, setFilters] = useState({ facilityId: '', unitTypeId: '', facilityAreaId: '' });
  const [state, setState] = useState({ loading: false, error: '', units: null });
  const request = useRef(null);
  useEffect(() => () => request.current?.abort(), []);
  const update = (key, value) => {
    request.current?.abort();
    setFilters((previous) => ({ ...previous, [key]: value, ...(key === 'facilityId' ? { facilityAreaId: '' } : {}) }));
    setState({ loading: false, error: '', units: null });
  };
  async function submit(event) {
    event.preventDefault();
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setState({ loading: true, error: '', units: null });
    try {
      const configured = import.meta.env.VITE_AVAILABLE_STORAGE_UNITS_URL;
      if (!configured) throw new Error('Chưa cấu hình API ô kho trống.');
      const url = new URL(configured, window.location.origin);
      for (const [key, value] of Object.entries(filters)) {
        url.searchParams.delete(key);
        if (value) url.searchParams.set(key, value);
      }
      const response = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error([401, 403].includes(response.status) ? 'Bạn chưa có quyền truy cập danh sách ô kho. Vui lòng đăng nhập.' : 'Không tải được ô kho trống. Vui lòng thử lại.');
      const payload = await response.json();
      if (payload?.success !== true || !Array.isArray(payload.data)) throw new Error('Dữ liệu ô kho trả về không đúng cấu trúc.');
      if (payload.data.some((item) => !item || typeof item !== 'object' || Array.isArray(item))) throw new Error('Thông tin ô kho không hợp lệ.');
      if (!controller.signal.aborted) setState({ loading: false, error: '', units: payload.data });
    } catch (error) {
      if (!controller.signal.aborted) setState({ loading: false, error: error.message, units: null });
    }
  }
  const inputClass = 'mt-1 w-full rounded-lg border bg-white p-3';
  return <section className="mt-6 rounded-xl border bg-white p-5" aria-label="Tìm ô kho trống">
    <h2 className="text-lg font-bold">Tìm ô kho trống</h2>
    <form onSubmit={submit} className="mt-4 grid gap-4 md:grid-cols-3">
      <label>Cơ sở<select value={filters.facilityId} onChange={(event) => update('facilityId', event.target.value)} className={inputClass}><option value="">Tất cả cơ sở</option>{facilities.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label>Loại kho<select value={filters.unitTypeId} onChange={(event) => update('unitTypeId', event.target.value)} className={inputClass}><option value="">Tất cả loại kho</option>{unitTypes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label>ID phân khu (không bắt buộc)<input type="number" min="1" step="1" value={filters.facilityAreaId} onChange={(event) => update('facilityAreaId', event.target.value)} className={inputClass} placeholder="Bỏ trống để tìm mọi phân khu" /></label>
      <button disabled={state.loading} type="submit" className="rounded-lg bg-[#0b1c30] px-4 py-3 text-white disabled:opacity-50">{state.loading ? 'Đang tìm…' : 'Tìm ô kho trống'}</button>
    </form>
    <p className="mt-3 text-sm text-[#58657a]">Kết quả theo trạng thái khả dụng do hệ thống trả về; chưa kiểm tra khoảng thời gian thuê.</p>
    {state.error && <p role="alert" className="mt-3 text-red-700">{state.error}</p>}
    {state.units && <div className="mt-4"><p role="status">{state.units.length === 0 ? 'Không tìm thấy ô kho phù hợp. Thử bỏ bộ lọc phân khu hoặc đổi cơ sở.' : `Tìm thấy ${state.units.length} ô kho.`}</p>
      <div className="mt-3 grid gap-3 md:grid-cols-2">{state.units.map((unit, index) => <AvailableUnit key={unit.id ?? unit.unitId ?? index} unit={unit} />)}</div>
    </div>}
  </section>;
}

// Provisional aliases until a non-empty API response confirms the DTO.
function AvailableUnit({ unit }) {
  const code = unit.unitCode ?? unit.unit_code;
  const id = unit.id ?? unit.unitId;
  const status = unit.physicalStatus ?? unit.physical_status;
  return <article className="rounded-lg border bg-[#f8faff] p-4">
    <h3 className="font-bold">{code ?? (id != null ? `Ô kho #${id}` : 'Ô kho')}</h3>
    {(unit.facilityName ?? unit.facility_name) && <p>{unit.facilityName ?? unit.facility_name}</p>}
    {(unit.unitTypeName ?? unit.unit_type_name) && <p>{unit.unitTypeName ?? unit.unit_type_name}</p>}
    {(unit.floorLabel ?? unit.floor_label) != null && <p>Tầng: {unit.floorLabel ?? unit.floor_label}</p>}
    {(unit.zoneLabel ?? unit.zone_label) != null && <p>Dãy: {unit.zoneLabel ?? unit.zone_label}</p>}
    {status && <p>Trạng thái: {status}</p>}
    {!code && id == null && <p className="text-sm">Chưa nhận được mã định danh ô kho để hiển thị chi tiết.</p>}
  </article>;
}
