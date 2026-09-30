import { useBilling } from "../hooks/useBilling";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageBackground from "../components/PageBackground";
import { formatVnd } from "../lib/utils";

function Billing() {
  const {
    invoiceTabs,
    activeTab,
    setActiveTab,
    search,
    setSearch,
    filteredInvoices,
    loading,
    error,
    checkout,
    reservation,
  } = useBilling();

  return (
    <div className="relative flex min-h-screen flex-col text-[#0b1c30]">
      <PageBackground />
      <Header active="billing" />

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 lg:px-6">
        {checkout && (
          <div
            className={`mb-5 grid grid-cols-1 items-start gap-5 rounded-[16px] border border-[#1d5fe5]/30 bg-[#eef4ff] p-5 ${
              checkout.vietQr?.qrImageUrl ? "md:grid-cols-[1fr_320px]" : ""
            }`}
          >
            <div>
              <div className="flex items-center gap-2 text-[18px] font-bold text-[#1d5fe5]">
                <span className="material-symbols-outlined text-[24px]">qr_code_2</span>
                Đặt chỗ thành công — vui lòng thanh toán để giữ kho
              </div>
              {reservation?.reservationCode && (
                <div className="mt-2 text-[15px] text-[#3a475a]">
                  Mã đặt chỗ: <span className="font-semibold">{reservation.reservationCode}</span>
                </div>
              )}
              {!checkout.vietQr?.qrImageUrl && (
                <div className="mt-2 text-[20px] font-extrabold text-[#1d5fe5]">{formatVnd(checkout.amount)}</div>
              )}
            </div>
            {checkout.vietQr?.qrImageUrl && (
              <div className="justify-self-center text-center">
                <div className="relative h-[282px] w-[280px] overflow-hidden rounded-[12px] border border-[#dfe7f5] bg-white">
                  <img
                    src={checkout.vietQr.qrImageUrl}
                    alt="VietQR"
                    className="absolute left-0 top-0 w-full"
                  />
                </div>
                <div className="mt-2 text-[13px] font-bold text-[#0b1c30]">Self Storage System</div>
                <div className="text-[16px] font-extrabold text-[#1d5fe5]">{formatVnd(checkout.amount)}</div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-[12px] border border-[#fecdca] bg-[#fff1f1] px-4 py-3 text-[13px] font-semibold text-[#b3261e]">
            {error}
          </div>
        )}

        <h1 className="text-[22px] sm:text-[24px] font-bold tracking-[-0.02em] text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">Hóa đơn &amp; Thanh toán</h1>

        <div className="mt-5 rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-[15px] font-bold text-[#0b1c30]">Lịch sử giao dịch</div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-[#8996a9]">search</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm mã hóa đơn, mã kho..."
                className="rounded-md border border-[#dfe7f5] bg-white py-1.5 pl-8 pr-3 text-[12px] outline-none focus:border-[#3b82f6]"
              />
            </div>
          </div>

          <div className="mt-4 inline-flex rounded-[10px] bg-[#eef4ff] p-1">
            {invoiceTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-[8px] px-3 py-1.5 text-[12px] font-semibold transition ${
                  activeTab === tab.id ? "bg-[#0b1c30] text-white shadow-sm" : "text-[#58657a] hover:text-[#0b1c30]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="mt-4 flex items-center gap-2 py-8 text-[13px] text-[#58657a]">
              <span className="material-symbols-outlined animate-spin text-[18px] text-[#1d5fe5]">progress_activity</span>
              Đang tải lịch sử thanh toán...
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="mt-4 rounded-[12px] border border-dashed border-[#dfe7f5] p-8 text-center text-[13px] text-[#8996a9]">
              Chưa có giao dịch thanh toán nào.
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[620px] border-collapse text-[12px]">
                <thead>
                  <tr className="border-b border-[#eef1f8] text-left text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
                    <th className="py-2.5 pr-3">Mã HĐ</th>
                    <th className="py-2.5 pr-3">Ngày</th>
                    <th className="py-2.5 pr-3">Dịch vụ</th>
                    <th className="py-2.5 pr-3">Số tiền</th>
                    <th className="py-2.5 pr-3">Thanh toán</th>
                    <th className="py-2.5 pr-3">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-[#f2f4fa] hover:bg-[#f8faff]">
                      <td className="py-3 pr-3 font-semibold text-[#1d5fe5]">{inv.id}</td>
                      <td className="py-3 pr-3 text-[#3a475a]">{inv.date}</td>
                      <td className="py-3 pr-3 font-semibold text-[#0b1c30]">{inv.desc}</td>
                      <td className="py-3 pr-3 font-semibold text-[#0b1c30]">{inv.amount}</td>
                      <td className="py-3 pr-3 text-[#3a475a]">{inv.method}</td>
                      <td className="py-3 pr-3">
                        {inv.status === "paid" ? (
                          <span className="rounded-full bg-[#e7f8ee] px-2 py-0.5 text-[11px] font-bold text-[#0e7b4c]">Đã thanh toán</span>
                        ) : (
                          <span className="rounded-full bg-[#eef4ff] px-2 py-0.5 text-[11px] font-bold text-[#1d5fe5]">Sắp đến hạn</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Billing;
