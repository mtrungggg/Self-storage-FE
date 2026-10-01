import { useEffect, useRef, useState } from 'react';

// Map geometry/DTO is not supplied yet. Do not guess coordinates or unit availability.
export default function FacilityMapLoader({ facilityId }) {
  const [areaId, setAreaId] = useState('');
  const [floor, setFloor] = useState('');
  const [state, setState] = useState({ loading: false, error: '', received: false, empty: false });
  const request = useRef(null);
  useEffect(() => () => request.current?.abort(), []);
  const changeFilter = (setter, value) => {
    request.current?.abort();
    setter(value);
    setState({ loading: false, error: '', received: false, empty: false });
  };
  async function load(event) {
    event.preventDefault();
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setState({ loading: true, error: '', received: false, empty: false });
    try {
      const base = import.meta.env.VITE_CUSTOMER_FACILITIES_URL;
      if (!base) throw new Error('Chưa cấu hình API cơ sở.');
      const url = new URL(base, window.location.origin);
      url.pathname = `${url.pathname.replace(/\/$/, '')}/${encodeURIComponent(facilityId)}/map`;
      url.search = '';
      if (areaId) url.searchParams.set('areaId', areaId);
      if (floor.trim()) url.searchParams.set('floor', floor.trim());
      const response = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error([401, 403].includes(response.status) ? 'Bạn chưa có quyền xem sơ đồ. Vui lòng đăng nhập.' : response.status === 404 ? 'Không tìm thấy sơ đồ cơ sở.' : 'Không tải được sơ đồ. Vui lòng thử lại.');
      const payload = await response.json();
      if (payload?.success !== true || !Object.hasOwn(payload, 'data')) throw new Error('Phản hồi sơ đồ không đúng cấu trúc dự kiến.');
      if (!controller.signal.aborted) setState({ loading: false, error: '', received: true, empty: payload.data == null || (Array.isArray(payload.data) && payload.data.length === 0) });
    } catch (error) {
      if (!controller.signal.aborted) setState({ loading: false, error: error.message, received: false, empty: false });
    }
  }
  return <section className="mt-6 rounded-xl border bg-white p-5" aria-label="Sơ đồ cơ sở">
    <h2 className="text-lg font-bold">Sơ đồ cơ sở</h2>
    <form onSubmit={load} className="mt-3 grid gap-3 sm:grid-cols-3">
      <label>ID phân khu (tùy chọn)<input type="number" min="1" step="1" value={areaId} onChange={(event) => changeFilter(setAreaId, event.target.value)} className="mt-1 w-full rounded-lg border p-3" /></label>
      <label>Tầng (tùy chọn)<input value={floor} onChange={(event) => changeFilter(setFloor, event.target.value)} className="mt-1 w-full rounded-lg border p-3" /></label>
      <button disabled={state.loading} className="self-end rounded-lg bg-[#0b1c30] p-3 text-white disabled:opacity-50">{state.loading ? 'Đang tải…' : 'Tải sơ đồ'}</button>
    </form>
    <p className="mt-3 text-sm text-[#58657a]">Phần hiển thị sơ đồ đang được hoàn thiện.</p>
    {state.error && <p role="alert" className="mt-3 text-red-700">{state.error}</p>}
    {state.received && <p role="status" className="mt-3">{state.empty ? 'Không có dữ liệu sơ đồ cho bộ lọc đã chọn.' : 'Đã nhận dữ liệu. Chưa hỗ trợ hiển thị sơ đồ này.'}</p>}
  </section>;
}
