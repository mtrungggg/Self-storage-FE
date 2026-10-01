import Header from '../components/Header';
import Footer from '../components/Footer';
import CustomerReservations from '../components/CustomerReservations';
import { getDefaultFooterColumns } from '../data/footerRepository';

export default function ReservationsPage() {
  return <div className="min-h-screen bg-[#f5f7fd] text-[#0b1c30]"><Header active="reservations" showUserBadge /><main className="mx-auto max-w-[1100px] px-4 py-8"><h1 className="text-[26px] font-bold">Đặt chỗ của tôi</h1><p className="mt-2 text-[13px] text-[#58657a]">Theo dõi thời gian giữ chỗ, báo giá, hóa đơn và trạng thái xác nhận.</p><CustomerReservations /></main><Footer tagline="Theo dõi và quản lý các đơn đặt chỗ của bạn." columns={getDefaultFooterColumns()} /></div>;
}
