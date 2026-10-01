import { useCallback, useEffect, useState } from 'react';

const money = (value, currency = 'VND') => value == null ? 'Chưa có thông tin' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: currency || 'VND' }).format(Number(value));
const dateTime = (value) => {
  if (!value) return 'Chưa có';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

export default function PaymentHistory() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [state, setState] = useState({ loading: true, error: '', payments: [] });
  const load = useCallback(async (signal) => {
    await Promise.resolve();
    if (signal.aborted) return;
    try {
      const configured = import.meta.env.VITE_PAYMENT_HISTORY_URL;
      if (!configured) throw new Error('Chưa cấu hình API lịch sử thanh toán.');
      const response = await fetch(new URL(configured, window.location.origin), { credentials: 'include', signal, headers: { Accept: 'application/json' } });
      const payload = await response.json().catch(() => null);
      if (!response.ok || payload?.success !== true) {
        const apiMessage = typeof payload?.message === 'string' && payload.message !== 'Success.' ? payload.message : '';
        throw new Error(apiMessage || ([401, 403].includes(response.status) ? 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.' : 'Không tải được lịch sử thanh toán.'));
      }
      if (!Array.isArray(payload.data) || payload.data.some((item) => !item || typeof item !== 'object' || Array.isArray(item))) throw new Error('Dữ liệu lịch sử thanh toán không đúng cấu trúc.');
      if (!signal.aborted) setState({ loading: false, error: '', payments: payload.data });
    } catch (error) {
      if (!signal.aborted) setState((previous) => ({ ...previous, loading: false, error: error.message }));
    }
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    // oxlint-disable-next-line react/set-state-in-effect -- the effect synchronizes this view with the payment API.
    load(controller.signal);
    return () => controller.abort();
  }, [load, refreshKey]);
  return <section className="mt-6 rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between gap-3">
      <div><h2 className="text-[16px] font-bold">Lịch sử thanh toán</h2><p className="mt-1 text-[12px] text-[#58657a]">Trạng thái được cập nhật từ hệ thống thanh toán.</p></div>
      <button disabled={state.loading} onClick={() => { setState((previous) => ({ ...previous, loading: true, error: '' })); setRefreshKey((value) => value + 1); }} className="rounded-[8px] border px-4 py-2 text-[12px] font-semibold disabled:opacity-50">{state.loading ? 'Đang tải…' : 'Làm mới'}</button>
    </div>
    {state.error && <p role="alert" className="mt-4 text-red-700">{state.error}</p>}
    {!state.loading && !state.error && state.payments.length === 0 && <p role="status" className="mt-4">Bạn chưa có giao dịch thanh toán.</p>}
    {state.payments.length > 0 && <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[900px] text-left text-[12px]">
      <thead><tr className="border-b text-[#58657a]"><th className="p-3">Hóa đơn</th><th className="p-3">Đặt chỗ</th><th className="p-3">Số tiền</th><th className="p-3">Phương thức</th><th className="p-3">Trạng thái</th><th className="p-3">Thời gian</th><th className="p-3">Mã giao dịch</th></tr></thead>
      <tbody>{state.payments.map((payment) => <tr key={payment.paymentId} className="border-b align-top">
        <td className="p-3"><div className="font-semibold">{payment.invoiceNo || `#${payment.invoiceId}`}</div><div className="text-[#8996a9]">Payment #{payment.paymentId}</div></td>
        <td className="p-3">#{payment.reservationId}</td>
        <td className="p-3 font-semibold">{money(payment.amount, payment.currency)}</td>
        <td className="p-3">{payment.method || 'Chưa có'}</td>
        <td className="p-3"><span className="rounded-full bg-[#eef4ff] px-2 py-1 font-semibold">{payment.status || 'UNKNOWN'}</span>{payment.failureReason && <div className="mt-2 max-w-56 text-red-700">{payment.failureReason}</div>}</td>
        <td className="p-3"><div>Tạo: {dateTime(payment.createdAt)}</div><div className="mt-1">Thanh toán: {dateTime(payment.paidAt)}</div></td>
        <td className="max-w-56 break-all p-3">{payment.providerTransactionId || 'Chưa có'}</td>
      </tr>)}</tbody>
    </table></div>}
  </section>;
}
