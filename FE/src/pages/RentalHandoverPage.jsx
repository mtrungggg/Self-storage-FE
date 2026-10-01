import { Link, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import RentalHandover from '../components/RentalHandover';
import { getDefaultFooterColumns } from '../data/footerRepository';

export default function RentalHandoverPage() {
  const { agreementId } = useParams();
  const valid = /^\d+$/.test(agreementId || '') && Number(agreementId) > 0;
  return <div className="min-h-screen bg-[#f5f7fd] text-[#0b1c30]"><Header active="dashboard" showUserBadge /><main className="mx-auto max-w-[1000px] px-4 py-8"><Link to="/dashboard" className="text-blue-700 underline">Quay lại kho đang thuê</Link><h1 className="mt-4 text-[26px] font-bold">Biên bản bàn giao</h1>{valid ? <RentalHandover agreementId={agreementId} /> : <p role="alert" className="mt-6 rounded-xl bg-white p-5">Mã hợp đồng không hợp lệ.</p>}</main><Footer tagline="Biên bản bàn giao và kết quả kiểm tra kho." columns={getDefaultFooterColumns()} /></div>;
}
