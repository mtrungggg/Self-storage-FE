import { useAccessControl } from "../hooks/useAccessControl";
import Header from "../components/Header";
import Footer from "../components/Footer";

function AccessControl() {
  const {
    wallets,
    guestPins,
    accessLogs,
    trustBadges,
    activeUnit,
    setActiveUnit,
    showPin,
    setShowPin,
    unlocking,
    handleUnlock,
    alerts,
    toggleAlert,
  } = useAccessControl();

  return (
    <div className="min-h-screen bg-[#f5f7fd] text-[#0b1c30]">
      <Header active="access" showUserBadge />

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
              Hotline khẩn cấp: 1900 8899
            </span>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1280px] px-4 py-6 lg:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-bold tracking-[-0.02em] text-[#0b1c30]">Mã PIN &amp; Khóa điện tử</h1>
            <p className="mt-2 max-w-[640px] text-[13px] leading-6 text-[#58657a]">
              Kiểm soát truy cập không chạm, tạo mã PIN dùng một lần cho người thân/đơn vị vận chuyển và đồng bộ khóa BLE với điện thoại.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 rounded-[10px] border border-[#dfe7f5] bg-white px-4 py-2.5 text-[12px] font-semibold text-[#3a475a]">
              <span className="material-symbols-outlined text-[16px]">sync_alt</span>
              Đổi mã PIN chính
            </button>
            <button className="flex items-center gap-2 rounded-[10px] bg-[#1d5fe5] px-4 py-2.5 text-[12px] font-bold text-white shadow-[0_10px_20px_rgba(29,95,229,0.25)] hover:bg-[#174fc7]">
              <span className="material-symbols-outlined text-[16px]">add</span>
              Cấp mã PIN tạm thời
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-[#dfe7f5] bg-white p-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveUnit("main")}
              className={`rounded-[10px] px-3.5 py-2.5 text-left text-[12px] font-semibold transition ${
                activeUnit === "main" ? "bg-[#0b1c30] text-white" : "border border-[#dfe7f5] text-[#3a475a]"
              }`}
            >
              <div>Kho chính #B-204</div>
              <div className={`text-[10px] font-normal ${activeUnit === "main" ? "text-[#c7d1e6]" : "text-[#8996a9]"}`}>Kho lạnh cao cấp 5' x 10'</div>
            </button>

            <button
              onClick={() => setActiveUnit("garage")}
              className={`rounded-[10px] px-3.5 py-2.5 text-left text-[12px] font-semibold transition ${
                activeUnit === "garage" ? "bg-[#0b1c30] text-white" : "border border-[#dfe7f5] text-[#3a475a]"
              }`}
            >
              <div>Kho phụ #D-118</div>
              <div className={`text-[10px] font-normal ${activeUnit === "garage" ? "text-[#c7d1e6]" : "text-[#8996a9]"}`}>Drive-up Garage • 10' x 20'</div>
            </button>
          </div>

          <div className="flex items-center gap-4 text-[12px] font-semibold text-[#3a475a]">
            <span>Chốt khóa Latch BLE Pro</span>
            <span className="flex items-center gap-1 rounded-full bg-[#e7f8ee] px-2.5 py-1 text-[#0e7b4c]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4a0]" />
              Đã khóa &amp; bảo vệ
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">battery_5_bar</span>
              94%
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">bluetooth</span>
              -48 dBm (Tốt)
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">social_distance</span>
              Cự ly ~3.2m
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-[15px] font-bold text-[#0b1c30]">Bàn phím điện tử &amp; Khóa điều khiển</div>
                <span className="rounded-full bg-[#eef4ff] px-2.5 py-1 text-[11px] font-bold text-[#1d5fe5]">Khoang B-204</span>
              </div>
              <p className="mt-1 text-[11px] text-[#8996a9]">Bộ điều khiển Latch Gen 4 • Băng tần bảo mật 128/256-bit</p>

              <div className="mt-4 rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">Mã PIN cá nhân mở kho chính</div>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 text-[20px] font-bold tracking-[0.25em] text-[#0b1c30]">
                    {showPin ? "4 9 2 #" : "• • • • 9 2 #"}
                    <button onClick={() => setShowPin((v) => !v)} className="material-symbols-outlined text-[18px] text-[#8996a9]">
                      {showPin ? "visibility_off" : "visibility"}
                    </button>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <button className="flex items-center gap-1 rounded-md border border-[#dfe7f5] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#3a475a]">
                      <span className="material-symbols-outlined text-[14px]">content_copy</span>
                      Sao chép PIN
                    </button>
                    <button className="flex items-center gap-1 rounded-md border border-[#dfe7f5] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#3a475a]">
                      <span className="material-symbols-outlined text-[14px]">autorenew</span>
                      Tạo lại mã an toàn
                    </button>
                  </div>
                </div>
                <div className="mt-2 text-[11px] text-[#8996a9]">Sử dụng trên bàn phím số gắn tại mặt của kho B-204.</div>
              </div>

              <div className="mt-4 rounded-[12px] bg-[#0b1c30] p-4 text-white">
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[#7fd8b1]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4a0]" />
                  Mở khóa không chạm (Hands-Free)
                </div>
                <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-[14px] font-bold">Mở chốt khóa kho tức thì</div>
                    <p className="mt-1 max-w-[380px] text-[11px] leading-5 text-[#c7d1e6]">
                      Ứng dụng tự động kết nối Bluetooth LE mã hóa AES-256 khi bạn đứng cách khóa dưới 5 mét.
                    </p>
                  </div>
                  <div className="text-right">
                    <button
                      onClick={handleUnlock}
                      className="flex items-center gap-2 rounded-[10px] bg-[#1d5fe5] px-4 py-2.5 text-[13px] font-bold text-white hover:bg-[#174fc7]"
                    >
                      <span className="material-symbols-outlined text-[16px]">{unlocking ? "lock_open" : "lock"}</span>
                      {unlocking ? "Đang mở..." : "Nhấn để mở chốt"}
                    </button>
                    <div className="mt-1 text-[10px] text-[#8f9cbd]">Độ trễ phản hồi ~0.8s</div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">Ví điện tử &amp; Thẻ thông hành NFC di động</div>
                <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
                  {wallets.map((wallet) => (
                    <div key={wallet.title} className="flex items-center gap-2 rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                      <span className="material-symbols-outlined text-[18px] text-[#1d5fe5]">{wallet.icon}</span>
                      <div>
                        <div className="text-[12px] font-semibold text-[#0b1c30]">{wallet.title}</div>
                        <div className={`text-[10px] ${wallet.active ? "text-[#0e7b4c]" : "text-[#8996a9]"}`}>{wallet.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-[15px] font-bold text-[#0b1c30]">Mã PIN chia sẻ &amp; Khách ủy quyền</div>
                  <p className="mt-1 max-w-[480px] text-[11px] text-[#8996a9]">
                    Cấp quyền tạm thời cho xe giao nhận, dịch vụ chuyển nhà hoặc đối tác mà không lộ mã PIN chính.
                  </p>
                </div>
                <button className="flex items-center gap-1 rounded-[10px] bg-[#1d5fe5] px-3.5 py-2 text-[12px] font-bold text-white hover:bg-[#174fc7]">
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Tạo mã mới
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {guestPins.map((guest) => (
                  <div key={guest.id} className={`rounded-[12px] border p-3.5 ${guest.status === "expired" ? "border-[#eef1f8] bg-[#f8faff] opacity-80" : "border-[#eef1f8] bg-white"}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-[#0b1c30]">{guest.name}</span>
                        <span className="rounded-full bg-[#eef4ff] px-2 py-0.5 text-[10px] font-semibold text-[#1d5fe5]">{guest.tag}</span>
                      </div>
                      {guest.status === "active" ? (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-[#0e7b4c]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4a0]" />
                          Hoạt động
                        </span>
                      ) : (
                        <span className="rounded-full bg-[#eef1f8] px-2 py-0.5 text-[10px] font-semibold text-[#8996a9]">Đã hết hạn</span>
                      )}
                    </div>
                    <div className="mt-1 text-[11px] text-[#8996a9]">{guest.schedule}</div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className={`text-[12px] font-semibold ${guest.status === "expired" ? "text-[#8996a9] line-through" : "text-[#0b1c30]"}`}>
                        {guest.status === "expired" ? "MÃ TỪNG CẤP" : "MÃ CẤP QUYỀN"}: {guest.code}
                      </span>
                      <button
                        className={`rounded-md px-3 py-1.5 text-[11px] font-bold ${
                          guest.action === "Hủy tức thì" ? "bg-[#fdecec] text-[#c0362c]" : "border border-[#dfe7f5] text-[#3a475a]"
                        }`}
                      >
                        {guest.action}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="flex items-center justify-between text-[13px] font-bold text-[#0b1c30]">
                Cổng cơ sở &amp; Cửa cuốn Hub #04
                <span className="rounded-full bg-[#eef4ff] px-2 py-0.5 text-[10px] font-semibold text-[#1d5fe5]">Trạm số #04</span>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#3a475a]">directions_car</span>
                  <div>
                    <div className="text-[12px] font-semibold text-[#0b1c30]">Barrier Xe Ra Vào (Cổng Nam)</div>
                    <div className="text-[10px] text-[#8996a9]">Mã số bấm cổng: #9410*</div>
                  </div>
                </div>
                <button className="rounded-md bg-[#1d5fe5] px-3 py-1.5 text-[11px] font-bold text-white">Mở Barrier</button>
              </div>

              <div className="mt-2 flex items-center justify-between rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#3a475a]">elevator</span>
                  <div>
                    <div className="text-[12px] font-semibold text-[#0b1c30]">Thang máy chở hàng Tầng 2</div>
                    <div className="text-[10px] text-[#8996a9]">Tự động phân tầng đến dãy kho B-204</div>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[16px] text-[#0e7b4c]">check_circle</span>
              </div>

              <p className="mt-3 text-[10px] leading-4 text-[#8996a9]">
                Cổng mở 24/7 cho thành viên. Vui lòng giữ khoảng cách 2 mét khi quét thẻ xe.
              </p>
            </div>

            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="flex items-center justify-between text-[13px] font-bold text-[#0b1c30]">
                Nhật ký mở khóa gần đây
                <span className="text-[10px] font-semibold text-[#8996a9]">Thời gian thực</span>
              </div>

              <div className="mt-3 space-y-3">
                {accessLogs.map((log) => (
                  <div key={log.title} className="flex gap-2.5">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: log.dot }} />
                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[12px] font-semibold text-[#0b1c30]">{log.title}</span>
                        <span className="shrink-0 text-[10px] text-[#8996a9]">{log.time}</span>
                      </div>
                      <div className="text-[11px] text-[#8996a9]">{log.note}</div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="mt-3 w-full rounded-[10px] border border-[#dfe7f5] py-2 text-[12px] font-semibold text-[#3a475a] hover:bg-[#f8faff]">
                Xem toàn bộ 90 ngày lịch sử
              </button>
            </div>

            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="text-[13px] font-bold text-[#0b1c30]">Quy tắc cảnh báo xâm nhập</div>

              <div className="mt-3 space-y-2.5">
                <label className="flex items-center justify-between gap-2 rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                  <div>
                    <div className="text-[12px] font-semibold text-[#0b1c30]">Cảnh báo mở cửa quá 15 phút</div>
                    <div className="text-[10px] text-[#8996a9]">Còi chuông tại khoang và thông báo đẩy điện thoại</div>
                  </div>
                  <input type="checkbox" checked={alerts.doorOpen} onChange={() => toggleAlert("doorOpen")} className="h-4 w-4 accent-[#1d5fe5]" />
                </label>

                <label className="flex items-center justify-between gap-2 rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                  <div>
                    <div className="text-[12px] font-semibold text-[#0b1c30]">Khóa bàn phím khi sai PIN 5 lần</div>
                    <div className="text-[10px] text-[#8996a9]">Khóa mã 30 phút và kích hoạt camera an ninh hành lang</div>
                  </div>
                  <input type="checkbox" checked={alerts.wrongPin} onChange={() => toggleAlert("wrongPin")} className="h-4 w-4 accent-[#1d5fe5]" />
                </label>

                <label className="flex items-center justify-between gap-2 rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                  <div>
                    <div className="text-[12px] font-semibold text-[#0b1c30]">Cảnh báo mở ngoài giờ (22h – 06h)</div>
                    <div className="text-[10px] text-[#8996a9]">Báo động trực tiếp về trung tâm bảo vệ VaultSpace</div>
                  </div>
                  <input type="checkbox" checked={alerts.afterHours} onChange={() => toggleAlert("afterHours")} className="h-4 w-4 accent-[#1d5fe5]" />
                </label>
              </div>
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

export default AccessControl;
