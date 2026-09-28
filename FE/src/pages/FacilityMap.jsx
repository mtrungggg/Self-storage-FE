import { useFacilityMap } from "../hooks/useFacilityMap";
import { getDefaultFooterColumns } from "../data/footerRepository";
import Header from "../components/Header";
import Footer from "../components/Footer";

function UnitBox({ unit, side }) {
  return (
    <div
      className={`absolute flex h-[62px] w-[70px] items-center justify-center rounded-[6px] border text-center text-[10px] font-semibold ${
        unit.taken ? "border-[#c7d1e6] bg-[#dbe3f5] text-[#3a475a]" : "border-[#dfe7f5] bg-white text-[#3a475a]"
      }`}
      style={{
        top: unit.top,
        [side]: unit.col === 2 ? 88 : 0,
      }}
    >
      Kho #{unit.id}
    </div>
  );
}

function FacilityMap() {
  const {
    floors,
    leftUnits,
    rightUnits,
    steps,
    amenities,
    trustBadges,
    activeFloor,
    setActiveFloor,
    layers,
    toggleLayer,
  } = useFacilityMap();

  return (
    <div className="min-h-screen bg-[#f5f7fd] text-[#0b1c30]">
      <Header active="facility" showUserBadge />

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
            <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#1d5fe5]">
              <span className="material-symbols-outlined text-[14px]">explore</span>
              Indoor Wayfinding Engine v4.2
            </div>
            <h1 className="mt-1 text-[26px] font-bold tracking-[-0.02em] text-[#0b1c30]">Sơ đồ cơ sở &amp; Định vị kho</h1>
            <p className="mt-2 max-w-[640px] text-[13px] leading-6 text-[#58657a]">
              Bản đồ trực quan kho #04 Downtown Metro: chỉ dẫn từng bước tới kho của bạn, bãi đỗ hàng, thang máy và tiện ích.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 rounded-[10px] border border-[#dfe7f5] bg-white px-4 py-2.5 text-[12px] font-semibold text-[#3a475a]">
              <span className="material-symbols-outlined text-[16px]">sms</span>
              Gửi SMS chỉ đường
            </button>
            <button className="flex items-center gap-2 rounded-[10px] bg-[#1d5fe5] px-4 py-2.5 text-[12px] font-bold text-white shadow-[0_10px_20px_rgba(29,95,229,0.25)] hover:bg-[#174fc7]">
              <span className="material-symbols-outlined text-[16px]">download</span>
              Tải sơ đồ PDF
            </button>
          </div>
        </div>

        <div className="mt-5 rounded-[14px] bg-[#0b1c30] p-4 text-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-white/10 text-white">
                <span className="material-symbols-outlined text-[18px]">home</span>
              </span>
              <div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.06em]">
                  <span className="rounded-full bg-[#1d5fe5] px-2 py-0.5">Căn kho của bạn</span>
                  <span className="rounded-full bg-[#0e7b4c] px-2 py-0.5">Đã khóa điện tử</span>
                </div>
                <div className="mt-1 text-[18px] font-bold">Kho #B-204</div>
                <div className="text-[11px] text-[#c7d1e6]">Tầng 2 Lầu • Lối đi phía Đông • Ngay sát Thang máy hàng số 2</div>
              </div>
            </div>

            <button className="flex items-center gap-2 rounded-[10px] bg-white px-4 py-2.5 text-[12px] font-bold text-[#0b1c30]">
              <span className="material-symbols-outlined text-[16px]">near_me</span>
              Định vị kho
            </button>

            <div className="flex items-center gap-4 text-[11px] font-semibold">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">directions_walk</span>
                <div>
                  <div className="text-[9px] uppercase text-[#8f9cbd]">Khoảng cách đi bộ</div>
                  <div>45 mét (~1 phút)</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                <div>
                  <div className="text-[9px] uppercase text-[#8f9cbd]">Xe đẩy sẵn có</div>
                  <div>12 chiếc • Sảnh thang</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex flex-wrap rounded-[10px] bg-[#eef4ff] p-1">
            {floors.map((floor) => (
              <button
                key={floor.id}
                onClick={() => setActiveFloor(floor.id)}
                className={`rounded-[8px] px-3 py-2 text-[12px] font-semibold transition ${
                  activeFloor === floor.id ? "bg-[#0b1c30] text-white shadow-sm" : "text-[#58657a]"
                }`}
              >
                {floor.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-[12px] font-semibold text-[#3a475a]">
            <span className="text-[11px] text-[#8996a9]">Lọc lớp hiển thị:</span>
            <label className="flex items-center gap-1.5">
              <input type="checkbox" checked={layers.route} onChange={() => toggleLayer("route")} className="h-3.5 w-3.5 accent-[#1d5fe5]" />
              Đường đi
            </label>
            <label className="flex items-center gap-1.5">
              <input type="checkbox" checked={layers.cctv} onChange={() => toggleLayer("cctv")} className="h-3.5 w-3.5 accent-[#1d5fe5]" />
              CCTV &amp; Cửa an ninh
            </label>
            <label className="flex items-center gap-1.5">
              <input type="checkbox" checked={layers.carts} onChange={() => toggleLayer("carts")} className="h-3.5 w-3.5 accent-[#1d5fe5]" />
              Xe đẩy &amp; Tiện ích
            </label>
          </div>
        </div>

        <div className="mt-4 rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
            Mặt bằng Tầng 2 (Lối B) • North
            <span className="flex items-center gap-3 text-[10px] font-semibold normal-case text-[#3a475a]">
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-[3px] bg-[#1d5fe5]" /> Kho của bạn (#B-204)</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-[3px] bg-[#c7d1e6]" /> Kho đã có khách</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-[3px] border border-[#dfe7f5] bg-white" /> Kho trống</span>
              {layers.route && <span className="flex items-center gap-1"><span className="h-0.5 w-4 border-t-2 border-dashed border-[#1d5fe5]" /> Tuyến dẫn đường</span>}
            </span>
          </div>

          <div className="relative mt-3 h-[380px] overflow-hidden rounded-[12px] border border-[#eef1f8] bg-[#f8faff]">
            <div className="relative mx-auto h-full w-full max-w-[560px]">
              {leftUnits.map((unit) => (
                <UnitBox key={unit.id} unit={unit} side="left" />
              ))}

              {rightUnits.map((unit) => (
                <div
                  key={unit.id}
                  className={`absolute flex h-[62px] w-[70px] items-center justify-center rounded-[6px] border text-center text-[10px] font-semibold ${
                    unit.id === "B-204" ? "" : "border-[#dfe7f5] bg-white text-[#3a475a]"
                  }`}
                  style={{ top: unit.top, right: unit.col === 2 ? 0 : 88 }}
                >
                  Kho #{unit.id}
                </div>
              ))}

              <div className="absolute right-0 top-[210px] flex h-[62px] w-[70px] flex-col items-center justify-center rounded-[6px] border-2 border-[#1d5fe5] bg-[#eef4ff] text-center text-[10px] font-bold text-[#1d5fe5]">
                Kho #B-204
                <span className="text-[8px] font-semibold text-[#1d5fe5]">Đã khóa</span>
              </div>

              <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center rounded-[8px] bg-[#0b1c30] px-3 py-2 text-center text-[9px] font-bold text-white">
                Sảnh thang máy số 2
                <span className="font-normal text-[#c7d1e6]">Điểm xuất phát của bạn</span>
              </div>

              {layers.route && (
                <svg className="pointer-events-none absolute inset-0 h-full w-full">
                  <polyline
                    points="280,330 280,240 480,240"
                    fill="none"
                    stroke="#1d5fe5"
                    strokeWidth="3"
                    strokeDasharray="6 6"
                  />
                </svg>
              )}

              {layers.cctv && (
                <>
                  <span className="material-symbols-outlined absolute left-[36%] top-2 text-[16px] text-[#c0362c]">videocam</span>
                  <span className="material-symbols-outlined absolute right-[8%] top-2 text-[16px] text-[#c0362c]">videocam</span>
                </>
              )}

              <div className="absolute right-2 top-2 rounded bg-[#fdecec] px-1.5 py-0.5 text-[8px] font-bold text-[#c0362c]">LỐI THOÁT HIỂM</div>
              <div className="absolute -right-1 top-1/2 -translate-y-1/2 rotate-90 text-[9px] font-bold text-[#8996a9]">HÀNH LANG B-EAST</div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#8996a9]">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-[#1d5fe5]">device_thermostat</span>
              Nhiệt độ hiện tại: 21.8°C (Chuẩn vi khí hậu)
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-[#1d5fe5]">water_drop</span>
              Độ ẩm: 52% RH (Ổn định hồ sơ)
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-[#0e7b4c]">videocam</span>
              Camera hành lang: 16 luồng trực tuyến
            </span>
            <span>Cập nhật bản đồ lúc 14:30 hôm nay</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-[15px] font-bold text-[#0b1c30]">Chỉ dẫn từng bước đến kho #B-204</div>
                  <p className="text-[11px] text-[#8996a9]">Lộ trình tối ưu nhất từ cổng xe tải đến lối của bạn</p>
                </div>
                <span className="rounded-full bg-[#eef4ff] px-2.5 py-1 text-[11px] font-bold text-[#1d5fe5]">4 chặng di chuyển</span>
              </div>

              <div className="mt-4 space-y-3">
                {steps.map((step, idx) => (
                  <div key={step.title} className="flex gap-3 rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-3.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1d5fe5] text-[12px] font-bold text-white">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[13px] font-bold text-[#0b1c30]">{step.title}</span>
                        <span className="rounded-full bg-[#eef4ff] px-2 py-0.5 text-[10px] font-semibold text-[#1d5fe5]">{step.tag}</span>
                      </div>
                      <p className="mt-1 text-[11px] leading-5 text-[#58657a]">{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="flex items-center justify-between">
                <div className="text-[15px] font-bold text-[#0b1c30]">Hình ảnh thực tế hành lang tầng 2</div>
                <span className="text-[11px] text-[#8996a9]">Ảnh chụp kiểm định an ninh</span>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="relative overflow-hidden rounded-[12px] border border-[#eef1f8]">
                  <div
                    className="h-[160px] w-full bg-cover bg-center"
                    style={{
                      backgroundImage:
                        "linear-gradient(180deg, rgba(15,30,45,0.05), rgba(15,30,45,0.4)), url('https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80')",
                    }}
                  />
                  <div className="absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-1 text-[10px] font-semibold text-[#0b1c30]">
                    Hành lang B-East (Trước cửa kho #B-204)
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-[12px] border border-[#eef1f8]">
                  <div
                    className="h-[160px] w-full bg-cover bg-center"
                    style={{
                      backgroundImage:
                        "linear-gradient(180deg, rgba(15,30,45,0.05), rgba(15,30,45,0.4)), url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80')",
                    }}
                  />
                  <div className="absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-1 text-[10px] font-semibold text-[#0b1c30]">
                    Mặt tiền trạm &amp; Bãi đỗ hàng Dock 2
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="text-[13px] font-bold text-[#0b1c30]">Tiện ích &amp; Quy chuẩn Hub #04</div>
              <p className="mt-1 text-[11px] text-[#8996a9]">Cơ sở tiêu chuẩn Class-A Logistics</p>

              <div className="mt-3 space-y-3">
                {amenities.map((item) => (
                  <div key={item.title} className="flex gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#eef4ff] text-[#1d5fe5]">
                      <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                    </span>
                    <div>
                      <div className="text-[12px] font-semibold text-[#0b1c30]">{item.title}</div>
                      <div className="text-[10px] leading-4 text-[#8996a9]">{item.text}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between rounded-[10px] bg-[#f8faff] p-3 text-[11px] font-semibold text-[#3a475a]">
                Quản lý trạm trực tiếp
                <span className="text-[#1d5fe5]">0908.889.922</span>
              </div>
            </div>

            <div className="rounded-[16px] bg-[#0b1c30] p-5 text-white">
              <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.06em] text-[#7fd8b1]">
                <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
                Thẻ ra vào trạm số
              </div>
              <p className="mt-2 text-[11px] text-[#c7d1e6]">Mã truy cập cổng &amp; Cửa thang máy hôm nay</p>
              <div className="mt-2 flex items-center gap-2 text-[22px] font-bold tracking-[0.1em]">
                4829 - 9912
                <span className="material-symbols-outlined text-[18px] text-[#c7d1e6]">content_copy</span>
              </div>
              <p className="mt-2 text-[10px] leading-4 text-[#8f9cbd]">
                * Mã này cấp quyền tự động cho thang máy di chuyển đến tầng 2 và kích hoạt cảm biến động cửa kho B-204 trong quá trình xuất nhập kho.
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
        columns={getDefaultFooterColumns()}
      />
    </div>
  );
}

export default FacilityMap;
