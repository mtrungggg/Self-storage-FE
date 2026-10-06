import { useRef, useState } from "react";
import { createPortal } from "react-dom";
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
    credentials,
    credentialsLoading,
    credentialsError,
    handleCheckIn,
    pinChanging,
    handleChangePin,
  } = useAccessControl();

  // Custom PIN change modal
  const [pinModal, setPinModal] = useState(null); // { newPin, error, loading }

  const pinLock = useRef(false);
  const [pinResult, setPinResult] = useState(null);
  const openPinModal = () => { setPinResult(null); setPinModal({ currentPin: "", newPin: "", error: "", loading: false }); };
  const closePinModal = () => { if (!pinLock.current) setPinModal(null); };

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
      setPinResult({ ...result, unitCode: currentUnitCode });
      setPinModal(null);
    } catch (err) {
      setPinModal((m) => ({ ...m, loading: false, error: err?.message || "Failed to update PIN code." }));
    } finally { pinLock.current = false; }
  };

  return (
    <div className="relative flex min-h-screen flex-col text-[#0b1c30]">
      <PageBackground />
      <Header active="access" />

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 lg:px-6">
        {/* Page title */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <h1 className="text-[22px] sm:text-[24px] font-bold tracking-[-0.02em] text-[#0b1c30]">
            Digital Keypad PIN
          </h1>
        </div>

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

        {!rentalsLoading && activeRentals.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center rounded-[16px] border border-[#dfe7f5] bg-white p-12 text-center shadow-sm">
            <span className="material-symbols-outlined text-[54px] text-[#1d5fe5]">key_off</span>
            <h2 className="mt-3 text-[19px] font-bold text-[#0b1c30]">
              No active storage units found
            </h2>
            <p className="mt-2 max-w-[460px] text-[13px] leading-relaxed text-[#58657a]">
              Your personal keypad PIN will automatically appear here once your rental agreement is active.
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-5 rounded-[10px] bg-[#1d5fe5] px-6 py-2.5 text-[13px] font-bold text-white shadow transition hover:bg-[#174fc7]"
            >
              Find &amp; Rent a Storage Unit
            </button>
          </div>
        ) : (
          !rentalsLoading && (
            <>
              {/* Rental selector tabs */}
              <div className="mt-5 flex flex-wrap items-center gap-2 rounded-[14px] border border-[#dfe7f5] bg-white p-3">
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
                    <div>{idx === 0 ? "Primary Unit" : `Unit ${idx + 1}`} {r.unitCode}</div>
                  
                  </button>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
                {/* LEFT: PIN card */}
                <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-[15px] font-bold text-[#0b1c30]">Keypad PIN Code</div>
                    <span className="rounded-full bg-[#eef4ff] px-2.5 py-0.5 text-[11px] font-bold text-[#1d5fe5]">
                      Unit {currentUnitCode}
                    </span>
                  </div>

                  <div className="mt-4 rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">Main PIN Code</div>
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
                      <div className="ml-auto">
                        <button
                          onClick={openPinModal}
                          disabled={!credentials}
                          className="flex items-center gap-1 rounded-md border border-[#dfe7f5] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#1d5fe5] hover:bg-[#f5f7fd] disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined text-[14px]">autorenew</span>
                          Change PIN
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT: Access log */}
                <aside>
                  <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
                    <div className="flex items-center justify-between text-[13px] font-bold text-[#0b1c30]">
                      Access Activity Log
                      <span className="text-[10px] font-semibold text-[#8996a9]">Live</span>
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
                        <div className="py-4 text-center text-[12px] text-[#8996a9]">
                          No access activity logs yet.
                        </div>
                      )}
                    </div>
                  </div>
                  <button type="button" onClick={handleCheckIn} disabled={!selectedRentalId || credentialsLoading} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1d5fe5] px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">login</span>
                    {credentialsLoading ? "Loading PIN..." : "Check in"}
                  </button>
                  <p className="mt-2 text-xs text-[#58657a]">View the access PIN for Unit {currentUnitCode}. This does not unlock the unit or record an entry.</p>
                  {credentials?.suspendedReason && <p role="alert" className="mt-2 text-sm text-red-600">{credentials.suspendedReason}</p>}
                </aside>
              </div>
            </>
          )
        )}
      </main>

      {pinResult && <div role="status" className="mx-auto mb-4 w-full max-w-[1280px] px-4 text-sm text-[#0e7b4c]">Unit {pinResult.unitCode}: {pinResult.message || "PIN change accepted."} {pinResult.syncStatus && <span>Sync: {pinResult.syncStatus}. </span>}{pinResult.estimatedSyncSeconds > 0 && <span>Estimated sync: {pinResult.estimatedSyncSeconds} seconds.</span>}</div>}
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
                  <div className="mt-0.5 text-[12px] text-[#8996a9]">Unit {currentUnitCode}</div>
                </div>
                <button
                  onClick={closePinModal}
                  className="material-symbols-outlined text-[20px] text-[#8996a9] hover:text-[#0b1c30]"
                >
                  close
                </button>
              </div>

              <div className="mt-5">
                <label className="block text-sm">Current PIN<input type="password" inputMode="numeric" maxLength={6} disabled={pinModal.loading} value={pinModal.currentPin} onChange={(e) => setPinModal((m) => ({ ...m, currentPin: e.target.value.replace(/\D/g, "").slice(0, 6) }))} className="mb-3 mt-1 w-full rounded-lg border p-3" /></label>
                <label htmlFor="new-keypad-pin" className="block text-sm">New PIN</label>
                <input id="new-keypad-pin" disabled={pinModal.loading}
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={pinModal.newPin}
                  onChange={(e) =>
                    setPinModal((m) => ({ ...m, newPin: e.target.value.replace(/\D/g, "").slice(0, 6) }))
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
