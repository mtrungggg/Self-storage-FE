import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FacilityMapLoader from '../components/FacilityMapLoader';
import { getDefaultFooterColumns } from '../data/footerRepository';
import { useStorageCatalog } from '../hooks/storageCatalogContext';

export default function FacilityMap() {
  const { records, loading, loadError } = useStorageCatalog();
  const [selectedFacilityId, setSelectedFacilityId] = useState('');
  const facilities = records?.facilities ?? [];
  const facilityId = selectedFacilityId || String(facilities[0]?.id ?? '');

  return <div className="min-h-screen bg-[#f5f7fd] text-[#0b1c30]">
    <Header active="facility" subtitle="Sơ đồ cơ sở" />
    <main className="mx-auto max-w-[1200px] px-4 py-8 lg:px-6">
      <div className="max-w-[760px]">
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#1d5fe5]">Bản đồ kho</p>
        <h1 className="mt-2 text-[32px] font-bold leading-tight tracking-[-0.03em]">Sơ đồ ô kho theo cơ sở</h1>
        <p className="mt-3 text-[14px] leading-6 text-[#58657a]">Chọn cơ sở, lọc theo phân khu hoặc tầng rồi tải vị trí các ô kho từ hệ thống.</p>
      </div>

      {loading && <p role="status" className="mt-6 rounded-xl border bg-white p-5">Đang tải danh sách cơ sở…</p>}
      {loadError && <p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">{loadError}</p>}
      {!loading && !loadError && facilities.length === 0 && <p role="status" className="mt-6 rounded-xl border bg-white p-5">Chưa có cơ sở kho để hiển thị.</p>}
      {facilities.length > 0 && <>
        <label className="mt-6 block max-w-md font-semibold">Cơ sở
          <select value={facilityId} onChange={(event) => setSelectedFacilityId(event.target.value)} className="mt-1 w-full rounded-lg border bg-white p-3 font-normal">
            {facilities.map((facility) => <option key={facility.id} value={facility.id}>{facility.name} — {facility.city}</option>)}
          </select>
        </label>
        <FacilityMapLoader key={facilityId} facilityId={facilityId} />
      </>}
    </main>
    <Footer tagline="Xem vị trí và trạng thái ô kho trực tiếp từ dữ liệu cơ sở." columns={getDefaultFooterColumns()} />
  </div>;
}
