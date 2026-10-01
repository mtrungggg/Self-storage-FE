import Header from '../components/Header';
import Footer from '../components/Footer';
import PaymentCheckout from '../components/PaymentCheckout';
import PaymentHistory from '../components/PaymentHistory';
import { getDefaultFooterColumns } from '../data/footerRepository';

export default function Billing() {
  return <div className="min-h-screen bg-[#f5f7fd] text-[#0b1c30]">
    <Header active="billing" showUserBadge />
    <main className="mx-auto max-w-[1100px] px-4 py-8">
      <h1 className="text-[26px] font-bold">Thanh toán</h1>
      <p className="mt-2 text-[13px] text-[#58657a]">Tạo giao dịch thanh toán cho đơn đặt chỗ và theo dõi trạng thái xử lý từ SePay.</p>
      <PaymentCheckout />
      <PaymentHistory />
      <div className="mt-6 rounded-[12px] border border-[#dfe7f5] bg-white p-4 text-[12px] text-[#58657a]">
        Webhook SePay được xử lý trực tiếp bởi backend. Trang này chỉ tạo checkout và đọc lịch sử của tài khoản đang đăng nhập.
      </div>
    </main>
    <Footer tagline="Thanh toán an toàn và theo dõi giao dịch rõ ràng." columns={getDefaultFooterColumns()} />
  </div>;
}
