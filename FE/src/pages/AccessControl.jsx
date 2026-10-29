import { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAccessControl } from "../hooks/useAccessControl";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageBackground from "../components/PageBackground";
import { Component as LuminaInteractiveList } from "../components/ui/lumina-interactive-list";
import { FACILITY_GALLERY_PHOTOS as UNIT_PHOTOS } from "../constants/assets";

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

  // Custom PIN change modal
  const [pinModal, setPinModal] = useState(null); // { currentPin, newPin, error, loading }
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
      setPinModal((m) => ({ ...m, error: "PIN code must be exactly 6 digits." }));
      return;
    }
    if (!/^\d{6}$/.test(pinModal.currentPin)) {
      setPinModal((m) => ({ ...m, error: "Enter your current 6-digit PIN." }));
      return;
    }
    const weakPins = ["012345", "123456", "234567", "345678", "456789", "567890", "987654", "876543", "765432", "654321", "543210", "098765"];
    if (/^(\d)\1{5}$/.test(trimmed) || weakPins.includes(trimmed) || trimmed === pinModal.currentPin) {
      setPinModal((m) => ({ ...m, error: "Choose a different PIN without repeated or sequential digits." }));
      return;
    }
    pinLock.current = true;
    setPinModal((m) => ({ ...m, loading: true, error: "" }));
    try {
      const result = await handleChangePin(trimmed, pinModal.currentPin);
      setPinResult({ ...result, unitCode: activeUnitCode });
      setPinModal(null);
    } catch (err) {
      setPinModal((m) => ({ ...m, loading: false, error: err?.message || "Failed to update PIN code." }));
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
      title: `Unit ${r.unitCode}`,
      description: r.facilityName || "",
      media: r.image || UNIT_PHOTOS[idx % UNIT_PHOTOS.length],
    }));
  }, [effectiveRentals]);

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
        {/* Page Header & Unit Dropdown Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-[22px] sm:text-[24px] font-bold tracking-[-0.02em] text-[#0b1c30]">
              Access Control &amp; Keypad PIN
            </h1>
          </div>
        </div>

        {/* Lockout Warning Banner when agreement/credentials are suspended */}
        {isSuspended && (
          <div className="mt-4 rounded-[14px] border border-[#fecdca] bg-[#fff5f5] p-5 shadow-[0_4px_16px_rgba(229,72,77,0.08)]">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fee4e2] text-[#e5484d]">
                <span className="material-symbols-outlined text-[24px]">lock</span>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-[15px] font-bold text-[#b3261e]">
                    Your unit access is temporarily suspended due to overdue payment
                  </h2>
                  <span className="rounded-full border border-[#fecdca] bg-[#fdecec] px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#b3261e]">
                    Suspended
                  </span>
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[#7a271a]">
                  System and facility management have temporarily suspended keypad PIN access for unit <strong>{activeUnitCode || "your unit"}</strong> due to overdue rental payment.
                  {credentials?.suspendedReason ? ` (Details: ${credentials.suspendedReason}) ` : " "}
                  Please settle outstanding rental fees and penalties to automatically restore access immediately.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/billing")}
                    className="inline-flex items-center gap-2 rounded-[9px] bg-[#d92d20] px-4 py-2.5 text-[13px] font-bold text-white shadow-sm transition hover:bg-[#b42318]"
                  >
                    <span className="material-symbols-outlined text-[18px]">payments</span>
                    <span>Pay Overdue Fees</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/support")}
                    className="inline-flex items-center gap-2 rounded-[9px] border border-[#fecdca] bg-white px-4 py-2.5 text-[13px] font-bold text-[#7a271a] hover:bg-[#fff1f1]"
                  >
                    <span className="material-symbols-outlined text-[18px]">support_agent</span>
                    <span>Contact Support</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {credentialsError && (
          <div className="mt-4 rounded-[12px] border border-[#fecdca] bg-[#fff1f1] px-4 py-3 text-[13px] font-semibold text-[#b3261e]">
            {credentialsError}
          </div>
        )}

        {rentalsLoading && (
          <div className="mt-6 flex items-center gap-2 rounded-[14px] border border-[#dfe7f5] bg-white p-4 text-[13px] text-[#58657a]">
            <span className="material-symbols-outlined animate-spin text-[18px] text-[#1d5fe5]">progress_activity</span>
            Loading access credentials...
          </div>
        )}

        {hasLiveRentals ? (
          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 shadow-md">
            <LuminaInteractiveList
              slides={luminaSlides}
              initialIndex={selectedSlideIndex}
              onSlideChange={(_idx, slide) => {
                if (slide?.id) setSelectedRentalId(slide.id);
              }}
            />
          </div>
        ) : !rentalsLoading && (
          <div className="mt-5 rounded-2xl border border-dashed border-[#dfe7f5] bg-white p-8 text-center">
            <span className="material-symbols-outlined text-[32px] text-[#8996a9]">warehouse</span>
            <p className="mt-2 text-sm font-semibold text-[#3a475a]">No active storage unit.</p>
            <button onClick={() => navigate("/")} className="mt-4 rounded-lg bg-[#1d5fe5] px-4 py-2 text-sm font-semibold text-white">Rent a unit</button>
          </div>
        )}

        {/* Selected unit details */}
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
                {/* LEFT: PIN card */}
                <div>
                  <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)] transition-all duration-300">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="text-[15px] font-bold text-[#0b1c30]">Keypad PIN Code</div>
                        {currentFacilityCheckIn && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-[#abefc6] bg-[#ecfdf3] px-2.5 py-0.5 text-[10px] font-bold text-[#027a48]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#12b76a]" />
                            Facility Checked-In
                          </span>
                        )}
                      </div>
                      <span className="rounded-full bg-[#eef4ff] px-2.5 py-0.5 text-[11px] font-bold text-[#1d5fe5]">
                        Unit {activeUnitCode}
                      </span>
                    </div>

                    {/* Selected Unit Visual Banner */}
                    <div className="mt-3.5 flex items-center gap-3.5 rounded-xl border border-[#dfe7f5] bg-[#f8faff] p-2.5">
                      <img
                        src={currentUnit?.image || UNIT_PHOTOS[selectedSlideIndex % UNIT_PHOTOS.length]}
                        alt={`Unit ${activeUnitCode}`}
                        className="h-16 w-24 rounded-lg object-cover shadow-xs border border-white shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-[14px] font-bold text-[#0b1c30]">
                            Unit {activeUnitCode}
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
                          <span>PIN CODE SUSPENDED DUE TO OVERDUE PAYMENT</span>
                        </div>
                        <p className="mt-2 text-[12px] leading-relaxed text-[#7a271a]">
                          Unit access is currently suspended. Please complete your outstanding payment to automatically restore your PIN.
                        </p>
                        <button
                          type="button"
                          onClick={() => navigate("/billing")}
                          className="mt-3.5 inline-flex items-center gap-1.5 rounded-[8px] bg-[#d92d20] px-4 py-2 text-[12px] font-bold text-white transition hover:bg-[#b42318]"
                        >
                          <span className="material-symbols-outlined text-[16px]">credit_card</span>
                          <span>Go to Billing</span>
                        </button>
                      </div>
                    ) : (
                      <div className="mt-4 rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-4">
                        <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">Main PIN Code</div>
                        <div className="mt-2 flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-2 text-[20px] font-bold tracking-[0.25em] text-[#0b1c30] min-h-[36px]">
                            {credentialsLoading ? (
                              <span className="text-[13px] font-medium tracking-normal text-[#8996a9] animate-pulse">
                                Loading PIN...
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
                              className="flex items-center gap-1 rounded-md border border-[#dfe7f5] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#1d5fe5] hover:bg-[#f5f7fd] disabled:opacity-50 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[14px]">autorenew</span>
                              Change PIN
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT: Access log + Check in QR button */}
                <aside>
                  <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)] transition-all duration-300">
                    <div className="flex items-center justify-between text-[13px] font-bold text-[#0b1c30]">
                      Access Activity Log
                    </div>

                    <div className="mt-3 space-y-2.5">
                      {accessLogs.length > 0 ? (
                        accessLogs.map((log, idx) => (
                          <div key={log.id || `${log.title}-${log.time}-${idx}`} className="flex items-center justify-between gap-2">
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
                        <div className="py-4 text-center text-[12px] text-[#8996a9]">
                          No access activity logs yet.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Button: Check in Pass -> Navigate to Storage Pass */}
                  <button
                    type="button"
                    onClick={handleOpenCheckInQr}
                    disabled={!selectedRentalId || credentialsLoading || isSuspended || navigatingOut}
                    className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white transition ${
                      isSuspended
                        ? "bg-[#b3261e] opacity-80 cursor-not-allowed"
                        : "bg-[#1d5fe5] hover:bg-[#1550c7] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                      {isSuspended ? "lock" : navigatingOut ? "progress_activity" : "qr_code_2"}
                    </span>
                    {isSuspended
                      ? "Access Suspended"
                      : credentialsLoading
                      ? "Loading..."
                      : navigatingOut
                      ? "Opening Pass..."
                      : "Check-in Pass (QR Code)"}
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
          Unit {pinResult.unitCode}: {pinResult.message || "PIN change accepted."}{" "}
          {pinResult.syncStatus && <span>Sync: {pinResult.syncStatus}. </span>}
          {pinResult.estimatedSyncSeconds > 0 && <span>Estimated sync: {pinResult.estimatedSyncSeconds} seconds.</span>}
        </div>
      )}
      <Footer />

      {/* PIN Change Modal */}
      {pinModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && closePinModal()}
          >
            <div className="w-full max-w-[380px] rounded-[20px] border border-[#dfe7f5] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.14)] animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[16px] font-bold text-[#0b1c30]">Change Keypad PIN</div>
                  <div className="mt-0.5 text-[12px] text-[#8996a9]">Unit {activeUnitCode}</div>
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
                  Current PIN
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
                  New PIN
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
                  placeholder="Enter 6 digits"
                  className="w-full rounded-[12px] border border-[#dfe7f5] bg-[#f8faff] px-4 py-3 text-center text-[22px] font-bold tracking-[0.3em] text-[#0b1c30] outline-none focus:border-[#1d5fe5] focus:bg-white focus:ring-4 focus:ring-[#1d5fe5]/10 transition"
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
                  Cancel
                </button>
                <button
                  onClick={submitPinChange}
                  disabled={pinModal.loading || pinModal.newPin.length !== 6 || pinModal.currentPin.length !== 6}
                  className="flex-1 rounded-[10px] bg-[#1d5fe5] py-2.5 text-[13px] font-bold text-white shadow transition hover:bg-[#154ec1] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {pinModal.loading ? "Saving..." : "Confirm PIN"}
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
