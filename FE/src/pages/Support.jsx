import { useSupport } from "../hooks/useSupport";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageBackground from "../components/PageBackground";

function Support() {
  const {
    unitTabs,
    ticketTabs,
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
    facilityName,
    activeRentals,
  } = useSupport();

  const rentalCount = activeRentals.length > 0 ? activeRentals.length : filteredUnits.length;
  const primaryUnitCode = activeRentals[0]?.unitCode || filteredUnits[0]?.id || "A-101";

  return (
    <div className="relative flex min-h-screen flex-col text-[#0b1c30]">
      <PageBackground />
      <Header active="support" />

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 lg:px-6">
        <div className="rounded-[16px] bg-[#0b1c30] p-6 text-white">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.06em] text-[#8f9cbd]">
                <span className="material-symbols-outlined text-[14px]">location_on</span>
                Cơ sở {facilityName}
                <span className="ml-2 text-[#c7d1e6]">Cập nhật: Hôm nay</span>
              </div>
              <h1 className="mt-1 text-[22px] sm:text-[24px] font-bold tracking-[-0.02em]">Trung tâm Hỗ trợ Kỹ thuật</h1>
              <p className="mt-1 text-[13px] text-[#c7d1e6]">
                Xử lý yêu cầu sửa chữa và tiếp nhận hỗ trợ kỹ thuật 24/7.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 rounded-[10px] bg-[#1d5fe5] px-3.5 py-2 text-[12px] font-bold text-white hover:bg-[#174fc7]">
                <span className="material-symbols-outlined text-[16px]">build</span>
                Yêu cầu sửa chữa
              </button>
              <button className="flex items-center gap-1.5 rounded-[10px] border border-white/20 bg-white/10 px-3.5 py-2 text-[12px] font-bold text-white">
                <span className="material-symbols-outlined text-[16px]">call</span>
                1800-555
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="rounded-[12px] border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.06em] text-[#8f9cbd]">
                Kho quản lý
                <span className="material-symbols-outlined text-[14px]">inventory_2</span>
              </div>
              <div className="mt-1 text-[16px] font-bold">{rentalCount} Kho thuê</div>
              <div className="text-[10px] text-[#8f9cbd]">{rentalCount} kho hoạt động tốt</div>
            </div>

            <div className="rounded-[12px] border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.06em] text-[#8f9cbd]">
                Kho chính
                <span className="material-symbols-outlined text-[14px]">schedule</span>
              </div>
              <div className="mt-1 text-[16px] font-bold">Kho #{primaryUnitCode}</div>
              <div className="text-[10px] text-[#7fd8b1]">✓ Trạng thái an toàn</div>
            </div>

            <div className="rounded-[12px] border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.06em] text-[#8f9cbd]">
                Đang xử lý
                <span className="material-symbols-outlined text-[14px]">support_agent</span>
              </div>
              <div className="mt-1 text-[16px] font-bold">2 Yêu cầu</div>
              <div className="text-[10px] text-[#8f9cbd]">1 chờ • 1 đang xử lý</div>
            </div>

            <div className="rounded-[12px] border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.06em] text-[#8f9cbd]">
                Trực ban
                <span className="material-symbols-outlined text-[14px]">emergency</span>
              </div>
              <div className="mt-1 text-[16px] font-bold">SLA ≤ 15 phút</div>
              <div className="text-[10px] text-[#8f9cbd]">Trực tiếp 24/7</div>
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
                  {filteredUnits.map((u) => (
                    <option key={u.id} value={u.id}>
                      Khoang #{u.id} ({u.size})
                    </option>
                  ))}
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
      </main>

      <Footer />
    </div>
  );
}

export default Support;
