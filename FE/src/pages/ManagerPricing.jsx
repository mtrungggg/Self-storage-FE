import SelectDropdown from "@/components/ui/select-dropdown";
import DatePicker from "@/components/ui/date-picker";
import { useLanguage } from "../context/LanguageContext";
import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
// facilities loaded via ManagerFacilityContext
import managerService from "../api/managerService";
import { useManagerFacility } from "../context/ManagerFacilityContext";
import { useAuth } from "../context/AuthContext";
import { ADMIN_ROLES, hasAnyRole } from "../constants/roles";
import { FacilityBarActions } from "../components/FacilitySwitcher";
import { formatVnd } from "../lib/utils";
import PAGINATION from "../constants/pagination";


function getCleanCondition(raw) {
  if (!raw) return "";
  if (typeof raw === "string" && raw.trim().startsWith("{")) {
    try {
      const obj = JSON.parse(raw);
      return obj.description || obj.notes || obj.reason || raw;
    } catch {
      return raw;
    }
  }
  return raw;
}

function parseTypeAndSize(unitTypeName) {
  const name = String(unitTypeName || "").toLowerCase();
  let typeLabel = "Kho hàng khô";
  if (name.includes("seafood") || name.includes("freeze") || name.includes("đông lạnh") || name.includes("hải sản")) {
    typeLabel = "Kho đông lạnh / Hải sản";
  } else if (name.includes("warm") || name.includes("heated") || name.includes("sưởi")) {
    typeLabel = "Kho sưởi ấm";
  } else if (name.includes("climate") || name.includes("nhiệt độ")) {
    typeLabel = "Kho kiểm soát nhiệt độ";
  } else if (name.includes("locker") || name.includes("tủ khóa")) {
    typeLabel = "Tủ khóa thông minh";
  }

  let sizeLabel = "Small (3 m²)";
  if (name.includes("mini") || name.includes("1 m2") || name.includes("1 m²")) {
    sizeLabel = "Mini (1 m²)";
  } else if (name.includes("small") || name.includes("3 m2") || name.includes("3 m²")) {
    sizeLabel = "Small (3 m²)";
  } else if (name.includes("medium") || name.includes("6 m2") || name.includes("6 m²")) {
    sizeLabel = "Medium (6 m²)";
  } else if ((name.includes("large") && !name.includes("extra")) || name.includes("10 m2") || name.includes("10 m²")) {
    sizeLabel = "Large (10 m²)";
  } else if (name.includes("extra large") || name.includes("xl") || name.includes("16 m2") || name.includes("16 m²")) {
    sizeLabel = "Extra Large (16 m²)";
  }

  return { typeLabel, sizeLabel };
}

const FEE_TYPE_TRANSLATIONS = {
  vi: {
    late_fee: "Phí trễ hạn thanh toán",
    late_payment: "Phí trễ hạn thanh toán",
    damage_fee: "Phí hư hỏng / Vệ sinh",
    damage: "Bồi thường hư hại ô kho",
    cleaning: "Phí dọn dẹp vệ sinh kho",
    lost_key_fee: "Phí mất chìa / thẻ từ",
    key_replacement: "Cấp lại chìa khóa / thẻ",
    lock_cut: "Phí cắt khóa khẩn cấp",
    maintenance_fee: "Phí bảo trì định kỳ",
    other: "Phí dịch vụ / Chuyển kho",
    booking_fee: "Phí giữ chỗ đặt kho",
    admin: "Phí thủ tục hành chính",
    overstay: "Phí quá hạn lưu kho",
    service: "Phí dịch vụ hỗ trợ",
  },
  en: {
    late_fee: "Late Payment Fee",
    late_payment: "Late Payment Fee",
    damage_fee: "Damage & Cleaning Fee",
    damage: "Damage Compensation",
    cleaning: "Unit Cleaning Fee",
    lost_key_fee: "Lost Key / RFID Card Fee",
    key_replacement: "Key Replacement",
    lock_cut: "Emergency Lock Cut",
    maintenance_fee: "Maintenance Fee",
    other: "Administrative / Transfer Fee",
    booking_fee: "Storage Reservation Fee",
    admin: "Administrative Fee",
    overstay: "Overstay Storage Fee",
    service: "Customer Service Fee",
  },
};

const feeTypes = [
  ["late_fee", "Late Fee (Phí trễ hạn)"],
  ["damage_fee", "Damage / Cleaning Fee (Phí hỏng / vệ sinh)"],
  ["lost_key_fee", "Lost Key Fee (Phí mất chìa / thẻ)"],
  ["maintenance_fee", "Maintenance Fee (Phí bảo trì)"],
  ["other", "Other / Administrative (Phí khác / chuyển kho)"],
  ["late_payment", "Late Payment Fee"],
  ["cleaning", "Cleaning Fee"],
  ["damage", "Damage Compensation"],
  ["key_replacement", "Key Replacement"],
  ["lock_cut", "Lock Cutting"],
  ["overstay", "Overstay Surcharge"],
  ["booking_fee", "Booking Fee"],
  ["admin", "Administrative Fee"],
];

const calculationMethods = [
  ["flat", "Flat Fixed (Cố định)"],
  ["per_day", "Per Day (Theo ngày)"],
  ["percentage", "Percentage (%)"],
  ["fixed", "Fixed"],
  ["monthly", "Monthly"],
];

const FEE_TEMPLATES = [
  {
    name: "Standard Late Fee (50,000₫/day)",
    code: "LATE_STANDARD",
    feeType: "late_payment",
    calculationMethod: "daily_accrual",
    amount: "50000",
    ratePercent: "",
    graceDays: 3,
    conditions: "Applied after 3 grace days of overdue payment, daily accrual 50,000 VND",
  },
  {
    name: "Standard Cleaning Fee (150,000₫)",
    code: "CLEAN_STANDARD",
    feeType: "cleaning",
    calculationMethod: "fixed_amount",
    amount: "150000",
    ratePercent: "",
    graceDays: 0,
    conditions: "Cleaning surcharge when unit is returned unclean upon move-out",
  },
  {
    name: "Basic Damage Penalty (500,000₫)",
    code: "DAMAGE_BASIC",
    feeType: "damage",
    calculationMethod: "fixed_amount",
    amount: "500000",
    ratePercent: "",
    graceDays: 0,
    conditions: "Standard penalty for physical damage (heavy scratches, bent door, broken lock)",
  },
];

function getStandardFeeCode(type) {
  const map = {
    late_payment: "LATE_FEE_01",
    cleaning: "CLEAN_FEE_01",
    damage: "DMG_FEE_01",
    maintenance_fee: "MAINT_FEE_01",
    key_replacement: "KEY_REP_01",
    lock_cut: "LOCK_CUT_01",
    overstay: "OVERSTAY_01",
    booking_fee: "BOOKING_FEE_01",
    vat_tax: "VAT_TAX_01",
    admin: "ADMIN_FEE_01",
    service: "SERVICE_FEE_01",
  };
  return map[type] || `${(type || "FEE").toUpperCase()}_01`;
}

const initialFeeFilters = {
  Search: "",
  FeeType: "",
  IsActive: "",
  GlobalOnly: "",
  PageSize: PAGINATION.DEFAULT_PAGE_SIZE,
};

const initialFeeForm = {
  id: undefined,
  facilityId: "",
  code: "",
  feeType: "late_payment",
  calculationMethod: "fixed_amount",
  amount: "",
  ratePercent: "",
  graceDays: 0,
  conditions: "",
  validFrom: new Date().toISOString().split("T")[0],
  validTo: "",
  isActive: true,
};

export default function ManagerPricing() {
  const { t, lang, formatCurrency } = useLanguage();
  const { facilityId, facilities } = useManagerFacility();
  const { user } = useAuth();
  const userRoles = (user?.roles || []).map((r) => r.toLowerCase());
  const isAdmin = hasAnyRole(userRoles, ADMIN_ROLES);

  // Active Tab: "fees" | "rates" | "promotions"
  const [activeTab, setActiveTab] = useState("fees");

  // Feedback states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  // TAB 1: FEES & SURCHARGES
  const [feeFilters, setFeeFilters] = useState(initialFeeFilters);
  const [feeQuery, setFeeQuery] = useState({ ...initialFeeFilters, PageNumber: 1 });
  const [feeData, setFeeData] = useState(null);
  const [loadingFees, setLoadingFees] = useState(true);
  const facilitiesList = Array.isArray(facilities) ? facilities : [];

  // Fee modal state
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [feeFormData, setFeeFormData] = useState(initialFeeForm);
  const [savingFee, setSavingFee] = useState(false);

  // TAB 2: RATES
  const [rates, setRates] = useState([]);
  const [editedRates, setEditedRates] = useState({});
  const [dirtyIds, setDirtyIds] = useState(new Set());

  // TAB 3: PROMOTIONS
  const [promotions, setPromotions] = useState([]);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoForm, setPromoForm] = useState({
    code: "",
    name: "",
    discountType: "percentage",
    discountValue: "",
    usageLimit: "100",
  });
  const [savingPromo, setSavingPromo] = useState(false);



  // Fetch Pricing Fees via GET /api/manager/pricing/fees
  const [feeReloadKey, setFeeReloadKey] = useState(0);
  const loadFees = useCallback(() => {
    setLoadingFees(true);
    setFeeReloadKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let active = true;
    async function fetchFees() {
      try {
        const res = await managerService.getPricingFees({
          ...feeQuery,
          FacilityId: feeQuery.FacilityId || undefined,
          GlobalOnly: feeQuery.GlobalOnly === "" ? undefined : feeQuery.GlobalOnly === "true",
          IsActive: feeQuery.IsActive === "" ? undefined : feeQuery.IsActive === "true",
        });
        if (active) setFeeData(res);
      } catch (err) {
        if (active) setError(err?.message || "Failed to load pricing fee policies from server.");
      } finally {
        if (active) setLoadingFees(false);
      }
    }
    fetchFees();
    return () => { active = false; };
  }, [feeQuery, feeReloadKey]);

  // Fetch Rates & Promotions
  const [ratesReloadKey, setRatesReloadKey] = useState(0);
  const loadRatesAndPromos = useCallback(() => {
    setLoading(true);
    setError("");
    setRatesReloadKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let active = true;
    async function fetchRatesAndPromos() {
      try {
        const [ratesRes, promosRes] = await Promise.all([
          facilityId
            ? managerService.getPricingRates(facilityId, { pageSize: PAGINATION.BATCH_PAGE_SIZE })
            : Promise.resolve({ items: [] }),
          managerService.getPromotions({ pageSize: PAGINATION.BATCH_PAGE_SIZE }),
        ]);

        if (active) {
          setRates(ratesRes?.items ?? (Array.isArray(ratesRes) ? ratesRes : []));
          setEditedRates({});
          setDirtyIds(new Set());
          setPromotions(promosRes?.items ?? (Array.isArray(promosRes) ? promosRes : []));
        }
      } catch (err) {
        if (active) setError(err?.message || "Failed to load rates and promotion configurations.");
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchRatesAndPromos();
    return () => { active = false; };
  }, [facilityId, ratesReloadKey]);

  // Refresh all
  const handleRefreshAll = () => {
    loadFees();
    loadRatesAndPromos();
  };

  // Fees handlers - Reactive (no manual Apply button required)
  const handleFeeFilterChange = (field, value) => {
    const nextFilters = { ...feeFilters, [field]: value };
    setFeeFilters(nextFilters);
    setFeeQuery({ ...nextFilters, PageNumber: 1 });
  };

  const handleResetFeeFilters = () => {
    setFeeFilters(initialFeeFilters);
    setFeeQuery({ ...initialFeeFilters, PageNumber: 1 });
  };

  const openCreateFeeModal = () => {
    if (!isAdmin) return;
    setFeeFormData({
      ...initialFeeForm,
      facilityId: facilityId ? String(facilityId) : "",
      code: "LATE_FEE_01",
    });
    setShowFeeModal(true);
  };

  const openEditFeeModal = (fee) => {
    if (!isAdmin) return;
    setFeeFormData({
      id: fee.id,
      facilityId: fee.facilityId ? String(fee.facilityId) : "",
      code: fee.code || "",
      feeType: fee.feeType || "late_payment",
      calculationMethod: fee.calculationMethod || "fixed_amount",
      amount: fee.amount != null ? String(fee.amount) : "",
      ratePercent: fee.ratePercent != null ? String(fee.ratePercent) : "",
      graceDays: fee.graceDays ?? 0,
      conditions: fee.conditions || "",
      validFrom: fee.validFrom ? fee.validFrom.split("T")[0] : "",
      validTo: fee.validTo ? fee.validTo.split("T")[0] : "",
      isActive: fee.isActive ?? true,
    });
    setShowFeeModal(true);
  };

  const handleSaveFee = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      setError("Chỉ Quản trị viên hệ thống (Admin) mới có quyền chỉnh sửa quy tắc phí.");
      return;
    }
    setSavingFee(true);
    setError("");

    const payload = {
      id: feeFormData.id ? Number(feeFormData.id) : 0,
      facilityId: feeFormData.facilityId ? Number(feeFormData.facilityId) : null,
      code: feeFormData.code.trim().toUpperCase(),
      feeType: feeFormData.feeType,
      calculationMethod: feeFormData.calculationMethod,
      amount: feeFormData.amount !== "" ? Number(feeFormData.amount) : null,
      ratePercent: feeFormData.ratePercent !== "" ? Number(feeFormData.ratePercent) : null,
      graceDays: Number(feeFormData.graceDays) || 0,
      conditions: feeFormData.conditions?.trim() || "",
      validFrom: feeFormData.validFrom || new Date().toISOString().split("T")[0],
      validTo: feeFormData.validTo ? feeFormData.validTo : null,
      isActive: Boolean(feeFormData.isActive),
    };

    try {
      await managerService.updatePricingFee(payload);
      setNotice(
        feeFormData.id
          ? `Pricing fee policy "${payload.code}" updated successfully.`
          : `New pricing fee policy "${payload.code}" created successfully.`
      );
      setShowFeeModal(false);
      setFeeFormData(initialFeeForm);
      loadFees();
      setTimeout(() => setNotice(""), 4000);
    } catch (err) {
      setError(err?.message || "Failed to save pricing fee policy.");
    } finally {
      setSavingFee(false);
    }
  };

  const handleToggleFeeStatus = async (fee) => {
    if (!isAdmin) {
      setError("Chỉ Quản trị viên hệ thống (Admin) mới có quyền chỉnh sửa quy tắc phí.");
      return;
    }
    const nextStatus = !fee.isActive;
    const payload = {
      id: fee.id,
      facilityId: fee.facilityId != null ? fee.facilityId : null,
      code: fee.code,
      feeType: fee.feeType,
      calculationMethod: fee.calculationMethod,
      amount: fee.amount != null ? fee.amount : null,
      ratePercent: fee.ratePercent != null ? fee.ratePercent : null,
      graceDays: fee.graceDays ?? 0,
      conditions: fee.conditions || "",
      validFrom: fee.validFrom ? fee.validFrom.split("T")[0] : new Date().toISOString().split("T")[0],
      validTo: fee.validTo ? fee.validTo.split("T")[0] : null,
      isActive: nextStatus,
    };

    try {
      await managerService.updatePricingFee(payload);
      setNotice(`Fee policy "${fee.code}" status updated to ${nextStatus ? "Active" : "Inactive"}.`);
      loadFees();
      setTimeout(() => setNotice(""), 4000);
    } catch (err) {
      setError(err?.message || "Failed to update fee status.");
    }
  };

  // Rates handlers
  const handleRateChange = (id, field, value) => {
    if (!isAdmin) return;
    const num = Number(value) || 0;
    setEditedRates((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [field]: num,
      },
    }));
    setDirtyIds((prev) => new Set(prev).add(id));
  };

  const handleSaveRates = async () => {
    if (!isAdmin) {
      setError("Chỉ Quản trị viên hệ thống (Admin) mới có quyền chỉnh sửa biểu giá.");
      return;
    }
    if (dirtyIds.size === 0) return;
    setSaving(true);
    setError("");

    try {
      const updates = Array.from(dirtyIds).map((id) => {
        const original = rates.find((r) => r.id === id);
        const edited = editedRates[id] || {};
        return {
          id,
          unitTypeId: original?.unitTypeId,
          monthlyRate: edited.monthlyRate ?? original?.monthlyRate,
          depositAmount: edited.depositAmount ?? original?.depositAmount,
        };
      });

      await managerService.updatePricingRates(facilityId, { rates: updates });
      setNotice(`Updated ${updates.length} rate configurations successfully.`);
      setDirtyIds(new Set());
      setEditedRates({});
      loadRatesAndPromos();
      setTimeout(() => setNotice(""), 4000);
    } catch (err) {
      setError(err?.message || "Failed to save rate updates.");
    } finally {
      setSaving(false);
    }
  };

  // Promotions handlers
  const handleTogglePromo = async (promoId, currentActive) => {
    try {
      await managerService.updatePromotionStatus(promoId, !currentActive);
      setNotice(`Voucher status updated.`);
      loadRatesAndPromos();
      setTimeout(() => setNotice(""), 3000);
    } catch (err) {
      setError(err?.message || "Failed to change voucher status.");
    }
  };

  const handleCreatePromo = async (e) => {
    e.preventDefault();
    if (!promoForm.code.trim() || !promoForm.discountValue) {
      setError("Please provide a voucher code and discount value.");
      return;
    }
    setSavingPromo(true);
    setError("");

    try {
      const payload = {
        code: promoForm.code.trim().toUpperCase(),
        name: promoForm.name.trim() || promoForm.code.trim().toUpperCase(),
        discountType: promoForm.discountType,
        discountValue: Number(promoForm.discountValue),
        facilityId: facilityId || null,
        usageLimit: promoForm.usageLimit ? Number(promoForm.usageLimit) : undefined,
      };

      await managerService.createPromotion(payload);
      setNotice(`Voucher "${payload.code}" created successfully.`);
      setShowPromoModal(false);
      setPromoForm({
        code: "",
        name: "",
        discountType: "percentage",
        discountValue: "",
        usageLimit: "100",
      });
      loadRatesAndPromos();
      setTimeout(() => setNotice(""), 4000);
    } catch (err) {
      setError(err?.message || "Failed to create voucher.");
    } finally {
      setSavingPromo(false);
    }
  };

  const feesList = feeData?.items ?? [];

  return (
    <div className="space-y-4">
      {/* Top Facility Bar Action: Refresh button placed in FacilitySwitcher */}
      <FacilityBarActions>
        <button
          type="button"
          onClick={handleRefreshAll}
          disabled={loading || loadingFees}
          className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
        >
          {loading || loadingFees ? "Refreshing..." : "Refresh"}
        </button>
      </FacilityBarActions>

      {/* Notice Banner */}
      {notice && (
        <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800">
          {notice}
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-800">
          {error}
        </div>
      )}

      {/* Tab Navigation Pill Bar with Right-side Primary Action */}
      {!isAdmin && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-950 flex items-center gap-2.5 shadow-xs">
          <span className="material-symbols-outlined text-amber-600 text-[20px]">lock</span>
          <div>
            <p className="font-bold text-amber-900">
              Khóa quyền chỉnh sửa: Chế độ chỉ xem biểu giá (Read-only)
            </p>
            <p className="text-[11px] text-amber-700 mt-0.5">
              {t("manager.pricing_admin_notice", "Biểu giá thuê kho cơ sở.")}
            </p>
          </div>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("fees")}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition ${
              activeTab === "fees"
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Operational &amp; Penalty Fees ({feeData?.totalCount ?? feesList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("rates")}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition ${
              activeTab === "rates"
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Unit Rental Rates ({rates.length})
          </button>
        </div>

        <div>
          {isAdmin && activeTab === "fees" && (
            <button
              type="button"
              onClick={openCreateFeeModal}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition"
            >
              {t("manager.add_pricing", "Thêm biểu giá")}
            </button>
          )}

          {!isAdmin && (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 mr-2">
              🔒 Chế độ xem (Manager)
            </span>
          )}

          {isAdmin && activeTab === "rates" && dirtyIds.size > 0 && (
            <button
              type="button"
              onClick={handleSaveRates}
              disabled={saving}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving ? "Saving..." : `Save Changes (${dirtyIds.size})`}
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: FEES & SURCHARGES SECTION */}
      {activeTab === "fees" && (
        <div className="space-y-4">
          {/* Fees Filter Bar - Clean 4-column Grid */}
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
              <input
                type="search"
                placeholder={t("pricing.search_fee_placeholder", "Search code, conditions...")}
                value={feeFilters.Search}
                onChange={(e) => handleFeeFilterChange("Search", e.target.value)}
                className="w-full h-10 rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-white px-3.5 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 transition"
              />
              <SelectDropdown
                value={feeFilters.FeeType}
                onChange={(e) => handleFeeFilterChange("FeeType", e.target.value)}
                className="w-full"
              >
                <option value="">{t("common.all", "Tất cả loại phí")}</option>
                {feeTypes.map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </SelectDropdown>
              <SelectDropdown
                value={feeFilters.GlobalOnly}
                onChange={(e) => handleFeeFilterChange("GlobalOnly", e.target.value)}
                className="w-full"
              >
                <option value="">{t("common.all", "Tất cả phạm vi")}</option>
                <option value="true">Global (Toàn hệ thống)</option>
                <option value="false">{t("common.facility", "Theo cơ sở")}</option>
              </SelectDropdown>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <SelectDropdown
                    value={feeFilters.IsActive}
                    onChange={(e) => handleFeeFilterChange("IsActive", e.target.value)}
                    className="w-full"
                  >
                    <option value="">{t("common.all", "Tất cả trạng thái")}</option>
                    <option value="true">{t("status.active", "Đang áp dụng")}</option>
                    <option value="false">Không kích hoạt</option>
                  </SelectDropdown>
                </div>
                {(feeFilters.Search || feeFilters.FeeType || feeFilters.GlobalOnly || feeFilters.IsActive) && (
                  <button
                    type="button"
                    onClick={handleResetFeeFilters}
                    className="shrink-0 h-10 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Fees Data Table */}
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">{t("manager.fee_code", "Mã phí")}</th>
                  <th className="px-4 py-2.5">{t("manager.scope", "Phạm vi")}</th>
                  <th className="px-4 py-2.5">{t("manager.category", "Danh mục")}</th>
                  <th className="px-4 py-2.5">{t("manager.method", "Phương thức")}</th>
                  <th className="px-4 py-2.5 text-right">{t("manager.rate_amount", "Mức phí / Tỷ lệ")}</th>
                  <th className="px-4 py-2.5 text-center">{t("manager.grace_period", "Thời gian ân hạn")}</th>
                  <th className="px-4 py-2.5">{t("manager.effective_date", "Hiệu lực")}</th>
                  <th className="px-4 py-2.5 text-center">{t("common.status", "Trạng thái")}</th>
                  <th className="px-4 py-2.5 text-right">{t("manager.actions", "Thao tác")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingFees ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-xs text-slate-400">
                      Loading fee policies from server...
                    </td>
                  </tr>
                ) : feesList.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-xs text-slate-400">
                      No fee policies found matching filter criteria.
                    </td>
                  </tr>
                ) : (
                  feesList.map((fee) => {
                    const langKey = lang === "vi" ? "vi" : "en";
                    const feeTypeLabel = FEE_TYPE_TRANSLATIONS[langKey]?.[fee.feeType] || feeTypes.find(([val]) => val === fee.feeType)?.[1] || fee.feeType;
                    const calcMethodLabel = calculationMethods.find(([val]) => val === fee.calculationMethod)?.[1] || fee.calculationMethod;
                    const cleanCondition = getCleanCondition(fee.conditions);

                    return (
                      <tr key={fee.id} className="hover:bg-slate-50/60 transition">
                        <td className="px-4 py-2.5 font-sans font-semibold tracking-wide text-slate-800 dark:text-zinc-100">
                          {fee.code}
                        </td>
                        <td className="px-4 py-2.5">
                          {fee.facilityName ? (
                            <span className="font-medium text-slate-800 dark:text-zinc-200">{fee.facilityName}</span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:text-blue-300">
                              Global
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 font-sans">
                          <span className="font-medium text-slate-800 dark:text-zinc-100">{feeTypeLabel}</span>
                          {cleanCondition && (
                            <p className="max-w-[240px] truncate text-[11px] text-slate-500 dark:text-zinc-400 font-sans mt-0.5" title={cleanCondition}>
                              {cleanCondition}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-slate-600">{calcMethodLabel}</td>
                        <td className="px-4 py-2.5 text-right font-medium text-slate-900">
                          {fee.amount != null && fee.amount > 0 ? formatVnd(fee.amount) : ""}
                          {fee.ratePercent != null && fee.ratePercent > 0 ? ` ${fee.ratePercent}%` : ""}
                          {(!fee.amount && !fee.ratePercent) && "0 ₫"}
                        </td>
                        <td className="px-4 py-2.5 text-center text-slate-600">
                          {fee.graceDays != null ? `${fee.graceDays}d` : "0d"}
                        </td>
                        <td className="px-4 py-2.5 text-slate-500">
                          {fee.validFrom ? fee.validFrom.split("T")[0] : "Always"}
                          {fee.validTo ? ` → ${fee.validTo.split("T")[0]}` : " → Ongoing"}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          {isAdmin ? (
                            <button
                              type="button"
                              onClick={() => handleToggleFeeStatus(fee)}
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                                fee.isActive
                                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              }`}
                              title="Click to toggle status"
                            >
                              {fee.isActive ? "Active" : "Inactive"}
                            </button>
                          ) : (
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                                fee.isActive
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {fee.isActive ? "Active" : "Inactive"}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          {isAdmin ? (
                            <button
                              type="button"
                              onClick={() => openEditFeeModal(fee)}
                              className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                            >
                              Edit
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400">View only</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination for Fees */}
          {feeData && (
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>
                {feeData.totalCount === 0
                  ? "0 policies"
                  : `Showing page ${feeData.pageNumber} of ${Math.max(1, feeData.totalPages)} (${feeData.totalCount} policies)`}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!feeData.hasPreviousPage || feeQuery.PageNumber <= 1}
                  onClick={() => setFeeQuery({ ...feeQuery, PageNumber: feeQuery.PageNumber - 1 })}
                  className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={!feeData.hasNextPage}
                  onClick={() => setFeeQuery({ ...feeQuery, PageNumber: feeQuery.PageNumber + 1 })}
                  className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: UNIT RENTAL RATES SECTION */}
      {activeTab === "rates" && (
        <div className="rounded-lg border border-slate-200 bg-white overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5">LOẠI KHO</th>
                <th className="px-4 py-2.5">KÍCH THƯỚC</th>
                <th className="px-4 py-2.5 text-right">{t("pricing.monthly_rate", "Đơn giá tháng")}</th>
                <th className="px-4 py-2.5 text-right">{t("manager.deposit_amount", "Tiền cọc")}</th>
                <th className="px-4 py-2.5 text-right">{t("pricing.reservation_fee", "Phí giữ chỗ")}</th>
                <th className="px-4 py-2.5 text-center">{t("manager.effective_date", "Hiệu lực")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                    Loading rate policies from server...
                  </td>
                </tr>
              ) : rates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                    No rate configurations defined for this facility.
                  </td>
                </tr>
              ) : (
                rates.map((rate) => {
                  const edited = editedRates[rate.id] || {};
                  const isDirty = dirtyIds.has(rate.id);
                  const { typeLabel, sizeLabel } = parseTypeAndSize(rate.unitTypeName);

                  return (
                    <tr
                      key={rate.id}
                      className={isDirty ? "bg-amber-50/40 hover:bg-amber-50/70 transition" : "hover:bg-slate-50/60 transition"}
                    >
                      <td className="px-4 py-2.5">
                        <div className="font-semibold text-slate-900">{typeLabel}</div>
                        <div className="text-[10px] text-slate-400">{rate.facilityName}</div>
                      </td>

                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {sizeLabel}
                        </span>
                      </td>

                      <td className="px-4 py-2.5 text-right">
                        {isAdmin ? (
                          <input
                            type="number"
                            step="1000"
                            value={edited.monthlyRate ?? rate.monthlyRate}
                            onChange={(e) => handleRateChange(rate.id, "monthlyRate", e.target.value)}
                            className="w-32 rounded-md border border-slate-200 bg-white px-2 py-1 text-right text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-400"
                          />
                        ) : (
                          <span className="text-xs font-bold text-slate-900">
                            {formatVnd(rate.monthlyRate)}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-2.5 text-right">
                        {isAdmin ? (
                          <input
                            type="number"
                            step="1000"
                            value={edited.depositAmount ?? rate.depositAmount}
                            onChange={(e) => handleRateChange(rate.id, "depositAmount", e.target.value)}
                            className="w-28 rounded-md border border-slate-200 bg-white px-2 py-1 text-right text-xs font-medium text-slate-700 focus:outline-none focus:border-slate-400"
                          />
                        ) : (
                          <span className="text-xs font-medium text-slate-700">
                            {formatVnd(rate.depositAmount)}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-2.5 text-right font-medium text-slate-700">
                        {formatVnd(rate.bookingFee)}
                      </td>

                      <td className="px-4 py-2.5 text-center">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                          {rate.validFrom ? new Date(rate.validFrom).toLocaleDateString("en-US") : "Current"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Create / Edit Fee Policy */}
      {isAdmin && showFeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-5 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  {feeFormData.id ? "Edit Fee Policy" : "Create New Fee Policy"}
                </h2>
                {!feeFormData.id && (
                  <p className="text-[11px] text-slate-500">
                    Select a quick template or enter custom fee parameters.
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowFeeModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Templates 1-Click Bar */}
            {!feeFormData.id && (
              <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50/80 p-3">
                <div className="text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <span>Quick Templates:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {FEE_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.name}
                      type="button"
                      onClick={() =>
                        setFeeFormData((prev) => ({
                          ...prev,
                          ...tpl,
                          facilityId: prev.facilityId || (facilityId ? String(facilityId) : ""),
                        }))
                      }
                      className="rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-[#2563eb] hover:bg-blue-50/60 hover:text-[#2563eb] transition shadow-xs cursor-pointer"
                    >
                      + {tpl.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSaveFee} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-700">
                    Fee Code <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LATE_FEE_STD"
                    value={feeFormData.code}
                    onChange={(e) => setFeeFormData({ ...feeFormData, code: e.target.value.toUpperCase() })}
                    className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs font-mono font-bold uppercase text-slate-800 focus:outline-none focus:border-slate-400"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-700">
                    Scope (Facility)
                  </span>
                  <SelectDropdown
                    value={feeFormData.facilityId}
                    onChange={(e) => setFeeFormData({ ...feeFormData, facilityId: e.target.value })}
                    className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-400"
                  >
                    <option value="">Global (All Facilities)</option>
                    {facilitiesList.map((fac) => (
                      <option key={fac.id} value={fac.id}>
                        {fac.name} ({fac.code})
                      </option>
                    ))}
                  </SelectDropdown>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-700">Fee Type <span className="text-red-500">*</span></span>
                  <SelectDropdown
                    value={feeFormData.feeType}
                    onChange={(e) => {
                      const nextType = e.target.value;
                      setFeeFormData((prev) => ({
                        ...prev,
                        feeType: nextType,
                        code: prev.id ? prev.code : getStandardFeeCode(nextType),
                      }));
                    }}
                    className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-400"
                  >
                    {feeTypes.map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </SelectDropdown>
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-700">Calculation Method <span className="text-red-500">*</span></span>
                  <SelectDropdown
                    value={feeFormData.calculationMethod}
                    onChange={(e) => setFeeFormData({ ...feeFormData, calculationMethod: e.target.value })}
                    className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-400"
                  >
                    {calculationMethods.map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </SelectDropdown>
                </label>
              </div>

              {/* Conditional Amount vs Percentage Rendering */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {feeFormData.calculationMethod === "percentage" ? (
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-slate-700">
                      Rate Percent (%) <span className="text-red-500">*</span>
                    </span>
                    <input
                      type="number"
                      step="0.1"
                      required
                      placeholder="e.g. 5"
                      value={feeFormData.ratePercent}
                      onChange={(e) => setFeeFormData({ ...feeFormData, ratePercent: e.target.value })}
                      className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-400"
                    />
                  </label>
                ) : (
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-slate-700">
                      {feeFormData.calculationMethod === "daily_accrual" ? "Daily Accrual (₫/day) *" : "Fixed Amount (₫) *"}
                    </span>
                    <input
                      type="number"
                      step="1000"
                      required
                      placeholder="e.g. 50000"
                      value={feeFormData.amount}
                      onChange={(e) => setFeeFormData({ ...feeFormData, amount: e.target.value })}
                      className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-400"
                    />
                  </label>
                )}

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-700">Grace Period (Days)</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={feeFormData.graceDays}
                    onChange={(e) => setFeeFormData({ ...feeFormData, graceDays: e.target.value })}
                    className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-700">Conditions / Notes</span>
                <textarea
                  rows={2}
                  placeholder="e.g. Applied after 3 overdue days calculated daily"
                  value={feeFormData.conditions}
                  onChange={(e) => setFeeFormData({ ...feeFormData, conditions: e.target.value })}
                  className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-700">Valid From</span>
                  <DatePicker
                    value={feeFormData.validFrom}
                    onChange={(e) => setFeeFormData({ ...feeFormData, validFrom: e.target.value })}
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-700">Valid To (Optional)</span>
                  <DatePicker
                    value={feeFormData.validTo}
                    onChange={(e) => setFeeFormData({ ...feeFormData, validTo: e.target.value })}
                  />
                </label>
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={feeFormData.isActive}
                  onChange={(e) => setFeeFormData({ ...feeFormData, isActive: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-medium text-slate-700">Policy is Active immediately</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowFeeModal(false)}
                  className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingFee}
                  className="rounded-md bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {savingFee ? "Saving..." : feeFormData.id ? "Save Changes" : "Create Policy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
