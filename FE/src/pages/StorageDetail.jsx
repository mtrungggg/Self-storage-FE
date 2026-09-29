import { Link } from "react-router-dom";
import { useStorageDetail } from "../hooks/useStorageDetail";
import Header from "../components/Header";
import Footer from "../components/Footer";

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
      <Header active="rent" />

      {/* Facility Header */}
      <div className="border-b border-[#e6ebf5] bg-white">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#eef4ff] text-[#1d5fe5]">
              <span className="material-symbols-outlined text-[18px]">domain</span>
            </span>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">
                Vault Trung tâm • 420 E Cesar Chavez St
              </div>
              <div className="text-[14px] font-bold text-[#0b1c30]">Kho Khối B • Tầng trệt</div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[12px] font-semibold text-[#3a475a]">
            <button className="flex items-center gap-1 text-[#1d5fe5] hover:underline">
              Sơ đồ kho
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1280px] px-4 py-6 lg:px-6">
        {/* Breadcrumb & Reservation Timer */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[12px] font-semibold text-[#58657a]">
            <Link to="/home" className="hover:underline">Trang chủ</Link> / Kho #B-204
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-[#fff1e6] px-3 py-1 text-[12px] font-bold text-[#b45309]">
            <span className="material-symbols-outlined text-[15px]">schedule</span>
            Giữ chỗ: 14:59
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            {/* Unit Info Box */}
            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                <span className="rounded-full bg-[#0e7b4c] px-2.5 py-1 text-white">Sẵn sàng</span>
                <span className="rounded-full border border-[#dfe7f5] px-2.5 py-1 text-[#3a475a]">Tầng trệt</span>
                <span className="rounded-full border border-[#dfe7f5] px-2.5 py-1 text-[#3a475a]">Khóa điện tử</span>
              </div>

              <h1 className="mt-3 text-[22px] sm:text-[24px] font-bold leading-snug tracking-[-0.02em] text-[#0b1c30]">
                Kho 5' x 10' (4.6 m²)
              </h1>
              <p className="mt-1 text-[13px] leading-6 text-[#58657a]">
                Phù hợp chứa đồ 1 phòng ngủ hoặc căn hộ studio.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-3">
                  <span className="material-symbols-outlined text-[18px] text-[#1d5fe5]">straighten</span>
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">Kích thước</div>
                  <div className="text-[13px] font-bold text-[#0b1c30]">5' x 10' x 9'</div>
                  <div className="text-[11px] text-[#8996a9]">12.7 m³</div>
                </div>
                <div className="rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-3">
                  <span className="material-symbols-outlined text-[18px] text-[#1d5fe5]">device_thermostat</span>
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">Nhiệt độ</div>
                  <div className="text-[13px] font-bold text-[#0b1c30]">20°C – 22°C</div>
                  <div className="text-[11px] text-[#8996a9]">Kiểm soát độ ẩm</div>
                </div>
                <div className="rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-3">
                  <span className="material-symbols-outlined text-[18px] text-[#1d5fe5]">lock</span>
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">An ninh</div>
                  <div className="text-[13px] font-bold text-[#0b1c30]">Khóa điện tử</div>
                  <div className="text-[11px] text-[#8996a9]">Cảm biến PIR</div>
                </div>
                <div className="rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-3">
                  <span className="material-symbols-outlined text-[18px] text-[#1d5fe5]">door_open</span>
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">Truy cập</div>
                  <div className="text-[13px] font-bold text-[#0b1c30]">24/7</div>
                  <div className="text-[11px] text-[#8996a9]">Không chạm</div>
                </div>
              </div>

              {/* Simulation */}
              <div className="mt-5 border-t border-[#eef1f8] pt-4">
                <div className="text-[13px] font-bold text-[#0b1c30]">Mô phỏng sức chứa</div>

                <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-3.5">
                    <div className="mb-2 flex items-center justify-between text-[10px] font-semibold text-[#8996a9]">
                      <span>Dài 10' (~3m)</span>
                      <span>Rộng 5' (~1.5m)</span>
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
                      className="h-full min-h-[140px] w-full bg-cover bg-center"
                      style={{
                        backgroundImage:
                          "linear-gradient(180deg, rgba(15,30,45,0.05), rgba(15,30,45,0.35)), url('https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80')",
                      }}
                    />
                    <div className="absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-1 text-[11px] font-semibold text-[#0b1c30]">
                      Lối đi 2 – Kho 204
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-[#3a475a]">
                  {["Giường Queen", "Sofa 3 chỗ", "Tủ quần áo", "Bàn ghế", "Xe đạp"].map((item) => (
                    <span key={item} className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-[#0e7b4c]">check_circle</span>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 1 */}
            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[14px] font-bold text-[#0b1c30]">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1d5fe5] text-[12px] text-white">1</span>
                  Ngày chuyển vào
                </div>
                <span className="text-[11px] font-semibold text-[#1d5fe5]">Tính từ ngày nhận kho</span>
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
                    <div className="text-[13px] font-semibold text-[#0b1c30]">Bắt đầu: Thứ 6, 01/11/2025</div>
                    <div className="text-[11px] text-[#8996a9]">Kích hoạt từ 06:00 sáng</div>
                  </div>
                </div>
                <button className="text-[12px] font-semibold text-[#1d5fe5] hover:underline">Thay đổi</button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[14px] font-bold text-[#0b1c30]">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1d5fe5] text-[12px] text-white">2</span>
                  Giờ nhận kho
                </div>
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

            {/* Step 3 */}
            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[14px] font-bold text-[#0b1c30]">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1d5fe5] text-[12px] text-white">3</span>
                  Gói bảo vệ tài sản
                </div>
                <span className="text-[11px] text-[#8996a9]">Bắt buộc</span>
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

            {/* Step 4 */}
            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[14px] font-bold text-[#0b1c30]">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1d5fe5] text-[12px] text-white">4</span>
                  Vật dụng chuẩn bị sẵn
                </div>
                <span className="text-[11px] text-[#8996a9]">Giao sẵn vào kho</span>
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
                      <span className="block text-[13px] font-semibold text-[#0b1c30]">Khóa trụ chống cắt</span>
                      <span className="block text-[11px] text-[#8996a9]">Khóa inox chịu lực, đặt sẵn trong kho.</span>
                    </span>
                  </span>
                  <span className="text-right text-[12px] font-bold">
                    <span className="mr-1 text-[#c2c9d6] line-through">$18.00</span>
                    <span className="text-[#0e7b4c]">MIỄN PHÍ</span>
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
                      <span className="block text-[13px] font-semibold text-[#0b1c30]">Chăn bọc &amp; Dây chằng (Bộ 2)</span>
                      <span className="block text-[11px] text-[#8996a9]">Bảo vệ nội thất tránh trầy xước.</span>
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
                      <span className="block text-[13px] font-semibold text-[#0b1c30]">10 Thùng carton + Băng dính</span>
                      <span className="block text-[11px] text-[#8996a9]">5 thùng vừa, 5 thùng lớn.</span>
                    </span>
                  </span>
                  <span className="text-[13px] font-bold text-[#0b1c30]">+$28.00</span>
                </label>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="h-fit rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.04)] lg:sticky lg:top-4">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">
              Bảng kê đặt chỗ
              <span className="rounded-full bg-[#0b1c30] px-2 py-0.5 text-[10px] text-white">Giữ giá</span>
            </div>

            <div className="mt-2 text-[15px] font-bold text-[#0b1c30]">Chi phí thanh toán</div>

            <div className="mt-4 space-y-2.5 text-[12px]">
              <div className="flex items-center justify-between">
                <span className="text-[#3a475a]">Thuê kho chuẩn (5' x 10')</span>
                <span className="font-semibold text-[#0b1c30]">${pricing.baseRent.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-[#0e7b4c]">
                  <span className="material-symbols-outlined text-[14px]">sell</span>
                  Giảm 50% tháng đầu
                </span>
                <span className="font-semibold text-[#0e7b4c]">-${pricing.firstMonthDiscount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-[#3a475a]">
                  Tiền cọc
                  <span className="material-symbols-outlined text-[13px] text-[#8996a9]">info</span>
                </span>
                <span className="text-right font-semibold text-[#0b1c30]">
                  ${pricing.deposit.toFixed(2)}
                  <span className="block text-[10px] font-normal text-[#0e7b4c]">Hoàn trả</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#3a475a]">Kích hoạt khóa thông minh</span>
                <span className="font-semibold text-[#0b1c30]">${pricing.smartLockActivation.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#3a475a]">Bảo vệ đồ đạc</span>
                <span className="font-semibold text-[#0b1c30]">${protectionPrice.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#3a475a]">Khóa trụ</span>
                <span className="font-semibold text-[#0b1c30]">$0.00</span>
              </div>
              {addons.blankets && (
                <div className="flex items-center justify-between">
                  <span className="text-[#3a475a]">Chăn bọc &amp; Dây chằng</span>
                  <span className="font-semibold text-[#0b1c30]">$15.00</span>
                </div>
              )}
              {addons.boxKit && (
                <div className="flex items-center justify-between">
                  <span className="text-[#3a475a]">10 Thùng carton</span>
                  <span className="font-semibold text-[#0b1c30]">$28.00</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-[#eef1f8] pt-3">
              <span className="text-[14px] font-bold text-[#0b1c30]">Tổng hôm nay</span>
              <span className="text-[20px] font-bold text-[#0b1c30]">${totalToday.toFixed(2)}</span>
            </div>

            <div className="mt-3 rounded-[10px] bg-[#f8faff] p-3 text-[11px] text-[#58657a]">
              <div className="flex items-center justify-between text-[12px] font-semibold text-[#0b1c30]">
                Hàng tháng tiếp theo
                <span>${monthlyRent.toFixed(2)}/tháng</span>
              </div>
              <div className="mt-1">
                Từ 01/12/2025. Hủy bất kỳ lúc nào.
              </div>
            </div>

            <div className="mt-3 space-y-1.5 text-[11px] text-[#58657a]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-[#0e7b4c]">lock</span>
                Bảo mật chuẩn 256-bit
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-[#0e7b4c]">event_available</span>
                Hủy miễn phí trước 24h
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-[#0e7b4c]">verified</span>
                Giữ giá trong 12 tháng
              </div>
            </div>

            <div className="mt-4 space-y-2 text-[11px] text-[#58657a]">
              <label className="flex items-start gap-2">
                <input type="checkbox" checked={agreeTerms} onChange={() => setAgreeTerms((v) => !v)} className="mt-0.5 h-3.5 w-3.5 accent-[#1d5fe5]" />
                <span>
                  Tôi đồng ý với <span className="font-semibold text-[#1d5fe5]">Thỏa thuận Thuê kho</span>.
                </span>
              </label>
              <label className="flex items-start gap-2">
                <input type="checkbox" checked={agreeLock} onChange={() => setAgreeLock((v) => !v)} className="mt-0.5 h-3.5 w-3.5 accent-[#1d5fe5]" />
                <span>
                  Tôi xác nhận mở khóa qua ứng dụng hoặc mã PIN được cấp.
                </span>
              </label>
            </div>

            <button
              disabled={!canSubmit}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#1d5fe5] py-3 text-[14px] font-bold text-white shadow-[0_14px_24px_rgba(29,95,229,0.25)] transition hover:bg-[#174fc7] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">lock</span>
              Thanh toán &amp; Đặt cọc
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>

            <div className="mt-2 text-center text-[11px] text-[#8996a9]">Giữ chỗ 48h miễn phí ($0)</div>
            <div className="mt-2 text-center text-[11px] text-[#8996a9]">
              Hỗ trợ: <span className="font-semibold text-[#1d5fe5]">(512) 555-8290</span>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default StorageDetail;
