import { useEffect, useRef, useState } from 'react';

// Loads and renders the facility map geometry returned by the customer API.
export default function FacilityMapLoader({ facilityId }) {
  const [areaId, setAreaId] = useState('');
  const [floor, setFloor] = useState('');
  const [state, setState] = useState({ loading: false, error: '', units: null });
  const [selectedId, setSelectedId] = useState(null);
  const request = useRef(null);
  useEffect(() => () => request.current?.abort(), []);
  const changeFilter = (setter, value) => {
    request.current?.abort();
    setter(value);
    setState({ loading: false, error: '', units: null });
    setSelectedId(null);
  };
  async function load(event) {
    event.preventDefault();
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setState({ loading: true, error: '', units: null });
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
      if (payload?.success !== true || String(payload.data?.facilityId) !== String(facilityId) || !Array.isArray(payload.data?.units)) throw new Error('Phản hồi sơ đồ không đúng cấu trúc dự kiến.');
      const units = payload.data.units;
      if (units.some((unit) => unit?.unitId == null || ![unit.x, unit.y, unit.width, unit.height].every((value) => Number.isFinite(Number(value))))) throw new Error('Tọa độ ô kho không hợp lệ.');
      if (!controller.signal.aborted) setState({ loading: false, error: '', units });
    } catch (error) {
      if (!controller.signal.aborted) setState({ loading: false, error: error.message, units: null });
    }
  }
  return <section className="mt-6 rounded-xl border bg-white p-5" aria-label="Sơ đồ cơ sở">
    <h2 className="text-lg font-bold">Sơ đồ cơ sở</h2>
    <form onSubmit={load} className="mt-3 grid gap-3 sm:grid-cols-3">
      <label>ID phân khu (tùy chọn)<input type="number" min="1" step="1" value={areaId} onChange={(event) => changeFilter(setAreaId, event.target.value)} className="mt-1 w-full rounded-lg border p-3" /></label>
      <label>Tầng (tùy chọn)<input value={floor} onChange={(event) => changeFilter(setFloor, event.target.value)} className="mt-1 w-full rounded-lg border p-3" /></label>
      <button disabled={state.loading} className="self-end rounded-lg bg-[#0b1c30] p-3 text-white disabled:opacity-50">{state.loading ? 'Đang tải…' : 'Tải sơ đồ'}</button>
    </form>
    <p className="mt-3 text-sm text-[#58657a]">Có thể bỏ trống bộ lọc để xem toàn bộ ô kho của cơ sở.</p>
    {state.error && <p role="alert" className="mt-3 text-red-700">{state.error}</p>}
    {state.units?.length === 0 && <p role="status" className="mt-3">Không có ô kho cho bộ lọc đã chọn.</p>}
    {state.units?.length > 0 && <MapCanvas units={state.units} selectedId={selectedId} onSelect={setSelectedId} />}
  </section>;
}

const tone = (status) => {
  switch (String(status).toLowerCase()) {
    case 'available': return { fill: '#dcfce7', stroke: '#15803d', label: 'Khả dụng' };
    case 'rented': return { fill: '#dbeafe', stroke: '#1d4ed8', label: 'Đang thuê' };
    case 'reserved': return { fill: '#fef3c7', stroke: '#b45309', label: 'Đã giữ chỗ' };
    case 'maintenance': return { fill: '#fee2e2', stroke: '#b91c1c', label: 'Bảo trì' };
    default: return { fill: '#f1f5f9', stroke: '#64748b', label: status || 'Không rõ' };
  }
};

function MapCanvas({ units, selectedId, onSelect }) {
  const maxX = Math.max(...units.map((unit) => Number(unit.x) + Number(unit.width)), 100) + 10;
  const maxY = Math.max(...units.map((unit) => Number(unit.y) + Number(unit.height)), 60) + 10;
  const selected = units.find((unit) => String(unit.unitId) === String(selectedId));
  const statuses = [...new Set(units.map((unit) => String(unit.status).toLowerCase()))];
  return <div className="mt-5">
    <div className="flex flex-wrap gap-3 text-xs">{statuses.map((status) => { const color = tone(status); return <span key={status} className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm border" style={{ backgroundColor: color.fill, borderColor: color.stroke }} />{color.label}</span>; })}</div>
    <div className="mt-3 overflow-auto rounded-xl border bg-[#f8faff] p-3">
      <svg viewBox={`0 0 ${maxX} ${maxY}`} className="min-h-[320px] w-full" role="img" aria-label="Sơ đồ các ô kho">
        {units.map((unit) => {
          const color = tone(unit.status);
          const x = Number(unit.x); const y = Number(unit.y); const width = Number(unit.width); const height = Number(unit.height);
          const selectedUnit = String(unit.unitId) === String(selectedId);
          return <g key={unit.unitId} role="button" tabIndex="0" aria-label={`${unit.unitCode}, ${color.label}`} onClick={() => onSelect(unit.unitId)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(unit.unitId); } }} className="cursor-pointer" transform={`rotate(${Number(unit.rotationDegrees) || 0} ${x + width / 2} ${y + height / 2})`}>
            <rect x={x} y={y} width={width} height={height} rx="2" fill={color.fill} stroke={color.stroke} strokeWidth={selectedUnit ? 2.5 : 1} />
            <text x={x + width / 2} y={y + height / 2} textAnchor="middle" dominantBaseline="middle" fontSize="4" fontWeight="700" fill="#0b1c30">{unit.unitCode}</text>
          </g>;
        })}
      </svg>
    </div>
    {selected && <div className="mt-3 rounded-lg border border-[#dfe7f5] bg-white p-4 text-sm"><h3 className="font-bold">Ô {selected.unitCode}</h3><p>Trạng thái: {tone(selected.status).label}</p><p>Phân khu: {selected.layer || 'Chưa có'}</p><p>Loại kho ID: {selected.unitTypeId} · Khu vực ID: {selected.areaId}</p><p>Tọa độ: ({selected.x}, {selected.y}) · Kích thước sơ đồ: {selected.width} × {selected.height}</p></div>}
  </div>;
}
