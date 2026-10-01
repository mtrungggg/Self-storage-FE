import Header from '../components/Header';
import Footer from '../components/Footer';
import StorageSearch from '../components/StorageSearch';
import { useStorageCatalog } from '../hooks/storageCatalogContext';
import { getDefaultFooterColumns } from '../data/footerRepository';

export default function Home() {
  const catalog = useStorageCatalog();
  return <div className="min-h-screen bg-[#f5f7fd] text-[#0b1c30]">
    <Header active="rent" subtitle="Tìm và đặt kho" />
    <main className="mx-auto max-w-[1200px] px-4 py-8 lg:px-6">
      <div className="max-w-[760px]">
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#1d5fe5]">Danh mục kho dành cho khách hàng</p>
        <h1 className="mt-2 text-[32px] font-bold leading-tight tracking-[-0.03em]">Tìm ô kho phù hợp với nhu cầu của bạn</h1>
        <p className="mt-3 text-[14px] leading-6 text-[#58657a]">Chọn cơ sở và loại kho, kiểm tra ô đang khả dụng, xem báo giá rồi tạo đặt chỗ. Tất cả thông tin bên dưới được tải từ hệ thống.</p>
      </div>
      <StorageSearch {...catalog} />
    </main>
    <Footer tagline="Tìm kiếm, báo giá và quản lý đặt chỗ kho trên một hệ thống." columns={getDefaultFooterColumns()} />
  </div>;
}
