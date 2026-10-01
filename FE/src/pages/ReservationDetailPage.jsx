import { Link, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ReservationDetail from '../components/ReservationDetail';
import { getDefaultFooterColumns } from '../data/footerRepository';

export default function ReservationDetailPage() {
  const { reservationId } = useParams();
  const valid = /^\d+$/.test(reservationId || '') && Number(reservationId) > 0;
  return <div className="min-h-screen bg-[#f5f7fd] text-[#0b1c30]"><Header active="reservations" showUserBadge /><main className="mx-auto max-w-[1100px] px-4 py-8"><Link to="/reservations" className="text-blue-700 underline">Quay lại danh sách đặt chỗ</Link><h1 className="mt-4 text-[26px] font-bold">Chi tiết đặt chỗ</h1>{valid ? <ReservationDetail reservationId={reservationId} /> : <p role="alert" className="mt-6 rounded-xl bg-white p-5">Mã đặt chỗ không hợp lệ.</p>}</main><Footer tagline="Thông tin đặt chỗ, check-in và hóa đơn." columns={getDefaultFooterColumns()} /></div>;
}
