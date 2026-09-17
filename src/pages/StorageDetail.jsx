import { Link } from "react-router-dom";
import { useStorageDetail } from "../hooks/useStorageDetail";
import Header from "../components/Header";

function StorageDetail() {
  const {
    moveInOptions,
    timeSlots,
    protectionPlans,
    moveInOption,
    setMoveInOption,
    timeSlot,
    setTimeSlot,
    protectionPlan,
    setProtectionPlan,
    addons,
    toggleAddon,
    agreeTerms,
    setAgreeTerms,
    agreeLock,
    setAgreeLock,
    protectionPrice,
    totalToday,
    monthlyRent,
    canSubmit,
    pricing,
  } = useStorageDetail();

  return (
    <div className="min-h-screen bg-[#f5f7fd] text-[#0b1c30]">
      <Header active="rent" subtitle="Secure Self Storage" />

      <div className="border-b border-[#dfe7f5] bg-[#eef4ff]">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-2 px-4 py-2 text-[11px] font-semibold text-[#3a475a] lg:px-6">
          <span>Cổng thông tin VaultSpace / Vận hành cơ sở & Tổng quan khách hàng</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-[#0e7b4c]">
              <span className="h-2 w-2 rounded-full bg-[#2dd4a0]" />
              Giám sát cổng an ninh 24/7 đang hoạt động
            </span>
            <span className="flex items-center gap-1 text-[#0e7b4c]">
              <span className="h-2 w-2 rounded-full bg-[#2dd4a0]" />
              Khóa siêu an toàn đang hoạt động
            </span>
          </div>
        </div>
      </div>

      <div className="border-b border-[#e6ebf5] bg-white">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#eef4ff] text-[#1d5fe5]">
              <span className="material-symbols-outlined text-[18px]">domain</span>
            </span>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">
                Cơ sở chính Trung tâm • 420 E Cesar Chavez St, Austin, TX
              </div>
              <div className="text-[14px] font-bold text-[#0b1c30]">Dãy kho Khối B • Lối vào tầng trệt</div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[12px] font-semibold text-[#3a475a]">
            <span className="text-[#0e7b4c]">98.4% Công suất hoạt động</span>
            <button className="flex items-center gap-1 text-[#1d5fe5] hover:underline">
              Xem sơ đồ cơ sở
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1280px] px-4 py-6 lg:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[12px] font-semibold text-[#58657a]">
            <Link to="/home" className="hover:underline">Trung tâm Austin</Link> / Kho số #B-204 / Quy trình đặt chỗ trực tiếp
          </div>
          <div className="flex items-center gap-2 rounded-full bg-[#fff1e6] px-3 py-1.5 text-[12px] font-bold text-[#b45309]">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            Đang giữ chỗ trong 14:59
            <button className="material-symbols-outlined text-[16px] text-[#b45309]">close</button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                <span className="rounded-full bg-[#0e7b4c] px-2.5 py-1 text-white">Có thể chuyển đồ vào ngay</span>
                <span className="rounded-full border border-[#dfe7f5] px-2.5 py-1 text-[#3a475a]">Tầng trệt • Xe đẩy vào thuận tiện</span>
                <span className="rounded-full border border-[#dfe7f5] px-2.5 py-1 text-[#3a475a]">Vào không cần chìa khóa vật lý</span>
              </div>

              <h1 className="mt-3 text-[24px] font-bold leading-snug tracking-[-0.02em] text-[#0b1c30]">
                Kho lưu trữ cao cấp 5' x 10' (Khoảng 4.6 m² / 50 sq ft)
              </h1>
              <p className="mt-2 text-[13px] leading-6 text-[#58657a]">
                Tương đương phòng thay đồ cỡ vừa, đủ chứa đồ studio, 1 phòng ngủ và hơn 20 thùng.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-3">
                  <span className="material-symbols-outlined text-[18px] text-[#1d5fe5]">straighten</span>
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">Kích thước</div>
                  <div className="text-[13px] font-bold text-[#0b1c30]">5' R x 10' D x 9' C</div>
                  <div className="text-[11px] text-[#8996a9]">Thể tích ~12.7 m³</div>
                </div>
                <div className="rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-3">
                  <span className="material-symbols-outlined text-[18px] text-[#1d5fe5]">device_thermostat</span>
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">Nhiệt độ & Độ ẩm</div>
                  <div className="text-[13px] font-bold text-[#0b1c30]">68°F – 72°F (20°C-22°C)</div>
                  <div className="text-[11px] text-[#8996a9]">Kiểm soát độ ẩm tự động</div>
                </div>
                <div className="rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-3">
                  <span className="material-symbols-outlined text-[18px] text-[#1d5fe5]">lock</span>
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">An ninh</div>
                  <div className="text-[13px] font-bold text-[#0b1c30]">Khóa chốt điện tử</div>
                  <div className="text-[11px] text-[#8996a9]">Cảm biến chuyển động PIR</div>
                </div>
                <div className="rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-3">
                  <span className="material-symbols-outlined text-[18px] text-[#1d5fe5]">door_open</span>
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">Lối vào</div>
                  <div className="text-[13px] font-bold text-[#0b1c30]">24/7 Không giới hạn</div>
                  <div className="text-[11px] text-[#8996a9]">Cổng & cửa không chạm</div>
                </div>
              </div>

              <div className="mt-5 border-t border-[#eef1f8] pt-5">
                <div className="text-[13px] font-bold text-[#0b1c30]">Mô phỏng sức chứa không gian</div>
                <p className="mt-1 text-[12px] text-[#8996a9]">Bố trí tối ưu với chiều cao trần 2.7m (9ft).</p>

                <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-4">
                    <div className="mb-2 flex items-center justify-between text-[10px] font-semibold text-[#8996a9]">
                      <span>Chiều sâu 10' (~3m)</span>
                      <span>Chiều rộng 5' (~1.5m)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-[8px] bg-[#dbe7ff] p-2 text-center text-[11px] font-semibold text-[#1d5fe5]">Đệm Queen</div>
                      <div className="rounded-[8px] bg-[#dcf3e6] p-2 text-center text-[11px] font-semibold text-[#0e7b4c]">Ghế Sofa</div>
                      <div className="rounded-[8px] bg-[#fdeacb] p-2 text-center text-[11px] font-semibold text-[#b45309]">Tủ 4 ngăn</div>
                      <div className="rounded-[8px] bg-[#e6e6f7] p-2 text-center text-[11px] font-semibold text-[#4338ca]">20 Thùng</div>
                    </div>
                  </div>

                  <div className="relative overflow-hidden rounded-[12px] border border-[#eef1f8]">
                    <div
                      className="h-full min-h-[160px] w-full bg-cover bg-center"
                      style={{
                        backgroundImage:
                          "linear-gradient(180deg, rgba(15,30,45,0.05), rgba(15,30,45,0.35)), url('https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80')",
                      }}
                    />
                    <div className="absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-1 text-[11px] font-semibold text-[#0b1c30]">
                      Lối đi 2 – Kho 204
                      <div className="text-[10px] font-normal text-[#58657a]">Góc nhìn hành lang thực tế</div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-[#3a475a]">
                  {["Khung giường Queen", "Sofa 3 chỗ", "Tủ 4 ngăn", "Bàn & Ghế công thái học", "Xe đạp địa hình"].map((item) => (
                    <span key={item} className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-[#0e7b4c]">check_circle</span>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[14px] font-bold text-[#0b1c30]">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1d5fe5] text-[12px] text-white">1</span>
                  Chọn ngày bắt đầu chuyển đồ vào
                </div>
                <span className="text-[11px] font-semibold text-[#1d5fe5] hover:underline">Chu kỳ thanh toán tính từ ngày chuyển vào</span>
              </div>

              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {moveInOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setMoveInOption(opt.id)}
                    className={`rounded-[10px] border px-3 py-2.5 text-[12px] font-semibold transition ${
                      moveInOption === opt.id
                        ? "border-[#1d5fe5] bg-[#eef4ff] text-[#1d5fe5]"
                        : "border-[#dfe7f5] bg-white text-[#3a475a]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between rounded-[10px] bg-[#f8faff] p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-col items-center justify-center rounded-[8px] bg-[#0b1c30] text-white">
                    <span className="text-[9px] leading-none">THÁNG</span>
                    <span className="text-[13px] font-bold leading-none">01</span>
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-[#0b1c30]">Bắt đầu sử dụng kho: Thứ 6, 01/11/2025</div>
                    <div className="text-[11px] text-[#8996a9]">Hợp đồng thuê 30 ngày kích hoạt từ 06:00 sáng</div>
                  </div>
                </div>
                <button className="text-[12px] font-semibold text-[#1d5fe5] hover:underline">Thay đổi</button>
              </div>
            </div>

            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[14px] font-bold text-[#0b1c30]">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1d5fe5] text-[12px] text-white">2</span>
                  Khung giờ đến nhận kho lần đầu
                </div>
                <span className="text-[11px] text-[#8996a9]">Có nhân viên hướng dẫn hoặc Tự vào</span>
              </div>

              <div className="space-y-2">
                {timeSlots.map((slot) => (
                  <label
                    key={slot.id}
                    className={`flex cursor-pointer items-center justify-between rounded-[10px] border px-3 py-2.5 text-[13px] transition ${
                      timeSlot === slot.id ? "border-[#1d5fe5] bg-[#eef4ff]" : "border-[#dfe7f5] bg-white"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="timeSlot"
                        checked={timeSlot === slot.id}
                        onChange={() => setTimeSlot(slot.id)}
                        className="h-4 w-4 accent-[#1d5fe5]"
                      />
                      <span className="font-semibold text-[#0b1c30]">{slot.label}</span>
                    </span>
                    {slot.highlight ? (
                      <span className="rounded-full bg-[#1d5fe5] px-2 py-0.5 text-[10px] font-bold text-white">{slot.note}</span>
                    ) : (
                      <span className="text-[11px] text-[#8996a9]">{slot.note}</span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[14px] font-bold text-[#0b1c30]">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1d5fe5] text-[12px] text-white">3</span>
                  Gói bảo vệ tài sản & bảo hiểm cho khách thuê
                </div>
                <span className="text-[11px] text-[#8996a9]">Quy định bảo vệ tài sản bắt buộc cho cơ sở</span>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {protectionPlans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setProtectionPlan(plan.id)}
                    className={`rounded-[12px] border p-3.5 text-left transition ${
                      protectionPlan === plan.id ? "border-[#1d5fe5] bg-[#eef4ff]" : "border-[#dfe7f5] bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-[#0b1c30] px-2 py-0.5 text-[9px] font-bold uppercase text-white">{plan.badge}</span>
                      {protectionPlan === plan.id && (
                        <span className="material-symbols-outlined text-[18px] text-[#1d5fe5]">check_circle</span>
                      )}
                    </div>
                    <div className="mt-2 text-[13px] font-bold text-[#0b1c30]">{plan.name}</div>
                    <p className="mt-1 text-[11px] leading-5 text-[#58657a]">{plan.text}</p>
                    <div className="mt-2 text-[14px] font-bold text-[#0b1c30]">
                      ${plan.price.toFixed(2)}
                      <span className="text-[11px] font-normal text-[#8996a9]"> /tháng</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[14px] font-bold text-[#0b1c30]">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1d5fe5] text-[12px] text-white">4</span>
                  Đồ dùng dọn kho đã chuẩn bị sẵn bên trong
                </div>
                <span className="text-[11px] text-[#8996a9]">Miễn phí giao sẵn vào kho</span>
              </div>

              <div className="space-y-2">
                <label className="flex items-center justify-between rounded-[10px] border border-[#dfe7f5] bg-white px-3 py-2.5">
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={addons.lockKit}
                      onChange={() => toggleAddon("lockKit")}
                      className="h-4 w-4 accent-[#1d5fe5]"
                    />
                    <span>
                      <span className="block text-[13px] font-semibold text-[#0b1c30]">Bộ khóa đĩa hình trụ chịu lực cao</span>
                      <span className="block text-[11px] text-[#8996a9]">Khóa inox chống cạy phá, đặt sẵn khi bạn nhận kho.</span>
                    </span>
                  </span>
                  <span className="text-right text-[12px] font-bold">
                    <span className="mr-1 text-[#c2c9d6] line-through">$18.00</span>
                    <span className="text-[#0e7b4c]">MIỄN PHÍ (Ưu đãi chuyển vào)</span>
                  </span>
                </label>

                <label className="flex items-center justify-between rounded-[10px] border border-[#dfe7f5] bg-white px-3 py-2.5">
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={addons.blankets}
                      onChange={() => toggleAddon("blankets")}
                      className="h-4 w-4 accent-[#1d5fe5]"
                    />
                    <span>
                      <span className="block text-[13px] font-semibold text-[#0b1c30]">Chăn bọc đồ nội thất dày &amp; Dây chằng tăng đồ (Bộ 2 cái)</span>
                      <span className="block text-[11px] text-[#8996a9]">Bảo vệ đồ gỗ, đồ dễ trầy trong quá trình vận chuyển.</span>
                    </span>
                  </span>
                  <span className="text-[13px] font-bold text-[#0b1c30]">+$15.00</span>
                </label>

                <label className="flex items-center justify-between rounded-[10px] border border-[#dfe7f5] bg-white px-3 py-2.5">
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={addons.boxKit}
                      onChange={() => toggleAddon("boxKit")}
                      className="h-4 w-4 accent-[#1d5fe5]"
                    />
                    <span>
                      <span className="block text-[13px] font-semibold text-[#0b1c30]">Bộ 10 thùng carton chịu lực xếp chồng + Băng dính đóng gói</span>
                      <span className="block text-[11px] text-[#8996a9]">5 thùng vừa, 5 thùng lớn, carton 2 lớp chịu lực.</span>
                    </span>
                  </span>
                  <span className="text-[13px] font-bold text-[#0b1c30]">+$28.00</span>
                </label>
              </div>
            </div>
          </div>

          <aside className="h-fit rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.04)] lg:sticky lg:top-4">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">
              Bảng kê đặt chỗ
              <span className="rounded-full bg-[#0b1c30] px-2 py-1 text-[10px] text-white">Khóa giữ mức giá</span>
            </div>

            <div className="mt-2 text-[15px] font-bold text-[#0b1c30]">Chi tiết biểu phí thanh toán</div>
            <p className="mt-1 text-[11px] text-[#8996a9]">Chi phí minh bạch, không phụ phí phát sinh.</p>

            <div className="mt-4 space-y-2.5 text-[12px]">
              <div className="flex items-center justify-between">
                <span className="text-[#3a475a]">Giá thuê kho chuẩn (5' x 10')</span>
                <span className="font-semibold text-[#0b1c30]">${pricing.baseRent.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-[#0e7b4c]">
                  <span className="material-symbols-outlined text-[14px]">sell</span>
                  Khuyến mại 50% tháng đầu
                </span>
                <span className="font-semibold text-[#0e7b4c]">-${pricing.firstMonthDiscount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-[#3a475a]">
                  Tiền cọc bảo đảm
                  <span className="material-symbols-outlined text-[13px] text-[#8996a9]">info</span>
                </span>
                <span className="text-right font-semibold text-[#0b1c30]">
                  ${pricing.deposit.toFixed(2)}
                  <span className="block text-[10px] font-normal text-[#0e7b4c]">Hoàn trả 100%</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#3a475a]">Kích hoạt khóa thông minh một lần</span>
                <span className="font-semibold text-[#0b1c30]">${pricing.smartLockActivation.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#3a475a]">Gói bảo vệ đồ đạc (Mức {protectionPlan === "premium" ? "$5,000" : protectionPlan === "own" ? "tự có" : "$2,000"})</span>
                <span className="font-semibold text-[#0b1c30]">${protectionPrice.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#3a475a]">Gói khóa trụ bảo mật</span>
                <span className="font-semibold text-[#0b1c30]">$0.00</span>
              </div>
              {addons.blankets && (
                <div className="flex items-center justify-between">
                  <span className="text-[#3a475a]">Chăn bọc đồ nội thất & Dây chằng</span>
                  <span className="font-semibold text-[#0b1c30]">$15.00</span>
                </div>
              )}
              {addons.boxKit && (
                <div className="flex items-center justify-between">
                  <span className="text-[#3a475a]">Bộ thùng carton đóng gói</span>
                  <span className="font-semibold text-[#0b1c30]">$28.00</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-[#eef1f8] pt-3">
              <span className="text-[14px] font-bold text-[#0b1c30]">Tổng thanh toán hôm nay</span>
              <span className="text-[20px] font-bold text-[#0b1c30]">${totalToday.toFixed(2)}</span>
            </div>

            <div className="mt-3 rounded-[10px] bg-[#f8faff] p-3 text-[11px] text-[#58657a]">
              <div className="flex items-center justify-between text-[12px] font-semibold text-[#0b1c30]">
                Tiền thuê hàng tháng tiếp theo
                <span>${monthlyRent.toFixed(2)}/tháng</span>
              </div>
              <div className="mt-1">
                Từ 01/12/2025. Hủy bất kỳ lúc nào, không phạt phí.
              </div>
            </div>

            <div className="mt-3 space-y-1.5 text-[11px] text-[#58657a]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-[#0e7b4c]">lock</span>
                Thanh toán mã hóa chuẩn ngân hàng 256-bit
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-[#0e7b4c]">event_available</span>
                Hủy miễn phí trước giờ nhận kho 24h
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-[#0e7b4c]">verified</span>
                Cam kết giữ giá cố định trong 12 tháng
              </div>
            </div>

            <div className="mt-4 space-y-2 text-[11px] text-[#58657a]">
              <label className="flex items-start gap-2">
                <input type="checkbox" checked={agreeTerms} onChange={() => setAgreeTerms((v) => !v)} className="mt-0.5 h-3.5 w-3.5 accent-[#1d5fe5]" />
                <span>
                  Tôi đồng ý với <span className="font-semibold text-[#1d5fe5]">Thỏa thuận Thuê kho theo tháng</span> của VaultSpace. Có thể hủy bất kỳ lúc nào, báo trước 10 ngày.
                </span>
              </label>
              <label className="flex items-start gap-2">
                <input type="checkbox" checked={agreeLock} onChange={() => setAgreeLock((v) => !v)} className="mt-0.5 h-3.5 w-3.5 accent-[#1d5fe5]" />
                <span>
                  Tôi xác nhận mở khóa số qua ứng dụng VaultSpace hoặc mã PIN 6 số được cấp sau khi đặt chỗ.
                </span>
              </label>
            </div>

            <button
              disabled={!canSubmit}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#1d5fe5] py-3.5 text-[14px] font-bold text-white shadow-[0_14px_24px_rgba(29,95,229,0.25)] transition hover:bg-[#174fc7] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">lock</span>
              Tiến hành Thanh toán &amp; Đặt cọc
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>

            <div className="mt-2 text-center text-[11px] text-[#8996a9]">Giữ chỗ kho trong 48 giờ (Miễn phí $0)</div>
            <div className="mt-3 text-center text-[11px] text-[#8996a9]">
              Cần hỗ trợ? Gọi Quản lý Cơ sở: <span className="font-semibold text-[#1d5fe5]">(512) 555-8290</span>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default StorageDetail;
