import { useBilling } from "../hooks/useBilling";
import Header from "../components/Header";
import Footer from "../components/Footer";

function Billing() {
  const {
    invoiceTabs,
    trustBadges,
    activeTab,
    setActiveTab,
    search,
    setSearch,
    autoInvoice,
    setAutoInvoice,
    filteredInvoices,
  } = useBilling();

  return (
    <div className="min-h-screen bg-[#f5f7fd] text-[#0b1c30]">
      <Header active="billing" />

      <main className="mx-auto max-w-[1280px] px-4 py-6 lg:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[22px] sm:text-[24px] font-bold tracking-[-0.02em] text-[#0b1c30]">Hóa đơn &amp; Thanh toán</h1>
              <span className="rounded-full bg-[#eef4ff] px-2.5 py-0.5 text-[11px] font-bold text-[#1d5fe5]">Tháng 10/2025</span>
            </div>
            <p className="mt-1 text-[13px] text-[#58657a]">
              Quản lý hóa đơn và phương thức thanh toán định kỳ.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 rounded-[10px] border border-[#dfe7f5] bg-white px-3.5 py-2 text-[12px] font-semibold text-[#3a475a] hover:bg-[#f8faff]">
              <span className="material-symbols-outlined text-[16px]">description</span>
              Xuất sao kê
            </button>
            <button className="flex items-center gap-1.5 rounded-[10px] bg-[#1d5fe5] px-4 py-2 text-[12px] font-bold text-white shadow-[0_10px_20px_rgba(29,95,229,0.25)] hover:bg-[#174fc7]">
              <span className="material-symbols-outlined text-[16px]">bolt</span>
              Thanh toán ($260)
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-[14px] border border-[#dfe7f5] bg-white p-4">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">
              Sắp đến hạn
              <span className="rounded-full bg-[#fff1e6] px-2 py-0.5 text-[10px] font-semibold text-[#b45309]">01/11/2025</span>
            </div>
            <div className="mt-2 text-[22px] font-bold text-[#0b1c30]">$101.00</div>
            <div className="mt-1 text-[11px] text-[#58657a]">Kho #B-204 (Có điều hòa)</div>
            <div className="mt-2 flex items-center gap-1.5 rounded-md bg-[#f8faff] px-2 py-1.5 text-[11px] text-[#3a475a]">
              <span className="material-symbols-outlined text-[14px] text-[#1d5fe5]">autorenew</span>
              Tự động trích Visa •••• 4092
            </div>
          </div>

          <div className="rounded-[14px] border border-[#dfe7f5] bg-white p-4">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">
              Thanh toán tự động
              <span className="flex items-center gap-1 rounded-full bg-[#e7f8ee] px-2 py-0.5 text-[10px] font-semibold text-[#0e7b4c]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4a0]" /> Bật
              </span>
            </div>
            <div className="mt-2 text-[16px] font-bold text-[#0b1c30]">Visa •••• 4092</div>
            <div className="mt-1 text-[11px] text-[#58657a]">Hạn 08/28 • Alex Morgan</div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-[#8996a9]">Thẻ mặc định</span>
              <button className="font-semibold text-[#1d5fe5] hover:underline">Đổi thẻ</button>
            </div>
          </div>

          <div className="rounded-[14px] border border-[#dfe7f5] bg-white p-4">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">
              Tiền cọc
              <span className="rounded-full bg-[#e7f8ee] px-2 py-0.5 text-[10px] font-semibold text-[#0e7b4c]">Bảo toàn</span>
            </div>
            <div className="mt-2 text-[22px] font-bold text-[#0b1c30]">$130.00</div>
            <div className="mt-1 text-[11px] text-[#58657a]">Kho #B-204 &amp; #D-118</div>
            <div className="mt-2 flex items-center gap-1.5 rounded-md bg-[#f8faff] px-2 py-1.5 text-[11px] text-[#3a475a]">
              <span className="material-symbols-outlined text-[14px] text-[#0e7b4c]">verified</span>
              Hoàn trả khi trả kho
            </div>
          </div>

          <div className="rounded-[14px] border border-[#dfe7f5] bg-white p-4">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">
              Hóa đơn VAT
              <span className="rounded-full bg-[#e7f8ee] px-2 py-0.5 text-[10px] font-semibold text-[#0e7b4c]">Đầy đủ</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[22px] font-bold text-[#0b1c30]">
              12/12
              <span className="material-symbols-outlined text-[18px] text-[#0e7b4c]">check_circle</span>
            </div>
            <div className="mt-1 text-[11px] text-[#58657a]">MST: 0109845621</div>
            <div className="mt-2 flex items-center gap-1.5 rounded-md bg-[#f8faff] px-2 py-1.5 text-[11px] text-[#3a475a]">
              <span className="material-symbols-outlined text-[14px] text-[#1d5fe5]">mail</span>
              Tự động gửi qua email
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 overflow-hidden rounded-[16px] bg-[#0b1c30] text-white md:grid-cols-[1fr_260px]">
          <div className="p-6">
            <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#7fd8b1]">Đảm bảo dịch vụ</div>
            <div className="mt-1 text-[17px] font-bold">Duy trì quyền truy cập &amp; An ninh 24/7</div>
            <p className="mt-2 max-w-[480px] text-[12px] leading-relaxed text-[#c7d1e6]">
              Thanh toán đúng hạn bảo đảm mã PIN, khóa thông minh và hệ thống điều hòa nhiệt độ luôn hoạt động ổn định.
            </p>
          </div>
          <div
            className="h-full min-h-[130px] w-full bg-cover bg-center"
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgba(11,28,48,0.95), rgba(11,28,48,0.1)), url('https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80')",
            }}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[15px] font-bold text-[#0b1c30]">Lịch sử giao dịch</div>
                  <p className="mt-0.5 text-[11px] text-[#8996a9]">Hóa đơn lưu trữ phục vụ quyết toán thuế.</p>
                </div>
                <select className="rounded-md border border-[#dfe7f5] bg-white px-2.5 py-1.5 text-[12px] font-semibold text-[#3a475a] outline-none">
                  <option>Năm 2025</option>
                  <option>Năm 2024</option>
                </select>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex rounded-[10px] bg-[#eef4ff] p-1">
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
                      <th className="py-2.5 pr-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="border-b border-[#f2f4fa] hover:bg-[#f8faff]">
                        <td className="py-3 pr-3 font-semibold text-[#1d5fe5]">{inv.id}</td>
                        <td className="py-3 pr-3 text-[#3a475a]">{inv.date}</td>
                        <td className="py-3 pr-3">
                          <div className="font-semibold text-[#0b1c30]">{inv.desc}</div>
                          <div className="text-[11px] text-[#8996a9]">{inv.note}</div>
                        </td>
                        <td className="py-3 pr-3 font-semibold text-[#0b1c30]">{inv.amount}</td>
                        <td className="py-3 pr-3 text-[#3a475a]">{inv.method}</td>
                        <td className="py-3 pr-3">
                          {inv.status === "paid" ? (
                            <span className="rounded-full bg-[#e7f8ee] px-2 py-0.5 text-[11px] font-bold text-[#0e7b4c]">Đã thanh toán</span>
                          ) : (
                            <span className="rounded-full bg-[#eef4ff] px-2 py-0.5 text-[11px] font-bold text-[#1d5fe5]">Sắp đến hạn</span>
                          )}
                        </td>
                        <td className="py-3 pr-3 text-right">
                          {inv.status === "paid" ? (
                            <span className="flex items-center justify-end gap-2 text-[#8996a9]">
                              <button title="Xem chi tiết" className="hover:text-[#1d5fe5]">
                                <span className="material-symbols-outlined text-[16px]">visibility</span>
                              </button>
                              <button title="Tải xuống" className="hover:text-[#1d5fe5]">
                                <span className="material-symbols-outlined text-[16px]">download</span>
                              </button>
                            </span>
                          ) : (
                            <button className="rounded-md bg-[#1d5fe5] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[#174fc7]">Thanh toán</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#8996a9]">
                <span>Hiển thị {filteredInvoices.length} / 18 hóa đơn</span>
                <div className="flex items-center gap-1">
                  <button className="flex h-7 w-7 items-center justify-center rounded-md border border-[#dfe7f5] hover:bg-[#f8faff]">
                    <span className="material-symbols-outlined text-[14px]">chevron_left</span>
                  </button>
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0b1c30] font-semibold text-white">1</span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-md border border-[#dfe7f5] hover:bg-[#f8faff]">2</span>
                  <button className="flex h-7 w-7 items-center justify-center rounded-md border border-[#dfe7f5] hover:bg-[#f8faff]">
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="flex items-center justify-between">
                <div className="text-[15px] font-bold text-[#0b1c30]">Cước định kỳ theo kho</div>
                <span className="rounded-full bg-[#eef4ff] px-2.5 py-0.5 text-[11px] font-bold text-[#1d5fe5]">2 kho đang thuê</span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-[13px] font-bold text-[#0b1c30]">Kho #B-204</div>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-[#3a475a] border border-[#eef1f8]">Tầng 2</span>
                  </div>
                  <div className="text-[11px] text-[#8996a9]">5' × 10' • Điều hòa nhiệt độ</div>

                  <div className="mt-3 space-y-1.5 text-[12px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[#58657a]">Tiền thuê kho:</span>
                      <span className="font-semibold text-[#0b1c30]">$89.00/tháng</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#58657a]">Bảo hiểm VaultGuard:</span>
                      <span className="font-semibold text-[#0b1c30]">+$12.00</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-[#eef1f8] pt-2 text-[13px] font-bold text-[#0b1c30]">
                    Tổng định kỳ:
                    <span className="text-[#1d5fe5]">$101.00/tháng</span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-[#8996a9]">
                    <span>Kỳ trừ: Ngày 01 hàng tháng</span>
                    <span className="font-semibold text-[#3a475a]">Visa •••• 4092</span>
                  </div>
                </div>

                <div className="rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-[13px] font-bold text-[#0b1c30]">Kho #D-118</div>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-[#3a475a] border border-[#eef1f8]">Tầng trệt</span>
                  </div>
                  <div className="text-[11px] text-[#8996a9]">10' × 20' • Garage xe vào tận nơi</div>

                  <div className="mt-3 space-y-1.5 text-[12px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[#58657a]">Tiền thuê kho:</span>
                      <span className="font-semibold text-[#0b1c30]">$159.00/tháng</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#58657a]">Bảo hiểm cơ bản:</span>
                      <span className="font-semibold text-[#0e7b4c]">Đã bao gồm</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-[#eef1f8] pt-2 text-[13px] font-bold text-[#0b1c30]">
                    Tổng định kỳ:
                    <span className="text-[#1d5fe5]">$159.00/tháng</span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-[#8996a9]">
                    <span>Kỳ trừ: Ngày 15 hàng tháng</span>
                    <span className="font-semibold text-[#3a475a]">Visa •••• 4092</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="flex items-center gap-2 text-[13px] font-bold text-[#0b1c30]">
                <span className="material-symbols-outlined text-[18px] text-[#1d5fe5]">credit_card</span>
                Phương thức thanh toán
              </div>

              <div className="mt-3 rounded-[14px] bg-[#0b1c30] p-4 text-white">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.06em] text-[#7fd8b1]">
                  Tự động thanh toán
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                </div>
                <div className="mt-4 text-[16px] font-semibold tracking-[0.1em]">•••• •••• •••• 4092</div>
                <div className="mt-3 flex items-center justify-between text-[10px] text-[#c7d1e6]">
                  <span>
                    CHỦ THẺ
                    <div className="text-[12px] font-semibold text-white">ALEX MORGAN</div>
                  </span>
                  <span className="text-right">
                    HẠN DÙNG
                    <div className="text-[12px] font-semibold text-white">08/28</div>
                  </span>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between rounded-[10px] border border-[#eef1f8] p-3">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px] text-[#3a475a]">phone_iphone</span>
                    <div>
                      <div className="text-[12px] font-semibold text-[#0b1c30]">Apple Pay</div>
                      <div className="text-[10px] text-[#8996a9]">Đã liên kết ví</div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[16px] text-[#0e7b4c]">check_circle</span>
                </div>
                <div className="flex items-center justify-between rounded-[10px] border border-[#eef1f8] p-3">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px] text-[#3a475a]">qr_code_2</span>
                    <div>
                      <div className="text-[12px] font-semibold text-[#0b1c30]">VietQR / MoMo</div>
                      <div className="text-[10px] text-[#8996a9]">Quét mã tức thì</div>
                    </div>
                  </div>
                  <button className="text-[11px] font-semibold text-[#1d5fe5] hover:underline">Liên kết</button>
                </div>
              </div>

              <button className="mt-3 flex w-full items-center justify-center gap-1 rounded-[10px] border border-dashed border-[#1d5fe5] py-2 text-[12px] font-semibold text-[#1d5fe5] hover:bg-[#f8faff]">
                <span className="material-symbols-outlined text-[16px]">add</span>
                Thêm phương thức mới
              </button>
            </div>

            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="flex items-center justify-between text-[13px] font-bold text-[#0b1c30]">
                Thông tin hóa đơn VAT
                <span className="material-symbols-outlined text-[16px] text-[#0e7b4c]">check_circle</span>
              </div>

              <label className="mt-3 flex items-center gap-2 text-[12px] text-[#3a475a] cursor-pointer">
                <input type="checkbox" checked={autoInvoice} onChange={() => setAutoInvoice((v) => !v)} className="h-4 w-4 accent-[#1d5fe5]" />
                Tự động xuất hóa đơn điện tử
              </label>

              <div className="mt-3 space-y-2 text-[12px]">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">Tên công ty</div>
                  <input defaultValue="Morgan & Associates Tech Ltd." className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] bg-[#f8faff] px-2.5 py-1.5 text-[12px] outline-none focus:border-[#3b82f6]" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">Mã số thuế</div>
                    <input defaultValue="0109845621" className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] bg-[#f8faff] px-2.5 py-1.5 text-[12px] outline-none focus:border-[#3b82f6]" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">Cơ quan thuế</div>
                    <input defaultValue="Cục Thuế TP HCM" className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] bg-[#f8faff] px-2.5 py-1.5 text-[12px] outline-none focus:border-[#3b82f6]" />
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">Địa chỉ doanh nghiệp</div>
                  <input defaultValue="Tầng 4, Bitexco, Q.1, TP. Hồ Chí Minh" className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] bg-[#f8faff] px-2.5 py-1.5 text-[12px] outline-none focus:border-[#3b82f6]" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">Email nhận hóa đơn</div>
                  <input defaultValue="billing@alexmorgan.tech" className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] bg-[#f8faff] px-2.5 py-1.5 text-[12px] outline-none focus:border-[#3b82f6]" />
                </div>
              </div>

              <button className="mt-4 w-full rounded-[10px] bg-[#0b1c30] py-2 text-[12px] font-bold text-white hover:bg-[#132741]">
                Lưu thông tin
              </button>
            </div>

            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="flex items-center gap-2 text-[13px] font-bold text-[#0b1c30]">
                <span className="material-symbols-outlined text-[18px] text-[#1d5fe5]">support_agent</span>
                Hỗ trợ thanh toán
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[16px] font-bold text-[#1d5fe5]">1800 555 8285</span>
                <span className="rounded-full bg-[#eef4ff] px-2 py-0.5 text-[10px] font-semibold text-[#1d5fe5]">Nhánh 2</span>
              </div>
              <p className="mt-2 text-[11px] text-[#8996a9]">
                Bảo mật theo chuẩn PCI-DSS Cấp 1 &amp; TLS 1.3.
              </p>
            </div>
          </aside>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 rounded-[14px] border border-[#dfe7f5] bg-white p-5 md:grid-cols-4">
          {trustBadges.map((item) => (
            <div key={item.title} className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[22px] text-[#0e7b4c]">{item.icon}</span>
              <div>
                <div className="text-[13px] font-bold text-[#0b1c30]">{item.title}</div>
                <div className="text-[11px] text-[#8996a9]">{item.text}</div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Billing;
