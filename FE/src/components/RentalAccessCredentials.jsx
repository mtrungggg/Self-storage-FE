import { useEffect, useState } from 'react';

const dateTime = (value) => {
  if (!value) return 'Chưa có';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'medium' }).format(date);
};

export default function RentalAccessCredentials({ agreementId }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showPin, setShowPin] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');
  const [pinResult, setPinResult] = useState(null);
  const [state, setState] = useState({ loading: true, error: '', credentials: null });
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const base = import.meta.env.VITE_CUSTOMER_RENTALS_URL;
        if (!base) throw new Error('Chưa cấu hình API kho đang thuê.');
        const url = new URL(base, window.location.origin);
        url.pathname = `${url.pathname.replace(/\/$/, '')}/${encodeURIComponent(agreementId)}/access-credentials`;
        url.search = '';
        const response = await fetch(url, { credentials: 'include', signal: controller.signal, headers: { Accept: 'application/json', 'Cache-Control': 'no-store' }, cache: 'no-store' });
        const payload = await response.json().catch(() => null);
        if (!response.ok || payload?.success !== true) {
          const apiMessage = typeof payload?.message === 'string' && payload.message !== 'Success.' ? payload.message : '';
          throw new Error(apiMessage || ([401, 403].includes(response.status) ? 'Bạn không có quyền xem thông tin truy cập này.' : response.status === 404 ? 'Không tìm thấy hợp đồng thuê.' : 'Không tải được thông tin truy cập.'));
        }
        if (!payload.data || String(payload.data.agreementId) !== String(agreementId)) throw new Error('Dữ liệu thông tin truy cập không đúng cấu trúc.');
        if (!controller.signal.aborted) setState({ loading: false, error: '', credentials: payload.data });
      } catch (error) {
        if (!controller.signal.aborted) setState({ loading: false, error: error.message, credentials: null });
      }
    }
    load();
    return () => controller.abort();
  }, [agreementId, refreshKey]);
  async function copy(value, label) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopyMessage(`Đã sao chép ${label}.`);
    } catch {
      setCopyMessage(`Không thể sao chép ${label}.`);
    }
  }
  if (state.loading) return <p role="status" className="mt-6 rounded-xl bg-white p-5">Đang tải thông tin truy cập…</p>;
  if (state.error) return <div role="alert" className="mt-6 rounded-xl bg-white p-5"><p className="text-red-700">{state.error}</p><button onClick={() => { setShowPin(false); setState({ loading: true, error: '', credentials: null }); setRefreshKey((value) => value + 1); }} className="mt-3 text-blue-700 underline">Thử lại</button></div>;
  const item = state.credentials;
  return <section className="mt-6 rounded-xl border border-[#dfe7f5] bg-white p-6 shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold text-blue-700">{item.agreementNo}</p><h2 className="mt-1 text-xl font-bold">Ô kho {item.unitCode}</h2><p className="mt-1 text-sm">{item.facilityName}</p></div><span className="rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-semibold">{item.status}</span></div>
    {item.suspendedReason && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">Truy cập bị tạm dừng: {item.suspendedReason}</p>}
    <div className="mt-5 grid gap-4 md:grid-cols-2">
      <div className="rounded-xl bg-[#f8faff] p-4"><h3 className="font-bold">Mã PIN bàn phím</h3><div className="mt-3 flex items-center gap-3"><code className="text-xl font-bold tracking-[0.2em]">{showPin ? item.keypadPin || 'Chưa có' : item.keypadPin ? '••••••' : 'Chưa có'}</code>{item.keypadPin && <button onClick={() => setShowPin((value) => !value)} className="text-sm text-blue-700 underline">{showPin ? 'Ẩn PIN' : 'Hiện PIN'}</button>}</div>{item.keypadPin && <button onClick={() => copy(item.keypadPin, 'PIN')} className="mt-3 rounded-lg border px-3 py-2 text-sm">Sao chép PIN</button>}</div>
      <div className="rounded-xl bg-[#f8faff] p-4"><h3 className="font-bold">QR token vào cổng</h3><p className="mt-3 break-all font-mono text-sm">{item.gateQrToken || 'Chưa có token'}</p>{item.gateQrToken && <button onClick={() => copy(item.gateQrToken, 'QR token')} className="mt-3 rounded-lg border px-3 py-2 text-sm">Sao chép token</button>}</div>
    </div>
    <dl className="mt-5 grid grid-cols-2 gap-3 text-sm"><dt>QR hết hạn sau</dt><dd className="text-right">{item.qrExpiresInSeconds != null ? `${item.qrExpiresInSeconds} giây` : 'Chưa có'}</dd><dt>Thời điểm hết hạn</dt><dd className="text-right">{dateTime(item.qrExpiresAt)}</dd></dl>
    <ChangePinForm agreementId={agreementId} disabled={Boolean(item.suspendedReason)} onSuccess={(result) => { setPinResult(result); setShowPin(false); setRefreshKey((value) => value + 1); }} />
    {pinResult && <div role="status" className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800"><p>{pinResult.message || 'Đổi PIN thành công.'}</p><p>Trạng thái đồng bộ: {pinResult.syncStatus || 'Chưa có thông tin'}</p>{pinResult.retryAfterSeconds > 0 && <p>Thử kiểm tra lại sau {pinResult.retryAfterSeconds} giây.</p>}</div>}
    {copyMessage && <p role="status" className="mt-3 text-sm text-[#58657a]">{copyMessage}</p>}
    <p className="mt-5 text-xs text-[#58657a]">Không chia sẻ PIN hoặc QR token. Thông tin này không được lưu trong trình duyệt sau khi đóng trang.</p>
  </section>;
}

function ChangePinForm({ agreementId, disabled, onSuccess }) {
  const [form, setForm] = useState({ currentPin: '', newPin: '', confirmPin: '' });
  const [state, setState] = useState({ loading: false, error: '' });
  async function submit(event) {
    event.preventDefault();
    if (!/^\d{6}$/.test(form.currentPin) || !/^\d{6}$/.test(form.newPin)) {
      setState({ loading: false, error: 'PIN hiện tại và PIN mới phải gồm đúng 6 chữ số.' });
      return;
    }
    if (form.newPin !== form.confirmPin) {
      setState({ loading: false, error: 'Xác nhận PIN mới không khớp.' });
      return;
    }
    if (form.newPin === form.currentPin) {
      setState({ loading: false, error: 'PIN mới phải khác PIN hiện tại.' });
      return;
    }
    setState({ loading: true, error: '' });
    try {
      const base = import.meta.env.VITE_CUSTOMER_RENTALS_URL;
      if (!base) throw new Error('Chưa cấu hình API kho đang thuê.');
      const url = new URL(base, window.location.origin);
      url.pathname = `${url.pathname.replace(/\/$/, '')}/${encodeURIComponent(agreementId)}/change-pin`;
      url.search = '';
      const response = await fetch(url, { method: 'PUT', credentials: 'include', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPin: form.currentPin, newPin: form.newPin }) });
      const payload = await response.json().catch(() => null);
      if (!response.ok || payload?.success !== true || payload.data?.success === false) {
        const errors = Array.isArray(payload?.errors) ? payload.errors.filter((item) => typeof item === 'string').join(' ') : '';
        const message = typeof payload?.data?.message === 'string' ? payload.data.message : typeof payload?.message === 'string' && payload.message !== 'Success.' ? payload.message : '';
        throw new Error(errors || message || ([401, 403].includes(response.status) ? 'Bạn không có quyền đổi PIN của hợp đồng này.' : response.status === 429 ? 'Bạn thao tác quá nhanh. Vui lòng thử lại sau.' : 'Không đổi được PIN. Vui lòng kiểm tra PIN hiện tại.'));
      }
      if (!payload.data || typeof payload.data !== 'object') throw new Error('Phản hồi đổi PIN không đúng cấu trúc.');
      setForm({ currentPin: '', newPin: '', confirmPin: '' });
      setState({ loading: false, error: '' });
      onSuccess(payload.data);
    } catch (error) {
      setState({ loading: false, error: error.message });
    }
  }
  return <div className="mt-6 border-t border-[#dfe7f5] pt-5">
    <h3 className="font-bold">Đổi mã PIN</h3>
    <form onSubmit={submit} className="mt-3 grid gap-3 md:grid-cols-3">
      <label className="text-sm">PIN hiện tại<input disabled={disabled || state.loading} required inputMode="numeric" autoComplete="current-password" type="password" maxLength="6" value={form.currentPin} onChange={(event) => { setForm((previous) => ({ ...previous, currentPin: event.target.value.replace(/\D/g, '') })); setState({ loading: false, error: '' }); }} className="mt-1 w-full rounded-lg border p-3 disabled:opacity-50" /></label>
      <label className="text-sm">PIN mới<input disabled={disabled || state.loading} required inputMode="numeric" autoComplete="new-password" type="password" maxLength="6" value={form.newPin} onChange={(event) => { setForm((previous) => ({ ...previous, newPin: event.target.value.replace(/\D/g, '') })); setState({ loading: false, error: '' }); }} className="mt-1 w-full rounded-lg border p-3 disabled:opacity-50" /></label>
      <label className="text-sm">Xác nhận PIN mới<input disabled={disabled || state.loading} required inputMode="numeric" autoComplete="new-password" type="password" maxLength="6" value={form.confirmPin} onChange={(event) => { setForm((previous) => ({ ...previous, confirmPin: event.target.value.replace(/\D/g, '') })); setState({ loading: false, error: '' }); }} className="mt-1 w-full rounded-lg border p-3 disabled:opacity-50" /></label>
      <button disabled={disabled || state.loading} className="rounded-lg bg-[#0b1c30] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{state.loading ? 'Đang đổi PIN…' : 'Đổi PIN'}</button>
    </form>
    {disabled && <p className="mt-2 text-sm text-red-700">Không thể đổi PIN khi quyền truy cập đang bị tạm dừng.</p>}
    {state.error && <p role="alert" className="mt-2 text-sm text-red-700">{state.error}</p>}
  </div>;
}
