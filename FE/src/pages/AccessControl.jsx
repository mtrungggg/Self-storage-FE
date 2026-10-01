import { useNavigate } from "react-router-dom";
import { useAccessControl } from "../hooks/useAccessControl";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageBackground from "../components/PageBackground";

function AccessControl() {
  const navigate = useNavigate();
  const {
    wallets,
    guestPins,
    accessLogs,
    rentalsLoading,
    activeRentals,
    selectedRental,
    selectedRentalId,
    setSelectedRentalId,
    currentUnitCode,
    showPin,
    setShowPin,
    unlocking,
    handleUnlock,
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
              Mã PIN &amp; Khóa điện tử
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
              <button className="flex items-center gap-1.5 rounded-[10px] bg-[#1d5fe5] px-4 py-2 text-[12px] font-bold text-white shadow-[0_10px_20px_rgba(29,95,229,0.25)] hover:bg-[#174fc7]">
                <span className="material-symbols-outlined text-[16px]">add</span>
                Cấp mã khách
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
              Mã PIN bàn phím số, khóa một chạm Bluetooth và phân quyền khách sẽ tự động hiển thị tại đây ngay khi bạn kích hoạt hợp đồng thuê kho.
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

                <div className="flex flex-wrap items-center gap-4 text-[12px] font-semibold text-[#3a475a]">
                  <span>Khóa thông minh</span>
                  <span className="flex items-center gap-1 rounded-full bg-[#e7f8ee] px-2.5 py-0.5 text-[11px] font-bold text-[#0e7b4c]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4a0]" />
                    Đã khóa
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
                <div className="space-y-6">
                  <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-[15px] font-bold text-[#0b1c30]">Bàn phím &amp; Khóa từ xa</div>
                      <span className="rounded-full bg-[#eef4ff] px-2.5 py-0.5 text-[11px] font-bold text-[#1d5fe5]">
                        Kho #{currentUnitCode}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-[#8996a9]">Mã hóa bảo mật 256-bit</p>

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
                      <div className="mt-2 text-[11px] text-[#8996a9]">
                        Nhập trực tiếp trên bàn phím tại cửa kho.
                      </div>
                    </div>

                    <div className="mt-4 rounded-[12px] bg-[#0b1c30] p-4 text-white">
                      <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[#7fd8b1]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4a0]" />
                        Mở khóa Bluetooth
                      </div>
                      <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-[14px] font-bold">Mở khóa một chạm</div>
                          <p className="mt-1 max-w-[380px] text-[11px] leading-relaxed text-[#c7d1e6]">
                            Tự động nhận diện khi đến gần kho trong phạm vi 5 mét.
                          </p>
                        </div>
                        <button
                          onClick={handleUnlock}
                          className="flex items-center gap-2 rounded-[10px] bg-[#1d5fe5] px-4 py-2.5 text-[13px] font-bold text-white hover:bg-[#174fc7]"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {unlocking ? "lock_open" : "lock"}
                          </span>
                          {unlocking ? "Đang mở..." : "Mở khóa kho"}
                        </button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">
                        Ví điện tử &amp; Thẻ NFC
                      </div>
                      <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
                        {wallets.map((wallet) => (
                          <div
                            key={wallet.title}
                            className="flex items-center gap-2.5 rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3"
                          >
                            <span className="material-symbols-outlined text-[18px] text-[#1d5fe5]">
                              {wallet.icon}
                            </span>
                            <div>
                              <div className="text-[12px] font-semibold text-[#0b1c30]">
                                {wallet.title}
                              </div>
                              <div
                                className={`text-[10px] ${
                                  wallet.active ? "text-[#0e7b4c]" : "text-[#8996a9]"
                                }`}
                              >
                                {wallet.status}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="text-[15px] font-bold text-[#0b1c30]">Mã khách &amp; Ủy quyền</div>
                        <p className="mt-0.5 max-w-[480px] text-[11px] text-[#8996a9]">
                          Cấp quyền mở kho tạm thời cho đối tác hoặc người thân.
                        </p>
                      </div>
                      <button className="flex items-center gap-1 rounded-[10px] bg-[#1d5fe5] px-3.5 py-1.5 text-[12px] font-bold text-white hover:bg-[#174fc7]">
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        Cấp mã mới
                      </button>
                    </div>

                    <div className="mt-4 space-y-3">
                      {guestPins.length > 0 ? (
                        guestPins.map((guest) => (
                          <div
                            key={guest.id}
                            className={`rounded-[12px] border p-3.5 ${
                              guest.status === "expired"
                                ? "border-[#eef1f8] bg-[#f8faff] opacity-80"
                                : "border-[#eef1f8] bg-white"
                            }`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[13px] font-bold text-[#0b1c30]">{guest.name}</span>
                                <span className="rounded-full bg-[#eef4ff] px-2 py-0.5 text-[10px] font-semibold text-[#1d5fe5]">
                                  {guest.tag}
                                </span>
                              </div>
                              {guest.status === "active" ? (
                                <span className="flex items-center gap-1 text-[11px] font-semibold text-[#0e7b4c]">
                                  <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4a0]" />
                                  Hoạt động
                                </span>
                              ) : (
                                <span className="rounded-full bg-[#eef1f8] px-2 py-0.5 text-[10px] font-semibold text-[#8996a9]">
                                  Hết hạn
                                </span>
                              )}
                            </div>
                            <div className="mt-1 text-[11px] text-[#8996a9]">{guest.schedule}</div>
                            <div className="mt-2 flex items-center justify-between">
                              <span
                                className={`text-[12px] font-semibold ${
                                  guest.status === "expired" ? "text-[#8996a9] line-through" : "text-[#0b1c30]"
                                }`}
                              >
                                Mã PIN: {guest.code}
                              </span>
                              <button
                                className={`rounded-md px-3 py-1 text-[11px] font-semibold ${
                                  guest.action === "Hủy mã"
                                    ? "bg-[#fdecec] text-[#c0362c] hover:bg-[#fad7d7]"
                                    : "border border-[#dfe7f5] text-[#3a475a] hover:bg-[#f8faff]"
                                }`}
                              >
                                {guest.action}
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-4 text-center text-[12px] text-[#8996a9]">
                          Chưa có mã khách nào được cấp cho kho này.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <aside className="space-y-6">
                  <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
                    <div className="flex items-center justify-between text-[13px] font-bold text-[#0b1c30]">
                      Cổng vào &amp; Thang máy
                      <span className="rounded-full bg-[#eef4ff] px-2 py-0.5 text-[10px] font-semibold text-[#1d5fe5]">
                        {selectedRental?.facilityName || "Cơ sở"}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-[#3a475a]">
                          directions_car
                        </span>
                        <div className="text-[12px] font-semibold text-[#0b1c30]">Barrier Cổng Vào</div>
                      </div>
                      <button className="rounded-md bg-[#1d5fe5] px-3 py-1 text-[11px] font-bold text-white hover:bg-[#174fc7]">
                        Mở barrier
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
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
                  </div>

                  <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
                    <div className="flex items-center justify-between text-[13px] font-bold text-[#0b1c30]">
                      Nhật ký mở khóa
                      <span className="text-[10px] font-semibold text-[#8996a9]">Trực tiếp</span>
                    </div>

                    <div className="mt-3 space-y-3">
                      {accessLogs.length > 0 ? (
                        accessLogs.map((log) => (
                          <div key={log.title + log.time} className="flex gap-2.5">
                            <span
                              className="mt-1 h-2 w-2 shrink-0 rounded-full"
                              style={{ backgroundColor: log.dot }}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="truncate text-[12px] font-semibold text-[#0b1c30]">
                                  {log.title}
                                </span>
                                <span className="shrink-0 text-[10px] text-[#8996a9]">{log.time}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-4 text-center text-[12px] text-[#8996a9]">
                          Chưa có lịch sử mở khóa nào.
                        </div>
                      )}
                    </div>

                    {accessLogs.length > 0 && (
                      <button className="mt-3 w-full rounded-[10px] border border-[#dfe7f5] py-2 text-[12px] font-semibold text-[#3a475a] hover:bg-[#f8faff]">
                        Xem tất cả lịch sử
                      </button>
                    )}
                  </div>

                  <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
                    <div className="text-[13px] font-bold text-[#0b1c30]">Cảnh báo an ninh</div>

                    <div className="mt-3 space-y-2.5">
                      <label className="flex items-center justify-between gap-2 rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3 cursor-pointer">
                        <div>
                          <div className="text-[12px] font-semibold text-[#0b1c30]">Cửa mở quá 15 phút</div>
                          <div className="text-[10px] text-[#8996a9]">Phát còi và gửi thông báo điện thoại</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={alerts.doorOpen}
                          onChange={() => toggleAlert("doorOpen")}
                          className="h-4 w-4 accent-[#1d5fe5]"
                        />
                      </label>

                      <label className="flex items-center justify-between gap-2 rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3 cursor-pointer">
                        <div>
                          <div className="text-[12px] font-semibold text-[#0b1c30]">Sai mã PIN 5 lần</div>
                          <div className="text-[10px] text-[#8996a9]">Khóa 30 phút và ghi hình camera</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={alerts.wrongPin}
                          onChange={() => toggleAlert("wrongPin")}
                          className="h-4 w-4 accent-[#1d5fe5]"
                        />
                      </label>

                      <label className="flex items-center justify-between gap-2 rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3 cursor-pointer">
                        <div>
                          <div className="text-[12px] font-semibold text-[#0b1c30]">Mở ngoài giờ (22h – 06h)</div>
                          <div className="text-[10px] text-[#8996a9]">Cảnh báo trung tâm an ninh 24/7</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={alerts.afterHours}
                          onChange={() => toggleAlert("afterHours")}
                          className="h-4 w-4 accent-[#1d5fe5]"
                        />
                      </label>
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
