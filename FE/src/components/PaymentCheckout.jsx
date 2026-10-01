import { useEffect, useRef, useState } from 'react';

const money = (value, currency = 'VND') => value == null ? 'Chưa có thông tin' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: currency || 'VND' }).format(Number(value));

export default function PaymentCheckout() {
  const [reservationId, setReservationId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('SEPAY');
  const [state, setState] = useState({ loading: false, error: '', checkout: null });
  const request = useRef(null);
  useEffect(() => () => request.current?.abort(), []);
  const clearResult = () => {
    request.current?.abort();
    setState({ loading: false, error: '', checkout: null });
  };
  async function submit(event) {
    event.preventDefault();
    const parsedId = Number(reservationId);
    if (!Number.isInteger(parsedId) || parsedId < 1) {
      setState({ loading: false, error: 'Mã đặt chỗ phải là số nguyên lớn hơn 0.', checkout: null });
      return;
    }
    if (!paymentMethod.trim()) {
      setState({ loading: false, error: 'Vui lòng chọn phương thức thanh toán.', checkout: null });
      return;
    }
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setState({ loading: true, error: '', checkout: null });
    try {
      const configured = import.meta.env.VITE_PAYMENT_CREATE_CHECKOUT_URL;
      if (!configured) throw new Error('Chưa cấu hình API tạo thanh toán.');
      const response = await fetch(new URL(configured, window.location.origin), {
        method: 'POST',
        credentials: 'include',
        signal: controller.signal,
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationId: parsedId, paymentMethod: paymentMethod.trim() }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || payload?.success !== true) {
        const apiMessage = typeof payload?.message === 'string' && payload.message !== 'Success.' ? payload.message : '';
        const errors = Array.isArray(payload?.errors) ? payload.errors.filter((item) => typeof item === 'string').join(' ') : '';
        throw new Error(errors || apiMessage || ([401, 403].includes(response.status) ? 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.' : [400, 404, 409, 422].includes(response.status) ? 'Không thể tạo thanh toán cho đơn đặt chỗ này.' : 'Không tạo được thanh toán. Vui lòng thử lại.'));
      }
      if (!payload.data || typeof payload.data !== 'object' || Array.isArray(payload.data)) throw new Error('Dữ liệu checkout không đúng cấu trúc.');
      if (!controller.signal.aborted) setState({ loading: false, error: '', checkout: payload.data });
    } catch (error) {
      if (!controller.signal.aborted) setState({ loading: false, error: error.message, checkout: null });
    }
  }
  const checkout = state.checkout;
  const vietQr = checkout?.vietQr;
  return <section className="mt-5 rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-sm" aria-label="Tạo thanh toán">
    <h2 className="text-[16px] font-bold">Tạo thanh toán cho đơn đặt chỗ</h2>
    <p className="mt-1 text-[12px] text-[#58657a]">Nhập mã đặt chỗ đã được hệ thống tạo. Thông tin chuyển khoản sẽ do backend cung cấp.</p>
    <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
      <label className="text-[12px] font-semibold">Mã đặt chỗ
        <input required type="number" min="1" step="1" value={reservationId} onChange={(event) => { setReservationId(event.target.value); clearResult(); }} className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] bg-[#f8faff] p-3" placeholder="Ví dụ: 12" />
      </label>
      <label className="text-[12px] font-semibold">Phương thức thanh toán
        <select value={paymentMethod} onChange={(event) => { setPaymentMethod(event.target.value); clearResult(); }} className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] bg-[#f8faff] p-3"><option value="SEPAY">SePay / Chuyển khoản QR</option></select>
      </label>
      <button disabled={state.loading} className="self-end rounded-[8px] bg-[#1d5fe5] px-5 py-3 text-[12px] font-bold text-white disabled:opacity-50">{state.loading ? 'Đang tạo…' : 'Tạo thanh toán'}</button>
    </form>
    {state.error && <p role="alert" className="mt-3 text-[12px] text-red-700">{state.error}</p>}
    {checkout && <div className="mt-5 rounded-[12px] bg-[#f8faff] p-4">
      <h3 className="font-bold">Thông tin thanh toán</h3>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
        <dt>Mã thanh toán</dt><dd className="text-right">{checkout.paymentId ?? 'Chưa có'}</dd>
        <dt>Mã hóa đơn</dt><dd className="text-right">{checkout.invoiceNo ?? checkout.invoiceId ?? 'Chưa có'}</dd>
        <dt>Số tiền</dt><dd className="text-right font-bold text-[#1d5fe5]">{money(checkout.amount, checkout.currency)}</dd>
        <dt>Phương thức</dt><dd className="text-right">{checkout.paymentMethod ?? paymentMethod}</dd>
        <dt>Thời hạn thanh toán</dt><dd className="text-right">{checkout.expiresInSeconds != null ? `${checkout.expiresInSeconds} giây` : 'Chưa có'}</dd>
      </dl>
      {vietQr && <div className="mt-4 border-t border-[#dfe7f5] pt-4 text-[12px]">
        <h4 className="font-bold">Thông tin chuyển khoản VietQR</h4>
        <dl className="mt-2 grid grid-cols-2 gap-2">
          <dt>Ngân hàng</dt><dd className="text-right">{vietQr.bankCode ?? 'Chưa có'}</dd>
          <dt>Số tài khoản</dt><dd className="text-right font-semibold">{vietQr.accountNo ?? 'Chưa có'}</dd>
          <dt>Tên tài khoản</dt><dd className="text-right">{vietQr.accountName ?? 'Chưa có'}</dd>
          <dt>Số tiền</dt><dd className="text-right">{money(vietQr.amount ?? checkout.amount, checkout.currency)}</dd>
          <dt>Nội dung</dt><dd className="break-all text-right font-semibold">{vietQr.transferContent ?? 'Chưa có'}</dd>
        </dl>
        {vietQr.qrImageUrl && <img src={vietQr.qrImageUrl} alt="Mã VietQR thanh toán" className="mx-auto mt-4 max-h-64 rounded-lg border bg-white p-2" />}
      </div>}
      <p className="mt-3 text-[11px] text-[#58657a]">Chỉ chuyển khoản đúng số tiền và nội dung do hệ thống cung cấp.</p>
    </div>}
  </section>;
}
