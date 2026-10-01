import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const money = (value) => value == null ? 'Chưa có thông tin' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value));
const date = (value) => value ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(value)) : 'Không xác định';
const dateTime = (value) => value ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Chưa nhận kho';

export default function CustomerRentals() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [state, setState] = useState({ loading: true, error: '', rentals: [] });
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const configured = import.meta.env.VITE_CUSTOMER_RENTALS_URL;
        if (!configured) throw new Error('Chưa cấu hình API danh sách kho đang thuê.');
        const response = await fetch(new URL(configured, window.location.origin), { credentials: 'include', signal: controller.signal, headers: { Accept: 'application/json' } });
        const payload = await response.json().catch(() => null);
        if (!response.ok || payload?.success !== true) {
          const apiMessage = typeof payload?.message === 'string' && payload.message !== 'Success.' ? payload.message : '';
          throw new Error(apiMessage || ([401, 403].includes(response.status) ? 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.' : 'Không tải được danh sách kho đang thuê.'));
        }
        if (!Array.isArray(payload.data) || payload.data.some((item) => !item || item.agreementId == null)) throw new Error('Dữ liệu kho đang thuê không đúng cấu trúc.');
        if (!controller.signal.aborted) setState({ loading: false, error: '', rentals: payload.data });
      } catch (error) {
        if (!controller.signal.aborted) setState({ loading: false, error: error.message, rentals: [] });
      }
    }
    load();
    return () => controller.abort();
  }, [refreshKey]);
  if (state.loading) return <p role="status" className="mt-6 rounded-xl bg-white p-5">Đang tải danh sách kho đang thuê…</p>;
  if (state.error) return <div role="alert" className="mt-6 rounded-xl bg-white p-5"><p className="text-red-700">{state.error}</p><button onClick={() => { setState({ loading: true, error: '', rentals: [] }); setRefreshKey((value) => value + 1); }} className="mt-3 text-blue-700 underline">Thử lại</button></div>;
  if (state.rentals.length === 0) return <p role="status" className="mt-6 rounded-xl bg-white p-5">Bạn chưa có hợp đồng thuê kho.</p>;
  return <div className="mt-6 grid gap-5 md:grid-cols-2">
    {state.rentals.map((rental) => <article key={rental.agreementId} className="rounded-xl border border-[#dfe7f5] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-xs font-semibold text-blue-700">{rental.agreementNo}</p><h2 className="mt-1 text-lg font-bold">{rental.unitCode} · {rental.unitTypeName}</h2></div>
        <span className="rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-semibold">{rental.status}</span>
      </div>
      <p className="mt-3 font-semibold">{rental.facilityName}</p>
      <p className="text-sm text-[#58657a]">{[rental.facilityAddress, rental.facilityCity].filter(Boolean).join(', ')}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div><span className="text-[#58657a]">Vị trí</span><p>Tầng {rental.floorLabel || '—'} · Dãy {rental.zoneLabel || '—'}</p></div>
        <div><span className="text-[#58657a]">Kích thước</span><p>{rental.dimensions || `${rental.areaM2} m² · ${rental.volumeM3} m³`}</p></div>
        <div><span className="text-[#58657a]">Thời hạn</span><p>{date(rental.startDate)} → {date(rental.actualEndDate || rental.endDate)}</p></div>
        <div><span className="text-[#58657a]">Ngày nhận kho</span><p>{dateTime(rental.checkedInAt)}</p></div>
        <div><span className="text-[#58657a]">Giá tháng</span><p className="font-semibold">{money(rental.monthlyRate)}</p></div>
        <div><span className="text-[#58657a]">Số dư tiền cọc</span><p className="font-semibold">{money(rental.depositBalance)}</p></div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {rental.hasOverdueDebt && <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">Có khoản quá hạn</span>}
        {rental.daysUntilExpiry != null && <span className={`rounded-full px-3 py-1 text-xs font-semibold ${rental.daysUntilExpiry <= 30 ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-700'}`}>{rental.daysUntilExpiry < 0 ? `Đã hết hạn ${Math.abs(rental.daysUntilExpiry)} ngày` : `Còn ${rental.daysUntilExpiry} ngày`}</span>}
      </div>
      <div className="mt-5 flex gap-3">
        <Link to={`/access-control?agreementId=${encodeURIComponent(rental.agreementId)}`} className="rounded-lg bg-[#0b1c30] px-4 py-2 text-sm font-semibold text-white">Thông tin truy cập</Link>
        <Link to={`/rentals/${encodeURIComponent(rental.agreementId)}/handover`} className="rounded-lg border px-4 py-2 text-sm font-semibold">Biên bản bàn giao</Link>
      </div>
    </article>)}
  </div>;
}
