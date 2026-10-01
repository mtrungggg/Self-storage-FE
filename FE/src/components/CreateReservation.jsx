import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const money = (value) => value == null ? 'Chưa có' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value));
const dateTime = (value) => {
  if (!value) return 'Chưa có';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

export default function CreateReservation({ facilities, unitTypes }) {
  const [form, setForm] = useState({ facilityId: '', unitTypeId: '', storageUnitId: '', startDate: '', durationMonths: '1', promotionCode: '' });
  const [state, setState] = useState({ loading: false, error: '', reservation: null });
  const request = useRef(null);
  useEffect(() => () => request.current?.abort(), []);
  const update = (key, value) => {
    request.current?.abort();
    setForm((previous) => ({ ...previous, [key]: value }));
    setState({ loading: false, error: '', reservation: null });
  };
  async function submit(event) {
    event.preventDefault();
    const facilityId = Number(form.facilityId);
    const unitTypeId = Number(form.unitTypeId);
    const storageUnitId = Number(form.storageUnitId);
    const durationMonths = Number(form.durationMonths);
    if (![facilityId, unitTypeId, storageUnitId, durationMonths].every((value) => Number.isInteger(value) && value > 0)) {
      setState({ loading: false, error: 'Cơ sở, loại kho, ô kho và thời hạn phải hợp lệ.', reservation: null });
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.startDate)) {
      setState({ loading: false, error: 'Vui lòng chọn ngày bắt đầu thuê.', reservation: null });
      return;
    }
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setState({ loading: true, error: '', reservation: null });
    try {
      const configured = import.meta.env.VITE_CUSTOMER_RESERVATIONS_URL;
      if (!configured) throw new Error('Chưa cấu hình API đặt chỗ.');
      const response = await fetch(new URL(configured, window.location.origin), {
        method: 'POST', credentials: 'include', signal: controller.signal,
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ facilityId, unitTypeId, storageUnitId, startDate: form.startDate, durationMonths, promotionCode: form.promotionCode.trim() || null }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || payload?.success !== true) {
        const errors = Array.isArray(payload?.errors) ? payload.errors.filter((item) => typeof item === 'string').join(' ') : '';
        const message = typeof payload?.message === 'string' && payload.message !== 'Success.' ? payload.message : '';
        throw new Error(errors || message || ([401, 403].includes(response.status) ? 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.' : [400, 404, 409, 422].includes(response.status) ? 'Không thể đặt ô kho này. Kho có thể đã được giữ chỗ hoặc thông tin chưa hợp lệ.' : 'Không tạo được đặt chỗ.'));
      }
      if (!payload.data || payload.data.reservationId == null) throw new Error('Dữ liệu đặt chỗ không đúng cấu trúc.');
      if (!controller.signal.aborted) setState({ loading: false, error: '', reservation: payload.data });
    } catch (error) {
      if (!controller.signal.aborted) setState({ loading: false, error: error.message, reservation: null });
    }
  }
  const result = state.reservation;
  return <section className="mt-6 rounded-xl border bg-white p-5" aria-label="Tạo đặt chỗ">
    <h2 className="text-lg font-bold">Đặt ô kho</h2>
    <p className="mt-1 text-sm text-[#58657a]">Tìm ô kho trống phía trên, sau đó nhập ID ô kho để giữ chỗ.</p>
    <form onSubmit={submit} className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <label>Cơ sở<select required value={form.facilityId} onChange={(event) => update('facilityId', event.target.value)} className="mt-1 w-full rounded-lg border p-3"><option value="">Chọn cơ sở</option>{facilities.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label>Loại kho<select required value={form.unitTypeId} onChange={(event) => update('unitTypeId', event.target.value)} className="mt-1 w-full rounded-lg border p-3"><option value="">Chọn loại kho</option>{unitTypes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label>ID ô kho<input required type="number" min="1" step="1" value={form.storageUnitId} onChange={(event) => update('storageUnitId', event.target.value)} className="mt-1 w-full rounded-lg border p-3" /></label>
      <label>Ngày bắt đầu<input required type="date" value={form.startDate} onChange={(event) => update('startDate', event.target.value)} className="mt-1 w-full rounded-lg border p-3" /></label>
      <label>Số tháng thuê<input required type="number" min="1" step="1" value={form.durationMonths} onChange={(event) => update('durationMonths', event.target.value)} className="mt-1 w-full rounded-lg border p-3" /></label>
      <label>Mã khuyến mãi<input value={form.promotionCode} onChange={(event) => update('promotionCode', event.target.value)} className="mt-1 w-full rounded-lg border p-3" placeholder="Không bắt buộc" /></label>
      <button disabled={state.loading} className="rounded-lg bg-[#1d5fe5] px-5 py-3 font-semibold text-white disabled:opacity-50">{state.loading ? 'Đang giữ chỗ…' : 'Tạo đặt chỗ'}</button>
    </form>
    {state.error && <p role="alert" className="mt-3 text-red-700">{state.error}</p>}
    {result && <div className="mt-5 rounded-xl bg-emerald-50 p-5">
      <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-sm font-semibold text-emerald-800">Đặt chỗ thành công</p><h3 className="text-lg font-bold">{result.reservationCode}</h3></div><span className="rounded-full bg-white px-3 py-1 text-sm font-semibold">{result.status}</span></div>
      <p className="mt-3 text-sm">{result.facilityName} · {result.unitCode} · {result.unitTypeName}</p>
      <dl className="mt-4 grid grid-cols-2 gap-2 text-sm"><dt>Giữ chỗ đến</dt><dd className="text-right">{dateTime(result.holdUntil)}</dd><dt>Thời gian còn lại</dt><dd className="text-right">{result.expiresInSeconds != null ? `${result.expiresInSeconds} giây` : 'Chưa có'}</dd><dt>Giá tháng</dt><dd className="text-right">{money(result.monthlyRate)}</dd><dt>Tiền cọc</dt><dd className="text-right">{money(result.securityDeposit)}</dd><dt>Giảm giá</dt><dd className="text-right">{money(result.discountAmount)}</dd><dt>Thanh toán đầu tiên</dt><dd className="text-right font-bold">{money(result.firstPaymentAmount)}</dd><dt>Hóa đơn</dt><dd className="text-right">{result.invoiceNo || result.invoiceId || 'Chưa có'}</dd></dl>
      <Link to={`/billing?reservationId=${encodeURIComponent(result.reservationId)}`} className="mt-4 inline-block rounded-lg bg-[#0b1c30] px-5 py-3 font-semibold text-white">Tiếp tục thanh toán</Link>
    </div>}
  </section>;
}
