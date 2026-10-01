import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../components/Header';
import FacilityMapLoader from '../components/FacilityMapLoader';

const money = (value) => value == null ? 'Chưa có giá' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

export default function FacilityDetail() {
  const { facilityId } = useParams();
  const [state, setState] = useState({ loading: true, facility: null, error: '' });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      await Promise.resolve();
      if (controller.signal.aborted) return;
      setState({ loading: true, facility: null, error: '' });
      const base = import.meta.env.VITE_CUSTOMER_FACILITIES_URL;
      if (!base) { setState({ loading: false, facility: null, error: 'Chưa cấu hình API cơ sở.' }); return; }
      try {
        const url = new URL(base, window.location.origin);
        url.pathname = `${url.pathname.replace(/\/$/, '')}/${encodeURIComponent(facilityId)}`;
        url.search = '';
        const response = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error(response.status === 404 ? 'Không tìm thấy cơ sở.' : [401, 403].includes(response.status) ? 'Bạn chưa có quyền truy cập thông tin cơ sở. Vui lòng đăng nhập.' : 'Không tải được thông tin cơ sở.');
        const payload = await response.json();
        if (payload?.success !== true || String(payload.data?.id) !== facilityId || !Array.isArray(payload.data?.unitTypes)) throw new Error('Dữ liệu cơ sở không hợp lệ.');
        if (!controller.signal.aborted) setState({ loading: false, facility: payload.data, error: '' });
      } catch (error) {
        if (!controller.signal.aborted) setState({ loading: false, facility: null, error: error.message });
      }
    }
    load();
    return () => controller.abort();
  }, [facilityId, attempt]);
  const facility = state.facility;
  return <div className="min-h-screen bg-[#f5f7fd] text-[#0b1c30]">
    <Header active="rent" />
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Link to="/home" className="text-blue-700 underline">Quay lại danh sách cơ sở</Link>
      <h1 className="mt-4 text-2xl font-bold">Thông tin cơ sở kho</h1>
      {state.loading && <p role="status" className="mt-4">Đang tải thông tin cơ sở…</p>}
      {state.error && <div role="alert" className="mt-4 rounded-xl bg-white p-5"><p>{state.error}</p><button onClick={() => setAttempt((value) => value + 1)} className="mt-3 text-blue-700 underline">Thử lại</button></div>}
      {facility && <>
        <section className="mt-5 rounded-xl border bg-white p-6">
          <h2 className="text-xl font-bold">{facility.name}</h2><p>{facility.code}</p>
          <p className="mt-2">{[facility.address, facility.city].filter(Boolean).join(', ')}</p>
          <p className="mt-2">Giờ mở cửa: {facility.openingTime ?? 'Chưa cập nhật'} – {facility.closingTime ?? 'Chưa cập nhật'}</p>
          <p className="mt-3 whitespace-pre-wrap">{facility.description || 'Chưa có mô tả cơ sở.'}</p>
          <h3 className="mt-4 font-semibold">Tiện ích</h3>
          {facility.amenities?.length ? <ul className="mt-2 list-inside list-disc">{facility.amenities.map((item, index) => <li key={index}>{typeof item === 'string' ? item : item.name || 'Tiện ích chưa có tên'}</li>)}</ul> : <p>Chưa có thông tin tiện ích.</p>}
        </section>
        <h2 className="mt-6 text-lg font-bold">Các loại kho tại cơ sở</h2>
        <FacilityMapLoader key={facility.id} facilityId={facility.id} />
        <p className="mt-1 text-sm">Số ô trống theo dữ liệu cơ sở; chưa đối chiếu khoảng thời gian thuê.</p>
        {facility.unitTypes.length === 0 && <p className="mt-4">Chưa có loại kho được cung cấp.</p>}
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {facility.unitTypes.map((type) => <article key={type.unitTypeId} className="rounded-xl border bg-white p-5">
            <h3 className="font-bold">{type.name} · {type.code}</h3>
            <p className="mt-2">Dài × rộng × cao: {type.lengthM} × {type.widthM} × {type.heightM} m</p>
            <p>Diện tích: {type.areaM2} m² · Thể tích: {type.volumeM3} m³</p>
            <p className="mt-3 text-lg font-bold text-blue-700">{money(type.monthlyRate)}{type.monthlyRate != null && ' / tháng'}</p>
            <p className="mt-2">Số ô trống: {type.availableUnitCount ?? 'Chưa cập nhật'}</p>
          </article>)}
        </div>
        <p className="mt-4 text-sm text-[#58657a]">Thông tin cọc, phí và chính sách chưa được cung cấp trong dữ liệu cơ sở.</p>
      </>}
    </main>
  </div>;
}
