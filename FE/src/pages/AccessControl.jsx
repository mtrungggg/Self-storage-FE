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

function AccessControl() {
  const navigate = useNavigate();
  const { t } = useLanguage();
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
    if (hasLiveRentals) {
      handleCheckIn();
    }
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
      setPinModal((m) => ({ ...m, error: t("auth.otp_placeholder", "Enter 6 digits") }));
      return;
    }
    if (!/^\d{6}$/.test(pinModal.currentPin)) {
      setPinModal((m) => ({ ...m, error: t("auth.otp_placeholder", "Enter current 6 digits") }));
      return;
    }
    const weakPins = ["012345", "123456", "234567", "345678", "456789", "567890", "987654", "876543", "765432", "654321", "543210", "098765"];
    if (/^(\d)\1{5}$/.test(trimmed) || weakPins.includes(trimmed) || trimmed === pinModal.currentPin) {
      setPinModal((m) => ({ ...m, error: t("common.error", "Invalid PIN pattern") }));
      return;
    }
    pinLock.current = true;
    setPinModal((m) => ({ ...m, loading: true, error: "" }));
    try {
      const result = await handleChangePin(trimmed, pinModal.currentPin);
      setPinResult({ ...result, unitCode: activeUnitCode });
      setPinModal(null);
    } catch (err) {
      setPinModal((m) => ({ ...m, loading: false, error: err?.message || t("common.error", "Failed to update PIN") }));
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
      title: `${t("common.unit", "Unit")} ${r.unitCode}`,
      description: r.facilityName || "",
      media: r.imageUrl || r.image || UNIT_PHOTOS[idx % UNIT_PHOTOS.length],
    }));
  }, [effectiveRentals, t]);

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
        className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 lg:px-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-[22px] sm:text-[24px] font-bold tracking-[-0.02em] text-[#0b1c30]">
              {t("access.title", "Access Control & PIN")}
            </h1>
          </div>
        </div>

        {isSuspended && (
          <div className="mt-4 rounded-[14px] border border-[#fecdca] bg-[#fff5f5] p-5 shadow-[0_4px_16px_rgba(229,72,77,0.08)]">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fee4e2] text-[#e5484d]">
                <span className="material-symbols-outlined text-[24px]">lock</span>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-[15px] font-bold text-[#b3261e]">
                    {t("access.lock_status_locked", "Access Suspended")}
                  </h2>
                  <span className="rounded-full border border-[#fecdca] bg-[#fdecec] px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#b3261e]">
                    {t("status.delinquent", "Suspended")}
                  </span>
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[#7a271a]">
                  {credentials?.suspendedReason || t("billing.overdue_notice", "Unit access suspended due to overdue payment")}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/billing")}
                    className="inline-flex items-center gap-2 rounded-[9px] bg-[#d92d20] px-4 py-2.5 text-[13px] font-bold text-white shadow-sm transition hover:bg-[#b42318]"
                  >
                    <span className="material-symbols-outlined text-[18px]">payments</span>
                    <span>{t("billing.pay_now", "Pay Now")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/support")}
                    className="inline-flex items-center gap-2 rounded-[9px] border border-[#fecdca] bg-white px-4 py-2.5 text-[13px] font-bold text-[#7a271a] hover:bg-[#fff1f1]"
                  >
                    <span className="material-symbols-outlined text-[18px]">support_agent</span>
                    <span>{t("nav.support", "Support")}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isAwaitingCheckIn && credentialsError && (
          <div className="mt-4 rounded-[12px] border border-[#fecdca] bg-[#fff1f1] px-4 py-3 text-[13px] font-semibold text-[#b3261e]">
            {credentialsError}
          </div>
        )}

        {rentalsLoading && (
          <div className="mt-6 flex items-center gap-2 rounded-[14px] border border-[#dfe7f5] bg-white p-4 text-[13px] text-[#58657a]">
            <span className="material-symbols-outlined animate-spin text-[18px] text-zinc-900 dark:text-zinc-100">progress_activity</span>
            {t("common.loading", "Loading...")}
          </div>
        )}

        {hasLiveRentals ? (
          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 shadow-md">
            <AccessUnitGallery
              slides={luminaSlides}
              selectedIndex={selectedSlideIndex}
              onSelect={setSelectedRentalId}
            />
          </div>
        ) : !rentalsLoading && (
          <div className="mt-5 rounded-2xl border border-dashed border-[#dfe7f5] bg-white p-8 text-center">
            <span className="material-symbols-outlined text-[32px] text-[#8996a9]">warehouse</span>
            <p className="mt-2 text-sm font-semibold text-[#3a475a]">{t("my_units.empty_contracts", "No active storage unit")}</p>
            <button onClick={() => navigate("/")} className="mt-4 rounded-lg bg-zinc-900 text-white px-4 py-2 text-sm font-semibold text-white">
              {t("my_units.rent_btn", "Rent Unit")}
            </button>
          </div>
        )}

        {hasLiveRentals && (
          <UnitInformation rental={currentUnit} className="mt-5" />
        )}

        {hasLiveRentals && (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeRentalId}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
                <div>
                  <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)] transition-all duration-300">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="text-[15px] font-bold text-[#0b1c30]">{t("access.pin_display", "Keypad PIN Code")}</div>
                        {currentFacilityCheckIn || selectedRental?.checkedInAt ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-[#abefc6] bg-[#ecfdf3] px-2.5 py-0.5 text-[10px] font-bold text-[#027a48]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#12b76a]" />
                            {t("status.checked_in", "Checked In")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                            {t("status.awaiting_checkin", "Chờ nhận kho")}
                          </span>
                        )}
                      </div>
                      <span className="rounded-full bg-[#eef4ff] px-2.5 py-0.5 text-[11px] font-bold text-zinc-900 dark:text-zinc-100">
                        {t("common.unit", "Unit")} {activeUnitCode}
                      </span>
                    </div>

                    <div className="mt-3.5 flex items-center gap-3.5 rounded-xl border border-[#dfe7f5] bg-[#f8faff] p-2.5">
                      <img
                        src={currentUnit?.image || UNIT_PHOTOS[selectedSlideIndex % UNIT_PHOTOS.length]}
                        alt={`Unit ${activeUnitCode}`}
                        className="h-16 w-24 rounded-lg object-cover shadow-xs border border-white shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-[14px] font-bold text-[#0b1c30]">
                            {t("common.unit", "Unit")} {activeUnitCode}
                          </span>
                          {currentUnit?.facilityName && (
                            <span className="rounded bg-white px-2 py-0.5 text-[10px] font-semibold text-[#58657a] border border-[#dfe7f5]">
                              {currentUnit.facilityName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {isSuspended ? (
                      <div className="mt-4 rounded-[12px] border border-[#fecdca] bg-[#fff5f5] p-5 text-center">
                        <div className="flex items-center justify-center gap-2 text-[15px] font-bold text-[#b3261e]">
                          <span className="material-symbols-outlined text-[22px]">lock</span>
                          <span>{t("access.lock_status_locked", "PIN CODE SUSPENDED")}</span>
                        </div>
                        <p className="mt-2 text-[12px] leading-relaxed text-[#7a271a]">
                          {t("billing.overdue_notice", "Unit access suspended")}
                        </p>
                        <button
                          type="button"
                          onClick={() => navigate("/billing")}
                          className="mt-3.5 inline-flex items-center gap-1.5 rounded-[8px] bg-[#d92d20] px-4 py-2 text-[12px] font-bold text-white transition hover:bg-[#b42318]"
                        >
                          <span className="material-symbols-outlined text-[16px]">credit_card</span>
                          <span>{t("billing.pay_now", "Billing")}</span>
                        </button>
                      </div>
                    ) : isAwaitingCheckIn || (!displayPin && !credentialsLoading) ? (
                      <div className="mt-4 rounded-[14px] border border-blue-200 bg-blue-50/70 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                            <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-[13px] font-bold text-blue-900">
                                {t("access.awaiting_checkin_title", "Kho mới đặt — Đang chờ Check-in nhận kho")}
                              </span>
                              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-800">
                                {t("status.awaiting_checkin", "Chờ nhận kho")}
                              </span>
                            </div>
                            <p className="mt-1 text-[12px] leading-relaxed text-blue-800">
                              {t(
                                "access.awaiting_checkin_desc",
                                "Theo quy trình vận hành kho (BR-RSV-04), mã PIN mở khóa sẽ tự động kích hoạt ngay sau khi bạn làm thủ tục nhận kho tại cơ sở. Vui lòng sử dụng Thẻ mở kho & QR để làm thủ tục."
                              )}
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={handleOpenCheckInQr}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-[12px] font-bold text-white shadow-sm transition hover:bg-blue-700"
                              >
                                <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
                                <span>{t("access.open_qr_pass", "Mở Thẻ mở kho & QR")}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-4">
                        <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">{t("access.pin_display", "Main PIN Code")}</div>
                        <div className="mt-2 flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-2 text-[20px] font-bold tracking-[0.25em] text-[#0b1c30] min-h-[36px]">
                            {credentialsLoading ? (
                              <span className="text-[13px] font-medium tracking-normal text-[#8996a9] animate-pulse">
                                {t("common.loading", "Loading...")}
                              </span>
                            ) : (
                              <>
                                <motion.span
                                  key={showPin ? "show" : "hide"}
                                  initial={{ opacity: 0, filter: "blur(4px)" }}
                                  animate={{ opacity: 1, filter: "blur(0px)" }}
                                  transition={{ duration: 0.18 }}
                                >
                                  {showPin ? displayPin : displayPin.replace(/./g, "•")}
                                </motion.span>
                                <button
                                  type="button"
                                  onClick={() => setShowPin((v) => !v)}
                                  className="material-symbols-outlined text-[18px] text-[#8996a9] hover:text-[#0b1c30] transition-colors"
                                >
                                  {showPin ? "visibility_off" : "visibility"}
                                </button>
                              </>
                            )}
                          </div>
                          <div className="ml-auto flex items-center gap-2">
                            <button
                              type="button"
                              onClick={openPinModal}
                              disabled={!credentials}
                              className="flex items-center gap-1 rounded-md border border-[#dfe7f5] bg-white px-3 py-1.5 text-[11px] font-semibold text-zinc-900 dark:text-zinc-100 hover:bg-[#f5f7fd] disabled:opacity-50 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[14px]">autorenew</span>
                              {t("access.generate_new_pin", "Change PIN")}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <aside>
                  <button
                    type="button"
                    onClick={handleOpenCheckInQr}
                    disabled={!selectedRentalId || credentialsLoading || isSuspended || navigatingOut}
                    className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white transition ${
                      isSuspended
                        ? "bg-[#b3261e] opacity-80 cursor-not-allowed"
                        : "bg-zinc-900 text-white hover:bg-zinc-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                      {isSuspended ? "lock" : navigatingOut ? "progress_activity" : "qr_code_2"}
                    </span>
                    {isSuspended
                      ? t("access.lock_status_locked", "Access Suspended")
                      : credentialsLoading
                      ? t("common.loading", "Loading...")
                      : navigatingOut
                      ? t("common.loading", "Opening Pass...")
                      : t("my_units.storage_pass", "Storage Pass")}
                  </button>

                  {credentials?.suspendedReason && (
                    <p role="alert" className="mt-2 text-sm text-red-600">
                      {credentials.suspendedReason}
                    </p>
                  )}
                </aside>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </motion.main>

      {pinResult && (
        <div role="status" className="mx-auto mb-4 w-full max-w-[1280px] px-4 text-sm text-[#0e7b4c]">
          {t("common.unit", "Unit")} {pinResult.unitCode}: {pinResult.message || t("common.success", "PIN updated")}
        </div>
      )}

      <Footer />

      {pinModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && closePinModal()}
          >
            <div className="w-full max-w-[380px] rounded-[20px] border border-[#dfe7f5] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.14)] animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[16px] font-bold text-[#0b1c30]">{t("access.generate_new_pin", "Change PIN")}</div>
                  <div className="mt-0.5 text-[12px] text-[#8996a9]">{t("common.unit", "Unit")} {activeUnitCode}</div>
                </div>
                <button
                  onClick={closePinModal}
                  className="material-symbols-outlined text-[20px] text-[#8996a9] hover:text-[#0b1c30]"
                >
                  close
                </button>
              </div>

              <div className="mt-5">
                <label className="block text-sm">
                  {t("my_units.current_pin", "Current PIN")}
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
                    className="mb-3 mt-1 w-full rounded-lg border p-3"
                  />
                </label>
                <label htmlFor="new-keypad-pin" className="block text-sm">
                  {t("access.temporary_pin", "New PIN")}
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
                  placeholder={t("auth.otp_placeholder", "Enter 6 digits")}
                  className="w-full rounded-[12px] border border-[#dfe7f5] bg-[#f8faff] px-4 py-3 text-center text-[22px] font-bold tracking-[0.3em] text-[#0b1c30] outline-none focus:border-zinc-900 dark:border-zinc-100 focus:bg-white focus:ring-4 focus:ring-zinc-900/20 dark:ring-zinc-100/20/10 transition"
                  autoFocus
                />
                {pinModal.error && (
                  <div className="mt-2 text-[12px] font-semibold text-[#b3261e]">{pinModal.error}</div>
                )}
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  onClick={closePinModal}
                  className="flex-1 rounded-[10px] border border-[#dfe7f5] bg-white py-2.5 text-[13px] font-semibold text-[#3a475a] transition hover:bg-[#f8faff]"
                >
                  {t("common.cancel", "Cancel")}
                </button>
                <button
                  onClick={submitPinChange}
                  disabled={pinModal.loading || pinModal.newPin.length !== 6 || pinModal.currentPin.length !== 6}
                  className="flex-1 rounded-[10px] bg-zinc-900 text-white py-2.5 text-[13px] font-bold text-white shadow transition hover:bg-[#154ec1] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {pinModal.loading ? t("common.loading", "Saving...") : t("common.confirm", "Confirm PIN")}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

export default AccessControl;
