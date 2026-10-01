import { useEffect, useState } from 'react';

const dateTime = (value) => {
  if (!value) return 'Chưa có';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};
const money = (value) => value == null ? 'Chưa có' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value));
const safeImageUrl = (value) => typeof value === 'string' && (/^https?:\/\//i.test(value) || value.startsWith('/')) ? value : '';

export default function RentalHandover({ agreementId }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [state, setState] = useState({ loading: true, error: '', handover: null });
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const base = import.meta.env.VITE_CUSTOMER_RENTALS_URL;
        if (!base) throw new Error('Chưa cấu hình API kho đang thuê.');
        const url = new URL(base, window.location.origin);
        url.pathname = `${url.pathname.replace(/\/$/, '')}/${encodeURIComponent(agreementId)}/handover`;
        url.search = '';
        const response = await fetch(url, { credentials: 'include', signal: controller.signal, headers: { Accept: 'application/json' } });
        const payload = await response.json().catch(() => null);
        if (!response.ok || payload?.success !== true) {
          const apiMessage = typeof payload?.message === 'string' && payload.message !== 'Success.' ? payload.message : '';
          throw new Error(apiMessage || ([401, 403].includes(response.status) ? 'Bạn không có quyền xem biên bản bàn giao này.' : response.status === 404 ? 'Hợp đồng chưa có biên bản bàn giao.' : 'Không tải được biên bản bàn giao.'));
        }
        if (!payload.data || String(payload.data.agreementId) !== String(agreementId)) throw new Error('Dữ liệu bàn giao không đúng cấu trúc.');
        if (!controller.signal.aborted) setState({ loading: false, error: '', handover: payload.data });
      } catch (error) {
        if (!controller.signal.aborted) setState({ loading: false, error: error.message, handover: null });
      }
    }
    load();
    return () => controller.abort();
  }, [agreementId, refreshKey]);
  if (state.loading) return <p role="status" className="mt-6 rounded-xl bg-white p-5">Đang tải biên bản bàn giao…</p>;
  if (state.error) return <div role="alert" className="mt-6 rounded-xl bg-white p-5"><p className="text-red-700">{state.error}</p><button onClick={() => { setState({ loading: true, error: '', handover: null }); setRefreshKey((value) => value + 1); }} className="mt-3 text-blue-700 underline">Thử lại</button></div>;
  const item = state.handover;
  const inspection = item.inspection;
  return <article className="mt-6 rounded-xl border border-[#dfe7f5] bg-white p-6 shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold text-blue-700">{item.agreementNo}</p><h2 className="mt-1 text-xl font-bold">Biên bản #{item.handoverId}</h2></div><span className="rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-semibold">{item.handoverType}</span></div>
    <dl className="mt-5 grid gap-3 text-sm md:grid-cols-2">
      <div><dt className="text-[#58657a]">Người xử lý</dt><dd>{item.handledByName || 'Chưa có'}</dd></div>
      <div><dt className="text-[#58657a]">Ngày tạo</dt><dd>{dateTime(item.createdAt)}</dd></div>
      <div><dt className="text-[#58657a]">Khách ký</dt><dd>{dateTime(item.customerSignedAt)}{item.customerSignatureRef && <div className="mt-1 break-all text-xs">Tham chiếu: {item.customerSignatureRef}</div>}</dd></div>
      <div><dt className="text-[#58657a]">Nhân viên ký</dt><dd>{dateTime(item.staffSignedAt)}{item.staffSignatureRef && <div className="mt-1 break-all text-xs">Tham chiếu: {item.staffSignatureRef}</div>}</dd></div>
    </dl>
    <div className="mt-5"><h3 className="font-bold">Ghi chú bàn giao</h3><p className="mt-2 whitespace-pre-wrap text-sm">{item.handoverNotes || 'Không có ghi chú.'}</p></div>
    {!inspection ? <p className="mt-5 rounded-lg bg-[#f8faff] p-4">Chưa có biên bản kiểm tra tình trạng.</p> : <section className="mt-6 border-t border-[#dfe7f5] pt-5">
      <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-lg font-bold">Kiểm tra tình trạng</h3><span className="rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-semibold">{inspection.status}</span></div>
      <dl className="mt-3 grid gap-3 text-sm md:grid-cols-2"><div><dt className="text-[#58657a]">Loại kiểm tra</dt><dd>{inspection.inspectionType}</dd></div><div><dt className="text-[#58657a]">Thời gian</dt><dd>{dateTime(inspection.inspectedAt)}</dd></div><div><dt className="text-[#58657a]">Tình trạng chung</dt><dd>{inspection.overallCondition || 'Chưa có'}</dd></div></dl>
      <p className="mt-3 whitespace-pre-wrap text-sm">{inspection.summary || 'Không có tóm tắt.'}</p>
      {!Array.isArray(inspection.items) || inspection.items.length === 0 ? <p className="mt-4">Chưa có hạng mục kiểm tra.</p> : <div className="mt-4 grid gap-4 md:grid-cols-2">{inspection.items.map((detail) => {
        const photo = safeImageUrl(detail.photoUrl);
        return <article key={detail.itemId} className="rounded-lg border border-[#dfe7f5] p-4"><div className="flex items-start justify-between gap-2"><h4 className="font-bold">{detail.itemName}</h4><span className="rounded-full bg-[#f8faff] px-2 py-1 text-xs">{detail.condition}</span></div><p className="mt-2 whitespace-pre-wrap text-sm">{detail.notes || 'Không có ghi chú.'}</p><p className="mt-2 text-sm">Phí phát sinh: <strong>{money(detail.chargeAmount)}</strong></p>{photo && <a href={photo} target="_blank" rel="noreferrer"><img src={photo} alt={`Ảnh kiểm tra ${detail.itemName}`} className="mt-3 max-h-52 w-full rounded-lg border object-cover" /></a>}</article>;
      })}</div>}
    </section>}
  </article>;
}
