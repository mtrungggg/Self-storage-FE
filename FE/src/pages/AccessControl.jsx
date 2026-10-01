import { Link, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import RentalAccessCredentials from '../components/RentalAccessCredentials';
import { getDefaultFooterColumns } from '../data/footerRepository';

export default function AccessControl() {
  const [query] = useSearchParams();
  const agreementId = query.get('agreementId');
  const validAgreementId = agreementId && /^\d+$/.test(agreementId) && Number(agreementId) > 0;
  return <div className="min-h-screen bg-[#f5f7fd] text-[#0b1c30]">
    <Header active="access" showUserBadge />
    <main className="mx-auto max-w-[900px] px-4 py-8">
      <Link to="/dashboard" className="text-sm text-blue-700 underline">Quay lại kho đang thuê</Link>
      <h1 className="mt-4 text-[26px] font-bold">Thông tin truy cập kho</h1>
      <p className="mt-2 text-[13px] text-[#58657a]">Xem PIN bàn phím và QR token của hợp đồng thuê đang hoạt động.</p>
      {validAgreementId ? <RentalAccessCredentials agreementId={agreementId} /> : <div role="alert" className="mt-6 rounded-xl bg-white p-5"><p>Chưa chọn hợp đồng thuê hợp lệ.</p><Link to="/dashboard" className="mt-3 inline-block text-blue-700 underline">Chọn kho đang thuê</Link></div>}
    </main>
    <Footer tagline="Thông tin truy cập được bảo vệ theo hợp đồng thuê của bạn." columns={getDefaultFooterColumns()} />
  </div>;
}
