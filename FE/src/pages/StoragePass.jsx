import SelectDropdown from "@/components/ui/select-dropdown";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAccessControl } from "../hooks/useAccessControl";
import { useLanguage } from "../context/LanguageContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageBackground from "../components/PageBackground";
import ReportCheckInIssueModal from "../components/ReportCheckInIssueModal";

export default function StoragePass() {
  const navigate = useNavigate();
  const { t, translateStatus } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlAgreementId = Number(searchParams.get("agreementId"));

  const ITEM_CATEGORIES = useMemo(() => [
    { value: "household", label: t("storage_pass.cat_household", "Đồ gia dụng / Nội thất") },
    { value: "documents", label: t("storage_pass.cat_documents", "Hồ sơ / Giấy tờ") },
    { value: "business", label: t("storage_pass.cat_business", "Hàng hóa kinh doanh") },
    { value: "electronics", label: t("storage_pass.cat_fragile", "Thiết bị điện tử / Dễ vỡ") },
    { value: "seasonal", label: t("storage_pass.cat_seasonal", "Đồ mùa vụ / Thể thao") },
    { value: "other", label: t("storage_pass.cat_other", "Khác") },
  ], [t]);

  const CATEGORY_LABELS = useMemo(() => Object.fromEntries(ITEM_CATEGORIES.map((c) => [c.value, c.label])), [ITEM_CATEGORIES]);

  const createEmptyItemRow = () => ({
    itemName: "",
    quantity: 1,
    category: "household",
  });

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

  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [unlockPin, setUnlockPin] = useState("");
  const [showUnlockPin, setShowUnlockPin] = useState(false);
  const [unlockError, setUnlockError] = useState("");

  const [declareModalOpen, setDeclareModalOpen] = useState(false);
  const [declareRows, setDeclareRows] = useState([createEmptyItemRow()]);
  const [declareSaving, setDeclareSaving] = useState(false);
  const [declareError, setDeclareError] = useState("");
  const [reportIssueModalOpen, setReportIssueModalOpen] = useState(false);

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
      setUnlockError(t("auth.otp_placeholder", "Enter PIN"));
      return;
    }
    try {
      verifyUnlockPin(pin);
      setUnlockModalOpen(false);
      setUnlockPin("");
      setUnlockError("");
    } catch (err) {
      setUnlockError(err?.message || t("common.error", "Incorrect PIN"));
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
      setDeclareError(t("common.required", "Please enter at least 1 item"));
      return;
    }
    setDeclareSaving(true);
    setDeclareError("");
    try {
      await handleDeclareItems(validItems);
      setDeclareModalOpen(false);
      setDeclareRows([createEmptyItemRow()]);
    } catch (err) {
      setDeclareError(err?.message || t("common.error", "Failed to save items"));
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
        <div className="mb-4">
          <button
            type="button"
            onClick={handleBackToAccess}
            disabled={navigatingBack}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#dfe7f5] bg-white px-3.5 py-2 text-xs font-bold text-zinc-900 dark:text-zinc-100 shadow-xs hover:bg-[#eef4ff] active:scale-[0.98] transition disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            {t("common.back", "Back")}
          </button>
        </div>

        <div className="rounded-2xl border border-[#dfe7f5] bg-white p-5 shadow-xs sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
                {t("my_units.storage_pass", "Storage Pass")}
              </div>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#0b1c30] sm:text-3xl">
                {t("common.unit", "Unit")} {activeUnitCode}
              </h1>
            </div>

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
                          ? "bg-zinc-900 text-white text-white shadow-xs"
                          : "text-[#58657a] hover:bg-white hover:text-[#0b1c30]"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">door_front</span>
                      {t("common.unit", "Unit")} {r.unitCode}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-2xl border border-[#dfe7f5] bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#dfe7f5] pb-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#8996a9]">{t("my_units.storage_pass", "Gate Pass")}</div>
                <div className="text-lg font-extrabold text-[#0b1c30]">
                  {selectedRental?.facilityName || t("common.facility", "Facility")}
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                {t("status.active", "Active")}
              </span>
            </div>

            <div className="mt-6 flex flex-col items-center rounded-2xl border border-[#dfe7f5] bg-[#f8faff] p-6 text-center">
              <div className="relative rounded-2xl border-4 border-zinc-900 dark:border-zinc-100/15 bg-white p-4 shadow-md transition hover:scale-[1.01]">
                <img
                  src={qrImageUrl}
                  alt={`QR ${activeUnitCode}`}
                  className="h-64 w-64 object-contain sm:h-72 sm:w-72"
                />
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 rounded-full bg-zinc-900 text-white px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-white shadow">
                  {t("my_units.storage_pass", "GATE")}
                </div>
              </div>

              <div className="mt-6 w-full max-w-[420px] rounded-xl border border-[#dfe7f5] bg-white p-3 shadow-xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#8996a9]">{t("table.code", "Code")}</div>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <code className="truncate font-mono text-xs font-bold text-[#0b1c30]">
                    {checkInQrValue || `VS-PASS-${activeUnitCode}-${selectedRentalId || 1006}`}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyQrValue}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-[#eef4ff] px-3 py-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:bg-[#dce8ff] transition"
                  >
                    <span className="material-symbols-outlined text-[15px]">
                      {qrCopied ? "check" : "content_copy"}
                    </span>
                    {qrCopied ? t("common.confirm", "Copied") : t("common.download", "Copy")}
                  </button>
                </div>
              </div>

              {currentFacilityCheckIn && (
                <div className="mt-4 flex w-full max-w-[420px] items-center gap-3 rounded-xl border border-[#abefc6] bg-[#ecfdf3] p-3 text-left text-[#027a48]">
                  <span className="material-symbols-outlined text-[24px] text-[#12b76a]">verified</span>
                  <div className="text-xs">
                    <div className="font-bold">{t("status.checked_in", "Checked In")}</div>
                    <div className="text-[11px] text-[#067647]">
                      {currentFacilityCheckIn.timeLabel || t("status.checked_in", "Checked In")}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6">
              {isUnitUnlocked ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#abefc6] bg-[#ecfdf3] p-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#12b76a] text-white">
                      <span className="material-symbols-outlined text-[20px]">lock_open</span>
                    </span>
                    <div>
                      <div className="text-sm font-extrabold text-[#027a48]">
                        {t("access.lock_status_unlocked", "Unlocked")}
                      </div>
                      <div className="text-xs text-[#067647]">
                        {t("common.unit", "Unit")} {activeUnitCode}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setReportIssueModalOpen(true)}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition shadow-xs cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">report_problem</span>
                      {t("my_units.report_issue", "Report Issue")}
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenDeclareModal}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#12b76a] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#0e9f5d] transition"
                    >
                      <span className="material-symbols-outlined text-[16px]">add_box</span>
                      {t("common.add", "Declare Items")}
                    </button>
                    <button
                      type="button"
                      onClick={() => lockUnit(selectedRentalId)}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#abefc6] bg-white px-3 py-2 text-xs font-bold text-[#027a48] hover:bg-[#f0fbf5] transition"
                    >
                      <span className="material-symbols-outlined text-[15px]">lock</span>
                      {t("access.lock_status_locked", "Lock Unit")}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenUnlockModal}
                    disabled={!selectedRentalId || credentialsLoading || isSuspended}
                    className="flex flex-1 w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 text-white px-4 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-zinc-800 transition disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">lock_open</span>
                    {t("access.lock_status_unlocked", "Unlock Unit")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportIssueModalOpen(true)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition whitespace-nowrap cursor-pointer shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">report_problem</span>
                    {t("my_units.report_issue", "Report Issue")}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-[#dfe7f5] bg-white p-6 shadow-sm">
            <div>
              <div className="flex items-center justify-between border-b border-[#dfe7f5] pb-3.5">
                <h3 className="text-base font-extrabold text-[#0b1c30]">{t("common.details", "Unit Information")}</h3>
                <span className="rounded-full bg-[#eef4ff] px-2.5 py-0.5 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {t("common.unit", "Unit")} {activeUnitCode}
                </span>
              </div>

              <div className="mt-4 divide-y divide-[#dfe7f5] text-xs">
                <div className="flex items-center justify-between py-3">
                  <span className="text-[#58657a]">{t("common.unit", "Unit Code")}</span>
                  <span className="font-bold text-[#0b1c30]">{activeUnitCode}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-[#58657a]">{t("common.facility", "Facility")}</span>
                  <span className="font-bold text-[#0b1c30]">
                    {selectedRental?.facilityName || t("common.facility", "Facility")}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-[#58657a]">{t("common.agreement", "Agreement")}</span>
                  <span className="font-mono font-bold text-[#0b1c30]">
                    {selectedRental?.agreementNo || "AGR-HN-1006"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-[#58657a]">{t("common.status", "Status")}</span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {t("status.active", "Active")}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-[#58657a]">{t("access.title", "Lock State")}</span>
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
                    {isUnitUnlocked ? t("access.lock_status_unlocked", "Unlocked") : t("access.lock_status_locked", "Locked")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isUnitUnlocked ? (
          <div className="mt-8 space-y-8 animate-in fade-in duration-300">
            <div className="rounded-2xl border border-[#dfe7f5] bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dfe7f5] pb-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#8996a9]">{t("common.details", "Inventory")}</div>
                  <h3 className="text-lg font-extrabold text-[#0b1c30]">
                    {t("common.unit", "Unit")} {activeUnitCode}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleOpenDeclareModal}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 text-white px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-zinc-800 transition"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  {t("common.add", "Declare Items")}
                </button>
              </div>

              <div className="mt-4">
                {itemsLoading ? (
                  <div className="py-8 text-center text-xs text-[#8996a9]">{t("common.loading", "Loading...")}</div>
                ) : storedItems && storedItems.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#dfe7f5] text-[#8996a9]">
                          <th className="py-2.5 font-bold">{t("table.name", "Item Name")}</th>
                          <th className="py-2.5 font-bold">{t("common.type", "Category")}</th>
                          <th className="py-2.5 font-bold text-center">{t("common.size", "Quantity")}</th>
                          <th className="py-2.5 font-bold text-right">{t("common.actions", "Actions")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#dfe7f5]">
                        {storedItems.map((item) => (
                          <tr key={item.id} className="hover:bg-[#f8faff] transition">
                            <td className="py-3 font-semibold text-[#0b1c30]">{item.itemName}</td>
                            <td className="py-3 text-[#58657a]">
                              {CATEGORY_LABELS[item.category] || item.category || t("common.optional", "General")}
                            </td>
                            <td className="py-3 text-center font-bold text-[#0b1c30]">{item.quantity}</td>
                            <td className="py-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleDeleteStoredItem(item.id)}
                                className="text-[#b3261e] hover:underline font-semibold"
                              >
                                {t("common.delete", "Remove")}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-[#8996a9]">
                    {t("common.no_data", "No items declared")}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </motion.main>

      <Footer />

      {unlockModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && setUnlockModalOpen(false)}
          >
            <div className="w-full max-w-[420px] rounded-[22px] border border-[#dfe7f5] bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[#eef4ff] px-2.5 py-0.5 text-[11px] font-bold text-zinc-900 dark:text-zinc-100">
                    <span className="material-symbols-outlined text-[14px]">dialpad</span>
                    {t("access.pin_display", "PIN Verification")}
                  </div>
                  <h3 className="mt-1.5 text-lg font-extrabold text-[#0b1c30]">
                    {t("access.lock_status_unlocked", "Unlock Unit")} {activeUnitCode}
                  </h3>
                  <p className="text-xs text-[#58657a]">{t("access.keypad_instructions", "Enter PIN")}</p>
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
                    <label className="text-xs font-bold text-[#0b1c30]">{t("access.pin_display", "Keypad PIN")}</label>
                    <button
                      type="button"
                      onClick={() => setShowUnlockPin(!showUnlockPin)}
                      className="text-xs text-zinc-900 dark:text-zinc-100 hover:underline"
                    >
                      {showUnlockPin ? t("my_units.hide_pin", "Hide PIN") : t("my_units.show_pin", "Show PIN")}
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
                    className="mt-2 w-full rounded-xl border border-[#dfe7f5] bg-white px-4 py-3 text-center text-2xl font-black tracking-widest text-[#0b1c30] outline-none focus:border-zinc-900 dark:border-zinc-100 focus:ring-4 focus:ring-zinc-900/20 dark:ring-zinc-100/20/15 transition"
                  />
                </div>

                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setUnlockModalOpen(false)}
                    className="flex-1 rounded-xl border border-[#dfe7f5] bg-white py-2.5 text-xs font-bold text-[#58657a] hover:bg-[#f8faff]"
                  >
                    {t("common.cancel", "Cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={unlockPin.length < 4}
                    className="flex-1 rounded-xl bg-zinc-900 text-white py-2.5 text-xs font-bold text-white shadow-xs hover:bg-zinc-800 disabled:opacity-50"
                  >
                    {t("common.confirm", "Verify & Unlock")}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {declareModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && !declareSaving && setDeclareModalOpen(false)}
          >
            <div className="w-full max-w-[480px] rounded-[22px] border border-[#dfe7f5] bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[#eef4ff] px-2.5 py-0.5 text-[11px] font-bold text-zinc-900 dark:text-zinc-100">
                    <span className="material-symbols-outlined text-[14px]">inventory_2</span>
                    {t("common.details", "Inventory")}
                  </div>
                  <h3 className="mt-1.5 text-lg font-extrabold text-[#0b1c30]">
                    {t("storage_pass.add_items", "Khai báo đồ đạc")} • {t("common.unit", "Ô kho")} {activeUnitCode}
                  </h3>
                  <p className="text-xs text-[#58657a]">{t("storage_pass.add_items_desc", "Thêm danh sách đồ đạc để quản lý và theo dõi tài sản")}</p>
                </div>
                <button
                  type="button"
                  onClick={() => !declareSaving && setDeclareModalOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f8faff] text-[#8996a9] hover:bg-[#eef4ff] hover:text-[#0b1c30] cursor-pointer"
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
                <div className={`space-y-3 pr-1 ${declareRows.length > 2 ? "max-h-[380px] overflow-y-auto pb-36 overscroll-contain" : "overflow-visible pb-4"}`}>
                  {declareRows.map((item, idx) => (
                    <div key={idx} className="rounded-xl border border-[#dfe7f5] dark:border-zinc-800 bg-[#f8faff] dark:bg-zinc-800/60 p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {t("storage_pass.item", "Vật phẩm")} #{idx + 1}
                        </span>
                        {declareRows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const next = declareRows.filter((_, i) => i !== idx);
                              setDeclareRows(next);
                            }}
                            className="text-xs font-semibold text-red-600 hover:underline cursor-pointer"
                          >
                            {t("common.delete", "Xóa")}
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder={t("storage_pass.item_name_placeholder", "Nhập tên đồ đạc, vật phẩm...")}
                        value={item.itemName}
                        onChange={(e) => {
                          const next = [...declareRows];
                          next[idx].itemName = e.target.value;
                          setDeclareRows(next);
                        }}
                        className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <SelectDropdown
                          value={item.category}
                          onChange={(e) => {
                            const next = [...declareRows];
                            next[idx].category = e.target.value;
                            setDeclareRows(next);
                          }}
                          className="w-full"
                        >
                          {ITEM_CATEGORIES.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </SelectDropdown>
                        <input
                          type="number"
                          min="1"
                          placeholder={t("storage_pass.quantity", "Số lượng")}
                          value={item.quantity}
                          onChange={(e) => {
                            const next = [...declareRows];
                            next[idx].quantity = Math.max(1, parseInt(e.target.value, 10) || 1);
                            setDeclareRows(next);
                          }}
                          className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setDeclareRows([...declareRows, createEmptyItemRow()])}
                  className="w-full rounded-xl border border-dashed border-zinc-400 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800/40 py-2.5 text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                >
                  + {t("storage_pass.add_another_item", "Thêm đồ đạc khác")}
                </button>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeclareModalOpen(false)}
                    className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition cursor-pointer"
                  >
                    {t("common.cancel", "Hủy")}
                  </button>
                  <button
                    type="submit"
                    disabled={declareSaving}
                    className="flex-1 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-2.5 text-xs font-bold shadow-xs hover:opacity-90 disabled:opacity-50 transition cursor-pointer"
                  >
                    {declareSaving ? t("common.loading", "Đang lưu...") : t("storage_pass.save_items", "Lưu danh sách đồ đạc")}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      <ReportCheckInIssueModal
        target={{
          unitCode: activeUnitCode,
          agreementNo: selectedRental?.agreementNo,
          customerName: selectedRental?.customerName,
          storageUnitId: selectedRental?.storageUnitId || selectedRental?.unitId,
          agreementId: selectedRental?.agreementId,
          facilityId: selectedRental?.facilityId || 1,
        }}
        isOpen={reportIssueModalOpen}
        onClose={() => setReportIssueModalOpen(false)}
        isStaff={false}
      />
    </div>
  );
}
