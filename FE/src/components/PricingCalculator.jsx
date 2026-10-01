import { useEffect, useRef, useState } from 'react';

const labels = {
  monthlyRate: 'Giá thuê mỗi tháng',
  subtotal: 'Tiền thuê trước giảm giá',
  discountAmount: 'Tiền giảm giá',
  depositAmount: 'Tiền cọc',
  bookingFee: 'Phí đặt chỗ',
  serviceFee: 'Phí dịch vụ',
  managementFee: 'Phí quản lý',
  total: 'Tổng tiền',
  totalAmount: 'Tổng tiền',
  quotedTotal: 'Tổng báo giá',
  voucherCode: 'Mã giảm giá',
  promotionName: 'Chương trình khuyến mãi',
};
const moneyKeys = new Set(['monthlyRate', 'subtotal', 'discountAmount', 'depositAmount', 'bookingFee', 'serviceFee', 'managementFee', 'total', 'totalAmount', 'quotedTotal']);
const money = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value));

export default function PricingCalculator({ facilities, unitTypes, initialFacilityId = '', initialUnitTypeId = '' }) {
  const [form, setForm] = useState({ facilityId: String(initialFacilityId || ''), unitTypeId: String(initialUnitTypeId || ''), durationMonths: '1', voucherCode: '' });
  const [state, setState] = useState({ loading: false, error: '', quote: null });
  const request = useRef(null);
  useEffect(() => () => request.current?.abort(), []);
  const update = (key, value) => {
    request.current?.abort();
    setForm((previous) => ({ ...previous, [key]: value }));
    setState({ loading: false, error: '', quote: null });
  };
  async function calculate(event) {
    event.preventDefault();
    if (!form.facilityId || !form.unitTypeId) {
      setState({ loading: false, error: 'Vui lòng chọn cơ sở và loại kho.', quote: null });
      return;
    }
    const durationMonths = Number(form.durationMonths);
    if (!Number.isInteger(durationMonths) || durationMonths < 1) {
      setState({ loading: false, error: 'Thời hạn thuê phải là số tháng nguyên, tối thiểu 1 tháng.', quote: null });
      return;
    }
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setState({ loading: true, error: '', quote: null });
    try {
      const configured = import.meta.env.VITE_PRICING_CALCULATE_URL;
      if (!configured) throw new Error('Chưa cấu hình API tính giá.');
      const response = await fetch(new URL(configured, window.location.origin), {
        method: 'POST', signal: controller.signal,
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ facilityId: Number(form.facilityId), unitTypeId: Number(form.unitTypeId), durationMonths, voucherCode: form.voucherCode.trim() || null }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || payload?.success !== true) {
        const apiMessage = typeof payload?.message === 'string' && payload.message !== 'Success.' ? payload.message : '';
        throw new Error(apiMessage || ([400, 422].includes(response.status) ? 'Thông tin tính giá chưa hợp lệ.' : [401, 403].includes(response.status) ? 'Bạn chưa có quyền tính giá. Vui lòng đăng nhập.' : 'Không tính được giá. Vui lòng thử lại.'));
      }
      if (!payload.data || typeof payload.data !== 'object' || Array.isArray(payload.data)) throw new Error('Dữ liệu báo giá không đúng cấu trúc.');
      if (!controller.signal.aborted) setState({ loading: false, error: '', quote: payload.data });
    } catch (error) {
      if (!controller.signal.aborted) setState({ loading: false, error: error.message, quote: null });
    }
  }
  const entries = state.quote ? Object.entries(state.quote).filter(([, value]) => value == null || ['string', 'number', 'boolean'].includes(typeof value)) : [];
  return <section className="mt-6 rounded-xl border bg-white p-5" aria-label="Tính giá thuê kho">
    <h2 className="text-lg font-bold">Tính giá thuê kho</h2>
    <form onSubmit={calculate} className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <label>Cơ sở<select required className="mt-1 w-full rounded-lg border p-3" value={form.facilityId} onChange={(event) => update('facilityId', event.target.value)}><option value="">Chọn cơ sở</option>{facilities.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label>Loại kho<select required className="mt-1 w-full rounded-lg border p-3" value={form.unitTypeId} onChange={(event) => update('unitTypeId', event.target.value)}><option value="">Chọn loại kho</option>{unitTypes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label>Số tháng thuê<input required type="number" min="1" step="1" className="mt-1 w-full rounded-lg border p-3" value={form.durationMonths} onChange={(event) => update('durationMonths', event.target.value)} /></label>
      <label>Mã giảm giá<input className="mt-1 w-full rounded-lg border p-3" value={form.voucherCode} onChange={(event) => update('voucherCode', event.target.value)} placeholder="Không bắt buộc" /></label>
      <button disabled={state.loading} className="rounded-lg bg-[#0b1c30] px-4 py-3 text-white disabled:opacity-50">{state.loading ? 'Đang tính…' : 'Tính giá'}</button>
    </form>
    {state.error && <p role="alert" className="mt-3 text-red-700">{state.error}</p>}
    {state.quote && <div className="mt-5 rounded-lg bg-[#f8faff] p-4">
      <h3 className="font-bold">Kết quả báo giá</h3>
      {entries.length === 0 ? <p className="mt-2">API chưa trả trường báo giá có thể hiển thị.</p> : <dl className="mt-3 grid grid-cols-2 gap-2">
        {entries.map(([key, value]) => <div key={key} className="contents"><dt>{labels[key] || key}</dt><dd className="text-right font-semibold">{moneyKeys.has(key) && value != null && Number.isFinite(Number(value)) ? money(value) : value == null ? 'Chưa có thông tin' : typeof value === 'boolean' ? value ? 'Có' : 'Không' : String(value)}</dd></div>)}
      </dl>}
      <p className="mt-3 text-xs text-[#58657a]">Báo giá do backend tính; chỉ có hiệu lực theo quy định của hệ thống.</p>
    </div>}
  </section>;
}
