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
      <Header active="billing" showUserBadge />

      <div className="border-b border-[#dfe7f5] bg-[#eef4ff]">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-2 px-4 py-2 text-[11px] font-semibold text-[#3a475a] lg:px-6">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-[#0e7b4c]">
              <span className="h-2 w-2 rounded-full bg-[#2dd4a0]" />
              Giám sát an ninh 24/7 đang hoạt động
            </span>
            <span className="flex items-center gap-1 text-[#0e7b4c]">
              <span className="h-2 w-2 rounded-full bg-[#2dd4a0]" />
              Khóa cửa sinh trắc học đang hoạt động
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">verified_user</span>
              Có 6 cơ sở đạt chuẩn bảo mật cấp độ A
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">phone_in_talk</span>
              Hotline khẩn cấp: 1800 888 999
            </span>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1280px] px-4 py-6 lg:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[26px] font-bold tracking-[-0.02em] text-[#0b1c30]">Hóa đơn & Tự động thanh toán</h1>
              <span className="rounded-full bg-[#eef4ff] px-2.5 py-1 text-[11px] font-bold text-[#1d5fe5]">Chu kỳ cước Tháng 10/2025</span>
            </div>
            <p className="mt-2 max-w-[640px] text-[13px] leading-6 text-[#58657a]">
              Quản lý thanh toán tự động, tra cứu hóa đơn VAT và kiểm soát chu kỳ cước cho các kho đang thuê tại VaultSpace.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 rounded-[10px] border border-[#dfe7f5] bg-white px-4 py-2.5 text-[12px] font-semibold text-[#3a475a]">
              <span className="material-symbols-outlined text-[16px]">description</span>
              Xuất sao kê (PDF/Excel)
            </button>
            <button className="flex items-center gap-2 rounded-[10px] bg-[#1d5fe5] px-4 py-2.5 text-[12px] font-bold text-white shadow-[0_10px_20px_rgba(29,95,229,0.25)] hover:bg-[#174fc7]">
              <span className="material-symbols-outlined text-[16px]">bolt</span>
              Thanh toán ngay ($260.00)
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-[14px] border border-[#dfe7f5] bg-white p-4">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">
              Khoản sắp đến hạn
              <span className="rounded-full bg-[#fff1e6] px-2 py-0.5 text-[#b45309]">01/11/2025</span>
            </div>
            <div className="mt-2 text-[22px] font-bold text-[#0b1c30]">$101.00 <span className="text-[12px] font-semibold text-[#8996a9]">USD</span></div>
            <div className="mt-1 text-[11px] text-[#58657a]">Kho tự quản #B-204 (Climate-Control)</div>
            <div className="mt-2 flex items-center gap-1 rounded-md bg-[#f8faff] px-2 py-1.5 text-[11px] text-[#3a475a]">
              <span className="material-symbols-outlined text-[14px] text-[#1d5fe5]">autorenew</span>
              Tự động trích Visa ****4092
            </div>
          </div>

          <div className="rounded-[14px] border border-[#dfe7f5] bg-white p-4">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">
              Tự động thanh toán
              <span className="flex items-center gap-1 rounded-full bg-[#e7f8ee] px-2 py-0.5 text-[#0e7b4c]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4a0]" /> Đang bật
              </span>
            </div>
            <div className="mt-2 text-[16px] font-bold text-[#0b1c30]">Visa Infinite</div>
            <div className="mt-1 text-[11px] text-[#58657a]">**** **** **** 4092 (Hết hạn 08/28)</div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-[#3a475a]">
              <span>Chủ thẻ: Alex Morgan</span>
              <button className="font-semibold text-[#1d5fe5] hover:underline">Thay đổi thẻ</button>
            </div>
          </div>

          <div className="rounded-[14px] border border-[#dfe7f5] bg-white p-4">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">
              Tiền cọc an ninh
              <span className="rounded-full bg-[#e7f8ee] px-2 py-0.5 text-[#0e7b4c]">Bảo toàn 100%</span>
            </div>
            <div className="mt-2 text-[22px] font-bold text-[#0b1c30]">$130.00 <span className="text-[12px] font-semibold text-[#8996a9]">USD</span></div>
            <div className="mt-1 text-[11px] text-[#58657a]">Áp dụng cho 2 căn: #B-204 & #D-118</div>
            <div className="mt-2 flex items-center gap-1 rounded-md bg-[#f8faff] px-2 py-1.5 text-[11px] text-[#3a475a]">
              <span className="material-symbols-outlined text-[14px] text-[#0e7b4c]">verified</span>
              Hoàn trả tự động khi tất toán bàn giao
            </div>
          </div>

          <div className="rounded-[14px] border border-[#dfe7f5] bg-white p-4">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">
              Hóa đơn VAT điện tử
              <span className="rounded-full bg-[#e7f8ee] px-2 py-0.5 text-[#0e7b4c]">Hợp lệ</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[22px] font-bold text-[#0b1c30]">
              12/12
              <span className="material-symbols-outlined text-[18px] text-[#0e7b4c]">check_circle</span>
            </div>
            <div className="mt-1 text-[11px] text-[#58657a]">MST: 0109845621 (Morgan &amp; Assoc.)</div>
            <div className="mt-2 flex items-center gap-1 rounded-md bg-[#f8faff] px-2 py-1.5 text-[11px] text-[#3a475a]">
              <span className="material-symbols-outlined text-[14px] text-[#1d5fe5]">mail</span>
              Tự gửi vào email công ty
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 overflow-hidden rounded-[16px] bg-[#0b1c30] text-white md:grid-cols-[1fr_260px]">
          <div className="p-6">
            <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#7fd8b1]">Hệ thống kho thông minh</div>
            <div className="mt-1 text-[18px] font-bold">Hành lang an ninh &amp; Khóa số thông minh trực tuyến</div>
            <p className="mt-2 max-w-[480px] text-[12px] leading-6 text-[#c7d1e6]">
              Mỗi chu kỳ thanh toán hợp lệ giúp mã PIN, thẻ sinh trắc học và hệ thống kiểm soát nhiệt độ của bạn duy trì hoạt động 24/7/365.
            </p>
          </div>
          <div
            className="h-full min-h-[140px] w-full bg-cover bg-center"
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgba(11,28,48,0.9), rgba(11,28,48,0)), url('https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80')",
            }}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[15px] font-bold text-[#0b1c30]">Danh sách Hóa đơn &amp; Lịch sử Giao dịch</div>
                  <p className="mt-1 text-[11px] text-[#8996a9]">Lưu trữ 5 năm phục vụ quyết toán thuế doanh nghiệp.</p>
                </div>
                <select className="rounded-md border border-[#dfe7f5] bg-white px-2 py-1.5 text-[12px] font-semibold text-[#3a475a] outline-none">
                  <option>Năm 2025 (Tất cả)</option>
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
                        activeTab === tab.id ? "bg-[#0b1c30] text-white shadow-sm" : "text-[#58657a]"
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
                    placeholder="Tìm theo mã hóa đơn, mã kho"
                    className="rounded-md border border-[#dfe7f5] bg-white py-1.5 pl-8 pr-3 text-[12px] outline-none focus:border-[#3b82f6]"
                  />
                </div>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-[12px]">
                  <thead>
                    <tr className="border-b border-[#eef1f8] text-left text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
                      <th className="py-2 pr-3">Mã hóa đơn</th>
                      <th className="py-2 pr-3">Ngày lập/hạn</th>
                      <th className="py-2 pr-3">Mô tả cước &amp; căn kho</th>
                      <th className="py-2 pr-3">Số tiền</th>
                      <th className="py-2 pr-3">Phương thức</th>
                      <th className="py-2 pr-3">Trạng thái</th>
                      <th className="py-2 pr-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="border-b border-[#f2f4fa]">
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
                            <span className="rounded-full bg-[#e7f8ee] px-2 py-1 text-[11px] font-bold text-[#0e7b4c]">Đã thanh toán</span>
                          ) : (
                            <span className="rounded-full bg-[#eef4ff] px-2 py-1 text-[11px] font-bold text-[#1d5fe5]">Sắp đến hạn</span>
                          )}
                        </td>
                        <td className="py-3 pr-3 text-right">
                          {inv.status === "paid" ? (
                            <span className="flex items-center justify-end gap-2 text-[#8996a9]">
                              <span className="material-symbols-outlined text-[16px]">visibility</span>
                              <span className="material-symbols-outlined text-[16px]">download</span>
                            </span>
                          ) : (
                            <button className="rounded-md bg-[#1d5fe5] px-3 py-1.5 text-[11px] font-bold text-white">Thanh toán sớm</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#8996a9]">
                <span>Hiển thị {filteredInvoices.length} trên tổng số 18 chứng từ kế toán</span>
                <div className="flex items-center gap-1">
                  <button className="flex h-7 w-7 items-center justify-center rounded-md border border-[#dfe7f5]">
                    <span className="material-symbols-outlined text-[14px]">chevron_left</span>
                  </button>
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0b1c30] font-semibold text-white">1</span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-md border border-[#dfe7f5]">2</span>
                  <button className="flex h-7 w-7 items-center justify-center rounded-md border border-[#dfe7f5]">
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="flex items-center justify-between">
                <div className="text-[15px] font-bold text-[#0b1c30]">Chi tiết chu kỳ cước theo từng Căn kho</div>
                <span className="rounded-full bg-[#eef4ff] px-2.5 py-1 text-[11px] font-bold text-[#1d5fe5]">2 Kho Đang Hoạt Động</span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-[13px] font-bold text-[#0b1c30]">Kho #B-204</div>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-[#3a475a]">Tầng 2</span>
                  </div>
                  <div className="text-[11px] text-[#8996a9]">5' x 10' • Kiểm soát nhiệt độ (Climate)</div>

                  <div className="mt-3 space-y-1.5 text-[12px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[#58657a]">Giá thuê gốc hàng tháng:</span>
                      <span className="font-semibold text-[#0b1c30]">$89.00 USD</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#58657a]">Bảo hiểm tài sản VaultGuard:</span>
                      <span className="font-semibold text-[#0b1c30]">+$12.00 USD</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-[#eef1f8] pt-2 text-[13px] font-bold text-[#0b1c30]">
                    Tổng phí định kỳ:
                    <span>$101.00 USD/tháng</span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-[#8996a9]">
                    <span>Trừ tiền: Ngày 01 hàng tháng</span>
                    <span className="font-semibold text-[#1d5fe5]">Tự động trừ Visa</span>
                  </div>
                </div>

                <div className="rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-[13px] font-bold text-[#0b1c30]">Kho #D-118</div>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-[#3a475a]">Tầng trệt</span>
                  </div>
                  <div className="text-[11px] text-[#8996a9]">10' x 20' • Drive-Up Tiếp cận ô tô</div>

                  <div className="mt-3 space-y-1.5 text-[12px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[#58657a]">Giá thuê kho khoảng rộng:</span>
                      <span className="font-semibold text-[#0b1c30]">$159.00 USD</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#58657a]">Bảo hiểm thiết bị chuyên dụng:</span>
                      <span className="font-semibold text-[#0e7b4c]">Đã gồm trọn gói</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-[#eef1f8] pt-2 text-[13px] font-bold text-[#0b1c30]">
                    Tổng phí định kỳ:
                    <span>$159.00 USD/tháng</span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-[#8996a9]">
                    <span>Trừ tiền: Ngày 15 hàng tháng</span>
                    <span className="font-semibold text-[#1d5fe5]">Tự động trừ Visa</span>
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
                  VaultSpace AUTO-PAY
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                </div>
                <div className="mt-4 text-[16px] font-semibold tracking-[0.1em]">**** **** **** 4092</div>
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
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#3a475a]">phone_iphone</span>
                    <div>
                      <div className="text-[12px] font-semibold text-[#0b1c30]">Apple Pay</div>
                      <div className="text-[10px] text-[#8996a9]">Đã liên kết (Khả dụng thanh toán chậm)</div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[16px] text-[#0e7b4c]">check_circle</span>
                </div>
                <div className="flex items-center justify-between rounded-[10px] border border-[#eef1f8] p-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#3a475a]">qr_code_2</span>
                    <div>
                      <div className="text-[12px] font-semibold text-[#0b1c30]">VietQR Pro / MoMo</div>
                      <div className="text-[10px] text-[#8996a9]">Thanh toán tức thời qua ứng dụng ngân hàng</div>
                    </div>
                  </div>
                  <button className="text-[11px] font-semibold text-[#1d5fe5] hover:underline">Cài đặt</button>
                </div>
              </div>

              <button className="mt-3 flex w-full items-center justify-center gap-1 rounded-[10px] border border-dashed border-[#1d5fe5] py-2.5 text-[12px] font-semibold text-[#1d5fe5]">
                <span className="material-symbols-outlined text-[16px]">add</span>
                Thêm phương thức thanh toán mới
              </button>
            </div>

            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="flex items-center justify-between text-[13px] font-bold text-[#0b1c30]">
                Hóa đơn Doanh nghiệp / VAT
                <span className="material-symbols-outlined text-[16px] text-[#0e7b4c]">check_circle</span>
              </div>

              <label className="mt-3 flex items-center gap-2 text-[12px] text-[#3a475a]">
                <input type="checkbox" checked={autoInvoice} onChange={() => setAutoInvoice((v) => !v)} className="h-4 w-4 accent-[#1d5fe5]" />
                Tự động xuất hóa đơn VAT điện tử
              </label>

              <div className="mt-3 space-y-2 text-[12px]">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">Tên doanh nghiệp</div>
                  <input defaultValue="Morgan & Associates Tech Ltd." className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] bg-[#f8faff] px-2.5 py-2 text-[12px] outline-none focus:border-[#3b82f6]" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">Mã số thuế (MST)</div>
                    <input defaultValue="0109845621" className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] bg-[#f8faff] px-2.5 py-2 text-[12px] outline-none focus:border-[#3b82f6]" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">Cơ quan thuế</div>
                    <input defaultValue="Cục Thuế TP HCM" className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] bg-[#f8faff] px-2.5 py-2 text-[12px] outline-none focus:border-[#3b82f6]" />
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">Địa chỉ đăng ký kinh doanh</div>
                  <input defaultValue="Tầng 4, Tháp Tài chính Bitexco, Q.1, TP. Hồ Chí Minh" className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] bg-[#f8faff] px-2.5 py-2 text-[12px] outline-none focus:border-[#3b82f6]" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">Email nhận E-invoice</div>
                  <input defaultValue="billing@alexmorgan.tech" className="mt-1 w-full rounded-[8px] border border-[#dfe7f5] bg-[#f8faff] px-2.5 py-2 text-[12px] outline-none focus:border-[#3b82f6]" />
                </div>
              </div>

              <button className="mt-4 w-full rounded-[10px] bg-[#0b1c30] py-2.5 text-[12px] font-bold text-white hover:bg-[#132741]">
                Lưu cập nhật thông tin thuế
              </button>
            </div>

            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="flex items-center gap-2 text-[13px] font-bold text-[#0b1c30]">
                <span className="material-symbols-outlined text-[18px] text-[#1d5fe5]">support_agent</span>
                Hỗ trợ Kế toán &amp; Cước phí
              </div>
              <div className="mt-1 text-[11px] text-[#8996a9]">Hotline ưu tiên khách thuê kho</div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[16px] font-bold text-[#1d5fe5]">1800 555 8285</span>
                <span className="rounded-full bg-[#eef4ff] px-2 py-0.5 text-[10px] font-semibold text-[#1d5fe5]">Nhánh 2</span>
              </div>
              <p className="mt-2 text-[11px] leading-5 text-[#8996a9]">
                Giao dịch thẻ tuân thủ chuẩn bảo mật PCI-DSS Cấp 1 và mã hóa TLS 1.3.
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

      <Footer
        tagline="Hệ sinh thái lưu trữ thông minh và kho tự quản cao cấp hàng đầu, an toàn tuyệt đối với sinh trắc học và quản lý số hóa."
        columns={[
          {
            title: "Dịch vụ lưu kho",
            items: ["Kho kiểm soát nhiệt độ (Climate-Controlled)", "Kho tiếp cận trực tiếp ô tô (Drive-Up)", "Kho tài liệu & Hồ sơ doanh nghiệp", "Tủ khóa bảo mật sinh trắc cá nhân"],
          },
          {
            title: "Hỗ trợ & Pháp lý",
            items: ["Quy chế bảo an và xuất/nhập kho", "Chính sách bảo hiểm vật phẩm ký gửi", "Điều khoản hợp đồng thuê kho", "Quy trình xử lý sự cố khẩn cấp"],
          },
          {
            title: "Tổng đài trợ giúp",
            items: ["Trung tâm Điều hành An ninh", "Hỗ trợ kỹ thuật 24/7/365", "support@vaultspace.vn"],
            highlight: "support@vaultspace.vn",
          },
        ]}
      />
    </div>
  );
}

export default Billing;
