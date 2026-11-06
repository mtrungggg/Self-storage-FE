import DatePicker from "@/components/ui/date-picker";
import { useEffect, useMemo, useRef, useState } from "react";
import rentalService from "../api/rentalService";
import facilityService from "../api/facilityService";
import SupportDropdown from "./SupportDropdown";
import { useLanguage } from "../context/LanguageContext";

function localDate() {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function getUnitCategory(type) {
  const n = (type?.name || "").toLowerCase();
  const c = (type?.code || "").toLowerCase();
  if (n.includes("climate") || c.includes("climate")) return "climate_controlled";
  if (n.includes("seafood") || n.includes("freeze") || n.includes("cold") || c.includes("seafood")) return "cold_seafood";
  if (n.includes("warm") || n.includes("heat") || c.includes("warm")) return "heated_warm";
  if (n.includes("locker") || c.includes("mini") || n.includes("mini smart")) return "smart_locker";
  return "dry_standard";
}

function getUnitCategoryLabel(catKey, isVi) {
  switch (catKey) {
    case "climate_controlled":
      return isVi ? "Kho mát điều hòa (Climate-Controlled)" : "Climate-Controlled Storage";
    case "cold_seafood":
      return isVi ? "Kho lạnh / Thủy hải sản (Cold / Deep Freeze)" : "Cold / Deep Freeze Storage";
    case "heated_warm":
      return isVi ? "Kho giữ nhiệt (Heated Warm Storage)" : "Heated Warm Storage";
    case "smart_locker":
      return isVi ? "Tủ đồ thông minh (Smart Dry Locker)" : "Smart Dry Locker";
    case "dry_standard":
    default:
      return isVi ? "Kho tiêu chuẩn / Khô (Dry Goods Storage)" : "Standard Dry Goods Storage";
  }
}

function getUnitSizeKey(type) {
  const area = Number(type?.areaM2 || (type?.widthM * type?.lengthM) || 0);
  if (area <= 1.5) return "mini";
  if (area <= 3.5) return "small";
  if (area <= 6.5) return "medium";
  if (area <= 10.5) return "large";
  return "xlarge";
}

function getUnitSizeLabel(sizeKey, areaM2, isVi) {
  const areaText = areaM2 ? `${areaM2} m²` : "";
  switch (sizeKey) {
    case "mini":
      return isVi ? "Mini (1 m² - 1.2 m³)" : "Mini (1 m² - 1.2 m³)";
    case "small":
      return isVi ? `Nhỏ - Small (${areaText || "3 m²"} - 7.5 m³)` : `Small (${areaText || "3 m²"} - 7.5 m³)`;
    case "medium":
      return isVi ? `Vừa - Medium (${areaText || "6 m²"} - 15 m³)` : `Medium (${areaText || "6 m²"} - 15 m³)`;
    case "large":
      return isVi ? `Lớn - Large (${areaText || "10 m²"} - 28 m³)` : `Large (${areaText || "10 m²"} - 28 m³)`;
    case "xlarge":
      return isVi ? `Rất lớn - XL (${areaText || "16 m²"} - 48 m³)` : `Extra Large (${areaText || "16 m²"} - 48 m³)`;
    default:
      return `${areaText || sizeKey}`;
  }
}

export default function UnitTransferRequest({ agreementId, unitId, facilityId, currentFacilityName = "" }) {
  const resolvedAgreementId = agreementId || unitId;
  const { t, translateStatus, lang } = useLanguage();
  const isVi = lang === "vi";
  const [open, setOpen] = useState(false);
  const [facilities, setFacilities] = useState([]);
  const [facilitiesLoading, setFacilitiesLoading] = useState(false);
  const [transferMode, setTransferMode] = useState("same_facility");
  const [selectedFacilityId, setSelectedFacilityId] = useState(facilityId ? String(facilityId) : "");
  const [unitTypes, setUnitTypes] = useState([]);
  const [typesLoading, setTypesLoading] = useState(false);
  const [requestedUnitTypeId, setRequestedUnitTypeId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  const categoryOptions = useMemo(() => {
    const seen = new Set();
    const list = [];
    unitTypes.forEach((t) => {
      const cat = getUnitCategory(t);
      if (!seen.has(cat)) {
        seen.add(cat);
        list.push({
          value: cat,
          label: getUnitCategoryLabel(cat, isVi),
        });
      }
    });
    return list;
  }, [unitTypes, isVi]);

  const sizeOptions = useMemo(() => {
    const filteredTypes = selectedCategory
      ? unitTypes.filter((t) => getUnitCategory(t) === selectedCategory)
      : unitTypes;

    const seen = new Set();
    const list = [];
    filteredTypes.forEach((t) => {
      const sz = getUnitSizeKey(t);
      if (!seen.has(sz)) {
        seen.add(sz);
        const area = Number(t.areaM2 || (t.widthM * t.lengthM) || 0);
        list.push({
          value: sz,
          label: getUnitSizeLabel(sz, area, isVi),
          area,
        });
      }
    });
    return list.sort((a, b) => a.area - b.area);
  }, [unitTypes, selectedCategory, isVi]);

  const selectedUnitType = useMemo(() => {
    return unitTypes.find((t) => String(t.id) === String(requestedUnitTypeId));
  }, [unitTypes, requestedUnitTypeId]);

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    const availableInCat = unitTypes.filter((t) => getUnitCategory(t) === cat);
    const matching = availableInCat.find((t) => getUnitSizeKey(t) === selectedSize);
    if (matching) {
      setRequestedUnitTypeId(String(matching.id));
    } else if (availableInCat.length > 0) {
      // Tự động pre-select kích thước khả dụng đầu tiên của Loại kho mới
      setSelectedSize(getUnitSizeKey(availableInCat[0]));
      setRequestedUnitTypeId(String(availableInCat[0].id));
    } else {
      setSelectedSize("");
      setRequestedUnitTypeId("");
    }
  };

  const handleSizeChange = (sz) => {
    setSelectedSize(sz);
    if (!selectedCategory) return;
    const matching = unitTypes.find(
      (t) => getUnitCategory(t) === selectedCategory && getUnitSizeKey(t) === sz
    );
    if (matching) {
      setRequestedUnitTypeId(String(matching.id));
    }
  };
  const [requestedEffectiveDate, setRequestedEffectiveDate] = useState(localDate);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const lock = useRef(false);

  useEffect(() => {
    if (facilityId && transferMode === "same_facility") {
      setSelectedFacilityId(String(facilityId));
    }
  }, [facilityId, transferMode]);

  // Load facilities and unit types
  useEffect(() => {
    if (!open) return undefined;
    let active = true;

    if (facilities.length === 0) {
      setFacilitiesLoading(true);
      facilityService.getFacilities()
        .then((data) => {
          if (active) setFacilities(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          if (active) console.warn("Failed to load facilities:", err);
        })
        .finally(() => {
          if (active) setFacilitiesLoading(false);
        });
    }

    if (unitTypes.length === 0) {
      setTypesLoading(true);
      facilityService.getUnitTypes()
        .then((data) => {
          if (active) setUnitTypes(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          if (active) setError(err.message || t("common.error", "Error loading unit types"));
        })
        .finally(() => {
          if (active) setTypesLoading(false);
        });
    }

    return () => { active = false; };
  }, [open, facilities.length, unitTypes.length, t]);

  // Load / Update transfer preview whenever facility, unit type, or date changes
  useEffect(() => {
    if (!open || !resolvedAgreementId) return;
    let active = true;

    const targetFacility = Number(selectedFacilityId) || Number(facilityId);
    const targetUnitType = Number(requestedUnitTypeId) || null;

    setPreviewLoading(true);
    rentalService.getTransferPreview(resolvedAgreementId, {
      requestedFacilityId: targetFacility || undefined,
      requestedUnitTypeId: targetUnitType || undefined,
      moveOutDate: requestedEffectiveDate,
    })
      .then((data) => {
        if (active) {
          setPreview(data);
          if (data && !data.canTransfer && data.disabledReason) {
            setError(data.disabledReason);
          } else {
            setError("");
          }
        }
      })
      .catch((err) => {
        if (active) console.warn("Failed to load transfer preview:", err);
      })
      .finally(() => {
        if (active) setPreviewLoading(false);
      });

    return () => { active = false; };
  }, [open, resolvedAgreementId, selectedFacilityId, facilityId, requestedUnitTypeId, requestedEffectiveDate]);

  const copyToClipboard = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  async function submit(event) {
    event.preventDefault();
    const targetFacility = Number(selectedFacilityId) || Number(facilityId);
    if (!Number.isInteger(targetFacility) || targetFacility <= 0) {
      setError(t("common.required", "Select target facility"));
      return;
    }

    const unitTypeId = Number(requestedUnitTypeId);
    if (!Number.isInteger(unitTypeId) || unitTypeId <= 0) {
      setError(t("common.required", "Select target unit type"));
      return;
    }

    if (preview && !preview.canTransfer) {
      setError(preview.disabledReason || t("transfer.max_transfers_reached", "Maximum transfers reached"));
      return;
    }

    if (lock.current) return;
    lock.current = true;
    setLoading(true);
    setError("");
    try {
      const data = await rentalService.requestUnitTransfer(resolvedAgreementId, {
        requestedUnitTypeId: unitTypeId,
        requestedFacilityId: targetFacility,
        moveOutDate: requestedEffectiveDate,
        moveInDate: requestedEffectiveDate,
        reason: reason.trim() || t("transfer.title", "Transfer Request"),
      });
      setResult(data);
    } catch (err) {
      const msg = err.message || "";
      setError(msg.toLowerCase().includes("debt") || msg.toLowerCase().includes("overdue")
        ? t("billing.overdue_notice", "Outstanding debt must be settled first")
        : (msg || t("common.error", "Failed to submit request")));
    } finally {
      lock.current = false;
      setLoading(false);
    }
  }

  if (result) {
    const targetFacilityObj = facilities.find((f) => String(f.id) === String(selectedFacilityId));
    const requiresPayment = Number(result.totalPaidAmount) > 0 && result.paymentQrUrl;

    return (
      <div role="status" className="mt-3 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/70 to-white dark:from-zinc-900 dark:to-zinc-950 dark:border-blue-900/40 p-4 text-xs space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-blue-100 dark:border-zinc-800 pb-2.5">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-zinc-100 text-sm">
            <span className="material-symbols-outlined text-emerald-600 text-[20px]">check_circle</span>
            <span>{t("transfer.request_sent", "Yêu cầu chuyển kho đã được tạo")}</span>
          </div>
          <span className="font-mono font-bold text-xs bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 rounded-md">
            #{result.id}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-zinc-400">
          <div>
            <span className="block text-[11px] text-slate-500">{t("common.status", "Trạng thái")}:</span>
            <span className="font-bold text-slate-800 dark:text-zinc-200">
              {translateStatus(result.status || "pending")}
            </span>
          </div>
          {targetFacilityObj && (
            <div>
              <span className="block text-[11px] text-slate-500">{t("common.facility", "Cơ sở mới")}:</span>
              <span className="font-semibold text-slate-800 dark:text-zinc-200">{targetFacilityObj.name}</span>
            </div>
          )}
        </div>

        {requiresPayment ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50/80 dark:bg-amber-950/30 dark:border-amber-900/60 p-3.5 space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200 text-xs">
              <span className="material-symbols-outlined text-[18px] text-amber-600">payments</span>
              <span>{t("transfer.pay_now_qr", "Quét mã VietQR thanh toán phí chuyển kho")}</span>
            </div>

            <p className="text-[11px] text-amber-800/90 dark:text-amber-300">
              {t("transfer.pay_instructions", "Quý khách vui lòng quét mã VietQR hoặc chuyển khoản đúng nội dung để hệ thống tự động xác nhận chuyển kho.")}
            </p>

            <div className="flex flex-col md:flex-row items-center gap-4 bg-white dark:bg-zinc-900 p-3 rounded-xl border border-amber-200/80 dark:border-zinc-800 shadow-xs">
              <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-50 border border-slate-200">
                <img
                  src={result.paymentQrUrl}
                  alt="VietQR Transfer Payment"
                  className="h-44 w-44 object-contain rounded"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <span className="text-[10px] font-semibold text-slate-500 mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">qr_code</span> VietQR
                </span>
              </div>

              <div className="flex-1 space-y-2 text-xs w-full">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-1.5">
                  <span className="text-slate-500">{t("billing.amount", "Số tiền")}:</span>
                  <span className="font-extrabold text-base text-amber-600 dark:text-amber-400">
                    {Number(result.totalPaidAmount).toLocaleString()} VND
                  </span>
                </div>

                {result.paymentContent && (
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-1.5">
                    <span className="text-slate-500">{t("billing.memo", "Nội dung CK")}:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">{result.paymentContent}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(result.paymentContent, "memo")}
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 cursor-pointer"
                        title="Copy memo"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {copiedField === "memo" ? "check" : "content_copy"}
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-1 text-[11px] text-slate-500">
                  {result.diffRentAmount > 0 && (
                    <div className="flex justify-between">
                      <span>{t("transfer.diff_rent", "Tiền thuê chênh lệch:")}</span>
                      <span>+{Number(result.diffRentAmount).toLocaleString()} đ</span>
                    </div>
                  )}
                  {result.diffDepositAmount > 0 && (
                    <div className="flex justify-between">
                      <span>{t("transfer.diff_deposit", "Tiền cọc chênh lệch:")}</span>
                      <span>+{Number(result.diffDepositAmount).toLocaleString()} đ</span>
                    </div>
                  )}
                  {result.cleaningFee > 0 && (
                    <div className="flex justify-between">
                      <span>{t("transfer.cleaning_fee", "Phí dọn dẹp vệ sinh kho cũ:")}</span>
                      <span>+{Number(result.cleaningFee).toLocaleString()} đ</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-800 text-xs">
            {t("transfer.fee_notice", "Yêu cầu chuyển kho miễn phí đã được tiếp nhận và nhân viên sẽ xử lý.")}
          </div>
        )}
      </div>
    );
  }

  const otherFacilities = facilities.filter((f) => String(f.id) !== String(facilityId));

  return (
    <details open={open} onToggle={(event) => setOpen(event.currentTarget.open)} className="mt-2 border-t border-[#dfe7f5] dark:border-zinc-800 pt-2 text-xs">
      <summary className="cursor-pointer font-semibold text-zinc-900 dark:text-zinc-100 hover:underline flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-blue-600">swap_horiz</span>
          {t("transfer.title", "Unit Transfer Request")}
        </span>
        {preview && (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
            preview.transferCount >= preview.maxTransfers
              ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:border-red-900"
              : "bg-slate-100 text-slate-700 border-slate-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700"
          }`}>
            {t("transfer.transfers_count", "Lượt chuyển:")} {preview.transferCount} / {preview.maxTransfers}
          </span>
        )}
      </summary>

      <form onSubmit={submit} className="mt-2 space-y-2.5">
        {/* Limit Warning if max reached */}
        {preview && !preview.canTransfer && (
          <div role="alert" className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 p-2.5 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <span className="material-symbols-outlined text-[18px] text-amber-600 shrink-0 mt-0.5">warning</span>
            <span>{preview.disabledReason || t("transfer.max_transfers_reached", "Hợp đồng đã đạt giới hạn tối đa 2 lần chuyển kho.")}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setTransferMode("same_facility");
                setSelectedFacilityId(String(facilityId));
              }}
              className={`flex items-center justify-center gap-1.5 rounded-xl border p-2 text-xs font-bold transition cursor-pointer ${
                transferMode === "same_facility"
                  ? "border-zinc-900 dark:border-zinc-100 bg-zinc-900 text-white shadow-xs"
                  : "border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">domain</span>
              {t("transfer.same_facility", "Same Facility")}
            </button>

            <button
              type="button"
              onClick={() => {
                setTransferMode("cross_facility");
                if (otherFacilities.length > 0 && String(selectedFacilityId) === String(facilityId)) {
                  setSelectedFacilityId(String(otherFacilities[0].id));
                }
              }}
              className={`flex items-center justify-center gap-1.5 rounded-xl border p-2 text-xs font-bold transition cursor-pointer ${
                transferMode === "cross_facility"
                  ? "border-zinc-900 dark:border-zinc-100 bg-zinc-900 text-white shadow-xs"
                  : "border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
              {t("transfer.cross_facility", "Another Facility")}
            </button>
          </div>
        </div>

        {transferMode === "cross_facility" ? (
          <div className="space-y-1.5">
            <SupportDropdown
              label={t("transfer.target_facility", "Target Facility")}
              icon="warehouse"
              disabled={facilitiesLoading || (preview && !preview.canTransfer)}
              value={selectedFacilityId}
              onChange={setSelectedFacilityId}
              placeholder={facilitiesLoading ? t("common.loading", "Loading...") : t("transfer.target_facility", "Target Facility")}
              options={otherFacilities.map((f) => ({
                value: String(f.id),
                label: `${f.name} (${f.city || f.address || "Branch"})`,
              }))}
            />
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-800/50 p-2.5 flex items-center justify-between text-xs text-slate-600 dark:text-zinc-300">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="material-symbols-outlined text-[16px] text-slate-400">store</span>
              {t("common.facility", "Facility")}:
            </span>
            <span className="font-bold text-slate-800 dark:text-zinc-100">
              {currentFacilityName || facilities.find((f) => String(f.id) === String(facilityId))?.name || t("common.facility", "Current")}
            </span>
          </div>
        )}

        {/* Tách loại kho và kích thước ra 2 dropdown riêng biệt */}
        <div className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <SupportDropdown
              label={isVi ? "1. Loại Kho & Tiện Ích" : "1. Storage Environment"}
              icon="category"
              disabled={typesLoading || (preview && !preview.canTransfer)}
              value={selectedCategory}
              onChange={handleCategoryChange}
              placeholder={typesLoading ? t("common.loading", "Đang tải...") : (isVi ? "Chọn loại kho..." : "Select type...")}
              options={categoryOptions}
            />

            <SupportDropdown
              label={isVi ? "2. Kích Thước & Diện Tích" : "2. Unit Size"}
              icon="aspect_ratio"
              disabled={typesLoading || (preview && !preview.canTransfer) || !selectedCategory}
              value={selectedSize}
              onChange={handleSizeChange}
              placeholder={
                !selectedCategory
                  ? (isVi ? "← Chọn loại kho trước" : "← Select type first")
                  : (isVi ? "Chọn kích thước..." : "Select size...")
              }
              options={sizeOptions}
            />
          </div>

          {selectedUnitType && (
            <div className="flex items-center justify-between rounded-xl bg-blue-50/70 dark:bg-zinc-800/60 border border-blue-200 dark:border-zinc-700 p-2.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[18px]">verified</span>
                <div>
                  <p className="font-bold text-slate-900 dark:text-zinc-100">{selectedUnitType.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    {selectedUnitType.widthM}m × {selectedUnitType.lengthM}m × {selectedUnitType.heightM}m 
                    {selectedUnitType.areaM2 ? ` • ${selectedUnitType.areaM2} m²` : ""}
                    {selectedUnitType.volumeM3 ? ` • ${selectedUnitType.volumeM3} m³` : ""}
                  </p>
                </div>
              </div>
              <span className="font-mono text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 rounded">
                {selectedUnitType.code}
              </span>
            </div>
          )}
        </div>

        <label className="block font-semibold text-slate-600 dark:text-zinc-400">
          {t("transfer.effective_date", "Target Date")}
          <DatePicker
            required
            min={localDate()}
            value={requestedEffectiveDate}
            onChange={(event) => setRequestedEffectiveDate(event.target.value)}
            disabled={preview && !preview.canTransfer}
          />
        </label>

        {/* Live Price Breakdown Box */}
        {preview && requestedUnitTypeId && preview.targetMonthlyRate != null && (
          <div className="rounded-xl border border-blue-200/80 bg-blue-50/60 dark:bg-blue-950/20 dark:border-blue-900/50 p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-blue-950 dark:text-blue-100">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-blue-600">receipt_long</span>
                {t("transfer.price_breakdown", "Chi tiết chi phí chuyển kho")}
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                preview.totalRequiredPayment > 0
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
              }`}>
                {preview.totalRequiredPayment > 0 ? t("transfer.payment_pending", "Cần thanh toán thêm") : t("transfer.free_transfer", "Miễn phí")}
              </span>
            </div>

            {preview.availableUnitsCount != null && (
              <div className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-white/70 dark:bg-zinc-900/50 border border-blue-100 dark:border-blue-900/30 text-[11px]">
                <span className="text-slate-600 dark:text-zinc-400 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-blue-600">warehouse</span>
                  {t("transfer.units_in_stock", "Kho trống khả dụng tại cơ sở:")}
                </span>
                <span className={`font-bold ${preview.availableUnitsCount > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                  {preview.availableUnitsCount > 0
                    ? `${preview.availableUnitsCount} ${t("transfer.units_available", "kho sẵn sàng")}`
                    : t("transfer.waiting_availability", "Đang chờ sắp xếp")}
                </span>
              </div>
            )}


            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-blue-100 dark:border-blue-900/40 text-slate-600 dark:text-zinc-400">
              <div>
                <span className="block text-[10px] text-slate-500">{t("transfer.current_rate", "Giá thuê hiện tại:")}</span>
                <span className="font-semibold text-slate-800 dark:text-zinc-200">{Number(preview.currentMonthlyRate || 0).toLocaleString()} đ/tháng</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500">{t("transfer.target_rate", "Giá thuê kho mới:")}</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{Number(preview.targetMonthlyRate || 0).toLocaleString()} đ/tháng</span>
              </div>
            </div>

            <div className="space-y-1 pt-1.5 border-t border-blue-100 dark:border-blue-900/40">
              {preview.diffRentAmount > 0 && (
                <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                  <span>{t("transfer.diff_rent", "Chênh lệch tiền thuê:")}</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">+{Number(preview.diffRentAmount).toLocaleString()} đ</span>
                </div>
              )}
              {preview.diffDepositAmount > 0 && (
                <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                  <span>{t("transfer.diff_deposit", "Chênh lệch tiền cọc:")}</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">+{Number(preview.diffDepositAmount).toLocaleString()} đ</span>
                </div>
              )}
              {preview.cleaningFee > 0 && (
                <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                  <span>{t("transfer.cleaning_fee", "Phí dọn dẹp kho cũ (chuyển cơ sở):")}</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">+{Number(preview.cleaningFee).toLocaleString()} đ</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-zinc-100 pt-1.5 border-t border-blue-200 dark:border-blue-900">
                <span>{t("transfer.total_payment", "Tổng thanh toán bổ sung:")}</span>
                <span className={preview.totalRequiredPayment > 0 ? "text-amber-600 dark:text-amber-400 font-extrabold" : "text-emerald-600 dark:text-emerald-400"}>
                  {preview.totalRequiredPayment > 0 ? `${Number(preview.totalRequiredPayment).toLocaleString()} đ` : t("transfer.free_transfer", "0 đ (Miễn phí)")}
                </span>
              </div>
            </div>

            {preview.isDowngrade && (
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-2 text-emerald-800 dark:text-emerald-300 text-[11px] flex items-start gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-emerald-600 mt-0.5">redeem</span>
                <span>{t("transfer.downgrade_notice", "Kho mới có giá tiết kiệm hơn! Quý khách sẽ nhận được voucher ưu đãi giảm 10% cho kỳ thanh toán tiếp theo.")}</span>
              </div>
            )}
          </div>
        )}

        <label className="block font-semibold text-slate-600 dark:text-zinc-400">
          {t("common.reason", "Reason")}
          <textarea
            required
            rows="2"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            disabled={preview && !preview.canTransfer}
            className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2 text-xs text-[#0b1c30] dark:text-zinc-100 focus:border-blue-500 focus:outline-none"
            placeholder={t("common.notes", "Notes...")}
          />
        </label>

        {error && <p role="alert" className="rounded-lg bg-red-50 dark:bg-red-950/40 p-2 text-xs font-medium text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50">{error}</p>}

        <button
          type="submit"
          disabled={loading || typesLoading || facilitiesLoading || (preview && !preview.canTransfer)}
          className="rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white text-white px-3.5 py-2 font-bold transition disabled:opacity-50 cursor-pointer shadow-xs w-full flex items-center justify-center gap-1.5"
        >
          {loading ? (
            t("common.loading", "Submitting...")
          ) : (
            <>
              <span className="material-symbols-outlined text-[16px]">send</span>
              {t("transfer.submit", "Submit Transfer Request")}
            </>
          )}
        </button>
      </form>
    </details>
  );
}
