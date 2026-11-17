import { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAccessControl } from "../hooks/useAccessControl";
import { useLanguage } from "../context/LanguageContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageBackground from "../components/PageBackground";
import { FACILITY_GALLERY_PHOTOS as UNIT_PHOTOS } from "../constants/assets";

import AccessUnitGallery from "../components/AccessUnitGallery";
import UnitInformation from "../components/UnitInformation";
import AuthorizedMembersPanel from "../components/AuthorizedMembersPanel";

export default function AccessControl() {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const isVi = lang === "vi";
  const label = (vi, en) => (isVi ? vi : en);

  const {
    rentalsLoading,
    activeRentals,
    selectedRental,
    selectedRentalId,
    setSelectedRentalId,
    currentUnitCode,
    currentFacilityCheckIn,
    showPin,
    setShowPin,
    credentials,
    credentialsLoading,
    credentialsError,
    handleCheckIn,
    handleChangePin,
    authorizedMembers,
    membersLoading,
    membersError,
    handleAddAuthorizedMember,
    handleRevokeAuthorizedMember,
  } = useAccessControl();

  const isSuspended =
    credentials?.status?.toLowerCase() === "suspended" ||
    Boolean(credentials?.suspendedReason) ||
    selectedRental?.status?.toLowerCase() === "suspended" ||
    Boolean(selectedRental?.isOverdue);

  const isAwaitingCheckIn =
    Boolean(selectedRental) &&
    (Boolean(selectedRental.isReservationFallback) ||
      selectedRental.status?.toLowerCase() === "draft" ||
      (!selectedRental.checkedInAt && selectedRental.status?.toLowerCase() !== "active"));

  const [pinModal, setPinModal] = useState(null);
  const pinLock = useRef(false);
  const [pinResult, setPinResult] = useState(null);
  const [navigatingOut, setNavigatingOut] = useState(false);

  const openPinModal = () => {
    setPinResult(null);
    setPinModal({ currentPin: "", newPin: "", error: "", loading: false });
  };

  const closePinModal = () => {
    if (!pinLock.current) setPinModal(null);
  };

  const handleOpenCheckInQr = () => {
    if (isSuspended || navigatingOut) return;
    if (hasLiveRentals) handleCheckIn();
    setNavigatingOut(true);
    const targetAgreementId = selectedRentalId || activeRentalId || 1001;
    setTimeout(() => {
      navigate(`/storage-pass?agreementId=${targetAgreementId}`);
    }, 280);
  };

  const submitPinChange = async () => {
    if (!pinModal || pinLock.current) return;
    const trimmed = pinModal.newPin.trim();
    if (!/^\d{6}$/.test(trimmed)) {
      setPinModal((m) => ({ ...m, error: label("Vui lòng nhập đủ 6 chữ số", "Enter 6 digits") }));
      return;
    }
    if (!/^\d{6}$/.test(pinModal.currentPin)) {
      setPinModal((m) => ({ ...m, error: label("Vui lòng nhập mã PIN hiện tại (6 số)", "Enter current 6 digits") }));
      return;
    }
    const weakPins = ["012345", "123456", "234567", "345678", "456789", "567890", "987654", "876543", "765432", "654321", "543210", "098765"];
    if (/^(\d)\1{5}$/.test(trimmed) || weakPins.includes(trimmed) || trimmed === pinModal.currentPin) {
      setPinModal((m) => ({ ...m, error: label("Mã PIN quá đơn giản hoặc trùng mã cũ", "Invalid PIN pattern or matches current") }));
      return;
    }
    pinLock.current = true;
    setPinModal((m) => ({ ...m, loading: true, error: "" }));
    try {
      const result = await handleChangePin(trimmed, pinModal.currentPin);
      setPinResult({ ...result, unitCode: activeUnitCode });
      setPinModal(null);
    } catch (err) {
      setPinModal((m) => ({
        ...m,
        loading: false,
        error: err?.message || label("Không thể cập nhật mã PIN", "Failed to update PIN"),
      }));
    } finally {
      pinLock.current = false;
    }
  };

  const hasLiveRentals = Boolean(activeRentals && activeRentals.length > 0);
  const effectiveRentals = activeRentals;
  const activeRentalId = selectedRentalId || effectiveRentals[0]?.agreementId || null;
  const currentUnit = useMemo(
    () => effectiveRentals.find((r) => r.agreementId === activeRentalId) || effectiveRentals[0],
    [effectiveRentals, activeRentalId]
  );
  const activeUnitCode = currentUnitCode || currentUnit?.unitCode || "";

  const luminaSlides = useMemo(() => {
    return effectiveRentals.map((r, idx) => ({
      id: r.agreementId,
      unitCode: r.unitCode,
      title: `${label("Ô kho", "Unit")} ${r.unitCode}`,
      description: r.facilityName || "",
      media: r.imageUrl || r.image || UNIT_PHOTOS[idx % UNIT_PHOTOS.length],
    }));
  }, [effectiveRentals, isVi]);

  const selectedSlideIndex = useMemo(() => {
    const idx = effectiveRentals.findIndex((r) => r.agreementId === activeRentalId);
    return idx >= 0 ? idx : 0;
  }, [effectiveRentals, activeRentalId]);

  const displayPin = credentials?.keypadPin || "";

  return (
    <div className="relative flex min-h-screen flex-col text-[#0b1c30]">
      <PageBackground />
      <Header active="access" />

      <motion.main
        initial={{ opacity: 0, y: 14 }}
        animate={{
          opacity: navigatingOut ? 0 : 1,
          y: navigatingOut ? -14 : 0,
          filter: navigatingOut ? "blur(4px)" : "blur(0px)",
        }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 space-y-6"
      >
        {/* Page Title Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-zinc-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
              {label("Kiểm soát ra vào & Mã PIN", "Access Control & Keypad PIN")}
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
              {label(
                "Xem mã PIN mở khóa, thẻ truy cập QR và quản lý danh sách thành viên ủy quyền mở ô kho.",
                "View keypad unlock PIN, digital QR storage pass, and manage shared access members."
              )}
            </p>
          </div>
          {activeUnitCode && (
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-blue-700 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300">
              <span className="material-symbols-outlined text-[16px]">key</span>
              <span>{label("Ô kho đang chọn:", "Selected Unit:")} {activeUnitCode}</span>
            </div>
          )}
        </div>

        {/* Suspended Access Banner */}
        {isSuspended && (
          <div className="rounded-2xl border border-red-200 bg-red-50/90 p-5 shadow-xs dark:border-red-900/60 dark:bg-red-950/40">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/60 dark:text-red-400">
                <span className="material-symbols-outlined text-[22px]">lock</span>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-sm font-bold text-red-900 dark:text-red-200">
                    {label("Quyền truy cập đang bị tạm khóa", "Access Suspended")}
                  </h2>
                  <span className="rounded-full border border-red-200 bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-700 dark:border-red-800 dark:bg-zinc-900 dark:text-red-300">
                    {label("Tạm khóa", "Suspended")}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-red-800 dark:text-red-300">
                  {credentials?.suspendedReason ||
                    label(
                      "Quyền mở khóa ô kho bị tạm dừng do có khoản thanh toán quá hạn hoặc yêu cầu từ quản trị viên.",
                      "Unit access suspended due to overdue payment or admin policy."
                    )}
                </p>
                <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => navigate("/billing")}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition"
                  >
                    <span className="material-symbols-outlined text-[16px]">payments</span>
                    <span>{label("Thanh toán ngay", "Pay Now")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/support")}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3.5 py-2 text-xs font-bold text-red-800 hover:bg-red-50 transition dark:bg-zinc-900 dark:border-red-800 dark:text-red-300"
                  >
                    <span className="material-symbols-outlined text-[16px]">support_agent</span>
                    <span>{label("Liên hệ hỗ trợ", "Support")}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Credentials Error */}
        {!isAwaitingCheckIn && credentialsError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
            {credentialsError}
          </div>
        )}

        {/* Loading state */}
        {rentalsLoading && (
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-5 text-xs text-slate-500 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <span className="material-symbols-outlined animate-spin text-[18px] text-zinc-900 dark:text-zinc-100">
              progress_activity
            </span>
            {label("Đang tải danh sách ô kho của bạn...", "Loading your units...")}
          </div>
        )}

        {/* Unit Selection Gallery */}
        {hasLiveRentals ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-xs dark:border-zinc-800">
            <AccessUnitGallery
              slides={luminaSlides}
              selectedIndex={selectedSlideIndex}
              onSelect={setSelectedRentalId}
            />
          </div>
        ) : (
          !rentalsLoading && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <span className="material-symbols-outlined text-[36px] text-slate-400">warehouse</span>
              <p className="mt-2 text-sm font-bold text-slate-800 dark:text-zinc-200">
                {label("Bạn chưa có hợp đồng thuê ô kho nào đang hoạt động", "No active storage unit found")}
              </p>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="mt-4 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-zinc-800 transition dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                {label("Đặt thuê kho ngay", "Rent Unit Now")}
              </button>
            </div>
          )
        )}

        {/* Unit Details Card (Cleaned Size Tier) */}
        {hasLiveRentals && <UnitInformation rental={currentUnit} />}

        {/* 2-Column Balanced Grid: Left (PIN & Storage Pass) - Right (Shared Unit Access) */}
        {hasLiveRentals && (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeRentalId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Column 1 (Left lg:col-span-5): Thẻ truy cập & Mã PIN (Unlock PIN & Storage Pass) */}
                <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-zinc-800">
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-100 dark:border-blue-900">
                          <span className="material-symbols-outlined text-[20px]">dialpad</span>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                            {label("Mã PIN mở khóa", "Unlock PIN Code")}
                          </h3>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                            {label("Bàn phím số tại cửa ô kho", "Keypad door lock")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {currentFacilityCheckIn || selectedRental?.checkedInAt ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            {label("Đã nhận kho", "Checked In")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                            {label("Chờ nhận kho", "Awaiting Check-in")}
                          </span>
                        )}
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-800 dark:bg-zinc-800 dark:text-zinc-200">
                          {activeUnitCode}
                        </span>
                      </div>
                    </div>

                    {/* Unit Mini Banner */}
                    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 dark:border-zinc-800 dark:bg-zinc-800/40">
                      <img
                        src={currentUnit?.imageUrl || currentUnit?.image || UNIT_PHOTOS[selectedSlideIndex % UNIT_PHOTOS.length]}
                        alt={`Unit ${activeUnitCode}`}
                        className="h-14 w-20 rounded-lg object-cover shadow-2xs border border-white dark:border-zinc-700 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
                          {label("Ô kho", "Unit")} {activeUnitCode}
                        </div>
                        <div className="mt-0.5 text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                          {currentUnit?.facilityName || label("Cơ sở lưu trữ", "Self Storage Facility")}
                        </div>
                      </div>
                    </div>

                    {/* PIN State Body */}
                    {isSuspended ? (
                      <div className="rounded-xl border border-red-200 bg-red-50/80 p-4 text-center dark:border-red-900/60 dark:bg-red-950/40">
                        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-red-700 dark:text-red-400">
                          <span className="material-symbols-outlined text-[18px]">lock</span>
                          <span>{label("MÃ PIN ĐANG BỊ KHÓA", "PIN CODE SUSPENDED")}</span>
                        </div>
                        <p className="mt-1.5 text-[11px] leading-relaxed text-red-600 dark:text-red-300">
                          {label("Vui lòng thanh toán hóa đơn để mở khóa quyền truy cập.", "Please settle overdue invoices to restore access.")}
                        </p>
                        <button
                          type="button"
                          onClick={() => navigate("/billing")}
                          className="mt-3 inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-red-700"
                        >
                          <span className="material-symbols-outlined text-[14px]">credit_card</span>
                          <span>{label("Xem hóa đơn", "Billing")}</span>
                        </button>
                      </div>
                    ) : isAwaitingCheckIn ? (
                      <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 dark:border-blue-900/60 dark:bg-blue-950/40">
                        <div className="flex items-start gap-2.5">
                          <span className="material-symbols-outlined text-[20px] text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                            how_to_reg
                          </span>
                          <div className="text-xs">
                            <span className="font-bold text-blue-950 dark:text-blue-200">
                              {label("Đang chờ làm thủ tục nhận kho", "Awaiting Check-in")}
                            </span>
                            <p className="mt-1 text-[11px] leading-relaxed text-blue-800 dark:text-blue-300">
                              {label(
                                "Mã PIN mở khóa sẽ được kích hoạt ngay khi bạn hoàn tất check-in nhận kho tại cơ sở. Bạn có thể bấm nút Thẻ ra vào bên dưới để làm thủ tục.",
                                "Keypad PIN will activate upon facility check-in. Use your Storage Pass below to complete check-in."
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
                        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                          <span>{label("Mã PIN hiện tại", "Current Unlock PIN")}</span>
                          <button
                            type="button"
                            onClick={openPinModal}
                            disabled={!credentials}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-[14px]">edit</span>
                            <span>{label("Tạo mã PIN mới", "Generate New PIN")}</span>
                          </button>
                        </div>

                        <div className="mt-2.5 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            {credentialsLoading ? (
                              <span className="text-xs font-medium text-slate-400 animate-pulse">
                                {label("Đang tải...", "Loading PIN...")}
                              </span>
                            ) : (
                              <>
                                <motion.span
                                  key={showPin ? "show" : "hide"}
                                  initial={{ opacity: 0, filter: "blur(4px)" }}
                                  animate={{ opacity: 1, filter: "blur(0px)" }}
                                  transition={{ duration: 0.18 }}
                                  className="font-mono text-2xl font-black tracking-[0.3em] text-slate-900 dark:text-zinc-100"
                                >
                                  {showPin ? displayPin : displayPin.replace(/./g, "•")}
                                </motion.span>
                                <button
                                  type="button"
                                  onClick={() => setShowPin((v) => !v)}
                                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition cursor-pointer"
                                  title={showPin ? label("Ẩn mã PIN", "Hide PIN") : label("Hiện mã PIN", "Show PIN")}
                                >
                                  <span className="material-symbols-outlined text-[20px]">
                                    {showPin ? "visibility_off" : "visibility"}
                                  </span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Storage Pass & PIN QR Button */}
                  <div className="mt-5 border-t border-slate-100 pt-4 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={handleOpenCheckInQr}
                      disabled={!selectedRentalId || credentialsLoading || isSuspended || navigatingOut}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold transition shadow-xs cursor-pointer ${
                        isSuspended
                          ? "bg-red-600 text-white opacity-80 cursor-not-allowed"
                          : "bg-zinc-900 text-white hover:bg-zinc-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                        {isSuspended ? "lock" : navigatingOut ? "progress_activity" : "qr_code_2"}
                      </span>
                      <span>
                        {isSuspended
                          ? label("Quyền truy cập bị tạm khóa", "Access Suspended")
                          : credentialsLoading
                          ? label("Đang tải dữ liệu...", "Loading...")
                          : navigatingOut
                          ? label("Đang mở thẻ...", "Opening Pass...")
                          : label("Thẻ truy cập QR / Storage Pass & PIN", "Storage Pass & PIN (QR)")}
                      </span>
                    </button>
                    <p className="mt-2 text-center text-[11px] text-slate-500 dark:text-zinc-400">
                      {label(
                        "Quét mã QR tại cổng kiểm soát ra vào và quầy làm việc cơ sở",
                        "Scan QR pass at facility security gates and counter"
                      )}
                    </p>
                  </div>
                </div>

                {/* Column 2 (Right lg:col-span-7): Chia sẻ quyền truy cập (Shared Unit Access) */}
                <div className="lg:col-span-7">
                  <AuthorizedMembersPanel
                    members={authorizedMembers}
                    loading={membersLoading}
                    error={membersError}
                    agreementStatus={selectedRental?.status}
                    onAddMember={handleAddAuthorizedMember}
                    onRevokeMember={handleRevokeAuthorizedMember}
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* PIN Update Result Feedback */}
        {pinResult && (
          <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-medium text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200 flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
            <span>
              {label("Ô kho", "Unit")} {pinResult.unitCode}: {pinResult.message || label("Đã cập nhật mã PIN thành công.", "PIN updated successfully.")}
            </span>
          </div>
        )}
      </motion.main>

      <Footer />

      {/* PIN Change Modal */}
      {pinModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150"
            onClick={(e) => e.target === e.currentTarget && closePinModal()}
          >
            <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-zinc-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                    {label("Đổi mã PIN mở khóa", "Change Keypad PIN")}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    {label("Ô kho", "Unit")} {activeUnitCode}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closePinModal}
                  className="rounded-lg p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="mb-1 block font-semibold text-slate-700 dark:text-zinc-300">
                    {label("Mã PIN hiện tại", "Current PIN")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    disabled={pinModal.loading}
                    value={pinModal.currentPin}
                    onChange={(e) =>
                      setPinModal((m) => ({
                        ...m,
                        currentPin: e.target.value.replace(/\D/g, "").slice(0, 6),
                      }))
                    }
                    placeholder="••••••"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-center font-mono text-base font-bold tracking-[0.2em] outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label htmlFor="new-keypad-pin" className="mb-1 block font-semibold text-slate-700 dark:text-zinc-300">
                    {label("Mã PIN mới (6 chữ số)", "New PIN (6 digits)")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="new-keypad-pin"
                    disabled={pinModal.loading}
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={pinModal.newPin}
                    onChange={(e) =>
                      setPinModal((m) => ({
                        ...m,
                        newPin: e.target.value.replace(/\D/g, "").slice(0, 6),
                      }))
                    }
                    onKeyDown={(e) => e.key === "Enter" && submitPinChange()}
                    placeholder={label("Nhập 6 số mới", "Enter 6 digits")}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-center font-mono text-base font-bold tracking-[0.2em] outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    autoFocus
                  />
                </div>

                {pinModal.error && (
                  <div className="rounded-lg bg-red-50 p-2 text-[11px] font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300">
                    {pinModal.error}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={closePinModal}
                  className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  {label("Hủy bỏ", "Cancel")}
                </button>
                <button
                  type="button"
                  onClick={submitPinChange}
                  disabled={pinModal.loading || pinModal.newPin.length !== 6 || pinModal.currentPin.length !== 6}
                  className="rounded-xl bg-zinc-900 px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-zinc-800 disabled:opacity-50 transition cursor-pointer dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                >
                  {pinModal.loading
                    ? label("Đang lưu...", "Saving...")
                    : label("Xác nhận đổi PIN", "Confirm PIN")}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
