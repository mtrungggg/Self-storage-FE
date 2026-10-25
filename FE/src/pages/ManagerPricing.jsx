import { useCallback, useEffect, useState } from "react";
import {
  RefreshCw,
  Save,
  Plus,
  X,
  Tag,
  Warehouse,
  AlertTriangle,
  CheckCircle2,
  Receipt,
  Search,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Globe,
  Clock,
  ShieldAlert,
} from "lucide-react";
import operationsService from "../api/operationsService";
import adminPricingService from "../api/adminPricingService";
import adminFacilityService from "../api/adminFacilityService";
import { useManagerFacility } from "../context/ManagerFacilityContext";

function formatCurrency(val) {
  if (val == null || isNaN(val)) return "0 ₫";
  return `${Number(val).toLocaleString("en-US")} ₫`;
}

const feeTypes = [
  ["maintenance_fee", "Maintenance Fee"],
  ["late_payment", "Late Payment Fee"],
  ["cleaning", "Cleaning Fee"],
  ["damage", "Damage Compensation"],
  ["key_replacement", "Key Replacement"],
  ["lock_cut", "Lock Cutting"],
  ["overstay", "Overstay Surcharge"],
  ["booking_fee", "Booking Fee"],
  ["vat_tax", "VAT / Tax"],
  ["admin", "Administrative Fee"],
  ["service", "Service Charge"],
];

const calculationMethods = [
  ["fixed_amount", "Fixed Amount (₫)"],
  ["percentage", "Percentage (%)"],
  ["daily_accrual", "Daily Accrual (₫/day)"],
];

const initialFeeFilters = {
  Search: "",
  FeeType: "",
  IsActive: "",
  GlobalOnly: "",
  PageSize: 10,
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

function ManagerPricing() {
  const { facilityId, activeFacility } = useManagerFacility();

  // Active Tab
  const [activeTab, setActiveTab] = useState("fees"); // "fees" | "rates" | "promotions"

  // Feedback states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  // ==================== TAB 1: FEES & SURCHARGES (/api/admin/pricing/fees) ====================
  const [feeFilters, setFeeFilters] = useState(initialFeeFilters);
  const [feeQuery, setFeeQuery] = useState({ ...initialFeeFilters, PageNumber: 1 });
  const [feeData, setFeeData] = useState(null);
  const [loadingFees, setLoadingFees] = useState(false);
  const [facilitiesList, setFacilitiesList] = useState([]);

  // Fee modal state (Create / Edit via PUT /api/admin/pricing/fees)
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [feeFormData, setFeeFormData] = useState(initialFeeForm);
  const [savingFee, setSavingFee] = useState(false);

  // ==================== TAB 2: RATES (/operations/pricing/rates) ====================
  const [rates, setRates] = useState([]);
  const [editedRates, setEditedRates] = useState({});
  const [dirtyIds, setDirtyIds] = useState(new Set());

  // ==================== TAB 3: PROMOTIONS (/operations/promotions) ====================
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

  // Fetch facilities list for dropdowns
  useEffect(() => {
    adminFacilityService
      .getFacilities({ PageSize: 100 })
      .then((res) => setFacilitiesList(res?.items ?? []))
      .catch(() => {});
  }, []);

  // Fetch Pricing Fees from /api/admin/pricing/fees
  const loadFees = useCallback(async () => {
    setLoadingFees(true);
    try {
      const res = await adminPricingService.getPricingFees({
        ...feeQuery,
        FacilityId: feeQuery.FacilityId || undefined,
        GlobalOnly: feeQuery.GlobalOnly === "" ? undefined : feeQuery.GlobalOnly === "true",
        IsActive: feeQuery.IsActive === "" ? undefined : feeQuery.IsActive === "true",
      });
      setFeeData(res);
    } catch (err) {
      setError(err?.message || "Failed to load pricing fee policies from server.");
    } finally {
      setLoadingFees(false);
    }
  }, [feeQuery]);

  useEffect(() => {
    loadFees();
  }, [loadFees]);

  // Fetch Rates & Promotions
  const loadRatesAndPromos = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [ratesRes, promosRes] = await Promise.all([
        operationsService.getPricingRates({
          facilityId: facilityId || undefined,
          pageSize: 50,
        }),
        operationsService.getPromotions({ pageSize: 50 }),
      ]);

      setRates(ratesRes?.items ?? []);
      setEditedRates({});
      setDirtyIds(new Set());
      setPromotions(promosRes?.items ?? []);
    } catch (err) {
      setError(err?.message || "Failed to load rates and promotion configurations.");
    } finally {
      setLoading(false);
    }
  }, [facilityId]);

  useEffect(() => {
    loadRatesAndPromos();
  }, [loadRatesAndPromos]);

  // Refresh all
  const handleRefreshAll = () => {
    loadFees();
    loadRatesAndPromos();
  };

  // ==================== FEES HANDLERS ====================
  const handleFeeFilterSubmit = (e) => {
    e.preventDefault();
    setFeeQuery({
      ...feeFilters,
      Search: feeFilters.Search.trim(),
      PageNumber: 1,
    });
  };

  const handleResetFeeFilters = () => {
    setFeeFilters(initialFeeFilters);
    setFeeQuery({ ...initialFeeFilters, PageNumber: 1 });
  };

  const openCreateFeeModal = () => {
    setFeeFormData(initialFeeForm);
    setShowFeeModal(true);
  };

  const openEditFeeModal = (fee) => {
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
      await adminPricingService.updatePricingFee(payload);
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
      await adminPricingService.updatePricingFee(payload);
      setNotice(`Fee policy "${fee.code}" status updated to ${nextStatus ? "ACTIVE" : "INACTIVE"}.`);
      loadFees();
      setTimeout(() => setNotice(""), 4000);
    } catch (err) {
      setError(err?.message || "Failed to update fee status.");
    }
  };

  // ==================== RATES HANDLERS ====================
  const handleRateChange = (id, field, value) => {
    const num = Number(value) || 0;
    setEditedRates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: num,
      },
    }));
    setDirtyIds((prev) => new Set(prev).add(id));
  };

  const handleSaveRates = async () => {
    if (dirtyIds.size === 0) return;
    setSaving(true);
    setError("");
    try {
      await Promise.all(
        Array.from(dirtyIds).map((id) => {
          const original = rates.find((r) => r.id === id);
          if (!original) return Promise.resolve();
          const edited = editedRates[id] || {};
          return operationsService.updatePricingRate({
            id: original.id,
            facilityId: original.facilityId,
            unitTypeId: original.unitTypeId,
            monthlyRate: edited.monthlyRate ?? original.monthlyRate,
            depositAmount: edited.depositAmount ?? original.depositAmount,
            bookingFee: edited.bookingFee ?? original.bookingFee,
            validFrom: original.validFrom,
            validTo: original.validTo,
          });
        })
      );
      setNotice("Pricing rates updated successfully!");
      setTimeout(() => setNotice(""), 3500);
      setDirtyIds(new Set());
      await loadRatesAndPromos();
    } catch (err) {
      setError(err?.message || "Failed to save rate updates.");
    } finally {
      setSaving(false);
    }
  };

  // ==================== PROMOTIONS HANDLERS ====================
  const handleTogglePromo = async (promoId, currentStatus) => {
    const next = !currentStatus;
    setPromotions((prev) =>
      prev.map((p) => (p.id === promoId ? { ...p, isActive: next } : p))
    );
    try {
      await operationsService.updatePromotionStatus(promoId, next);
    } catch (err) {
      setPromotions((prev) =>
        prev.map((p) => (p.id === promoId ? { ...p, isActive: currentStatus } : p))
      );
      setError(err?.message || "Failed to update promotion status.");
    }
  };

  const handleCreatePromo = async (e) => {
    e.preventDefault();
    if (!promoForm.code.trim() || !promoForm.name.trim() || !promoForm.discountValue) {
      setError("Please fill in all required promotion fields.");
      return;
    }
    setSavingPromo(true);
    setError("");
    try {
      await operationsService.createPromotion({
        code: promoForm.code.trim().toUpperCase(),
        name: promoForm.name.trim(),
        discountType: promoForm.discountType,
        discountValue: Number(promoForm.discountValue),
        usageLimit: promoForm.usageLimit ? Number(promoForm.usageLimit) : undefined,
      });
      setShowPromoModal(false);
      setPromoForm({
        code: "",
        name: "",
        discountType: "percentage",
        discountValue: "",
        usageLimit: "100",
      });
      setNotice("Promotion voucher created successfully!");
      setTimeout(() => setNotice(""), 3500);
      await loadRatesAndPromos();
    } catch (err) {
      setError(err?.message || "Failed to create promotion voucher.");
    } finally {
      setSavingPromo(false);
    }
  };

  const feesList = feeData?.items ?? [];

  return (
    <div className="reference-dashboard">
      {/* Top Toolbar matching Dashboard */}
      <div className="reference-toolbar">
        <div>
          <div className="flex items-center gap-3">
            <h1>Pricing &amp; Rate Governance</h1>
            <span className="reference-pill">
              {activeFacility ? `Facility: ${activeFacility.name} (${activeFacility.code})` : "Network Wide"}
            </span>
          </div>
          <p className="reference-muted mt-1">
            Govern operational penalty fees, ancillary surcharges, unit dimension rates, and promotional vouchers.
          </p>
        </div>

        <div className="reference-toolbar-actions">
          {activeTab === "fees" && (
            <button
              type="button"
              onClick={openCreateFeeModal}
              className="reference-button-primary"
            >
              <Plus size={15} /> Add Fee Policy
            </button>
          )}

          {activeTab === "rates" && dirtyIds.size > 0 && (
            <button
              type="button"
              onClick={handleSaveRates}
              disabled={saving}
              className="reference-button-primary !bg-[#23866a] !border-[#23866a] hover:!bg-[#1b6b54]"
            >
              <Save size={15} />
              {saving ? "Saving..." : `Save Changes (${dirtyIds.size})`}
            </button>
          )}

          {activeTab === "promotions" && (
            <button
              type="button"
              onClick={() => setShowPromoModal(true)}
              className="reference-button-primary"
            >
              <Plus size={15} /> Create Voucher
            </button>
          )}

          <button
            type="button"
            onClick={handleRefreshAll}
            disabled={loading || loadingFees}
            className="reference-refresh"
            title="Refresh pricing data"
          >
            <RefreshCw size={17} className={loading || loadingFees ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {notice && (
        <div
          role="status"
          className="mb-4 flex items-center gap-2 rounded-2xl bg-[#e2fff2] px-4 py-3 text-xs font-semibold text-[#173000] border border-[#b3fa65]"
        >
          <CheckCircle2 size={18} className="text-[#23866a]" />
          <span>{notice}</span>
        </div>
      )}

      {error && (
        <div role="alert" className="reference-error mb-4">
          <AlertTriangle size={20} />
          <div>
            <strong>Error</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* 3 Metric Cards */}
      <div className="mb-6 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => setActiveTab("fees")}
          className={`reference-card p-5 text-left transition cursor-pointer ${
            activeTab === "fees" ? "ring-2 ring-black" : "hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-[#767679]">
            <span>Operational Fees &amp; Surcharges</span>
            <Receipt size={18} className="text-[#14121b]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#14121b]">
            {loadingFees ? "..." : `${feeData?.totalCount ?? feesList.length} policies`}
          </div>
          <div className="mt-1">
            <span className="reference-badge lime">/api/admin/pricing/fees</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("rates")}
          className={`reference-card p-5 text-left transition cursor-pointer ${
            activeTab === "rates" ? "ring-2 ring-black" : "hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-[#767679]">
            <span>Unit Types &amp; Rates</span>
            <Warehouse size={18} className="text-[#14121b]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#14121b]">
            {loading ? "..." : `${rates.length} unit types`}
          </div>
          <div className="mt-1 text-xs text-[#767679]">Configured rental tiers</div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("promotions")}
          className={`reference-card p-5 text-left transition cursor-pointer ${
            activeTab === "promotions" ? "ring-2 ring-black" : "hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-[#767679]">
            <span>Promotions &amp; Vouchers</span>
            <Tag size={18} className="text-[#14121b]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#14121b]">
            {loading ? "..." : `${promotions.filter((p) => p.isActive).length} active campaigns`}
          </div>
          <div className="mt-1 text-xs text-[#767679]">Total {promotions.length} created campaigns</div>
        </button>
      </div>

      {/* Tab Navigation Pill Bar */}
      <div className="mb-6 flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("fees")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
            activeTab === "fees"
              ? "bg-[#14121b] text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Receipt size={14} className="inline mr-1.5" />
          Operational &amp; Penalty Fees ({feeData?.totalCount ?? feesList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("rates")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
            activeTab === "rates"
              ? "bg-[#14121b] text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Warehouse size={14} className="inline mr-1.5" />
          Unit Rental Rates ({rates.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("promotions")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
            activeTab === "promotions"
              ? "bg-[#14121b] text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Tag size={14} className="inline mr-1.5" />
          Promotions &amp; Vouchers ({promotions.length})
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: FEES & SURCHARGES SECTION (/api/admin/pricing/fees)                 */}
      {/* ========================================================================= */}
      {activeTab === "fees" && (
        <div className="space-y-6">
          {/* Fees Filter Card */}
          <section className="reference-card p-4">
            <form onSubmit={handleFeeFilterSubmit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 items-end">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-[#25232c]">Search</span>
                <div className="reference-search w-full">
                  <Search size={16} strokeWidth={1.5} />
                  <input
                    type="search"
                    placeholder="Search code, conditions..."
                    value={feeFilters.Search}
                    onChange={(e) => setFeeFilters({ ...feeFilters, Search: e.target.value })}
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-[#25232c]">Fee Type</span>
                <select
                  value={feeFilters.FeeType}
                  onChange={(e) => setFeeFilters({ ...feeFilters, FeeType: e.target.value })}
                  className="reference-select w-full"
                >
                  <option value="">All Fee Types</option>
                  {feeTypes.map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-[#25232c]">Scope</span>
                <select
                  value={feeFilters.GlobalOnly}
                  onChange={(e) => setFeeFilters({ ...feeFilters, GlobalOnly: e.target.value })}
                  className="reference-select w-full"
                >
                  <option value="">All Scopes</option>
                  <option value="true">Global (Network-Wide)</option>
                  <option value="false">Facility Specific</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-[#25232c]">Status</span>
                <select
                  value={feeFilters.IsActive}
                  onChange={(e) => setFeeFilters({ ...feeFilters, IsActive: e.target.value })}
                  className="reference-select w-full"
                >
                  <option value="">All Statuses</option>
                  <option value="true">Active Only</option>
                  <option value="false">Inactive Only</option>
                </select>
              </label>

              <div className="flex items-center gap-2">
                <button type="submit" className="reference-button-primary flex-1">
                  Apply Filters
                </button>
                <button
                  type="button"
                  onClick={handleResetFeeFilters}
                  className="reference-button-secondary"
                  title="Reset Filters"
                >
                  Reset
                </button>
              </div>
            </form>
          </section>

          {/* Fees Table */}
          <section className="reference-card reference-table-card">
            <div className="reference-card-heading">
              <div>
                <h2>Operational &amp; Ancillary Fee Directory</h2>
                <p className="reference-muted">
                  Official penalties, cleaning charges, and key replacement rates applied across storage agreements.
                </p>
              </div>
              <span className="reference-pill">
                {feeData ? `${feesList.length} of ${feeData.totalCount} policies` : "Loading..."}
              </span>
            </div>

            <div className="reference-table-scroll">
              <table className="reference-table">
                <thead>
                  <tr>
                    <th scope="col">Fee Code</th>
                    <th scope="col">Scope / Facility</th>
                    <th scope="col">Fee Type</th>
                    <th scope="col">Calculation</th>
                    <th scope="col" className="text-right">Amount / Rate</th>
                    <th scope="col" className="text-center">Grace Period</th>
                    <th scope="col">Validity</th>
                    <th scope="col" className="text-center">Status</th>
                    <th scope="col" className="text-right pr-6">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loadingFees ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-xs text-[#767679]">
                        <div className="inline-flex items-center gap-2">
                          <RefreshCw size={16} className="animate-spin text-blue-600" />
                          <span>Loading fee policies from server...</span>
                        </div>
                      </td>
                    </tr>
                  ) : feesList.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center">
                        <div className="admin-empty py-4">
                          <Receipt size={36} className="mx-auto text-slate-300 mb-2" />
                          <strong className="block text-sm text-[#14121b]">
                            {feeQuery.Search || feeQuery.FeeType
                              ? "No matching fee policies found"
                              : "No fee policies registered"}
                          </strong>
                          <p className="text-xs text-[#767679] mt-1">
                            {feeQuery.Search || feeQuery.FeeType
                              ? "Try adjusting search terms or clearing filters."
                              : "Click 'Add Fee Policy' to configure penalty and ancillary charges."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    feesList.map((fee) => {
                      const feeTypeLabel =
                        feeTypes.find(([v]) => v === fee.feeType)?.[1] || fee.feeType || "—";
                      const calcMethodLabel =
                        calculationMethods.find(([v]) => v === fee.calculationMethod)?.[1] ||
                        fee.calculationMethod ||
                        "—";

                      return (
                        <tr key={fee.id}>
                          <td>
                            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                              {fee.code}
                            </span>
                          </td>
                          <td>
                            <div className="text-xs">
                              {fee.facilityName ? (
                                <span className="font-semibold text-[#14121b] flex items-center gap-1">
                                  <Warehouse size={12} className="text-slate-400" />
                                  {fee.facilityName}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full text-[11px]">
                                  <Globe size={11} /> Global (All Branches)
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className="text-xs font-medium text-[#14121b]">{feeTypeLabel}</span>
                            {fee.conditions && (
                              <p className="text-[10px] text-[#767679] max-w-[200px] truncate" title={fee.conditions}>
                                {fee.conditions}
                              </p>
                            )}
                          </td>
                          <td>
                            <span className="text-xs text-[#475467]">{calcMethodLabel}</span>
                          </td>
                          <td className="text-right">
                            <span className="font-bold text-xs text-[#14121b]">
                              {fee.amount != null && fee.amount > 0 ? formatCurrency(fee.amount) : ""}
                              {fee.ratePercent != null && fee.ratePercent > 0 ? ` ${fee.ratePercent}%` : ""}
                              {(!fee.amount && !fee.ratePercent) && "0 ₫"}
                            </span>
                          </td>
                          <td className="text-center">
                            <span className="inline-flex items-center gap-1 text-xs text-[#767679]">
                              <Clock size={11} />
                              {fee.graceDays != null ? `${fee.graceDays} days` : "0 days"}
                            </span>
                          </td>
                          <td className="text-xs text-[#767679]">
                            {fee.validFrom ? fee.validFrom.split("T")[0] : "Always"}
                            {fee.validTo ? ` → ${fee.validTo.split("T")[0]}` : " → Ongoing"}
                          </td>
                          <td className="text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleFeeStatus(fee)}
                              className={`reference-status cursor-pointer ${fee.isActive ? "active" : "inactive"}`}
                              title="Click to toggle status"
                            >
                              {fee.isActive ? "Active" : "Inactive"}
                            </button>
                          </td>
                          <td className="text-right pr-6">
                            <button
                              type="button"
                              onClick={() => openEditFeeModal(fee)}
                              className="reference-button-secondary !py-1 !px-2.5 !text-[11px]"
                              title="Edit fee policy"
                            >
                              <Edit3 size={13} /> Edit
                            </button>
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
              <div className="reference-pagination">
                <span>
                  {feeData.totalCount === 0
                    ? "0 policies"
                    : `Showing page ${feeData.pageNumber} of ${Math.max(1, feeData.totalPages)} (Total ${feeData.totalCount} policies)`}
                </span>
                <div className="reference-pagination-buttons">
                  <button
                    type="button"
                    disabled={!feeData.hasPreviousPage || feeQuery.PageNumber <= 1}
                    onClick={() => setFeeQuery({ ...feeQuery, PageNumber: feeQuery.PageNumber - 1 })}
                    className="reference-button-secondary !py-1 !px-3 !text-xs"
                  >
                    <ChevronLeft size={14} /> Previous
                  </button>
                  <button
                    type="button"
                    disabled={!feeData.hasNextPage}
                    onClick={() => setFeeQuery({ ...feeQuery, PageNumber: feeQuery.PageNumber + 1 })}
                    className="reference-button-secondary !py-1 !px-3 !text-xs"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: UNIT RENTAL RATES SECTION                                          */}
      {/* ========================================================================= */}
      {activeTab === "rates" && (
        <section className="reference-card reference-table-card">
          <div className="reference-card-heading">
            <div>
              <h2>Unit Rental Rates Directory</h2>
              <p className="reference-muted">
                Edit values directly in table cells to adjust rates • Currency: VND / month
              </p>
            </div>
            <span className="reference-pill">{rates.length} rate entries</span>
          </div>

          <div className="reference-table-scroll">
            <table className="reference-table">
              <thead>
                <tr>
                  <th scope="col">Unit Type</th>
                  <th scope="col" className="text-right">Monthly Rate (₫)</th>
                  <th scope="col" className="text-right">Deposit Amount (₫)</th>
                  <th scope="col" className="text-right">Reservation Fee (₫)</th>
                  <th scope="col" className="text-center">Effective Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-xs text-[#767679]">
                      Loading rate policies from server...
                    </td>
                  </tr>
                ) : rates.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-xs text-[#767679]">
                      No rate configurations defined for this facility.
                    </td>
                  </tr>
                ) : (
                  rates.map((rate) => {
                    const edited = editedRates[rate.id] || {};
                    const isDirty = dirtyIds.has(rate.id);

                    return (
                      <tr
                        key={rate.id}
                        className={isDirty ? "bg-[#fffef0] hover:bg-[#fff9d6]" : ""}
                      >
                        <td>
                          <strong className="font-semibold text-[#14121b]">
                            {rate.unitTypeName}
                          </strong>
                          <div className="text-[10px] text-[#767679]">{rate.facilityName}</div>
                        </td>

                        <td className="text-right">
                          <input
                            type="number"
                            step="1000"
                            value={edited.monthlyRate ?? rate.monthlyRate}
                            onChange={(e) =>
                              handleRateChange(rate.id, "monthlyRate", e.target.value)
                            }
                            className="w-32 rounded-xl border border-[#e2e4e8] bg-white px-2.5 py-1 text-right text-xs font-bold text-[#14121b] outline-none transition focus:border-black"
                          />
                        </td>

                        <td className="text-right">
                          <input
                            type="number"
                            step="1000"
                            value={edited.depositAmount ?? rate.depositAmount}
                            onChange={(e) =>
                              handleRateChange(rate.id, "depositAmount", e.target.value)
                            }
                            className="w-28 rounded-xl border border-[#e2e4e8] bg-white px-2.5 py-1 text-right text-xs font-medium text-[#475467] outline-none transition focus:border-black"
                          />
                        </td>

                        <td className="text-right">
                          <span className="font-medium text-[#475467]">
                            {formatCurrency(rate.bookingFee)}
                          </span>
                        </td>

                        <td className="text-center">
                          <span className="reference-pill !py-0.5 !px-2.5">
                            {rate.validFrom
                              ? new Date(rate.validFrom).toLocaleDateString("en-US")
                              : "Current"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PROMOTIONS SECTION                                                 */}
      {/* ========================================================================= */}
      {activeTab === "promotions" && (
        <section className="reference-card p-5">
          <div className="reference-card-heading mb-3">
            <div>
              <h2>Discount Vouchers &amp; Promotions</h2>
              <p className="reference-muted">Promotional codes applicable when customers rent storage units</p>
            </div>
            <button
              type="button"
              onClick={() => setShowPromoModal(true)}
              className="reference-button-primary !py-1 !px-3 !text-xs"
            >
              <Plus size={13} /> Create Voucher
            </button>
          </div>

          <div className="space-y-2.5">
            {loading ? (
              <p className="py-6 text-center text-xs text-[#767679]">Loading promotional vouchers...</p>
            ) : promotions.length === 0 ? (
              <p className="py-6 text-center text-xs text-[#767679]">No promotional vouchers configured.</p>
            ) : (
              promotions.map((promo) => (
                <div
                  key={promo.id}
                  className="flex items-center justify-between rounded-2xl border border-[#ededed] bg-white p-3.5 transition hover:shadow-2xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                        {promo.code}
                      </span>
                      <span className="text-xs font-semibold text-[#14121b]">{promo.name}</span>
                    </div>
                    <div className="mt-1 text-[11px] text-[#767679]">
                      {promo.discountType === "percentage"
                        ? `Discount ${promo.discountValue}%`
                        : `Discount ${formatCurrency(promo.discountValue)}`}
                      {promo.usageLimit ? ` • Usage limit: ${promo.usageLimit}` : ""}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleTogglePromo(promo.id, promo.isActive)}
                      className={`h-5 w-9 rounded-full transition-colors cursor-pointer ${
                        promo.isActive ? "bg-black" : "bg-slate-200"
                      }`}
                      title={promo.isActive ? "Click to suspend" : "Click to activate"}
                    >
                      <span
                        className={`block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                          promo.isActive ? "translate-x-4" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* Modal: Create / Edit Fee Policy (PUT /api/admin/pricing/fees) */}
      {showFeeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg reference-card !bg-white p-6 shadow-2xl rounded-3xl max-h-[90vh] overflow-y-auto">
            <div className="reference-card-heading mb-4 pb-3 border-b border-[#ededed]">
              <div>
                <h2>{feeFormData.id ? "Edit Fee Policy" : "Create New Fee Policy"}</h2>
                <p className="reference-muted">
                  Configure operational penalty or surcharge policy (/api/admin/pricing/fees)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowFeeModal(false)}
                className="reference-pill hover:bg-slate-50 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSaveFee} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-[#25232c]">
                    Fee Code <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LATE_FEE_STD"
                    value={feeFormData.code}
                    onChange={(e) => setFeeFormData({ ...feeFormData, code: e.target.value })}
                    className="reference-input uppercase font-mono"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-[#25232c]">
                    Scope (Facility)
                  </span>
                  <select
                    value={feeFormData.facilityId}
                    onChange={(e) => setFeeFormData({ ...feeFormData, facilityId: e.target.value })}
                    className="reference-select w-full"
                  >
                    <option value="">Global (All Facilities)</option>
                    {facilitiesList.map((fac) => (
                      <option key={fac.id} value={fac.id}>
                        {fac.name} ({fac.code})
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-[#25232c]">Fee Type <span className="text-red-500">*</span></span>
                  <select
                    value={feeFormData.feeType}
                    onChange={(e) => setFeeFormData({ ...feeFormData, feeType: e.target.value })}
                    className="reference-select w-full"
                  >
                    {feeTypes.map(([val, label]) => (
                      <option key={val} value={val}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-[#25232c]">Calculation Method <span className="text-red-500">*</span></span>
                  <select
                    value={feeFormData.calculationMethod}
                    onChange={(e) => setFeeFormData({ ...feeFormData, calculationMethod: e.target.value })}
                    className="reference-select w-full"
                  >
                    {calculationMethods.map(([val, label]) => (
                      <option key={val} value={val}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-[#25232c]">Fixed Amount (₫)</span>
                  <input
                    type="number"
                    step="1000"
                    placeholder="e.g. 50000"
                    value={feeFormData.amount}
                    onChange={(e) => setFeeFormData({ ...feeFormData, amount: e.target.value })}
                    className="reference-input font-bold"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-[#25232c]">Rate Percent (%)</span>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 5"
                    value={feeFormData.ratePercent}
                    onChange={(e) => setFeeFormData({ ...feeFormData, ratePercent: e.target.value })}
                    className="reference-input font-bold"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-[#25232c]">Grace Days</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={feeFormData.graceDays}
                    onChange={(e) => setFeeFormData({ ...feeFormData, graceDays: e.target.value })}
                    className="reference-input"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-[#25232c]">Conditions / Notes</span>
                <textarea
                  rows={2}
                  placeholder="e.g. Applied after 3 overdue days calculated daily"
                  value={feeFormData.conditions}
                  onChange={(e) => setFeeFormData({ ...feeFormData, conditions: e.target.value })}
                  className="reference-input !h-auto py-2"
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-[#25232c]">Valid From</span>
                  <input
                    type="date"
                    value={feeFormData.validFrom}
                    onChange={(e) => setFeeFormData({ ...feeFormData, validFrom: e.target.value })}
                    className="reference-input"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-[#25232c]">Valid To (Optional)</span>
                  <input
                    type="date"
                    value={feeFormData.validTo}
                    onChange={(e) => setFeeFormData({ ...feeFormData, validTo: e.target.value })}
                    className="reference-input"
                  />
                </label>
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={feeFormData.isActive}
                  onChange={(e) => setFeeFormData({ ...feeFormData, isActive: e.target.checked })}
                  className="rounded border-slate-300 text-black focus:ring-black"
                />
                <span className="text-xs font-semibold text-[#25232c]">Policy is Active immediately</span>
              </label>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#ededed]">
                <button
                  type="button"
                  onClick={() => setShowFeeModal(false)}
                  className="reference-button-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingFee}
                  className="reference-button-primary"
                >
                  {savingFee ? "Saving..." : feeFormData.id ? "Save Changes" : "Create Policy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Promotion */}
      {showPromoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm reference-card !bg-white p-6 shadow-2xl rounded-3xl">
            <div className="reference-card-heading mb-4 pb-3 border-b border-[#ededed]">
              <h2>Create New Promotional Voucher</h2>
              <button
                type="button"
                onClick={() => setShowPromoModal(false)}
                className="reference-pill hover:bg-slate-50 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleCreatePromo} className="space-y-3.5">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-[#25232c]">
                  Voucher Code <span className="text-red-500">*</span>
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER20"
                  value={promoForm.code}
                  onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value })}
                  className="reference-input uppercase font-mono"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-[#25232c]">
                  Campaign Name <span className="text-red-500">*</span>
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Summer Opening Special"
                  value={promoForm.name}
                  onChange={(e) => setPromoForm({ ...promoForm, name: e.target.value })}
                  className="reference-input"
                />
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-[#25232c]">Discount Type</span>
                  <select
                    value={promoForm.discountType}
                    onChange={(e) => setPromoForm({ ...promoForm, discountType: e.target.value })}
                    className="reference-select"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₫)</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-[#25232c]">
                    Discount Value <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder={promoForm.discountType === "percentage" ? "10" : "50000"}
                    value={promoForm.discountValue}
                    onChange={(e) => setPromoForm({ ...promoForm, discountValue: e.target.value })}
                    className="reference-input font-bold"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-[#25232c]">Usage Limit</span>
                <input
                  type="number"
                  min="1"
                  value={promoForm.usageLimit}
                  onChange={(e) => setPromoForm({ ...promoForm, usageLimit: e.target.value })}
                  className="reference-input"
                />
              </label>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#ededed]">
                <button
                  type="button"
                  onClick={() => setShowPromoModal(false)}
                  className="reference-button-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPromo}
                  className="reference-button-primary"
                >
                  {savingPromo ? "Creating..." : "Confirm & Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManagerPricing;
