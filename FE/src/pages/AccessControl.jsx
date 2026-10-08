import { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAccessControl } from "../hooks/useAccessControl";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageBackground from "../components/PageBackground";
import AuthorizedMembers from "../components/AuthorizedMembers";
import { Component as LuminaInteractiveList } from "../components/ui/lumina-interactive-list";

const ITEM_CATEGORIES = [
  { value: "household", label: "Đồ gia dụng" },
  { value: "documents", label: "Hồ sơ / Tài liệu" },
  { value: "electronics", label: "Thiết bị điện tử" },
  { value: "furniture", label: "Nội thất" },
  { value: "clothing", label: "Quần áo / Vali" },
  { value: "personal", label: "Đồ cá nhân" },
  { value: "commercial", label: "Hàng hóa kinh doanh" },
  { value: "other", label: "Khác" },
];

const CATEGORY_LABELS = Object.fromEntries(ITEM_CATEGORIES.map((c) => [c.value, c.label]));

const createEmptyItemRow = () => ({
  itemName: "",
  quantity: 1,
  category: "household",
});

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
    checkInQrValue,
    currentFacilityCheckIn,
    isUnitUnlocked,
    verifyUnlockPin,
    storedItems,
    totalStoredItemsCount,
    itemsLoading,
    handleDeclareItems,
    handleUpdateStoredItem,
    handleDeleteStoredItem,
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
  const openPinModal = () => {
    setPinResult(null);
    setPinModal({ currentPin: "", newPin: "", error: "", loading: false });
  };
  const closePinModal = () => {
    if (!pinLock.current) setPinModal(null);
  };

  // Check-in QR modal state
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrCopied, setQrCopied] = useState(false);

  // Unlock Unit (Mở kho -> Nhập mã PIN -> Nhập đồ + Số lượng) modal state
  const [unlockModal, setUnlockModal] = useState(null);
  // unlockModal shape: { step: 'pin' | 'items', pin: '', showTypedPin: false, error: '', saving: false, successMsg: '', newItems: [{ itemName, quantity, category }] }
  const [updatingItemId, setUpdatingItemId] = useState(null);

  const handleOpenCheckInQr = () => {
    if (!selectedRentalId || isSuspended) return;
    handleCheckIn();
    setQrCopied(false);
    setQrModalOpen(true);
  };

  const handleCopyQrValue = async () => {
    if (!checkInQrValue) return;
    try {
      await navigator.clipboard.writeText(checkInQrValue);
      setQrCopied(true);
      setTimeout(() => setQrCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleOpenUnlockModal = (skipPinIfUnlocked = false) => {
    if (!selectedRentalId || isSuspended) return;
    setUnlockModal({
      step: skipPinIfUnlocked && isUnitUnlocked ? "items" : "pin",
      pin: "",
      showTypedPin: false,
      error: "",
      saving: false,
      successMsg: "",
      newItems: [createEmptyItemRow()],
    });
  };

  const handleVerifyPinAndOpenUnit = (e) => {
    if (e) e.preventDefault();
    if (!unlockModal) return;
    try {
      verifyUnlockPin(unlockModal.pin);
      setUnlockModal((m) => ({
        ...m,
        step: "items",
        error: "",
        successMsg: "",
      }));
    } catch (err) {
      setUnlockModal((m) => ({
        ...m,
        error: err?.message || "Mã PIN không chính xác.",
      }));
    }
  };

  const updateNewItemRow = (idx, field, value) => {
    setUnlockModal((m) => {
      if (!m) return m;
      const updated = m.newItems.map((row, i) => (i === idx ? { ...row, [field]: value } : row));
      return { ...m, newItems: updated, error: "", successMsg: "" };
    });
  };

  const addNewItemRow = () => {
    setUnlockModal((m) => {
      if (!m) return m;
      return { ...m, newItems: [...m.newItems, createEmptyItemRow()], error: "", successMsg: "" };
    });
  };

  const removeNewItemRow = (idx) => {
    setUnlockModal((m) => {
      if (!m || m.newItems.length <= 1) return m;
      return {
        ...m,
        newItems: m.newItems.filter((_, i) => i !== idx),
        error: "",
      };
    });
  };

  const submitStoredItems = async (e) => {
    if (e) e.preventDefault();
    if (!unlockModal || unlockModal.saving) return;

    const validRows = unlockModal.newItems.filter((r) => r.itemName.trim().length > 0);
    if (validRows.length === 0) {
      setUnlockModal((m) => ({ ...m, error: "Vui lòng nhập tên ít nhất 1 món đồ cần lưu kho." }));
      return;
    }
    for (const row of validRows) {
      if (!Number.isInteger(Number(row.quantity)) || Number(row.quantity) < 1) {
        setUnlockModal((m) => ({ ...m, error: `Số lượng của "${row.itemName}" phải từ 1 trở lên.` }));
        return;
      }
    }

    setUnlockModal((m) => ({ ...m, saving: true, error: "", successMsg: "" }));
    try {
      await handleDeclareItems(validRows);
      setUnlockModal((m) => ({
        ...m,
        saving: false,
        newItems: [createEmptyItemRow()],
        successMsg: `Đã thêm ${validRows.length} loại đồ vào kho ${currentUnitCode} thành công!`,
      }));
    } catch (err) {
      setUnlockModal((m) => ({
        ...m,
        saving: false,
        error: err?.message || "Không thể lưu đồ đạc vào kho. Vui lòng thử lại.",
      }));
    }
  };

  const handleAdjustExistingQuantity = async (item, delta) => {
    const nextQty = Number(item.quantity || 1) + delta;
    if (nextQty < 1 || updatingItemId === item.id) return;
    setUpdatingItemId(item.id);
    try {
      await handleUpdateStoredItem(item.id, { ...item, quantity: nextQty });
    } catch (err) {
      alert(err?.message || "Không thể cập nhật số lượng.");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveExistingItem = async (itemId) => {
    if (updatingItemId === itemId) return;
    setUpdatingItemId(itemId);
    try {
      await handleDeleteStoredItem(itemId);
    } catch (err) {
      alert(err?.message || "Không thể xóa món đồ này.");
    } finally {
      setUpdatingItemId(null);
    }
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
      setPinResult({ ...result, unitCode: currentUnitCode });
      setPinModal(null);
    } catch (err) {
      setPinModal((m) => ({ ...m, loading: false, error: err?.message || "Failed to update PIN code." }));
    } finally {
      pinLock.current = false;
    }
  };

  const luminaSlides = useMemo(() => {
    const stockPhotos = [
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1549194388-f61be84a6e9e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    ];

    if (!activeRentals || activeRentals.length === 0) return [];

    return activeRentals.map((r, idx) => ({
      id: r.agreementId,
      title: `${idx === 0 ? "Primary Unit" : `Unit ${idx + 1}`} ${r.unitCode}`,
      description: `${r.facilityName || "Storage Facility"} · Digital Keypad PIN · Agreement #${r.agreementNo || "AGR"}`,
      media: stockPhotos[idx % stockPhotos.length],
    }));
  }, [activeRentals]);

  const selectedSlideIndex = useMemo(() => {
    const idx = activeRentals.findIndex((r) => r.agreementId === selectedRentalId);
    return idx >= 0 ? idx : 0;
  }, [activeRentals, selectedRentalId]);

  const qrImageUrl = useMemo(() => {
    if (!checkInQrValue) return "";
    return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=10&data=${encodeURIComponent(checkInQrValue)}`;
  }, [checkInQrValue]);

  return (
    <div className="relative flex min-h-screen flex-col text-[#0b1c30]">
      <PageBackground />
      <Header active="access" />

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 lg:px-6">

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
                    Kho của bạn đang bị tạm khóa quyền ra vào do quá hạn thanh toán
                  </h2>
                  <span className="rounded-full border border-[#fecdca] bg-[#fdecec] px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#b3261e]">
                    Tạm Khóa / Suspended
                  </span>
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[#7a271a]">
                  Hệ thống và ban quản lý kho đã tạm đình chỉ mã PIN mở khóa của ô kho <strong>{currentUnitCode || "của bạn"}</strong> do hợp đồng quá hạn thanh toán.
                  {credentials?.suspendedReason ? ` (Chi tiết: ${credentials.suspendedReason}) ` : " "}
                  Vui lòng thanh toán cước phí thuê và tiền phạt để tự động mở khóa ngay lập tức.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/billing")}
                    className="inline-flex items-center gap-2 rounded-[9px] bg-[#d92d20] px-4 py-2.5 text-[13px] font-bold text-white shadow-sm transition hover:bg-[#b42318]"
                  >
                    <span className="material-symbols-outlined text-[18px]">payments</span>
                    <span>Thanh toán cước phí ngay</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/support")}
                    className="inline-flex items-center gap-2 rounded-[9px] border border-[#fecdca] bg-white px-4 py-2.5 text-[13px] font-bold text-[#7a271a] hover:bg-[#fff1f1]"
                  >
                    <span className="material-symbols-outlined text-[18px]">support_agent</span>
                    <span>Gửi yêu cầu hỗ trợ</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {credentialsError && !credentialsError.toLowerCase().includes("business hours") && !credentialsError.toLowerCase().includes("outside") && (
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
              {/* Lumina Interactive 3D Showcase for selecting units */}
              {luminaSlides.length > 0 && (
                <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 shadow-md">
                  <LuminaInteractiveList
                    slides={luminaSlides}
                    initialIndex={selectedSlideIndex}
                    autoSlide={false}
                    onSlideChange={(_idx, slide) => {
                      if (slide?.id) setSelectedRentalId(slide.id);
                    }}
                  />
                </div>
              )}

              {/* Smooth transition between selected units */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedRentalId}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
                    {/* LEFT: PIN card + Stored Items card */}
                    <div className="space-y-6">
                      <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)] transition-all duration-300">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="text-[15px] font-bold text-[#0b1c30]">Keypad PIN Code</div>
                            {currentFacilityCheckIn && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-[#abefc6] bg-[#ecfdf3] px-2.5 py-0.5 text-[10px] font-bold text-[#027a48]">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#12b76a]" />
                                Đã Check-in cơ sở
                              </span>
                            )}
                            {isUnitUnlocked && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-[#b9ccf0] bg-[#eef4ff] px-2.5 py-0.5 text-[10px] font-bold text-[#1d5fe5]">
                                <span className="material-symbols-outlined text-[12px]">lock_open</span>
                                Kho đang mở
                              </span>
                            )}
                          </div>
                          <span className="rounded-full bg-[#eef4ff] px-2.5 py-0.5 text-[11px] font-bold text-[#1d5fe5]">
                            Unit {currentUnitCode}
                          </span>
                        </div>

                        {isSuspended ? (
                          <div className="mt-4 rounded-[12px] border border-[#fecdca] bg-[#fff5f5] p-5 text-center">
                            <div className="flex items-center justify-center gap-2 text-[15px] font-bold text-[#b3261e]">
                              <span className="material-symbols-outlined text-[22px]">lock</span>
                              <span>MÃ PIN ĐÃ BỊ KHÓA DO QUÁ HẠN</span>
                            </div>
                            <p className="mt-2 text-[12px] leading-relaxed text-[#7a271a]">
                              Quyền mở cửa của ô kho này đang bị đình chỉ. Vui lòng hoàn tất thanh toán cước phí để hệ thống tự động mở khóa mã PIN.
                            </p>
                            <button
                              type="button"
                              onClick={() => navigate("/billing")}
                              className="mt-3.5 inline-flex items-center gap-1.5 rounded-[8px] bg-[#d92d20] px-4 py-2 text-[12px] font-bold text-white transition hover:bg-[#b42318]"
                            >
                              <span className="material-symbols-outlined text-[16px]">credit_card</span>
                              <span>Đi đến trang Thanh toán</span>
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
                                      {showPin
                                        ? credentials?.keypadPin || "—"
                                        : (credentials?.keypadPin || "••••••").replace(/./g, "•")}
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

                      {/* Stored Items Summary Card */}
                      <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px] text-[#1d5fe5]">inventory_2</span>
                            <div>
                              <h3 className="text-[15px] font-bold text-[#0b1c30]">
                                Đồ đạc lưu trong kho ({totalStoredItemsCount} món)
                              </h3>
                              <p className="text-[11px] text-[#8996a9]">
                                Mở kho bằng mã PIN để nhập thêm đồ hoặc cập nhật số lượng trong Ô kho {currentUnitCode}
                              </p>
                            </div>
                          </div>
                          {!isSuspended && (
                            <button
                              type="button"
                              onClick={() => handleOpenUnlockModal(true)}
                              className="inline-flex items-center gap-1.5 rounded-[10px] bg-[#0b1c30] px-3.5 py-2 text-[12px] font-bold text-white transition hover:bg-[#162b46]"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                {isUnitUnlocked ? "add_box" : "lock_open"}
                              </span>
                              <span>{isUnitUnlocked ? "Nhập thêm đồ" : "Mở kho & Nhập đồ"}</span>
                            </button>
                          )}
                        </div>

                        {itemsLoading ? (
                          <div className="mt-4 flex items-center gap-2 rounded-[12px] bg-[#f8faff] p-4 text-[12px] text-[#58657a]">
                            <span className="material-symbols-outlined animate-spin text-[16px] text-[#1d5fe5]">progress_activity</span>
                            Đang tải danh sách đồ đạc trong kho...
                          </div>
                        ) : storedItems.length === 0 ? (
                          <div className="mt-4 flex flex-col items-center justify-center rounded-[12px] border border-dashed border-[#dfe7f5] bg-[#f8faff] p-6 text-center">
                            <span className="material-symbols-outlined text-[32px] text-[#8996a9]">package_2</span>
                            <p className="mt-1.5 text-[13px] font-semibold text-[#3a475a]">
                              Chưa có đồ đạc nào được kê khai trong kho {currentUnitCode}
                            </p>
                            <p className="mt-0.5 text-[11px] text-[#8996a9]">
                              Ấn nút <strong>&quot;Mở kho&quot;</strong> và nhập mã PIN để bắt đầu thêm đồ đạc &amp; số lượng.
                            </p>
                          </div>
                        ) : (
                          <div className="mt-4 divide-y divide-[#eef1f8] rounded-[12px] border border-[#eef1f8] bg-[#f8faff] px-4">
                            {storedItems.map((item) => (
                              <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="truncate text-[13px] font-bold text-[#0b1c30]">
                                      {item.itemName}
                                    </span>
                                    <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-semibold text-[#58657a] border border-[#dfe7f5]">
                                      {CATEGORY_LABELS[item.category] || item.category || "Khác"}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {isUnitUnlocked ? (
                                    <>
                                      <button
                                        type="button"
                                        disabled={item.quantity <= 1 || updatingItemId === item.id}
                                        onClick={() => handleAdjustExistingQuantity(item, -1)}
                                        className="flex h-7 w-7 items-center justify-center rounded-md border border-[#dfe7f5] bg-white text-sm font-bold text-[#0b1c30] hover:bg-[#eef4ff] disabled:opacity-40"
                                      >
                                        -
                                      </button>
                                      <span className="min-w-[48px] text-center text-[13px] font-extrabold text-[#1d5fe5]">
                                        SL: {item.quantity}
                                      </span>
                                      <button
                                        type="button"
                                        disabled={updatingItemId === item.id}
                                        onClick={() => handleAdjustExistingQuantity(item, 1)}
                                        className="flex h-7 w-7 items-center justify-center rounded-md border border-[#dfe7f5] bg-white text-sm font-bold text-[#0b1c30] hover:bg-[#eef4ff] disabled:opacity-40"
                                      >
                                        +
                                      </button>
                                      <button
                                        type="button"
                                        disabled={updatingItemId === item.id}
                                        onClick={() => handleRemoveExistingItem(item.id)}
                                        title="Lấy đồ ra / Xóa"
                                        className="ml-1 flex h-7 w-7 items-center justify-center rounded-md text-[#b3261e] hover:bg-[#fee4e2] disabled:opacity-40"
                                      >
                                        <span className="material-symbols-outlined text-[16px]">delete</span>
                                      </button>
                                    </>
                                  ) : (
                                    <span className="rounded-full bg-[#eef4ff] px-3 py-1 text-[12px] font-extrabold text-[#1d5fe5]">
                                      Số lượng: {item.quantity}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* RIGHT: Access log + Check in QR button + Mở kho button */}
                    <aside>
                      <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)] transition-all duration-300">
                        <div className="flex items-center justify-between text-[13px] font-bold text-[#0b1c30]">
                          Access Activity Log
                          <span className="text-[10px] font-semibold text-[#8996a9]">Live</span>
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

                      {/* Button 1: Check in -> Hiện QR để Staff quét vào cơ sở */}
                      <button
                        type="button"
                        onClick={handleOpenCheckInQr}
                        disabled={!selectedRentalId || credentialsLoading || isSuspended}
                        className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white transition ${
                          isSuspended
                            ? "bg-[#b3261e] opacity-80 cursor-not-allowed"
                            : "bg-[#1d5fe5] hover:bg-[#1550c7] disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                          {isSuspended ? "lock" : "qr_code_2"}
                        </span>
                        {isSuspended
                          ? "Kho đang bị khóa ra vào"
                          : credentialsLoading
                          ? "Đang tải..."
                          : "Check in (Hiện mã QR)"}
                      </button>

                      {/* Button 2: Mở kho -> Nhập mã PIN -> Nhập đồ + Số lượng */}
                      <button
                        type="button"
                        onClick={() => handleOpenUnlockModal(false)}
                        disabled={!selectedRentalId || credentialsLoading || isSuspended}
                        className={`mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
                          isSuspended
                            ? "hidden"
                            : "bg-[#0e7b4c] text-white hover:bg-[#0b633d] disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                          lock_open
                        </span>
                        <span>Mở kho</span>
                      </button>

                      <p className="mt-2.5 text-xs leading-relaxed text-[#58657a]">
                        {isSuspended
                          ? "Ô kho đã bị khóa truy cập do vi phạm quá hạn thanh toán."
                          : `Ấn "Check in" để lấy mã QR cho Staff quét vào cơ sở, sau đó ấn "Mở kho" và nhập mã PIN để thêm đồ đạc vào Unit ${currentUnitCode}.`}
                      </p>
                      {credentials?.suspendedReason && <p role="alert" className="mt-2 text-sm text-red-600">{credentials.suspendedReason}</p>}
                    </aside>
                  </div>
                  {selectedRentalId && <AuthorizedMembers key={selectedRentalId} agreementId={selectedRentalId} unitCode={currentUnitCode} />}
                </motion.div>
              </AnimatePresence>
            </>
          )
        )}
      </main>

      {pinResult && <div role="status" className="mx-auto mb-4 w-full max-w-[1280px] px-4 text-sm text-[#0e7b4c]">Unit {pinResult.unitCode}: {pinResult.message || "PIN change accepted."} {pinResult.syncStatus && <span>Sync: {pinResult.syncStatus}. </span>}{pinResult.estimatedSyncSeconds > 0 && <span>Estimated sync: {pinResult.estimatedSyncSeconds} seconds.</span>}</div>}
      <Footer />

      {/* Check-in QR Code Modal (User ấn Check in -> Hiện QR -> Staff quét checkin vào cơ sở) */}
      {qrModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && setQrModalOpen(false)}
          >
            <div className="w-full max-w-[420px] rounded-[22px] border border-[#dfe7f5] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.18)] animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[#eef4ff] px-2.5 py-0.5 text-[11px] font-bold text-[#1d5fe5]">
                    <span className="material-symbols-outlined text-[14px]">qr_code_scanner</span>
                    Facility Gate Pass
                  </div>
                  <h3 className="mt-1.5 text-[18px] font-extrabold text-[#0b1c30]">
                    Mã QR Check-in Vào Cơ Sở
                  </h3>
                  <p className="text-[12px] text-[#58657a]">
                    {selectedRental?.facilityName || "G1 Self-Storage"} • Ô kho <strong>{currentUnitCode}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setQrModalOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f8faff] text-[#8996a9] hover:bg-[#eef4ff] hover:text-[#0b1c30]"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* QR Code Display Box */}
              <div className="mt-4 flex flex-col items-center rounded-[16px] border border-[#dfe7f5] bg-[#f8faff] p-5">
                <div className="relative rounded-2xl border-2 border-[#1d5fe5]/20 bg-white p-3 shadow-sm">
                  {qrImageUrl ? (
                    <img
                      src={qrImageUrl}
                      alt={`QR Check-in cho kho ${currentUnitCode}`}
                      className="h-56 w-56 object-contain"
                    />
                  ) : (
                    <div className="flex h-56 w-56 items-center justify-center text-xs text-[#8996a9]">
                      Đang tạo mã QR...
                    </div>
                  )}
                </div>

                <div className="mt-3 w-full rounded-xl border border-[#dfe7f5] bg-white px-3 py-2 text-center">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8996a9]">
                    Mã định danh Check-in (Staff có thể quét hoặc nhập mã)
                  </div>
                  <div className="mt-1 flex items-center justify-center gap-2">
                    <code className="truncate font-mono text-[12px] font-bold text-[#0b1c30]">
                      {checkInQrValue}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyQrValue}
                      className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[#eef4ff] px-2 py-1 text-[11px] font-bold text-[#1d5fe5] hover:bg-[#dce8ff]"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {qrCopied ? "check" : "content_copy"}
                      </span>
                      {qrCopied ? "Đã chép" : "Sao chép"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Check-in Confirmation Status */}
              {currentFacilityCheckIn ? (
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#abefc6] bg-[#ecfdf3] p-3.5 text-[#027a48]">
                  <span className="material-symbols-outlined text-[24px] text-[#12b76a]">verified</span>
                  <div className="text-xs">
                    <div className="font-bold">Staff đã xác nhận Check-in vào cơ sở!</div>
                    <div className="text-[11px] text-[#067647]">
                      Thời gian: {currentFacilityCheckIn.timeLabel || "Vừa xong"} • Bạn có thể mở kho ngay bây giờ.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#dfe7f5] bg-[#f8faff] p-3.5 text-[#3a475a]">
                  <span className="material-symbols-outlined animate-pulse text-[22px] text-[#1d5fe5]">
                    sensors
                  </span>
                  <div className="text-xs leading-relaxed">
                    Vui lòng đưa mã QR này cho <strong>Staff tại quầy Check-in</strong> quét qua Camera (hoặc nhập mã) để xác nhận vào cơ sở.
                  </div>
                </div>
              )}

              <div className="mt-5 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setQrModalOpen(false)}
                  className="flex-1 rounded-xl border border-[#dfe7f5] bg-white py-2.5 text-[13px] font-semibold text-[#3a475a] hover:bg-[#f8faff]"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQrModalOpen(false);
                    handleOpenUnlockModal(false);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0e7b4c] py-2.5 text-[13px] font-bold text-white shadow hover:bg-[#0b633d]"
                >
                  <span className="material-symbols-outlined text-[17px]">lock_open</span>
                  <span>Mở kho ngay</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Unlock Storage Unit & Stored Items Modal (Mở kho -> Nhập mã PIN -> Nhập đồ + Số lượng) */}
      {unlockModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && !unlockModal.saving && setUnlockModal(null)}
          >
            <div className="w-full max-w-[500px] max-h-[90vh] overflow-y-auto rounded-[22px] border border-[#dfe7f5] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.18)] animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[#effcf6] px-2.5 py-0.5 text-[11px] font-bold text-[#0e7b4c]">
                    <span className="material-symbols-outlined text-[14px]">
                      {unlockModal.step === "pin" ? "dialpad" : "lock_open"}
                    </span>
                    {unlockModal.step === "pin" ? "Bước 1/2: Xác thực mã PIN" : "Bước 2/2: Đã mở kho • Nhập đồ"}
                  </div>
                  <h3 className="mt-1.5 text-[18px] font-extrabold text-[#0b1c30]">
                    {unlockModal.step === "pin"
                      ? `Mở Khóa Ô Kho ${currentUnitCode}`
                      : `Nhập Đồ Vào Kho ${currentUnitCode}`}
                  </h3>
                  <p className="text-[12px] text-[#58657a]">
                    {unlockModal.step === "pin"
                      ? "Nhập mã PIN 6 chữ số của bạn để mở cửa ô kho lưu trữ"
                      : "Kê khai tên đồ đạc và số lượng bạn đưa vào ô kho"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => !unlockModal.saving && setUnlockModal(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f8faff] text-[#8996a9] hover:bg-[#eef4ff] hover:text-[#0b1c30]"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {unlockModal.step === "pin" ? (
                <form onSubmit={handleVerifyPinAndOpenUnit} className="mt-5">
                  <div className="rounded-[14px] border border-[#eef1f8] bg-[#f8faff] p-4">
                    <div className="flex items-center justify-between">
                      <label htmlFor="unlock-pin-input" className="text-xs font-bold uppercase tracking-wider text-[#58657a]">
                        Mã PIN bàn phím (6 số)
                      </label>
                      <button
                        type="button"
                        onClick={() => setUnlockModal((m) => ({ ...m, showTypedPin: !m.showTypedPin }))}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#1d5fe5] hover:underline"
                      >
                        <span className="material-symbols-outlined text-[15px]">
                          {unlockModal.showTypedPin ? "visibility_off" : "visibility"}
                        </span>
                        {unlockModal.showTypedPin ? "Ẩn số" : "Hiện số"}
                      </button>
                    </div>
                    <input
                      id="unlock-pin-input"
                      type={unlockModal.showTypedPin ? "text" : "password"}
                      inputMode="numeric"
                      maxLength={6}
                      autoFocus
                      value={unlockModal.pin}
                      onChange={(e) =>
                        setUnlockModal((m) => ({
                          ...m,
                          pin: e.target.value.replace(/\D/g, "").slice(0, 6),
                          error: "",
                        }))
                      }
                      placeholder="••••••"
                      className="mt-2.5 w-full rounded-[12px] border border-[#dfe7f5] bg-white px-4 py-3 text-center text-[24px] font-extrabold tracking-[0.35em] text-[#0b1c30] outline-none focus:border-[#0e7b4c] focus:ring-4 focus:ring-[#0e7b4c]/10 transition"
                    />
                  </div>

                  {unlockModal.error && (
                    <div role="alert" className="mt-3 flex items-center gap-2 rounded-xl bg-[#fff1f1] px-3.5 py-2.5 text-xs font-semibold text-[#b3261e]">
                      <span className="material-symbols-outlined text-[16px]">error</span>
                      <span>{unlockModal.error}</span>
                    </div>
                  )}

                  <div className="mt-5 flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => setUnlockModal(null)}
                      className="flex-1 rounded-xl border border-[#dfe7f5] bg-white py-2.5 text-[13px] font-semibold text-[#3a475a] hover:bg-[#f8faff]"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={unlockModal.pin.length !== 6}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0e7b4c] py-2.5 text-[13px] font-bold text-white shadow hover:bg-[#0b633d] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[17px]">lock_open</span>
                      <span>Mở khóa kho</span>
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={submitStoredItems} className="mt-4 space-y-4">
                  <div className="flex items-center gap-2 rounded-xl border border-[#abefc6] bg-[#ecfdf3] px-3.5 py-2.5 text-xs font-semibold text-[#027a48]">
                    <span className="material-symbols-outlined text-[18px] text-[#12b76a]">check_circle</span>
                    <span>Đã mở khóa Ô kho {currentUnitCode}! Hãy nhập tên đồ đạc và số lượng bên dưới.</span>
                  </div>

                  {/* New items input rows */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#58657a]">
                        Thêm đồ mới vào kho
                      </span>
                      <button
                        type="button"
                        onClick={addNewItemRow}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#eef4ff] px-2.5 py-1 text-xs font-bold text-[#1d5fe5] hover:bg-[#dce8ff]"
                      >
                        <span className="material-symbols-outlined text-[15px]">add</span>
                        Thêm dòng
                      </button>
                    </div>

                    {unlockModal.newItems.map((row, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-[#dfe7f5] bg-[#f8faff] p-3 space-y-2"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex-1 min-w-[180px]">
                            <label className="block text-[11px] font-semibold text-[#58657a]">
                              Tên đồ đạc *
                            </label>
                            <input
                              type="text"
                              required
                              autoFocus={idx === 0}
                              value={row.itemName}
                              onChange={(e) => updateNewItemRow(idx, "itemName", e.target.value)}
                              placeholder="VD: Thùng tài liệu, Vali quần áo..."
                              className="mt-1 w-full rounded-lg border border-[#dfe7f5] bg-white px-3 py-2 text-xs font-semibold text-[#0b1c30] outline-none focus:border-[#1d5fe5]"
                            />
                          </div>

                          <div className="w-28">
                            <label className="block text-[11px] font-semibold text-[#58657a]">
                              Số lượng *
                            </label>
                            <div className="mt-1 flex items-center rounded-lg border border-[#dfe7f5] bg-white">
                              <button
                                type="button"
                                onClick={() =>
                                  updateNewItemRow(idx, "quantity", Math.max(1, Number(row.quantity || 1) - 1))
                                }
                                className="px-2.5 py-1.5 text-sm font-bold text-[#58657a] hover:text-[#0b1c30]"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min={1}
                                value={row.quantity}
                                onChange={(e) =>
                                  updateNewItemRow(idx, "quantity", Math.max(1, parseInt(e.target.value, 10) || 1))
                                }
                                className="w-full text-center text-xs font-bold text-[#0b1c30] outline-none"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  updateNewItemRow(idx, "quantity", Number(row.quantity || 1) + 1)
                                }
                                className="px-2.5 py-1.5 text-sm font-bold text-[#58657a] hover:text-[#0b1c30]"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-[11px] font-semibold text-[#58657a]">Phân loại:</span>
                            <select
                              value={row.category}
                              onChange={(e) => updateNewItemRow(idx, "category", e.target.value)}
                              className="rounded-lg border border-[#dfe7f5] bg-white px-2.5 py-1 text-xs font-semibold text-[#0b1c30] outline-none focus:border-[#1d5fe5]"
                            >
                              {ITEM_CATEGORIES.map((c) => (
                                <option key={c.value} value={c.value}>
                                  {c.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          {unlockModal.newItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeNewItemRow(idx)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#b3261e] hover:underline"
                            >
                              <span className="material-symbols-outlined text-[14px]">delete</span>
                              Xóa dòng
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {unlockModal.error && (
                    <div role="alert" className="rounded-xl bg-[#fff1f1] px-3.5 py-2.5 text-xs font-semibold text-[#b3261e]">
                      {unlockModal.error}
                    </div>
                  )}

                  {unlockModal.successMsg && (
                    <div role="status" className="rounded-xl bg-[#ecfdf3] px-3.5 py-2.5 text-xs font-semibold text-[#027a48]">
                      {unlockModal.successMsg}
                    </div>
                  )}

                  <div className="flex gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setUnlockModal(null)}
                      className="flex-1 rounded-xl border border-[#dfe7f5] bg-white py-2.5 text-[13px] font-semibold text-[#3a475a] hover:bg-[#f8faff]"
                    >
                      Đóng kho
                    </button>
                    <button
                      type="submit"
                      disabled={unlockModal.saving}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#1d5fe5] py-2.5 text-[13px] font-bold text-white shadow hover:bg-[#1550c7] disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[17px]">save</span>
                      <span>{unlockModal.saving ? "Đang lưu..." : "Lưu vào kho"}</span>
                    </button>
                  </div>

                  {/* Existing Stored Items inside the modal */}
                  {storedItems.length > 0 && (
                    <div className="border-t border-[#eef1f8] pt-4">
                      <div className="text-xs font-bold uppercase tracking-wider text-[#58657a]">
                        Đồ đang có trong kho ({totalStoredItemsCount} món)
                      </div>
                      <div className="mt-2 max-h-44 overflow-y-auto divide-y divide-[#eef1f8] rounded-xl border border-[#eef1f8] bg-[#f8faff] px-3">
                        {storedItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between gap-2 py-2 text-xs">
                            <div className="truncate font-semibold text-[#0b1c30]">
                              {item.itemName}{" "}
                              <span className="text-[10px] font-normal text-[#8996a9]">
                                ({CATEGORY_LABELS[item.category] || item.category})
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                disabled={item.quantity <= 1 || updatingItemId === item.id}
                                onClick={() => handleAdjustExistingQuantity(item, -1)}
                                className="flex h-6 w-6 items-center justify-center rounded border border-[#dfe7f5] bg-white font-bold text-[#0b1c30] disabled:opacity-40"
                              >
                                -
                              </button>
                              <span className="min-w-[36px] text-center font-bold text-[#1d5fe5]">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                disabled={updatingItemId === item.id}
                                onClick={() => handleAdjustExistingQuantity(item, 1)}
                                className="flex h-6 w-6 items-center justify-center rounded border border-[#dfe7f5] bg-white font-bold text-[#0b1c30] disabled:opacity-40"
                              >
                                +
                              </button>
                              <button
                                type="button"
                                disabled={updatingItemId === item.id}
                                onClick={() => handleRemoveExistingItem(item.id)}
                                className="ml-1 text-[#b3261e] hover:opacity-80 disabled:opacity-40"
                              >
                                <span className="material-symbols-outlined text-[15px]">delete</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>,
          document.body
        )}

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
