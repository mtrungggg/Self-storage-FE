import { useNavigate } from "react-router-dom";
import { useAccessControl } from "../hooks/useAccessControl";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageBackground from "../components/PageBackground";

function AccessControl() {
  const navigate = useNavigate();
  const {
    accessLogs,
    rentalsLoading,
    activeRentals,
    selectedRental,
    selectedRentalId,
    setSelectedRentalId,
    currentUnitCode,
    showPin,
    setShowPin,
    alerts,
    toggleAlert,
    credentials,
    credentialsLoading,
    credentialsError,
    pinChanging,
    handleChangePin,
  } = useAccessControl();

  const onChangePin = () => {
    const newPin = window.prompt("Nhập mã PIN mới (6 chữ số):");
    if (!newPin) return;
    handleChangePin(newPin).catch(() => {});
  };

  return (
    <div className="relative flex min-h-screen flex-col text-[#0b1c30]">
      <PageBackground />
      <Header active="access" />

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 lg:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[22px] sm:text-[24px] font-bold tracking-[-0.02em] text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
              Mã PIN bàn phím số
            </h1>
          </div>

          {activeRentals.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={onChangePin}
                disabled={pinChanging || !credentials}
                className="flex items-center gap-1.5 rounded-[10px] border border-[#dfe7f5] bg-white px-3.5 py-2 text-[12px] font-semibold text-[#3a475a] hover:bg-[#f8faff] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">sync_alt</span>
                {pinChanging ? "Đang đổi..." : "Đổi mã PIN"}
              </button>
            </div>
          )}
        </div>

        {credentialsError && (
          <div className="mt-4 rounded-[12px] border border-[#fecdca] bg-[#fff1f1] px-4 py-3 text-[13px] font-semibold text-[#b3261e]">
            {credentialsError}
          </div>
        )}

        {rentalsLoading && (
          <div className="mt-6 flex items-center gap-2 rounded-[14px] border border-[#dfe7f5] bg-white p-4 text-[13px] text-[#58657a]">
            <span className="material-symbols-outlined animate-spin text-[18px] text-[#1d5fe5]">
              progress_activity
            </span>
            Đang tải dữ liệu khóa điện tử...
          </div>
        )}

        {!rentalsLoading && activeRentals.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center rounded-[16px] border border-[#dfe7f5] bg-white p-12 text-center shadow-sm">
            <span className="material-symbols-outlined text-[54px] text-[#1d5fe5]">
              key_off
            </span>
            <h2 className="mt-3 text-[19px] font-bold text-[#0b1c30]">
              Chưa có khóa điện tử hoặc kho nào được kích hoạt
            </h2>
            <p className="mt-2 max-w-[460px] text-[13px] leading-relaxed text-[#58657a]">
              Mã PIN bàn phím số sẽ tự động hiển thị tại đây ngay khi bạn kích hoạt hợp đồng thuê kho.
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-5 rounded-[10px] bg-[#1d5fe5] px-6 py-2.5 text-[13px] font-bold text-white shadow transition hover:bg-[#174fc7]"
            >
              Tìm kho &amp; Đặt thuê ngay
            </button>
          </div>
        ) : (
          !rentalsLoading && (
            <>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-[#dfe7f5] bg-white p-3">
                <div className="flex flex-wrap items-center gap-2">
                  {activeRentals.map((r, idx) => (
                    <button
                      key={r.agreementId}
                      onClick={() => setSelectedRentalId(r.agreementId)}
                      className={`rounded-[10px] px-3.5 py-2 text-left text-[12px] font-semibold transition ${
                        selectedRentalId === r.agreementId
                          ? "bg-[#0b1c30] text-white shadow-sm"
                          : "border border-[#dfe7f5] text-[#3a475a] hover:bg-[#f8faff]"
                      }`}
                    >
                      <div>
                        {idx === 0 ? "Kho chính" : `Kho #${idx + 1}`} #{r.unitCode}
                      </div>
                      <div
                        className={`text-[10px] font-normal ${
                          selectedRentalId === r.agreementId ? "text-[#c7d1e6]" : "text-[#8996a9]"
                        }`}
                      >
                        {r.unitTypeName || "Kho tự quản"} • Tầng {r.floorLabel || "1"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
                <div className="space-y-6">
                  <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-[15px] font-bold text-[#0b1c30]">Mã PIN bàn phím số</div>
                      <span className="rounded-full bg-[#eef4ff] px-2.5 py-0.5 text-[11px] font-bold text-[#1d5fe5]">
                        Kho #{currentUnitCode}
                      </span>
                    </div>

                    <div className="mt-4 rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-4">
                      <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">
                        Mã PIN chính
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 text-[20px] font-bold tracking-[0.25em] text-[#0b1c30]">
                          {credentialsLoading
                            ? "..."
                            : showPin
                            ? credentials?.keypadPin || "—"
                            : (credentials?.keypadPin || "••••••").replace(/./g, "•")}
                          <button
                            onClick={() => setShowPin((v) => !v)}
                            className="material-symbols-outlined text-[18px] text-[#8996a9] hover:text-[#0b1c30]"
                          >
                            {showPin ? "visibility_off" : "visibility"}
                          </button>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                          <button
                            onClick={() =>
                              credentials?.keypadPin &&
                              navigator.clipboard.writeText(credentials.keypadPin)
                            }
                            disabled={!credentials?.keypadPin}
                            className="flex items-center gap-1 rounded-md border border-[#dfe7f5] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#3a475a] hover:bg-[#f5f7fd] disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-[14px]">content_copy</span>
                            Sao chép
                          </button>
                          <button
                            onClick={onChangePin}
                            disabled={!credentials}
                            className="flex items-center gap-1 rounded-md border border-[#dfe7f5] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#3a475a] hover:bg-[#f5f7fd] disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-[14px]">autorenew</span>
                            Tạo lại mã
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-4 text-[12px] text-[#58657a]">
                      <div className="flex items-center gap-2 font-bold text-[#0b1c30]">
                        <span className="material-symbols-outlined text-[18px] text-[#1d5fe5]">info</span>
                        Hướng dẫn sử dụng mã PIN tại cơ sở
                      </div>
                      <ul className="mt-2 space-y-1.5 pl-5 list-disc text-[12px] leading-relaxed">
                        <li>
                          Nhập mã PIN 6 số trên bàn phím số tại barrier cổng hoặc tại ổ khóa ô kho.
                        </li>
                        <li>
                          Bấm phím <strong>#</strong> sau khi hoàn tất chuỗi số để xác nhận mở chốt.
                        </li>
                        <li>
                          Không chia sẻ mã PIN cho người khác để đảm bảo an toàn cho tài sản trong kho.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <aside className="space-y-6">
                  {/* Gộp 3 phần thành 1 khối duy nhất: Cổng vào & Thang máy, Nhật ký mở khóa, Cảnh báo an ninh */}
                  <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
                    {/* Phần 1: Cổng vào & Thang máy */}
                    <div className="flex items-center justify-between text-[13px] font-bold text-[#0b1c30]">
                      Cổng vào &amp; Thang máy
                      <span className="rounded-full bg-[#eef4ff] px-2 py-0.5 text-[10px] font-semibold text-[#1d5fe5]">
                        {selectedRental?.facilityName || "Thu Duc Self Storage"}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-[#3a475a]">
                          elevator
                        </span>
                        <div className="text-[12px] font-semibold text-[#0b1c30]">
                          Thang máy Khu {selectedRental?.zoneLabel || "A"} • Tầng {selectedRental?.floorLabel || "1"}
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-[16px] text-[#0e7b4c]">
                        check_circle
                      </span>
                    </div>

                    {/* Phần 2: Nhật ký mở khóa */}
                    <div className="mt-5 border-t border-[#f0f3f8] pt-4">
                      <div className="flex items-center justify-between text-[13px] font-bold text-[#0b1c30]">
                        Nhật ký mở khóa
                        <span className="text-[10px] font-semibold text-[#8996a9]">Trực tiếp</span>
                      </div>

                      <div className="mt-3 space-y-2.5">
                        {accessLogs.length > 0 ? (
                          accessLogs.map((log) => (
                            <div key={log.title + log.time} className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 truncate">
                                <span
                                  className="h-2 w-2 shrink-0 rounded-full"
                                  style={{ backgroundColor: log.dot }}
                                />
                                <span className="truncate text-[12px] font-semibold text-[#0b1c30]">
                                  {log.title}
                                </span>
                              </div>
                              <span className="shrink-0 text-[10px] text-[#8996a9]">{log.time}</span>
                            </div>
                          ))
                        ) : (
                          <div className="py-2 text-center text-[12px] text-[#8996a9]">
                            Chưa có lịch sử mở khóa nào.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Phần 3: Cảnh báo an ninh (ngắn gọn, không có các chú thích phụ) */}
                    <div className="mt-5 border-t border-[#f0f3f8] pt-4">
                      <div className="text-[13px] font-bold text-[#0b1c30]">Cảnh báo an ninh</div>

                      <div className="mt-3 space-y-2">
                        <label className="flex items-center justify-between gap-2 rounded-[8px] border border-[#eef1f8] bg-[#f8faff] px-3 py-2 cursor-pointer">
                          <span className="text-[12px] font-medium text-[#0b1c30]">Cửa mở quá 15 phút</span>
                          <input
                            type="checkbox"
                            checked={alerts.doorOpen}
                            onChange={() => toggleAlert("doorOpen")}
                            className="h-4 w-4 accent-[#1d5fe5]"
                          />
                        </label>

                        <label className="flex items-center justify-between gap-2 rounded-[8px] border border-[#eef1f8] bg-[#f8faff] px-3 py-2 cursor-pointer">
                          <span className="text-[12px] font-medium text-[#0b1c30]">Sai mã PIN 5 lần</span>
                          <input
                            type="checkbox"
                            checked={alerts.wrongPin}
                            onChange={() => toggleAlert("wrongPin")}
                            className="h-4 w-4 accent-[#1d5fe5]"
                          />
                        </label>

                        <label className="flex items-center justify-between gap-2 rounded-[8px] border border-[#eef1f8] bg-[#f8faff] px-3 py-2 cursor-pointer">
                          <span className="text-[12px] font-medium text-[#0b1c30]">Mở ngoài giờ (22h – 06h)</span>
                          <input
                            type="checkbox"
                            checked={alerts.afterHours}
                            onChange={() => toggleAlert("afterHours")}
                            className="h-4 w-4 accent-[#1d5fe5]"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            </>
          )
        )}
      </main>

      <Footer />
    </div>
  );
}

export default AccessControl;
