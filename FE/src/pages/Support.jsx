import { useSupport } from "../hooks/useSupport";
import Header from "../components/Header";
import Footer from "../components/Footer";

function Support() {
  const {
    unitTabs,
    ticketTabs,
    trustBadges,
    activeUnitTab,
    setActiveUnitTab,
    activeTicketTab,
    setActiveTicketTab,
    priority,
    setPriority,
    allowMasterKey,
    setAllowMasterKey,
    filteredUnits,
    filteredTickets,
  } = useSupport();

  return (
    <div className="min-h-screen bg-[#f5f7fd] text-[#0b1c30]">
      <Header active="support" showUserBadge />

      <div className="border-b border-[#dfe7f5] bg-[#eef4ff]">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-2 px-4 py-2 text-[11px] font-semibold text-[#3a475a] lg:px-6">
          <span>Hệ thống VaultSpace / Trung tâm Quản lý Kho &amp; Dịch vụ khách hàng</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-[#0e7b4c]">
              <span className="h-2 w-2 rounded-full bg-[#2dd4a0]" />
              Hệ thống cổng an ninh 24/7 đang hoạt động
            </span>
            <span className="flex items-center gap-1 text-[#0e7b4c]">
              <span className="h-2 w-2 rounded-full bg-[#2dd4a0]" />
              Khóa an ninh Sinh trắc học: Hoạt động
            </span>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1280px] px-4 py-6 lg:px-6">
        <div className="rounded-[16px] bg-[#0b1c30] p-6 text-white">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.06em] text-[#8f9cbd]">
                <span className="material-symbols-outlined text-[14px]">location_on</span>
                Cơ sở An Phú Central • TP. Thủ Đức
                <span className="ml-2 text-[#c7d1e6]">Cập nhật lần cuối: 14:35, Hôm nay</span>
              </div>
              <h1 className="mt-2 text-[24px] font-bold tracking-[-0.02em]">Quản lý Kho &amp; Trung tâm Hỗ trợ Kỹ thuật</h1>
              <p className="mt-2 max-w-[560px] text-[12px] leading-6 text-[#c7d1e6]">
                Giám sát tình trạng khoang lưu trữ, cấp quyền mã PIN và tiếp nhận hỗ trợ kỹ thuật hiện trường 24/7.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 rounded-[10px] bg-[#1d5fe5] px-4 py-2.5 text-[12px] font-bold text-white hover:bg-[#174fc7]">
                <span className="material-symbols-outlined text-[16px]">build</span>
                Tạo yêu cầu sửa chữa
              </button>
              <button className="flex items-center gap-2 rounded-[10px] border border-white/20 bg-white/10 px-4 py-2.5 text-[12px] font-bold text-white">
                <span className="material-symbols-outlined text-[16px]">call</span>
                1800-555-VAULT
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="rounded-[12px] border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.06em] text-[#8f9cbd]">
                Kho đang quản lý
                <span className="material-symbols-outlined text-[14px]">inventory_2</span>
              </div>
              <div className="mt-1 text-[16px] font-bold">3 khoang thuê</div>
              <div className="text-[10px] text-[#8f9cbd]">• 2 kho hoạt động tốt</div>
            </div>

            <div className="rounded-[12px] border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.06em] text-[#8f9cbd]">
                Cần gia hạn gấp
                <span className="material-symbols-outlined text-[14px]">schedule</span>
              </div>
              <div className="mt-1 text-[16px] font-bold">1 khoang #B-204</div>
              <div className="text-[10px] text-[#f2b8a4]">⚠ Còn 3 ngày đến hạn</div>
            </div>

            <div className="rounded-[12px] border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.06em] text-[#8f9cbd]">
                Yêu cầu đang xử lý
                <span className="material-symbols-outlined text-[14px]">support_agent</span>
              </div>
              <div className="mt-1 text-[16px] font-bold">2 yêu cầu hỗ trợ</div>
              <div className="text-[10px] text-[#8f9cbd]">• 1 Đang chờ • 1 Đã cử NV</div>
            </div>

            <div className="rounded-[12px] border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.06em] text-[#8f9cbd]">
                Trực ban cơ sở
                <span className="material-symbols-outlined text-[14px]">emergency</span>
              </div>
              <div className="mt-1 text-[16px] font-bold">24/7 SLA ≤ 15 phút</div>
              <div className="text-[10px] text-[#8f9cbd]">• Có trực tiếp hiện trường 24/7</div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[15px] font-bold text-[#0b1c30]">Danh sách Kho đang thuê &amp; Trạng thái hợp đồng</div>
            <p className="text-[11px] text-[#8996a9]">Xem mã truy cập, kiểm soát nhiệt độ thời gian thực và gia hạn từng kho</p>
          </div>
          <div className="inline-flex rounded-[10px] bg-[#eef4ff] p-1">
            {unitTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveUnitTab(tab.id)}
                className={`rounded-[8px] px-3 py-1.5 text-[12px] font-semibold transition ${
                  activeUnitTab === tab.id ? "bg-[#0b1c30] text-white shadow-sm" : "text-[#58657a]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {filteredUnits.map((unit) => (
            <div
              key={unit.id}
              className={`rounded-[14px] border bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)] ${
                unit.status === "renew" ? "border-[#f3b3a3]" : "border-[#dfe7f5]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#1d5fe5]">warehouse</span>
                  <span className="text-[14px] font-bold text-[#0b1c30]">Kho #{unit.id}</span>
                </div>
                {unit.status === "renew" ? (
                  <span className="flex items-center gap-1 rounded-full bg-[#fdecec] px-2 py-0.5 text-[10px] font-bold text-[#c0362c]">
                    <span className="material-symbols-outlined text-[12px]">error</span>
                    {unit.statusLabel}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-full bg-[#e7f8ee] px-2 py-0.5 text-[10px] font-bold text-[#0e7b4c]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4a0]" />
                    {unit.statusLabel}
                  </span>
                )}
              </div>
              <div className="mt-0.5 text-[11px] text-[#8996a9]">{unit.location}</div>

              {unit.warning && (
                <div className="mt-2 rounded-[8px] bg-[#fdecec] p-2 text-[10px] leading-4 text-[#c0362c]">
                  ⚠ {unit.warning}
                </div>
              )}

              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                <div className="rounded-[8px] border border-[#eef1f8] bg-[#f8faff] p-2">
                  <div className="text-[9px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
                    {unit.status === "renew" ? "Kích thước khoang" : "Kích thước chuẩn"}
                  </div>
                  <div className="font-semibold text-[#0b1c30]">{unit.size}</div>
                  <div className="text-[9px] text-[#8996a9]">{unit.sizeNote}</div>
                </div>
                <div className="rounded-[8px] border border-[#eef1f8] bg-[#f8faff] p-2">
                  <div className="text-[9px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
                    {unit.status === "renew" ? "Tiếp cận kho" : "Kiểm soát vi khí hậu"}
                  </div>
                  <div className="font-semibold text-[#0b1c30]">{unit.climate}</div>
                </div>
              </div>

              {unit.contractLabel && (
                <div className="mt-3 flex items-center justify-between text-[11px]">
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">{unit.contractLabel}</div>
                    <div className="font-semibold text-[#0b1c30]">{unit.contractDate}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-[#0e7b4c]">{unit.contractLeft}</div>
                    <div className="text-[9px] text-[#8996a9]">{unit.payment}</div>
                  </div>
                </div>
              )}

              {unit.autoPay !== undefined && (
                <label className="mt-3 flex items-center justify-between text-[11px] text-[#3a475a]">
                  Bật Auto-Pay hàng tháng
                  <input type="checkbox" defaultChecked={unit.autoPay} className="h-4 w-4 accent-[#1d5fe5]" />
                </label>
              )}

              <button
                className={`mt-3 w-full rounded-[10px] py-2.5 text-[12px] font-bold ${
                  unit.status === "renew" ? "bg-[#1d5fe5] text-white hover:bg-[#174fc7]" : "bg-[#0b1c30] text-white hover:bg-[#132741]"
                }`}
              >
                {unit.primaryAction}
              </button>

              <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-[#1d5fe5]">
                <button className="hover:underline">{unit.footerLinks[0]}</button>
                <button className="hover:underline">{unit.footerLinks[1]}</button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
            <div className="flex items-center justify-between">
              <div className="text-[15px] font-bold text-[#0b1c30]">Gửi yêu cầu hỗ trợ mới</div>
              <span className="rounded-full bg-[#eef4ff] px-2.5 py-1 text-[10px] font-bold text-[#1d5fe5]">24/7 SLA</span>
            </div>
            <p className="mt-1 text-[11px] text-[#8996a9]">Kỹ thuật viên cơ sở sẽ tiếp nhận và xử lý trong 15-30 phút</p>

            <form className="mt-4 space-y-3" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-[#0f172a]">Khoang lưu trữ gặp sự cố *</label>
                <select className="w-full rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] px-3 py-2.5 text-[12px] outline-none focus:border-[#3b82f6]">
                  <option>Khoang #A-102 (Tầng 1 - 5' x 10')</option>
                  <option>Khoang #B-204 (Tầng 2 - 10' x 15')</option>
                  <option>Khoang #D-118 (Garage - 10' x 20')</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-[#0f172a]">Loại sự cố / Nhu cầu hỗ trợ *</label>
                <select className="w-full rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] px-3 py-2.5 text-[12px] outline-none focus:border-[#3b82f6]">
                  <option>Lỗi mã truy cập / Bàn phím số điện tử không nhận</option>
                  <option>Cửa cuốn/Cửa kho bị kẹt hoặc phát tiếng lạ</option>
                  <option>Yêu cầu hóa đơn / Chứng từ thanh toán</option>
                  <option>Khác</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-[#0f172a]">Mức độ ưu tiên</label>
                <div className="flex gap-3 text-[11px]">
                  <label className="flex flex-1 items-center gap-2 rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] p-2.5">
                    <input type="radio" name="priority" checked={priority === "normal"} onChange={() => setPriority("normal")} className="h-3.5 w-3.5 accent-[#1d5fe5]" />
                    <span>
                      <span className="block font-semibold text-[#0b1c30]">Bình thường</span>
                      <span className="block text-[10px] text-[#8996a9]">Xử lý trong 4 giờ</span>
                    </span>
                  </label>
                  <label className="flex flex-1 items-center gap-2 rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] p-2.5">
                    <input type="radio" name="priority" checked={priority === "urgent"} onChange={() => setPriority("urgent")} className="h-3.5 w-3.5 accent-[#c0362c]" />
                    <span>
                      <span className="block font-semibold text-[#c0362c]">Khẩn cấp (Ưu tiên)</span>
                      <span className="block text-[10px] text-[#8996a9]">Xử lý trong 15 phút</span>
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-[#0f172a]">Mô tả tình huống chi tiết</label>
                <textarea
                  rows={3}
                  placeholder="Mô tả sự cố, hiện tượng gặp phải và thời điểm phát hiện..."
                  className="w-full rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] px-3 py-2.5 text-[12px] outline-none focus:border-[#3b82f6]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-[#0f172a]">Đính kèm ảnh / video hiện trường</label>
                <div className="flex flex-col items-center justify-center rounded-[10px] border border-dashed border-[#c7d1e6] bg-[#f8faff] p-4 text-center">
                  <span className="material-symbols-outlined text-[24px] text-[#1d5fe5]">cloud_upload</span>
                  <div className="mt-1 text-[11px] font-semibold text-[#3a475a]">Kéo thả ảnh hoặc nhấn để tải lên</div>
                  <div className="text-[10px] text-[#8996a9]">Hỗ trợ JPG, PNG hoặc video MP4 tối đa 15MB</div>
                </div>
                <div className="mt-2 flex items-center justify-between rounded-[8px] border border-[#eef1f8] bg-white px-3 py-2 text-[11px]">
                  <span className="text-[#3a475a]">ban_phim_kho_a102_error.jpg • 2.4 MB</span>
                  <button className="material-symbols-outlined text-[16px] text-[#8996a9]">close</button>
                </div>
              </div>

              <label className="flex items-start gap-2 text-[11px] text-[#3a475a]">
                <input type="checkbox" checked={allowMasterKey} onChange={() => setAllowMasterKey((v) => !v)} className="mt-0.5 h-4 w-4 accent-[#1d5fe5]" />
                Cho phép kỹ thuật viên dùng chìa Master mở kho kiểm tra khi vắng mặt (có camera giám sát).
              </label>

              <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#1d5fe5] py-3 text-[13px] font-bold text-white shadow-[0_14px_24px_rgba(29,95,229,0.25)] hover:bg-[#174fc7]">
                <span className="material-symbols-outlined text-[16px]">send</span>
                Gửi yêu cầu hỗ trợ ngay
              </button>
            </form>
          </div>

          <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-[15px] font-bold text-[#0b1c30]">Lịch sử &amp; Tiến độ xử lý sự cố</div>
                <p className="text-[11px] text-[#8996a9]">Theo dõi chi tiết thời gian thực yêu cầu đã gửi</p>
              </div>
            </div>

            <div className="mt-3 inline-flex flex-wrap rounded-[10px] bg-[#eef4ff] p-1">
              {ticketTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTicketTab(tab.id)}
                  className={`rounded-[8px] px-2.5 py-1.5 text-[11px] font-semibold transition ${
                    activeTicketTab === tab.id ? "bg-[#0b1c30] text-white shadow-sm" : "text-[#58657a]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="mt-3 space-y-3">
              {filteredTickets.map((ticket) => (
                <div key={ticket.id} className="rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-[#1d5fe5]">{ticket.id}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        ticket.status === "pending"
                          ? "bg-[#eef4ff] text-[#1d5fe5]"
                          : ticket.status === "assigned"
                          ? "bg-[#0b1c30] text-white"
                          : "bg-[#e7f8ee] text-[#0e7b4c]"
                      }`}
                    >
                      {ticket.statusLabel}
                    </span>
                  </div>
                  <div className="mt-1 text-[13px] font-semibold text-[#0b1c30]">{ticket.title}</div>
                  <div className="mt-1 flex flex-wrap gap-x-3 text-[10px] text-[#8996a9]">
                    <span>{ticket.unit}</span>
                    <span>{ticket.time}</span>
                  </div>

                  {ticket.quote && (
                    <p className="mt-2 rounded-[8px] bg-white p-2 text-[11px] italic leading-5 text-[#58657a]">"{ticket.quote}"</p>
                  )}

                  {ticket.tech && (
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-[8px] bg-white p-2">
                      <div>
                        <div className="text-[11px] font-semibold text-[#0b1c30]">{ticket.tech}</div>
                        <div className="text-[10px] text-[#8996a9]">{ticket.techNote}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="flex items-center gap-1 rounded-md border border-[#dfe7f5] px-2 py-1 text-[10px] font-semibold text-[#3a475a]">
                          <span className="material-symbols-outlined text-[12px]">call</span>
                          Gọi kỹ thuật
                        </button>
                        <button className="flex items-center gap-1 rounded-md bg-[#1d5fe5] px-2 py-1 text-[10px] font-semibold text-white">
                          <span className="material-symbols-outlined text-[12px]">chat</span>
                          Nhắn tin
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#8996a9]">
                    <span>{ticket.footer}</span>
                    {ticket.eta && <span className="font-semibold text-[#0e7b4c]">{ticket.eta}</span>}
                  </div>

                  {ticket.rating && (
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-0.5 text-[#f4b740]">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <span key={idx} className="material-symbols-outlined text-[14px]">star</span>
                        ))}
                      </div>
                      <button className="text-[11px] font-semibold text-[#1d5fe5] hover:underline">{ticket.action}</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[14px] border border-[#dfe7f5] bg-[#eef4ff] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#1d5fe5]">
                <span className="material-symbols-outlined text-[18px]">verified</span>
              </span>
              <div>
                <div className="text-[13px] font-bold text-[#0b1c30]">Cam kết Chất lượng Dịch vụ (SLA) VaultSpace</div>
                <div className="text-[11px] text-[#4d5d76]">
                  Sự cố khóa điện tử, thẻ từ và xe ra vào được hỗ trợ trực tiếp tại cơ sở trong ≤ 15 phút.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1 rounded-[10px] border border-[#dfe7f5] bg-white px-3 py-2 text-[11px] font-semibold text-[#3a475a]">
                <span className="material-symbols-outlined text-[14px]">chat</span>
                Chat với Quản lý cơ sở
              </button>
              <button className="flex items-center gap-1 rounded-[10px] bg-[#0b1c30] px-3 py-2 text-[11px] font-bold text-white">
                <span className="material-symbols-outlined text-[14px]">call</span>
                Gọi 1800-555-VAULT
              </button>
            </div>
          </div>
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
        tagline="Hệ thống lưu trữ cá nhân & doanh nghiệp thế hệ mới. Hạ tầng kiên cố, ra vào không tiếp xúc."
        columns={[
          {
            title: "Cổng khách hàng",
            items: ["Kho của tôi", "Mã PIN & Chìa khóa công nghệ", "Thanh toán tự động & Hóa đơn", "Trạng thái khóa điện tử", "Ủy quyền người truy cập"],
          },
          {
            title: "Cơ sở & Kích thước",
            items: ["Hướng dẫn chọn kích thước kho", "Tiêu chuẩn điều khiển vi khí hậu", "Khu vực xe tải vào/rời", "Đặt lịch sử dụng cầu nâng/bãi đỗ", "Gói bảo hiểm & Khiếu nại"],
          },
          {
            title: "Hỗ trợ & Tin cậy",
            items: ["Trò chuyện trực tuyến 24/7", "Cửa hàng vật tư đóng gói", "Chính sách an ninh & bảo mật", "Điều khoản hợp đồng thuê kho", "Quy định sử dụng camera"],
          },
        ]}
        bottomText="© 2025 VaultSpace Logistics Technologies, Inc. Bảo lưu mọi quyền. Đơn vị cung cấp kho lưu trữ chuyên nghiệp."
        bottomLinks={[{ label: "Điều khoản dịch vụ" }, { label: "Quy trình an ninh" }, { label: "Quy chuẩn truy cập" }]}
        statusText="Trạng thái: Hoạt động tốt"
      />
    </div>
  );
}

export default Support;
