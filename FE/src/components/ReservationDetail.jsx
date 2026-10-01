import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const money = (value) => value == null ? 'Chưa có' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value));
const date = (value) => value ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(value)) : 'Chưa có';
const dateTime = (value) => value ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Chưa có';

export default function ReservationDetail({ reservationId }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showToken, setShowToken] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');
  const [cancelMessage, setCancelMessage] = useState('');
  const [state, setState] = useState({ loading: true, error: '', reservation: null });
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const base = import.meta.env.VITE_CUSTOMER_RESERVATIONS_URL;
        if (!base) throw new Error('Chưa cấu hình API đặt chỗ.');
        const url = new URL(base, window.location.origin);
        url.pathname = `${url.pathname.replace(/\/$/, '')}/${encodeURIComponent(reservationId)}`;
        url.search = '';
        const response = await fetch(url, { credentials: 'include', signal: controller.signal, cache: 'no-store', headers: { Accept: 'application/json', 'Cache-Control': 'no-store' } });
        const payload = await response.json().catch(() => null);
        if (!response.ok || payload?.success !== true) {
          const message = typeof payload?.message === 'string' && payload.message !== 'Success.' ? payload.message : '';
          throw new Error(message || ([401, 403].includes(response.status) ? 'Bạn không có quyền xem đặt chỗ này.' : response.status === 404 ? 'Không tìm thấy đặt chỗ.' : 'Không tải được chi tiết đặt chỗ.'));
        }
        if (!payload.data || String(payload.data.id) !== String(reservationId) || (payload.data.invoices != null && !Array.isArray(payload.data.invoices))) throw new Error('Dữ liệu chi tiết đặt chỗ không đúng cấu trúc.');
        if (!controller.signal.aborted) setState({ loading: false, error: '', reservation: payload.data });
      } catch (error) {
        if (!controller.signal.aborted) setState({ loading: false, error: error.message, reservation: null });
      }
    }
    load();
    return () => controller.abort();
  }, [reservationId, refreshKey]);
  async function copyToken(token) {
    try { await navigator.clipboard.writeText(token); setCopyMessage('Đã sao chép QR token check-in.'); }
    catch { setCopyMessage('Không thể sao chép QR token.'); }
  }
  if (state.loading) return <p role="status" className="mt-6 rounded-xl bg-white p-5">Đang tải chi tiết đặt chỗ…</p>;
  if (state.error) return <div role="alert" className="mt-6 rounded-xl bg-white p-5"><p className="text-red-700">{state.error}</p><button onClick={() => { setState({ loading: true, error: '', reservation: null }); setRefreshKey((value) => value + 1); }} className="mt-3 text-blue-700 underline">Thử lại</button></div>;
  const item = state.reservation;
  const invoices = item.invoices ?? [];
  return <div className="mt-6 space-y-5">
    <article className="rounded-xl border border-[#dfe7f5] bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold text-blue-700">{item.reservationCode}</p><h2 className="mt-1 text-xl font-bold">{item.unitCode} · {item.unitTypeName}</h2><p className="mt-2">{item.facilityName}</p><p className="text-sm text-[#58657a]">{item.facilityAddress}</p></div><span className="rounded-full bg-[#eef4ff] px-3 py-1 text-sm font-semibold">{item.displayStatus || item.status}</span></div>
      <dl className="mt-5 grid gap-3 text-sm md:grid-cols-3"><div><dt className="text-[#58657a]">Thời gian thuê</dt><dd>{date(item.startDate)} → {date(item.endDate)}</dd></div><div><dt className="text-[#58657a]">Ngày tạo</dt><dd>{dateTime(item.createdAt)}</dd></div><div><dt className="text-[#58657a]">Giữ chỗ đến</dt><dd>{dateTime(item.holdUntil)}{item.expiresInSeconds != null && <span className="block text-xs">Còn {item.expiresInSeconds} giây</span>}</dd></div><div><dt className="text-[#58657a]">Giá tháng</dt><dd>{money(item.monthlyRateSnapshot)}</dd></div><div><dt className="text-[#58657a]">Tiền cọc</dt><dd>{money(item.depositSnapshot)}</dd></div><div><dt className="text-[#58657a]">Phí đặt chỗ</dt><dd>{money(item.bookingFeeSnapshot)}</dd></div><div><dt className="text-[#58657a]">Giảm giá</dt><dd>{money(item.discountSnapshot)}</dd></div><div><dt className="text-[#58657a]">Mã khuyến mãi</dt><dd>{item.promotionCode || 'Không áp dụng'}</dd></div><div><dt className="text-[#58657a]">Tổng báo giá</dt><dd className="font-bold">{money(item.quotedTotal)}</dd></div><div><dt className="text-[#58657a]">Thanh toán đầu tiên</dt><dd className="font-bold">{money(item.firstPaymentTotal)}</dd></div></dl>
      {item.confirmedAt && <p className="mt-4 text-sm text-emerald-700">Xác nhận: {dateTime(item.confirmedAt)}</p>}{item.cancelledAt && <p className="mt-4 text-sm text-red-700">Đã hủy: {dateTime(item.cancelledAt)}{item.cancellationReason && ` · ${item.cancellationReason}`}</p>}
      <div className="mt-5 flex gap-3"><Link to={`/billing?reservationId=${encodeURIComponent(item.id)}`} className="rounded-lg bg-[#0b1c30] px-4 py-2 text-sm font-semibold text-white">Thanh toán</Link></div>
      {!item.cancelledAt && <CancelReservation reservationId={item.id} onSuccess={(message) => { setCancelMessage(message); setShowToken(false); setRefreshKey((value) => value + 1); }} />}
      {cancelMessage && <p role="status" className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{cancelMessage}</p>}
    </article>
    {(item.checkInQrToken || item.checkInInstructions) && <section className="rounded-xl border border-[#dfe7f5] bg-white p-6"><h2 className="text-lg font-bold">Thông tin nhận kho</h2>{item.checkInQrToken && <div className="mt-3 rounded-lg bg-[#f8faff] p-4"><p className="text-sm text-[#58657a]">QR token check-in</p><code className="mt-2 block break-all">{showToken ? item.checkInQrToken : '••••••••••••'}</code><div className="mt-3 flex gap-3"><button onClick={() => setShowToken((value) => !value)} className="text-sm text-blue-700 underline">{showToken ? 'Ẩn token' : 'Hiện token'}</button><button onClick={() => copyToken(item.checkInQrToken)} className="text-sm text-blue-700 underline">Sao chép</button></div></div>}<p className="mt-4 whitespace-pre-wrap text-sm">{item.checkInInstructions || 'Chưa có hướng dẫn check-in.'}</p>{copyMessage && <p role="status" className="mt-2 text-sm text-[#58657a]">{copyMessage}</p>}</section>}
    <section className="rounded-xl border border-[#dfe7f5] bg-white p-6"><h2 className="text-lg font-bold">Hóa đơn ({invoices.length})</h2>{invoices.length === 0 ? <p className="mt-3">Chưa có hóa đơn.</p> : <div className="mt-4 space-y-5">{invoices.map((invoice) => <article key={invoice.id} className="rounded-lg border p-4"><div className="flex flex-wrap justify-between gap-2"><div><h3 className="font-bold">{invoice.invoiceNo}</h3><p className="text-sm">Phát hành {date(invoice.issueDate)} · Hạn {date(invoice.dueDate)}</p></div><span className="rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-semibold">{invoice.status}</span></div><dl className="mt-3 grid grid-cols-2 gap-2 text-sm"><dt>Tạm tính</dt><dd className="text-right">{money(invoice.subtotalAmount)}</dd><dt>Giảm giá</dt><dd className="text-right">{money(invoice.discountAmount)}</dd><dt>Thuế</dt><dd className="text-right">{money(invoice.taxAmount)}</dd><dt>Tổng tiền</dt><dd className="text-right font-bold">{money(invoice.totalAmount)}</dd><dt>Đã thanh toán</dt><dd className="text-right">{money(invoice.paidAmount)}</dd></dl>{Array.isArray(invoice.lines) && invoice.lines.length > 0 && <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[600px] text-left text-sm"><thead><tr className="border-b"><th className="p-2">Nội dung</th><th className="p-2">Loại</th><th className="p-2">SL</th><th className="p-2">Đơn giá</th><th className="p-2 text-right">Thành tiền</th></tr></thead><tbody>{invoice.lines.map((line) => <tr key={line.id} className="border-b"><td className="p-2">{line.description}</td><td className="p-2">{line.lineType}</td><td className="p-2">{line.quantity}</td><td className="p-2">{money(line.unitPrice)}</td><td className="p-2 text-right">{money(line.lineAmount)}</td></tr>)}</tbody></table></div>}</article>)}</div>}</section>
  </div>;
}

function CancelReservation({ reservationId, onSuccess }) {
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [state, setState] = useState({ loading: false, error: '' });
  async function submit(event) {
    event.preventDefault();
    const cleanReason = reason.trim();
    if (!cleanReason) {
      setState({ loading: false, error: 'Vui lòng nhập lý do hủy đặt chỗ.' });
      return;
    }
    if (!confirmed) {
      setState({ loading: false, error: 'Vui lòng xác nhận yêu cầu hủy.' });
      return;
    }
    setState({ loading: true, error: '' });
    try {
      const base = import.meta.env.VITE_CUSTOMER_RESERVATIONS_URL;
      if (!base) throw new Error('Chưa cấu hình API đặt chỗ.');
      const url = new URL(base, window.location.origin);
      url.pathname = `${url.pathname.replace(/\/$/, '')}/${encodeURIComponent(reservationId)}/cancel`;
      url.search = '';
      const response = await fetch(url, { method: 'POST', credentials: 'include', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: cleanReason }) });
      const payload = await response.json().catch(() => null);
      if (!response.ok || payload?.success !== true) {
        const errors = Array.isArray(payload?.errors) ? payload.errors.filter((item) => typeof item === 'string').join(' ') : '';
        const message = typeof payload?.message === 'string' && payload.message !== 'Success.' ? payload.message : '';
        throw new Error(errors || message || ([401, 403].includes(response.status) ? 'Bạn không có quyền hủy đặt chỗ này.' : [400, 404, 409, 422].includes(response.status) ? 'Đặt chỗ không thể hủy ở trạng thái hiện tại.' : 'Không hủy được đặt chỗ.'));
      }
      setReason('');
      setConfirmed(false);
      setState({ loading: false, error: '' });
      onSuccess(typeof payload.data === 'string' && payload.data ? payload.data : 'Hủy đặt chỗ thành công.');
    } catch (error) {
      setState({ loading: false, error: error.message });
    }
  }
  return <details className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
    <summary className="cursor-pointer font-semibold text-red-700">Hủy đặt chỗ</summary>
    <form onSubmit={submit} className="mt-4">
      <label className="text-sm">Lý do hủy<textarea required value={reason} onChange={(event) => { setReason(event.target.value); setState({ loading: false, error: '' }); }} rows="3" maxLength="500" className="mt-1 w-full rounded-lg border border-red-200 bg-white p-3" placeholder="Nhập lý do hủy đặt chỗ" /></label>
      <label className="mt-3 flex items-start gap-2 text-sm"><input type="checkbox" checked={confirmed} onChange={(event) => { setConfirmed(event.target.checked); setState({ loading: false, error: '' }); }} className="mt-1" />Tôi xác nhận muốn hủy đặt chỗ này và hiểu rằng chính sách hoàn tiền sẽ do hệ thống áp dụng.</label>
      {state.error && <p role="alert" className="mt-3 text-sm text-red-700">{state.error}</p>}
      <button disabled={state.loading || !confirmed} className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{state.loading ? 'Đang hủy…' : 'Xác nhận hủy đặt chỗ'}</button>
    </form>
  </details>;
}
