import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const money = (value) => value == null ? 'Chưa có' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value));
const date = (value) => value ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(value)) : 'Chưa có';
const dateTime = (value) => value ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Chưa có';

export default function CustomerReservations() {
  const [draftStatus, setDraftStatus] = useState('');
  const [status, setStatus] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [state, setState] = useState({ loading: true, error: '', reservations: [] });
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const base = import.meta.env.VITE_CUSTOMER_RESERVATIONS_URL;
        if (!base) throw new Error('Chưa cấu hình API đặt chỗ.');
        const url = new URL(base, window.location.origin);
        url.pathname = `${url.pathname.replace(/\/$/, '')}/my`;
        url.search = '';
        if (status) url.searchParams.set('status', status);
        const response = await fetch(url, { credentials: 'include', signal: controller.signal, headers: { Accept: 'application/json' } });
        const payload = await response.json().catch(() => null);
        if (!response.ok || payload?.success !== true) {
          const message = typeof payload?.message === 'string' && payload.message !== 'Success.' ? payload.message : '';
          throw new Error(message || ([401, 403].includes(response.status) ? 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.' : 'Không tải được danh sách đặt chỗ.'));
        }
        if (!Array.isArray(payload.data) || payload.data.some((item) => !item || item.id == null)) throw new Error('Dữ liệu đặt chỗ không đúng cấu trúc.');
        if (!controller.signal.aborted) setState({ loading: false, error: '', reservations: payload.data });
      } catch (error) {
        if (!controller.signal.aborted) setState({ loading: false, error: error.message, reservations: [] });
      }
    }
    load();
    return () => controller.abort();
  }, [status, refreshKey]);
  const reload = () => { setState((previous) => ({ ...previous, loading: true, error: '' })); setRefreshKey((value) => value + 1); };
  return <section className="mt-6">
    <form onSubmit={(event) => { event.preventDefault(); setState((previous) => ({ ...previous, loading: true, error: '' })); setStatus(draftStatus.trim()); }} className="flex flex-wrap items-end gap-3 rounded-xl border bg-white p-4">
      <label className="min-w-64 flex-1 text-sm">Lọc theo trạng thái<input value={draftStatus} onChange={(event) => setDraftStatus(event.target.value)} className="mt-1 w-full rounded-lg border p-3" placeholder="Ví dụ: PENDING, CONFIRMED" /></label>
      <button className="rounded-lg bg-[#0b1c30] px-5 py-3 text-sm font-semibold text-white">Áp dụng</button>
      <button type="button" onClick={() => { setDraftStatus(''); setState((previous) => ({ ...previous, loading: true, error: '' })); setStatus(''); }} className="rounded-lg border px-5 py-3 text-sm">Xóa lọc</button>
      <button type="button" disabled={state.loading} onClick={reload} className="rounded-lg border px-5 py-3 text-sm disabled:opacity-50">Làm mới</button>
    </form>
    {state.loading && <p role="status" className="mt-4 rounded-xl bg-white p-5">Đang tải danh sách đặt chỗ…</p>}
    {state.error && <div role="alert" className="mt-4 rounded-xl bg-white p-5"><p className="text-red-700">{state.error}</p><button onClick={reload} className="mt-3 text-blue-700 underline">Thử lại</button></div>}
    {!state.loading && !state.error && state.reservations.length === 0 && <p role="status" className="mt-4 rounded-xl bg-white p-5">Không có đặt chỗ phù hợp.</p>}
    <div className="mt-4 grid gap-5 md:grid-cols-2">{state.reservations.map((item) => <article key={item.id} className="rounded-xl border border-[#dfe7f5] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold text-blue-700">{item.reservationCode}</p><h2 className="mt-1 text-lg font-bold">{item.unitCode} · {item.unitTypeName}</h2></div><span className="rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-semibold">{item.displayStatus || item.status}</span></div>
      <p className="mt-3 font-semibold">{item.facilityName}</p><p className="text-sm text-[#58657a]">{item.facilityAddress}</p>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-[#58657a]">Thời gian thuê</dt><dd>{date(item.startDate)} → {date(item.endDate)}</dd></div><div><dt className="text-[#58657a]">Ngày tạo</dt><dd>{dateTime(item.createdAt)}</dd></div><div><dt className="text-[#58657a]">Giá tháng</dt><dd>{money(item.monthlyRateSnapshot)}</dd></div><div><dt className="text-[#58657a]">Tiền cọc</dt><dd>{money(item.depositSnapshot)}</dd></div><div><dt className="text-[#58657a]">Tổng báo giá</dt><dd className="font-bold">{money(item.quotedTotal)}</dd></div><div><dt className="text-[#58657a]">Thanh toán đầu tiên</dt><dd className="font-bold">{money(item.firstPaymentTotal)}</dd></div><div><dt className="text-[#58657a]">Giữ chỗ đến</dt><dd>{dateTime(item.holdUntil)}{item.expiresInSeconds != null && <span className="block text-xs">Còn {item.expiresInSeconds} giây</span>}</dd></div><div><dt className="text-[#58657a]">Hóa đơn</dt><dd>#{item.invoiceId} · {item.invoiceStatus}</dd></div></dl>
      {item.confirmedAt && <p className="mt-3 text-sm text-emerald-700">Xác nhận: {dateTime(item.confirmedAt)}</p>}{item.cancelledAt && <p className="mt-3 text-sm text-red-700">Đã hủy: {dateTime(item.cancelledAt)}{item.cancellationReason && ` · ${item.cancellationReason}`}</p>}
      <div className="mt-4 flex gap-3"><Link to={`/reservations/${encodeURIComponent(item.id)}`} className="rounded-lg border px-4 py-2 text-sm font-semibold">Xem chi tiết</Link><Link to={`/billing?reservationId=${encodeURIComponent(item.id)}`} className="rounded-lg bg-[#0b1c30] px-4 py-2 text-sm font-semibold text-white">Thanh toán</Link></div>
    </article>)}</div>
  </section>;
}
