import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAccessControl } from "../hooks/useAccessControl";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageBackground from "../components/PageBackground";
import AuthorizedMembers from "../components/AuthorizedMembers";

const ITEM_CATEGORIES = [
  { value: "household", label: "Household Items" },
  { value: "documents", label: "Documents / Files" },
  { value: "electronics", label: "Electronics" },
  { value: "furniture", label: "Furniture" },
  { value: "clothing", label: "Clothing / Luggage" },
  { value: "personal", label: "Personal Items" },
  { value: "commercial", label: "Commercial Goods" },
  { value: "other", label: "Other" },
];

const CATEGORY_LABELS = Object.fromEntries(ITEM_CATEGORIES.map((c) => [c.value, c.label]));

const createEmptyItemRow = () => ({
  itemName: "",
  quantity: 1,
  category: "household",
});

export default function StoragePass() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlAgreementId = Number(searchParams.get("agreementId"));

  const {
    activeRentals,
    selectedRental,
    selectedRentalId,
    setSelectedRentalId,
    currentUnitCode,
    checkInQrValue,
    currentFacilityCheckIn,
    isUnitUnlocked,
    verifyUnlockPin,
    lockUnit,
    storedItems,
    itemsLoading,
    handleDeclareItems,
    handleDeleteStoredItem,
    credentials,
    credentialsLoading,
  } = useAccessControl();

  const [qrCopied, setQrCopied] = useState(false);
  const [navigatingBack, setNavigatingBack] = useState(false);

  const handleBackToAccess = () => {
    if (navigatingBack) return;
    setNavigatingBack(true);
    setTimeout(() => {
      navigate("/access-control");
    }, 240);
  };

  // Modals
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [unlockPin, setUnlockPin] = useState("");
  const [showUnlockPin, setShowUnlockPin] = useState(false);
  const [unlockError, setUnlockError] = useState("");

  const [declareModalOpen, setDeclareModalOpen] = useState(false);
  const [declareRows, setDeclareRows] = useState([createEmptyItemRow()]);
  const [declareSaving, setDeclareSaving] = useState(false);
  const [declareError, setDeclareError] = useState("");

  // Sync agreementId from query string
  useEffect(() => {
    if (urlAgreementId && activeRentals?.length > 0) {
      const match = activeRentals.find((r) => r.agreementId === urlAgreementId);
      if (match && selectedRentalId !== urlAgreementId) {
        setSelectedRentalId(urlAgreementId);
      }
    }
  }, [urlAgreementId, activeRentals, selectedRentalId, setSelectedRentalId]);

  const hasLiveRentals = Boolean(activeRentals && activeRentals.length > 0);
  const activeUnitCode = (hasLiveRentals && currentUnitCode) ? currentUnitCode : selectedRental?.unitCode || "HN-101";
  const isSuspended = credentials?.suspended || credentials?.status === "suspended";

  const qrImageUrl = useMemo(() => {
    if (!checkInQrValue) {
      return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=10&data=${encodeURIComponent(`VS-PASS-${activeUnitCode}-${selectedRentalId || 1006}`)}`;
    }
    return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=10&data=${encodeURIComponent(checkInQrValue)}`;
  }, [checkInQrValue, activeUnitCode, selectedRentalId]);

  const handleCopyQrValue = async () => {
    const val = checkInQrValue || `VS-PASS-${activeUnitCode}-${selectedRentalId || 1006}`;
    try {
      await navigator.clipboard.writeText(val);
      setQrCopied(true);
      setTimeout(() => setQrCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleOpenUnlockModal = () => {
    if (isSuspended) return;
    setUnlockPin("");
    setUnlockError("");
    setShowUnlockPin(false);
    setUnlockModalOpen(true);
  };

  const handleVerifyUnlockSubmit = (e) => {
    e.preventDefault();
    const pin = unlockPin.trim();
    if (!pin) {
      setUnlockError("Please enter your keypad PIN code.");
      return;
    }
    try {
      verifyUnlockPin(pin);
      setUnlockModalOpen(false);
      setUnlockPin("");
      setUnlockError("");
    } catch (err) {
      setUnlockError(err?.message || "Incorrect PIN code. Please verify your PIN.");
    }
  };

  const handleOpenDeclareModal = () => {
    setDeclareRows([createEmptyItemRow()]);
    setDeclareError("");
    setDeclareSaving(false);
    setDeclareModalOpen(true);
  };

  const handleSaveDeclaredItemsSubmit = async (e) => {
    e.preventDefault();
    const validItems = declareRows.filter((it) => it.itemName && it.itemName.trim().length > 0);
    if (validItems.length === 0) {
      setDeclareError("Please enter the name of at least 1 item to store.");
      return;
    }
    setDeclareSaving(true);
    setDeclareError("");
    try {
      await handleDeclareItems(validItems);
      setDeclareModalOpen(false);
      setDeclareRows([createEmptyItemRow()]);
    } catch (err) {
      setDeclareError(err?.message || "Failed to save declared items. Please try again.");
    } finally {
      setDeclareSaving(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col text-[#0b1c30]">
      <PageBackground />
      <Header active="access" />

      <motion.main
        initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
        animate={{
          opacity: navigatingBack ? 0 : 1,
          y: navigatingBack ? 16 : 0,
          filter: navigatingBack ? "blur(4px)" : "blur(0px)",
        }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 lg:px-6"
      >
        {/* Top-left Back button */}
        <div className="mb-4">
          <button
            type="button"
            onClick={handleBackToAccess}
            disabled={navigatingBack}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#dfe7f5] bg-white px-3.5 py-2 text-xs font-bold text-[#1d5fe5] shadow-xs hover:bg-[#eef4ff] active:scale-[0.98] transition disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back
          </button>
        </div>

        {/* Page Header */}
        <div className="rounded-2xl border border-[#dfe7f5] bg-white p-5 shadow-xs sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-[#1d5fe5]">
                <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
                Facility Gate Pass &amp; Unit Management
              </div>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#0b1c30] sm:text-3xl">
                Unit {activeUnitCode} Management
              </h1>
            </div>

            {/* Quick Unit Switcher */}
            {hasLiveRentals && activeRentals.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl border border-[#dfe7f5] bg-[#f8faff] p-1.5">
                {activeRentals.map((r) => {
                  const isActive = r.agreementId === selectedRentalId;
                  return (
                    <button
                      key={r.agreementId}
                      type="button"
                      onClick={() => {
                        setSelectedRentalId(r.agreementId);
                        setSearchParams({ agreementId: String(r.agreementId) });
                      }}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                        isActive
                          ? "bg-[#1d5fe5] text-white shadow-xs"
                          : "text-[#58657a] hover:bg-white hover:text-[#0b1c30]"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">door_front</span>
                      Unit {r.unitCode}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Main Content Grid: Left QR Gate Pass, Right Unit Information */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Prominent Gate Pass QR Code Card */}
          <div className="rounded-2xl border border-[#dfe7f5] bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#dfe7f5] pb-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#8996a9]">Facility Gate Pass</div>
                <div className="text-lg font-extrabold text-[#0b1c30]">
                  {selectedRental?.facilityName || "Cau Giay Smart Storage"}
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Pass Active (24/7 Access)
              </span>
            </div>

            {/* Large QR Display Box */}
            <div className="mt-6 flex flex-col items-center rounded-2xl border border-[#dfe7f5] bg-[#f8faff] p-6 text-center">
              <div className="relative rounded-2xl border-4 border-[#1d5fe5]/15 bg-white p-4 shadow-md transition hover:scale-[1.01]">
                <img
                  src={qrImageUrl}
                  alt={`Facility Check-In QR for Unit ${activeUnitCode}`}
                  className="h-64 w-64 object-contain sm:h-72 sm:w-72"
                />
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 rounded-full bg-[#1d5fe5] px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-white shadow">
                  SCAN AT GATE
                </div>
              </div>

              {/* Pass Code String Box with Copy Button */}
              <div className="mt-6 w-full max-w-[420px] rounded-xl border border-[#dfe7f5] bg-white p-3 shadow-xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#8996a9]">Check-in Pass Code</div>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <code className="truncate font-mono text-xs font-bold text-[#0b1c30]">
                    {checkInQrValue || `VS-PASS-${activeUnitCode}-${selectedRentalId || 1006}`}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyQrValue}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-[#eef4ff] px-3 py-1.5 text-xs font-bold text-[#1d5fe5] hover:bg-[#dce8ff] transition"
                  >
                    <span className="material-symbols-outlined text-[15px]">
                      {qrCopied ? "check" : "content_copy"}
                    </span>
                    {qrCopied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Staff Confirmed Status */}
              {currentFacilityCheckIn && (
                <div className="mt-4 flex w-full max-w-[420px] items-center gap-3 rounded-xl border border-[#abefc6] bg-[#ecfdf3] p-3 text-left text-[#027a48]">
                  <span className="material-symbols-outlined text-[24px] text-[#12b76a]">verified</span>
                  <div className="text-xs">
                    <div className="font-bold">Staff confirmed facility check-in!</div>
                    <div className="text-[11px] text-[#067647]">
                      Time: {currentFacilityCheckIn.timeLabel || "Just now"} • Gate reader unlocked.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Unlock Unit Action / Unlocked Status Banner */}
            <div className="mt-6">
              {isUnitUnlocked ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#abefc6] bg-[#ecfdf3] p-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#12b76a] text-white">
                      <span className="material-symbols-outlined text-[20px]">lock_open</span>
                    </span>
                    <div>
                      <div className="text-sm font-extrabold text-[#027a48]">
                        Unit {activeUnitCode} is Unlocked!
                      </div>
                      <div className="text-xs text-[#067647]">
                        Inventory declaration and authorized member access are now active below.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleOpenDeclareModal}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#12b76a] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#0e9f5d] transition"
                    >
                      <span className="material-symbols-outlined text-[16px]">add_box</span>
                      Declare Items
                    </button>
                    <button
                      type="button"
                      onClick={() => lockUnit(selectedRentalId)}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#abefc6] bg-white px-3 py-2 text-xs font-bold text-[#027a48] hover:bg-[#f0fbf5] transition"
                    >
                      <span className="material-symbols-outlined text-[15px]">lock</span>
                      Lock Unit
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenUnlockModal}
                  disabled={!selectedRentalId || credentialsLoading || isSuspended}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1d5fe5] px-4 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[#1550c7] transition disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">lock_open</span>
                  Unlock Unit Now
                </button>
              )}
            </div>
          </div>

          {/* Unit Specifications Card */}
          <div className="rounded-2xl border border-[#dfe7f5] bg-white p-6 shadow-sm">
            <div>
              <div className="flex items-center justify-between border-b border-[#dfe7f5] pb-3.5">
                <h3 className="text-base font-extrabold text-[#0b1c30]">Unit Information</h3>
                <span className="rounded-full bg-[#eef4ff] px-2.5 py-0.5 text-xs font-bold text-[#1d5fe5]">
                  Unit {activeUnitCode}
                </span>
              </div>

              <div className="mt-4 divide-y divide-[#dfe7f5] text-xs">
                <div className="flex items-center justify-between py-3">
                  <span className="text-[#58657a]">Unit Code</span>
                  <span className="font-bold text-[#0b1c30]">{activeUnitCode}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-[#58657a]">Facility Location</span>
                  <span className="font-bold text-[#0b1c30]">
                    {selectedRental?.facilityName || "Cau Giay Smart Storage"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-[#58657a]">Agreement Number</span>
                  <span className="font-mono font-bold text-[#0b1c30]">
                    {selectedRental?.agreementNo || "AGR-HN-1006"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-[#58657a]">Rental Status</span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-[#58657a]">Unit Lock State</span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-bold ${
                      isUnitUnlocked
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-[#58657a]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[13px]">
                      {isUnitUnlocked ? "lock_open" : "lock"}
                    </span>
                    {isUnitUnlocked ? "Unlocked" : "Locked"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-[#58657a]">Access Hours</span>
                  <span className="font-semibold text-[#0b1c30]">24/7 Unlimited Access</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CONDITIONALLY REVEALED: Stored Items & Authorized Members ONLY when Unit is Unlocked */}
        {isUnitUnlocked ? (
          <div className="mt-8 space-y-8 animate-in fade-in duration-300">
            {/* Stored Items Inventory Manager Section */}
            <div className="rounded-2xl border border-[#dfe7f5] bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dfe7f5] pb-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#8996a9]">Unit Inventory</div>
                  <h3 className="text-lg font-extrabold text-[#0b1c30]">
                    Stored Items in Unit {activeUnitCode}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleOpenDeclareModal}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#1d5fe5] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#1550c7] transition"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Declare Items
                </button>
              </div>

              <div className="mt-4">
                {itemsLoading ? (
                  <div className="py-8 text-center text-xs text-[#8996a9]">Loading items inventory...</div>
                ) : storedItems && storedItems.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#dfe7f5] text-[#8996a9]">
                          <th className="py-2.5 font-bold">Item Name</th>
                          <th className="py-2.5 font-bold">Category</th>
                          <th className="py-2.5 font-bold text-center">Quantity</th>
                          <th className="py-2.5 font-bold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#dfe7f5]">
                        {storedItems.map((item) => (
                          <tr key={item.id} className="hover:bg-[#f8faff] transition">
                            <td className="py-3 font-semibold text-[#0b1c30]">{item.itemName}</td>
                            <td className="py-3 text-[#58657a]">
                              {CATEGORY_LABELS[item.category] || item.category || "General"}
                            </td>
                            <td className="py-3 text-center font-bold text-[#0b1c30]">{item.quantity}</td>
                            <td className="py-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleDeleteStoredItem(item.id)}
                                className="text-[#b3261e] hover:underline font-semibold"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-[#8996a9]">
                    No items declared in this unit yet. Click "Declare Items" to keep your inventory tracked.
                  </div>
                )}
              </div>
            </div>

            {/* Authorized Members Section */}
            {hasLiveRentals && selectedRentalId && (
              <AuthorizedMembers agreementId={selectedRentalId} unitCode={activeUnitCode} />
            )}
          </div>
        ) : null}
      </motion.main>

      <Footer />

      {/* Unlock Unit PIN Modal */}
      {unlockModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && setUnlockModalOpen(false)}
          >
            <div className="w-full max-w-[420px] rounded-[22px] border border-[#dfe7f5] bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[#eef4ff] px-2.5 py-0.5 text-[11px] font-bold text-[#1d5fe5]">
                    <span className="material-symbols-outlined text-[14px]">dialpad</span>
                    PIN Verification
                  </div>
                  <h3 className="mt-1.5 text-lg font-extrabold text-[#0b1c30]">
                    Unlock Unit {activeUnitCode}
                  </h3>
                  <p className="text-xs text-[#58657a]">Enter your keypad PIN to unlock your unit</p>
                </div>
                <button
                  type="button"
                  onClick={() => setUnlockModalOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f8faff] text-[#8996a9] hover:bg-[#eef4ff] hover:text-[#0b1c30]"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {unlockError && (
                <div className="mt-3.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                  {unlockError}
                </div>
              )}

              <form onSubmit={handleVerifyUnlockSubmit} className="mt-5 space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#0b1c30]">Keypad PIN</label>
                    <button
                      type="button"
                      onClick={() => setShowUnlockPin(!showUnlockPin)}
                      className="text-xs text-[#1d5fe5] hover:underline"
                    >
                      {showUnlockPin ? "Hide PIN" : "Show PIN"}
                    </button>
                  </div>
                  <input
                    type={showUnlockPin ? "text" : "password"}
                    inputMode="numeric"
                    maxLength={8}
                    autoFocus
                    placeholder="••••••"
                    value={unlockPin}
                    onChange={(e) => {
                      setUnlockPin(e.target.value.replace(/\D/g, "").slice(0, 8));
                      setUnlockError("");
                    }}
                    className="mt-2 w-full rounded-xl border border-[#dfe7f5] bg-white px-4 py-3 text-center text-2xl font-black tracking-widest text-[#0b1c30] outline-none focus:border-[#1d5fe5] focus:ring-4 focus:ring-[#1d5fe5]/15 transition"
                  />
                </div>

                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setUnlockModalOpen(false)}
                    className="flex-1 rounded-xl border border-[#dfe7f5] bg-white py-2.5 text-xs font-bold text-[#58657a] hover:bg-[#f8faff]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={unlockPin.length < 4}
                    className="flex-1 rounded-xl bg-[#1d5fe5] py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#1550c7] disabled:opacity-50"
                  >
                    Verify &amp; Unlock
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* Declare Items Modal */}
      {declareModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && !declareSaving && setDeclareModalOpen(false)}
          >
            <div className="w-full max-w-[480px] rounded-[22px] border border-[#dfe7f5] bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[#eef4ff] px-2.5 py-0.5 text-[11px] font-bold text-[#1d5fe5]">
                    <span className="material-symbols-outlined text-[14px]">inventory_2</span>
                    Unit Inventory
                  </div>
                  <h3 className="mt-1.5 text-lg font-extrabold text-[#0b1c30]">
                    Declare Stored Items • Unit {activeUnitCode}
                  </h3>
                  <p className="text-xs text-[#58657a]">Add items to keep your storage inventory up to date</p>
                </div>
                <button
                  type="button"
                  onClick={() => !declareSaving && setDeclareModalOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f8faff] text-[#8996a9] hover:bg-[#eef4ff] hover:text-[#0b1c30]"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {declareError && (
                <div className="mt-3.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                  {declareError}
                </div>
              )}

              <form onSubmit={handleSaveDeclaredItemsSubmit} className="mt-5 space-y-4">
                <div className="max-h-[300px] space-y-3 overflow-y-auto pr-1">
                  {declareRows.map((item, idx) => (
                    <div key={idx} className="rounded-xl border border-[#dfe7f5] bg-[#f8faff] p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#0b1c30]">Item #{idx + 1}</span>
                        {declareRows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const next = declareRows.filter((_, i) => i !== idx);
                              setDeclareRows(next);
                            }}
                            className="text-[11px] text-red-600 hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. Leather Sofa, Document Box #1"
                        value={item.itemName}
                        onChange={(e) => {
                          const next = [...declareRows];
                          next[idx].itemName = e.target.value;
                          setDeclareRows(next);
                        }}
                        className="w-full rounded-lg border border-[#dfe7f5] bg-white px-3 py-1.5 text-xs outline-none focus:border-[#1d5fe5]"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={item.category}
                          onChange={(e) => {
                            const next = [...declareRows];
                            next[idx].category = e.target.value;
                            setDeclareRows(next);
                          }}
                          className="rounded-lg border border-[#dfe7f5] bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#1d5fe5]"
                        >
                          {ITEM_CATEGORIES.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => {
                            const next = [...declareRows];
                            next[idx].quantity = Math.max(1, parseInt(e.target.value, 10) || 1);
                            setDeclareRows(next);
                          }}
                          className="rounded-lg border border-[#dfe7f5] bg-white px-3 py-1.5 text-xs outline-none focus:border-[#1d5fe5]"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setDeclareRows([...declareRows, createEmptyItemRow()])}
                  className="w-full rounded-lg border border-dashed border-[#1d5fe5] bg-[#eef4ff]/50 py-2 text-xs font-bold text-[#1d5fe5] hover:bg-[#eef4ff]"
                >
                  + Add Another Item
                </button>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeclareModalOpen(false)}
                    className="flex-1 rounded-xl border border-[#dfe7f5] bg-white py-2.5 text-xs font-bold text-[#58657a] hover:bg-[#f8faff]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={declareSaving}
                    className="flex-1 rounded-xl bg-[#1d5fe5] py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#1550c7] disabled:opacity-50"
                  >
                    {declareSaving ? "Saving..." : "Save Items"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
