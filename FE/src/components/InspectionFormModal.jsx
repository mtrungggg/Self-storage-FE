import { useState, useMemo } from "react";
import staffInspectionService from "../api/staffInspectionService";
import MediaUpload from "./MediaUpload";

function formatMoney(amount) {
  if (amount == null || isNaN(amount)) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

const DEFAULT_DAMAGE_ITEMS = [
  { itemName: "Vệ sinh kho / Dọn dẹp rác tồn", cost: "150000", notes: "" },
  { itemName: "Trầy xước / Sơn tường ố bẩn", cost: "300000", notes: "" },
  { itemName: "Móp méo / Kẹt ray cửa cuốn", cost: "500000", notes: "" },
  { itemName: "Hỏng ổ khóa / Chốt then cài", cost: "200000", notes: "" },
];

export default function InspectionFormModal({ inspection, isOpen, onClose, onSuccess }) {
  const deposit = Number(
    inspection?.depositAmount ??
    inspection?.deposit ??
    inspection?.securityDeposit ??
    2000000
  );

  const [hasDamage, setHasDamage] = useState(false);
  const [damageItems, setDamageItems] = useState([
    { itemName: "Dọn dẹp vệ sinh kho", cost: "200000", notes: "Bụi bẩn và rác đóng gói còn sót lại" },
  ]);
  const [manualDamageCost, setManualDamageCost] = useState("");
  const [evidenceUrls, setEvidenceUrls] = useState([]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Tính tổng chi phí hư hại
  const calculatedDamageCost = useMemo(() => {
    if (!hasDamage) return 0;
    if (manualDamageCost !== "" && !isNaN(Number(manualDamageCost))) {
      return Math.max(0, Number(manualDamageCost));
    }
    return damageItems.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);
  }, [hasDamage, manualDamageCost, damageItems]);

  // Box tính toán thời gian thực
  const calculation = useMemo(() => {
    if (!hasDamage) {
      return {
        hasDamage: false,
        damageCost: 0,
        refundAmount: deposit,
        penaltyAmount: 0,
        isOverDeposit: false,
      };
    }

    const damage = calculatedDamageCost;
    if (damage <= deposit) {
      return {
        hasDamage: true,
        damageCost: damage,
        refundAmount: deposit - damage,
        penaltyAmount: 0,
        isOverDeposit: false,
      };
    }

    // Khi DamageCost > Deposit
    return {
      hasDamage: true,
      damageCost: damage,
      refundAmount: 0,
      penaltyAmount: damage - deposit,
      isOverDeposit: true,
    };
  }, [hasDamage, calculatedDamageCost, deposit]);

  if (!isOpen || !inspection) return null;

  function handleAddPresetItem(preset) {
    setDamageItems((prev) => [...prev, { ...preset }]);
    setManualDamageCost(""); // reset manual override when modifying items list
  }

  function handleAddItem() {
    setDamageItems((prev) => [
      ...prev,
      { itemName: "", cost: "100000", notes: "" },
    ]);
    setManualDamageCost("");
  }

  function handleRemoveItem(index) {
    setDamageItems((prev) => prev.filter((_, i) => i !== index));
    setManualDamageCost("");
  }

  function handleUpdateItem(index, key, val) {
    setDamageItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [key]: val } : item))
    );
    setManualDamageCost("");
  }

  function handleAddPhoto(uploaded) {
    const url = uploaded?.url || (typeof uploaded === "string" ? uploaded : null);
    if (!url) return;
    setEvidenceUrls((prev) => [...prev, url]);
  }

  function handleRemovePhoto(index) {
    setEvidenceUrls((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (hasDamage && calculation.damageCost > 0 && damageItems.length === 0 && !manualDamageCost) {
      setError("Vui lòng ghi rõ hạng mục hư hỏng hoặc nhập tổng chi phí đền bù.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        hasDamage,
        overallCondition: hasDamage ? "Damaged" : "Good",
        damageCost: Number(calculation.damageCost || 0),
        refundAmount: Number(calculation.refundAmount || 0),
        penaltyAmount: Number(calculation.penaltyAmount || 0),
        notes: notes.trim(),
        summary: notes.trim() || (hasDamage ? "Kho có hư hại / cần xử lý" : "Kho sạch sẽ, không hư hại"),
        damageItems: hasDamage
          ? damageItems.map((item) => ({
              itemName: item.itemName.trim(),
              cost: Number(item.cost || 0),
              notes: item.notes?.trim() || "",
            }))
          : [],
        damageItemNames: hasDamage
          ? damageItems.map((item) => item.itemName.trim()).filter(Boolean)
          : [],
        evidenceUrls,
        photoUrls: evidenceUrls,
      };

      const result = await staffInspectionService.submitInspection(inspection.id, payload);
      if (onSuccess) {
        onSuccess(result || payload);
      }
      onClose();
    } catch (err) {
      setError(err.message || "Không thể gửi biên bản kiểm tra. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="inspection-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[24px] text-[#1d5fe5]">
                fact_check
              </span>
              <h2 id="inspection-modal-title" className="text-base font-bold text-slate-900">
                Biên bản kiểm tra trả kho · Kho {inspection.unitCode || "—"}
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Hợp đồng: <strong className="text-slate-700">{inspection.agreementNo || `#${inspection.id}`}</strong>
              {inspection.customerName && ` · Khách hàng: ${inspection.customerName}`}
              {inspection.customerPhone && ` (${inspection.customerPhone})`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Thông tin tiền cọc ban đầu */}
        <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-slate-500">lock</span>
            <span className="text-slate-600 font-medium">Tiền đặt cọc ban đầu (Deposit):</span>
          </div>
          <span className="text-sm font-extrabold text-[#1d5fe5]">
            {formatMoney(deposit)}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Toggle: Kho có bị hư hại / bẩn không? */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
              Hiện trạng nghiệm thu: Kho có bị hư hại / bẩn không? *
            </label>

            <div className="grid grid-cols-2 gap-3 mt-2">
              {/* Option: Không hư hại */}
              <button
                type="button"
                onClick={() => {
                  setHasDamage(false);
                  setManualDamageCost("");
                }}
                className={`flex items-center justify-center gap-2 rounded-xl p-3 border text-xs font-bold transition cursor-pointer ${
                  !hasDamage
                    ? "border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-200 shadow-xs"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="material-symbols-outlined text-[18px] text-emerald-600">
                  check_circle
                </span>
                <span>Không (Kho nguyên vẹn &amp; sạch)</span>
              </button>

              {/* Option: Có hư hại / bẩn */}
              <button
                type="button"
                onClick={() => setHasDamage(true)}
                className={`flex items-center justify-center gap-2 rounded-xl p-3 border text-xs font-bold transition cursor-pointer ${
                  hasDamage
                    ? "border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-200 shadow-xs"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="material-symbols-outlined text-[18px] text-amber-600">
                  warning
                </span>
                <span>Có (Bị bẩn hoặc có hư hại)</span>
              </button>
            </div>
          </div>

          {/* TRƯỜNG HỢP 1: NẾU KHÔNG CÓ HƯ HẠI */}
          {!hasDamage && (
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50/80 p-4 text-xs space-y-2 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm">
                <span className="material-symbols-outlined text-[20px] text-emerald-600">verified</span>
                <span>Hoàn trả 100% cọc</span>
              </div>
              <p className="text-emerald-950">
                Kho đạt tiêu chuẩn sạch sẽ, không có hư hại về kết cấu và phụ kiện. Khách hàng được nhận lại toàn bộ số tiền đặt cọc.
              </p>
              <div className="flex items-center justify-between border-t border-emerald-200 pt-2 font-semibold">
                <span className="text-slate-600">Chi phí hư hại (DamageCost):</span>
                <span className="text-emerald-700 font-bold">0 ₫</span>
              </div>
              <div className="flex items-center justify-between font-bold text-sm">
                <span className="text-slate-800">Số tiền hoàn cọc cho khách:</span>
                <span className="text-emerald-700 font-extrabold">{formatMoney(deposit)} (100%)</span>
              </div>
            </div>
          )}

          {/* TRƯỜNG HỢP 2: NẾU CÓ HƯ HẠI / BẨN */}
          {hasDamage && (
            <div className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50/40 p-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-950 uppercase tracking-wide flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-amber-600">handyman</span>
                  Danh sách hạng mục hư hại &amp; chi phí bồi thường
                </label>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#1d5fe5] hover:underline"
                >
                  <span className="material-symbols-outlined text-[16px]">add_circle</span>
                  Thêm hạng mục
                </button>
              </div>

              {/* Preset buttons nhanh */}
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                <span className="text-slate-500 font-semibold self-center mr-1">Thêm nhanh:</span>
                {DEFAULT_DAMAGE_ITEMS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddPresetItem(preset)}
                    className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-700 hover:border-[#1d5fe5] hover:text-[#1d5fe5] transition"
                  >
                    + {preset.itemName}
                  </button>
                ))}
              </div>

              {/* Danh sách các hạng mục */}
              <div className="space-y-2.5">
                {damageItems.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-xs space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                        {index + 1}
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="Tên hạng mục hư hỏng (VD: Vệ sinh rác, Cửa cuốn móp...)"
                        value={item.itemName}
                        onChange={(e) => handleUpdateItem(index, "itemName", e.target.value)}
                        className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-[#1d5fe5]"
                      />
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          required
                          min="0"
                          step="10000"
                          placeholder="Chi phí"
                          value={item.cost}
                          onChange={(e) => handleUpdateItem(index, "cost", e.target.value)}
                          className="w-28 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900 outline-none focus:border-[#1d5fe5] text-right"
                        />
                        <span className="text-slate-500 text-[11px] font-semibold">₫</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-slate-400 hover:text-rose-600 transition p-1"
                        title="Xóa hạng mục"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Ghi chú chi tiết mức độ hư hại (tùy chọn)..."
                      value={item.notes || ""}
                      onChange={(e) => handleUpdateItem(index, "notes", e.target.value)}
                      className="w-full rounded-lg border border-slate-100 bg-slate-50/60 px-2.5 py-1 text-[11px] text-slate-600 outline-none focus:border-[#1d5fe5]"
                    />
                  </div>
                ))}
              </div>

              {/* Tổng chi phí hư hại DamageCost */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-amber-200 pt-2.5">
                <span className="text-xs font-bold text-slate-800">
                  Tổng chi phí đền bù / dọn dẹp (DamageCost):
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    placeholder="Tùy chỉnh tổng phí..."
                    value={manualDamageCost !== "" ? manualDamageCost : calculatedDamageCost}
                    onChange={(e) => setManualDamageCost(e.target.value)}
                    className="w-36 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-extrabold text-amber-900 outline-none text-right"
                  />
                  <span className="text-xs font-bold text-amber-900">VNĐ</span>
                </div>
              </div>

              {/* Upload ảnh hiện trường nghiệm thu */}
              <div className="border-t border-amber-200 pt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Ảnh chụp hiện trường hư hại / rác tồn ({evidenceUrls.length})
                  </label>
                </div>
                <MediaUpload
                  label="Tải lên ảnh bằng chứng hiện trường"
                  accept="image/*"
                  multiple
                  dropzone
                  disabled={submitting}
                  onUploaded={handleAddPhoto}
                />
                {evidenceUrls.length > 0 && (
                  <div className="mt-2.5 grid grid-cols-4 gap-2">
                    {evidenceUrls.map((url, i) => (
                      <div
                        key={i}
                        className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-xs"
                      >
                        <img src={url} alt={`Evidence ${i + 1}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(i)}
                          className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white hover:bg-rose-600 transition"
                          title="Xóa ảnh"
                        >
                          <span className="material-symbols-outlined text-[13px]">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* BOX TÍNH TOÁN THỜI GIAN THỰC (REAL-TIME CALCULATION BOX) */}
          <div className="rounded-2xl border p-4 text-xs space-y-2 transition-all">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-bold uppercase tracking-wider text-slate-700 text-[11px] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-slate-500">calculate</span>
                Bảng tính quyết toán thời gian thực
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                POST /api/staff/inspections/{inspection.id}/submit
              </span>
            </div>

            <div className="space-y-1.5 pt-1 text-slate-700">
              <div className="flex justify-between">
                <span>Tiền cọc của khách hàng (Deposit):</span>
                <span className="font-semibold text-slate-900">{formatMoney(deposit)}</span>
              </div>
              <div className="flex justify-between">
                <span>Chi phí khấu trừ hư hại (DamageCost):</span>
                <span className="font-semibold text-rose-600">- {formatMoney(calculation.damageCost)}</span>
              </div>
            </div>

            {/* TRƯỜNG HỢP 1: DamageCost <= Deposit */}
            {!calculation.isOverDeposit && (
              <div className="mt-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-emerald-950 space-y-1">
                <div className="flex items-center justify-between text-sm font-bold">
                  <span className="text-emerald-900">Số tiền hoàn cọc cho khách (RefundAmount):</span>
                  <span className="text-emerald-700 text-base">{formatMoney(calculation.refundAmount)}</span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  {calculation.damageCost === 0
                    ? "✓ Kho sạch sẽ: Hoàn trả 100% tiền đặt cọc cho khách hàng."
                    : `✓ Tiền cọc đủ bù đắp thiệt hại. Hoàn lại ${formatMoney(calculation.refundAmount)} sau khi trừ ${formatMoney(calculation.damageCost)} tiền sửa chữa.`}
                </p>
              </div>
            )}

            {/* TRƯỜNG HỢP 2: DamageCost > Deposit (CẢNH BÁO ĐỎ) */}
            {calculation.isOverDeposit && (
              <div className="mt-2 rounded-xl bg-rose-50 border-2 border-rose-500 p-3.5 text-rose-950 space-y-2 shadow-xs animate-in fade-in">
                <div className="flex items-center gap-2 font-extrabold text-rose-800 text-sm">
                  <span className="material-symbols-outlined text-rose-600 text-[22px]">error</span>
                  <span>CẢNH BÁO: CHI PHÍ HƯ HẠI VƯỢT QUÁ TIỀN CỌC!</span>
                </div>

                <div className="rounded-lg bg-rose-100/80 p-2.5 font-bold text-rose-900 text-xs">
                  Thu 100% cọc + Tạo hóa đơn phạt thu thêm = {formatMoney(calculation.penaltyAmount)}
                </div>

                <div className="space-y-1 text-[11px] text-rose-900 leading-relaxed">
                  <p>
                    • <strong>Khấu trừ tiền cọc:</strong> Giữ lại toàn bộ <strong>{formatMoney(deposit)}</strong> (0 ₫ hoàn lại).
                  </p>
                  <p>
                    • <strong>Thu thêm:</strong> Hệ thống sẽ tự động tạo hóa đơn phạt bồi thường thiệt hại thu thêm <strong>{formatMoney(calculation.penaltyAmount)}</strong> gửi tới khách hàng.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Ghi chú chung */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">
              Ghi chú biên bản nghiệm thu (Notes):
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nhập ghi chú nghiệm thu kho, tình trạng bàn giao chìa khóa/khoá mã số..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-900 outline-none focus:border-[#1d5fe5] focus:bg-white"
            />
          </div>

          {error && (
            <div role="alert" className="rounded-lg bg-rose-50 p-3 text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-3">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold text-white shadow-xs transition disabled:opacity-50 ${
                calculation.isOverDeposit
                  ? "bg-rose-600 hover:bg-rose-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>
                {submitting
                  ? "Đang lưu biên bản..."
                  : calculation.isOverDeposit
                  ? "Xác nhận & Xuất hóa đơn phạt"
                  : "Xác nhận & Hoàn cọc"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
