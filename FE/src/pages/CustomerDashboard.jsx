import { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useCustomerDashboard } from "../hooks/useCustomerDashboard";
import { useAuth } from "../hooks/useAuth";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageBackground from "../components/PageBackground";
import { formatVnd } from "../lib/utils";

function CustomerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    activeRentals,
    primaryRental,
    credentialsMap,
    credentialsLoading,
    rentalsLoading,
    rentalsError,
    showPinMap,
    toggleShowPin,
    copyFeedbackMap,
    copyPinToClipboard,
    handleChangePin,
  } = useCustomerDashboard();

  // Custom PIN change modal
  const [pinModal, setPinModal] = useState(null); // { rental, newPin, error, loading }

  const openPinModal = (rental) =>
    setPinModal({ rental, newPin: "", error: "", loading: false });
  const closePinModal = () => setPinModal(null);

  const submitPinChange = async () => {
    if (!pinModal) return;
    const trimmed = pinModal.newPin.trim();
    if (!/^\d{6}$/.test(trimmed)) {
      setPinModal((m) => ({ ...m, error: "PIN code must be exactly 6 digits." }));
      return;
    }
    setPinModal((m) => ({ ...m, loading: true, error: "" }));
    try {
      await handleChangePin(pinModal.rental.agreementId, trimmed);
      closePinModal();
    } catch (err) {
      setPinModal((m) => ({ ...m, loading: false, error: err?.message || "Failed to update PIN code." }));
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col text-[#0b1c30]">
      <PageBackground />
      <Header active="dashboard" />

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 lg:px-6">
        {/* Welcome header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[22px] sm:text-[24px] font-bold tracking-[-0.02em] text-[#0b1c30]">
              Welcome, {user?.fullName || user?.email || "Customer"}
            </h1>
            {user?.id && (
              <span className="rounded-full bg-[#eef4ff] px-2.5 py-0.5 text-[11px] font-bold text-[#1d5fe5]">
                #VS-{user.id}
              </span>
            )}
          </div>

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 rounded-[10px] bg-white/90 px-3.5 py-2 text-[12px] font-bold text-[#1d5fe5] shadow-sm backdrop-blur-md transition hover:bg-white hover:shadow"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            {activeRentals.length > 0 ? "Rent Another Unit" : "Explore Available Units"}
          </button>
        </div>

        {rentalsError && (
          <div className="mt-3 rounded-[12px] border border-[#fecdca] bg-[#fff1f1] px-4 py-3 text-[13px] font-semibold text-[#b3261e]">
            {rentalsError}
          </div>
        )}

        {rentalsLoading && (
          <div className="mt-3 flex items-center gap-2 rounded-[12px] border border-[#dfe7f5] bg-white px-4 py-3 text-[13px] text-[#58657a]">
            <span className="material-symbols-outlined animate-spin text-[18px] text-[#1d5fe5]">progress_activity</span>
            Loading your storage units...
          </div>
        )}

        {/* Rental cards */}
        <div className="mt-6 space-y-6">
          {!rentalsLoading && activeRentals.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[16px] border border-[#dfe7f5] bg-white p-10 text-center shadow-sm">
              <span className="material-symbols-outlined text-[54px] text-[#1d5fe5]">inventory_2</span>
              <h2 className="mt-3 text-[19px] font-bold text-[#0b1c30]">
                You don't have any active storage rentals
              </h2>
              <p className="mt-2 max-w-[460px] text-[13px] leading-relaxed text-[#58657a]">
                Smart self-storage facility with keyless 24/7 keypad PIN access. Secure, convenient, and flexible.
              </p>
              <button
                onClick={() => navigate("/")}
                className="mt-5 rounded-[10px] bg-[#1d5fe5] px-6 py-2.5 text-[13px] font-bold text-white shadow transition hover:bg-[#174fc7]"
              >
                Find &amp; Rent a Storage Unit
              </button>
            </div>
          ) : (
            activeRentals.map((rental, index) => {
              const cred = credentialsMap[rental.agreementId];
              const pin = cred?.keypadPin;
              const isVisible = Boolean(showPinMap[rental.agreementId]);
              const pinText = credentialsLoading
                ? "Loading..."
                : isVisible
                ? pin || "No PIN set"
                : "• • • • • •";

              return (
                <div
                  key={rental.agreementId || rental.unitCode || index}
                  className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]"
                >
                  {/* Card header */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">
                        <span className="rounded-full bg-[#eef4ff] px-2 py-0.5 text-[#1d5fe5]">
                          {index === 0 ? "Primary Unit" : `Unit ${index + 1}`}
                        </span>
                        {rental.facilityName || "Thu Duc Self Storage"}
                      </div>
                      <h2 className="mt-1 text-[18px] sm:text-[20px] font-bold text-[#0b1c30]">
                        Unit {rental.unitCode}
                      </h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#eef4ff] px-2.5 py-1 text-[11px] font-bold text-[#1d5fe5]">
                        Agreement #{rental.agreementNo}
                      </span>
                      <div className="flex items-center gap-1.5 rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] px-3 py-1.5 text-[#0e7b4c]">
                        <span className="h-2 w-2 rounded-full bg-[#2dd4a0]" />
                        <span className="text-[12px] font-bold">Active</span>
                      </div>
                    </div>
                  </div>

                  {/* 4 stat tiles */}
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                      <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">Area</div>
                      <div className="text-[14px] font-bold text-[#0b1c30]">
                        {rental.areaM2 ? `${rental.areaM2} m²` : "—"}
                      </div>
                      <div className="text-[10px] text-[#8996a9]">{rental.dimensions || ""}</div>
                    </div>

                    <div className="rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                      <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">Volume</div>
                      <div className="text-[14px] font-bold text-[#0b1c30]">
                        {rental.volumeM3
                          ? `${rental.volumeM3} m³`
                          : rental.areaM2
                          ? `${(Number(rental.areaM2) * 2.5).toFixed(1)} m³`
                          : "—"}
                      </div>
                      <div className="truncate text-[10px] text-[#8996a9]">{rental.unitTypeName}</div>
                    </div>

                    <div className="rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                      <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">Climate</div>
                      <div className="text-[14px] font-bold text-[#0b1c30]">20° – 22°C</div>
                      <div className="text-[10px] font-semibold text-[#0e7b4c]">Regulated</div>
                    </div>

                    <div className="rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                      <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">Monthly Rate</div>
                      <div className="text-[14px] font-bold text-[#1d5fe5]">{formatVnd(rental.monthlyRate)}</div>
                      <div className="text-[10px] text-[#8996a9]">per month</div>
                    </div>
                  </div>

                  {/* PIN section */}
                  <div className="mt-4 rounded-[12px] border border-[#dfe7f5] bg-[#f8faff] p-4">
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
                      Keypad PIN — Unit {rental.unitCode}
                      <button
                        onClick={() => toggleShowPin(rental.agreementId)}
                        className="font-bold text-[#1d5fe5] hover:underline"
                      >
                        {isVisible ? "Hide PIN" : "Show PIN"}
                      </button>
                    </div>

                    <div className="mt-2 flex items-center gap-3 text-[20px] font-bold tracking-[0.2em] text-[#0b1c30]">
                      <span>{pinText}</span>
                    </div>

                    <div className="mt-3">
                      <button
                        onClick={() => openPinModal(rental)}
                        className="rounded-md border border-[#dfe7f5] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#1d5fe5] transition hover:bg-[#f5f7fd]"
                      >
                        Change PIN
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      <Footer />

      {/* PIN Change Modal */}
      {pinModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && closePinModal()}
          >
            <div className="w-full max-w-[380px] rounded-[20px] border border-[#dfe7f5] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.14)] animate-in fade-in zoom-in-95 duration-200">
              {/* Modal header */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[16px] font-bold text-[#0b1c30]">Change Keypad PIN</div>
                  <div className="mt-0.5 text-[12px] text-[#8996a9]">Unit {pinModal.rental.unitCode}</div>
                </div>
                <button
                  onClick={closePinModal}
                  className="material-symbols-outlined text-[20px] text-[#8996a9] hover:text-[#0b1c30]"
                >
                  close
                </button>
              </div>

              {/* PIN input */}
              <div className="mt-5">
                <input
                  type="text"
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

              {/* Actions */}
              <div className="mt-5 flex gap-2">
                <button
                  onClick={closePinModal}
                  className="flex-1 rounded-[10px] border border-[#dfe7f5] bg-white py-2.5 text-[13px] font-semibold text-[#3a475a] transition hover:bg-[#f8faff]"
                >
                  Cancel
                </button>
                <button
                  onClick={submitPinChange}
                  disabled={pinModal.loading || pinModal.newPin.length !== 6}
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

export default CustomerDashboard;
