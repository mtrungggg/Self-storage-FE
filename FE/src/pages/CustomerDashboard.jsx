import Header from '../components/Header';
import Footer from '../components/Footer';
import CustomerRentals from '../components/CustomerRentals';
import { getDefaultFooterColumns } from '../data/footerRepository';

export default function CustomerDashboard() {
  return <div className="min-h-screen bg-[#f5f7fd] text-[#0b1c30]">
    <Header active="dashboard" showUserBadge />
    <main className="mx-auto max-w-[1100px] px-4 py-8">
      <h1 className="text-[26px] font-bold">Kho đang thuê của tôi</h1>
      <p className="mt-2 text-[13px] text-[#58657a]">Theo dõi hợp đồng, ô kho, thời hạn thuê và trạng thái thanh toán.</p>
      <CustomerRentals />
    </main>
    <Footer tagline="Quản lý hợp đồng thuê kho và thông tin truy cập của bạn." columns={getDefaultFooterColumns()} />
  </div>;
}
