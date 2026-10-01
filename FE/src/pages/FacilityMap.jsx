import { useFacilityMap } from "../hooks/useFacilityMap";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageBackground from "../components/PageBackground";

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
    activeFloor,
    setActiveFloor,
    layers,
    toggleLayer,
    primaryRental,
    userUnitCode,
    facilityName,
    facilityAddress,
  } = useFacilityMap();

  return (
    <div className="relative flex min-h-screen flex-col text-[#0b1c30]">
      <PageBackground />
      <Header active="facility" />

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 lg:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[22px] sm:text-[24px] font-bold tracking-[-0.02em] text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">Sơ đồ cơ sở &amp; Định vị</h1>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 rounded-[10px] border border-[#dfe7f5] bg-white px-3.5 py-2 text-[12px] font-semibold text-[#3a475a] hover:bg-[#f8faff]">
              <span className="material-symbols-outlined text-[16px]">share</span>
              Chia sẻ
            </button>
            <button className="flex items-center gap-1.5 rounded-[10px] bg-[#1d5fe5] px-4 py-2 text-[12px] font-bold text-white shadow-[0_10px_20px_rgba(29,95,229,0.25)] hover:bg-[#174fc7]">
              <span className="material-symbols-outlined text-[16px]">download</span>
              Tải sơ đồ
            </button>
          </div>
        </div>

        <div className="mt-5 rounded-[14px] bg-[#0b1c30] p-4 text-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-white/10 text-white">
                <span className="material-symbols-outlined text-[20px]">warehouse</span>
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[17px] font-bold text-white">Kho #{userUnitCode}</span>
                  <span className="rounded-full bg-[#0e7b4c] px-2 py-0.5 text-[10px] font-semibold text-white">Đã kích hoạt</span>
                </div>
                <div className="text-[11px] text-[#c7d1e6]">
                  {facilityName} • {facilityAddress}
                </div>
              </div>
            </div>

            <button className="flex items-center gap-1.5 rounded-[10px] bg-white px-4 py-2 text-[12px] font-bold text-[#0b1c30] hover:bg-[#f8faff]">
              <span className="material-symbols-outlined text-[16px] text-[#1d5fe5]">near_me</span>
              Định vị vị trí
            </button>

            <div className="flex items-center gap-5 text-[11px] font-semibold">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#7fd8b1]">directions_walk</span>
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-[#8f9cbd]">Khoảng cách</div>
                  <div>45m (~1 phút)</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#7fd8b1]">shopping_cart</span>
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-[#8f9cbd]">Xe đẩy tại sảnh</div>
                  <div>12 chiếc sẵn có</div>
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
                className={`rounded-[8px] px-3.5 py-1.5 text-[12px] font-semibold transition ${
                  activeFloor === floor.id ? "bg-[#0b1c30] text-white shadow-sm" : "text-[#58657a] hover:text-[#0b1c30]"
                }`}
              >
                {floor.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-[12px] font-semibold text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
            <span className="text-[11px] text-white/80">Hiển thị:</span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={layers.route} onChange={() => toggleLayer("route")} className="h-3.5 w-3.5 accent-[#1d5fe5]" />
              Lộ trình
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={layers.cctv} onChange={() => toggleLayer("cctv")} className="h-3.5 w-3.5 accent-[#1d5fe5]" />
              Camera
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={layers.carts} onChange={() => toggleLayer("carts")} className="h-3.5 w-3.5 accent-[#1d5fe5]" />
              Xe đẩy
            </label>
          </div>
        </div>

        <div className="mt-4 rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
            <span>Mặt bằng Tầng 1 (Khu vực Zone A) • {facilityName}</span>
            <span className="flex items-center gap-3 text-[10px] font-semibold normal-case text-[#3a475a]">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px] bg-[#1d5fe5]" /> Kho của bạn (#{userUnitCode})</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px] bg-[#dbe3f5]" /> Đã thuê</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px] border border-[#dfe7f5] bg-white" /> Còn trống</span>
              {layers.route && <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 border-t-2 border-dashed border-[#1d5fe5]" /> Lộ trình</span>}
            </span>
          </div>

          <div className="relative mt-3 h-[380px] overflow-hidden rounded-[12px] border border-[#eef1f8] bg-[#f8faff]">
            <div className="relative mx-auto h-full w-full max-w-[560px]">
              {leftUnits.map((unit) => (
                <div
                  key={unit.id}
                  className={`absolute flex h-[62px] w-[70px] flex-col items-center justify-center rounded-[6px] text-center text-[10px] font-semibold ${
                    unit.id === userUnitCode
                      ? "border-2 border-[#1d5fe5] bg-[#eef4ff] font-bold text-[#1d5fe5] shadow-sm"
                      : unit.taken
                      ? "border-[#c7d1e6] bg-[#dbe3f5] text-[#3a475a]"
                      : "border-[#dfe7f5] bg-white text-[#3a475a]"
                  }`}
                  style={{
                    top: unit.top,
                    left: unit.col === 2 ? 88 : 0,
                  }}
                >
                  Kho #{unit.id}
                  {unit.id === userUnitCode && (
                    <span className="text-[8px] font-semibold text-[#0e7b4c]">Của bạn</span>
                  )}
                </div>
              ))}

              {rightUnits.map((unit) => (
                <div
                  key={unit.id}
                  className="absolute flex h-[62px] w-[70px] items-center justify-center rounded-[6px] border border-[#dfe7f5] bg-white text-center text-[10px] font-semibold text-[#3a475a]"
                  style={{ top: unit.top, right: unit.col === 2 ? 0 : 88 }}
                >
                  Kho #{unit.id}
                </div>
              ))}

              <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-[8px] bg-[#0b1c30] px-3.5 py-1.5 text-center text-[10px] font-bold text-white shadow-md">
                <span className="material-symbols-outlined text-[14px] text-[#7fd8b1]">elevator</span>
                Lối vào chính (Điểm xuất phát)
              </div>

              {layers.route && (
                <svg className="pointer-events-none absolute inset-0 h-full w-full">
                  <polyline
                    points="280,330 280,100 80,100"
                    fill="none"
                    stroke="#1d5fe5"
                    strokeWidth="2.5"
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
              <div className="absolute -right-1 top-1/2 -translate-y-1/2 rotate-90 text-[9px] font-bold text-[#8996a9]">HÀNH LANG ZONE A</div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#8996a9]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-[#3a475a]">
                <span className="material-symbols-outlined text-[14px] text-[#1d5fe5]">device_thermostat</span>
                Nhiệt độ: 21.8°C
              </span>
              <span className="flex items-center gap-1 text-[#3a475a]">
                <span className="material-symbols-outlined text-[14px] text-[#1d5fe5]">water_drop</span>
                Độ ẩm: 52%
              </span>
              <span className="flex items-center gap-1 text-[#0e7b4c]">
                <span className="material-symbols-outlined text-[14px]">videocam</span>
                16 camera trực tuyến
              </span>
            </div>
            <span>Cập nhật: 14:30 hôm nay</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-[15px] font-bold text-[#0b1c30]">Chỉ dẫn di chuyển đến kho #{userUnitCode}</div>
                </div>
                <span className="rounded-full bg-[#eef4ff] px-2.5 py-0.5 text-[11px] font-bold text-[#1d5fe5]">4 bước</span>
              </div>

              <div className="mt-4 space-y-3">
                {steps.map((step, idx) => (
                  <div key={step.title} className="flex gap-3 rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-3.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1d5fe5] text-[11px] font-bold text-white">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[13px] font-bold text-[#0b1c30]">{step.title}</span>
                        <span className="rounded-full bg-[#eef4ff] px-2 py-0.5 text-[10px] font-semibold text-[#1d5fe5]">{step.tag}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="flex items-center justify-between">
                <div className="text-[15px] font-bold text-[#0b1c30]">Hình ảnh thực tế</div>
                <span className="text-[11px] text-[#8996a9]">Khu vực Tầng 2 &amp; Bến bốc dỡ</span>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="relative overflow-hidden rounded-[12px] border border-[#eef1f8]">
                  <div
                    className="h-[150px] w-full bg-cover bg-center"
                    style={{
                      backgroundImage:
                        "linear-gradient(180deg, rgba(15,30,45,0.05), rgba(15,30,45,0.4)), url('https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80')",
                    }}
                  />
                  <div className="absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-1 text-[10px] font-semibold text-[#0b1c30]">
                    Hành lang Zone A (Trước kho #{userUnitCode})
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-[12px] border border-[#eef1f8]">
                  <div
                    className="h-[150px] w-full bg-cover bg-center"
                    style={{
                      backgroundImage:
                        "linear-gradient(180deg, rgba(15,30,45,0.05), rgba(15,30,45,0.4)), url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80')",
                    }}
                  />
                  <div className="absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-1 text-[10px] font-semibold text-[#0b1c30]">
                    Bến bốc dỡ Dock 2
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="text-[13px] font-bold text-[#0b1c30]">Tiện ích cơ sở</div>

              <div className="mt-3 space-y-3">
                {amenities.map((item) => (
                  <div key={item.title} className="flex gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#eef4ff] text-[#1d5fe5]">
                      <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                    </span>
                    <div className="text-[12px] font-semibold text-[#0b1c30]">{item.title}</div>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between rounded-[10px] bg-[#f8faff] p-3 text-[11px] font-semibold text-[#3a475a]">
                Quản lý trạm
                <span className="font-bold text-[#1d5fe5]">0908 889 922</span>
              </div>
            </div>

            <div className="rounded-[16px] bg-[#0b1c30] p-5 text-white">
              <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.06em] text-[#7fd8b1]">
                <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
                Mã vào trạm hôm nay
              </div>
              <div className="mt-3 flex items-center gap-2 text-[22px] font-bold tracking-[0.1em]">
                4829 - 9912
                <span className="material-symbols-outlined cursor-pointer text-[18px] text-[#c7d1e6] hover:text-white">content_copy</span>
              </div>
              <p className="mt-2 text-[10px] leading-relaxed text-[#8f9cbd]">
                Dùng cho barrier cổng chính và kích hoạt thang máy lên tầng 2.
              </p>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default FacilityMap;
