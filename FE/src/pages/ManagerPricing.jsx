import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ADMIN_ROLES, hasAnyRole } from "../constants/roles";
// facilities loaded via ManagerFacilityContext
import managerService from "../api/managerService";
import { useManagerFacility } from "../context/ManagerFacilityContext";
import { FacilityBarActions } from "../components/FacilitySwitcher";
import { formatVnd } from "../lib/utils";
import PAGINATION from "../constants/pagination";

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
  const { facilityId } = useManagerFacility();
  const { user } = useAuth();
  const isAdmin = hasAnyRole((user?.roles || []).map((r) => r.toLowerCase()), ADMIN_ROLES);

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
  const [loadingFees, setLoadingFees] = useState(false);
  const [facilitiesList, setFacilitiesList] = useState([]);

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

  // Sync facilities list from context or manager service
  useEffect(() => {
    if (Array.isArray(facilities) && facilities.length > 0) {
      setFacilitiesList(facilities);
    } else {
      managerService
        .getMyFacilities()
        .then((res) => {
          if (Array.isArray(res) && res.length > 0) setFacilitiesList(res);
        })
        .catch(() => {});
    }
  }, [facilities]);

  // Fetch Pricing Fees via GET /api/manager/pricing/fees
  const loadFees = useCallback(async () => {
    setLoadingFees(true);
    try {
      const res = await managerService.getPricingFees({
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
        facilityId
          ? managerService.getPricingRates(facilityId, { pageSize: PAGINATION.BATCH_PAGE_SIZE })
          : Promise.resolve({ items: [] }),
        managerService.getPromotions({ pageSize: PAGINATION.BATCH_PAGE_SIZE }),
      ]);

      setRates(ratesRes?.items ?? (Array.isArray(ratesRes) ? ratesRes : []));
      setEditedRates({});
      setDirtyIds(new Set());
      setPromotions(promosRes?.items ?? (Array.isArray(promosRes) ? promosRes : []));
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

  // Fees handlers
  const handleFeeFilterSubmit = (e) => {
    e.preventDefault();
    setFeeQuery({ ...feeFilters, PageNumber: 1 });
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
          <button
            type="button"
            onClick={() => setActiveTab("promotions")}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition ${
              activeTab === "promotions"
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Promotions &amp; Vouchers ({promotions.length})
          </button>
        </div>

        <div>
          {activeTab === "fees" && (
            <button
              type="button"
              onClick={openCreateFeeModal}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition"
            >
              Add Fee Policy
            </button>
          )}

          {activeTab === "rates" && dirtyIds.size > 0 && (
            <button
              type="button"
              onClick={handleSaveRates}
              disabled={saving}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving ? "Saving..." : `Save Changes (${dirtyIds.size})`}
            </button>
          )}

          {activeTab === "promotions" && (
            <button
              type="button"
              onClick={() => setShowPromoModal(true)}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition"
            >
              Create Voucher
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: FEES & SURCHARGES SECTION */}
      {activeTab === "fees" && (
        <div className="space-y-4">
          {/* Fees Filter Bar */}
          <form onSubmit={handleFeeFilterSubmit} className="flex flex-wrap items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-3">
            <input
              type="search"
              placeholder="Search code, conditions..."
              value={feeFilters.Search}
              onChange={(e) => setFeeFilters({ ...feeFilters, Search: e.target.value })}
              className="h-8 w-48 rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400"
            />
            <select
              value={feeFilters.FeeType}
              onChange={(e) => setFeeFilters({ ...feeFilters, FeeType: e.target.value })}
              className="h-8 rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:outline-none focus:border-slate-400"
            >
              <option value="">All Fee Types</option>
              {feeTypes.map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            <select
              value={feeFilters.GlobalOnly}
              onChange={(e) => setFeeFilters({ ...feeFilters, GlobalOnly: e.target.value })}
              className="h-8 rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:outline-none focus:border-slate-400"
            >
              <option value="">All Scopes</option>
              <option value="true">Global (Network-Wide)</option>
              <option value="false">Facility Specific</option>
            </select>
            <select
              value={feeFilters.IsActive}
              onChange={(e) => setFeeFilters({ ...feeFilters, IsActive: e.target.value })}
              className="h-8 rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:outline-none focus:border-slate-400"
            >
              <option value="">All Statuses</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
            <button type="submit" className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition">
              Apply
            </button>
            <button
              type="button"
              onClick={handleResetFeeFilters}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Reset
            </button>
          </form>

          {/* Fees Data Table */}
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Fee Code</th>
                  <th className="px-4 py-2.5">Scope</th>
                  <th className="px-4 py-2.5">Category</th>
                  <th className="px-4 py-2.5">Method</th>
                  <th className="px-4 py-2.5 text-right">Rate / Amount</th>
                  <th className="px-4 py-2.5 text-center">Grace</th>
                  <th className="px-4 py-2.5">Effective</th>
                  <th className="px-4 py-2.5 text-center">Status</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
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
                    const feeTypeLabel = feeTypes.find(([val]) => val === fee.feeType)?.[1] || fee.feeType;
                    const calcMethodLabel = calculationMethods.find(([val]) => val === fee.calculationMethod)?.[1] || fee.calculationMethod;

                    return (
                      <tr key={fee.id} className="hover:bg-slate-50/60 transition">
                        <td className="px-4 py-2.5 font-mono font-semibold text-slate-800">
                          {fee.code}
                        </td>
                        <td className="px-4 py-2.5">
                          {fee.facilityName ? (
                            <span className="font-medium text-slate-800">{fee.facilityName}</span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                              Global
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="font-medium text-slate-800">{feeTypeLabel}</span>
                          {fee.conditions && (
                            <p className="max-w-[200px] truncate text-[10px] text-slate-500" title={fee.conditions}>
                              {fee.conditions}
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
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => openEditFeeModal(fee)}
                            className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                          >
                            Edit
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
                <th className="px-4 py-2.5">Unit Type</th>
                <th className="px-4 py-2.5 text-right">Monthly Rate (₫)</th>
                <th className="px-4 py-2.5 text-right">Deposit Amount (₫)</th>
                <th className="px-4 py-2.5 text-right">Reservation Fee (₫)</th>
                <th className="px-4 py-2.5 text-center">Effective Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-slate-400">
                    Loading rate policies from server...
                  </td>
                </tr>
              ) : rates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-slate-400">
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
                      className={isDirty ? "bg-amber-50/40 hover:bg-amber-50/70 transition" : "hover:bg-slate-50/60 transition"}
                    >
                      <td className="px-4 py-2.5">
                        <div className="font-semibold text-slate-800">{rate.unitTypeName}</div>
                        <div className="text-[10px] text-slate-400">{rate.facilityName}</div>
                      </td>

                      <td className="px-4 py-2.5 text-right">
                        <input
                          type="number"
                          step="1000"
                          value={edited.monthlyRate ?? rate.monthlyRate}
                          onChange={(e) => handleRateChange(rate.id, "monthlyRate", e.target.value)}
                          className="w-32 rounded-md border border-slate-200 bg-white px-2 py-1 text-right text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-400"
                        />
                      </td>

                      <td className="px-4 py-2.5 text-right">
                        <input
                          type="number"
                          step="1000"
                          value={edited.depositAmount ?? rate.depositAmount}
                          onChange={(e) => handleRateChange(rate.id, "depositAmount", e.target.value)}
                          className="w-28 rounded-md border border-slate-200 bg-white px-2 py-1 text-right text-xs font-medium text-slate-700 focus:outline-none focus:border-slate-400"
                        />
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

      {/* TAB 3: PROMOTIONS SECTION */}
      {activeTab === "promotions" && (
        <div className="space-y-2.5">
          {loading ? (
            <div className="rounded-lg border border-slate-200 bg-white py-12 text-center text-xs text-slate-400">
              Loading promotional vouchers...
            </div>
          ) : promotions.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white py-12 text-center text-xs text-slate-400">
              No promotional vouchers configured.
            </div>
          ) : (
            promotions.map((promo) => (
              <div
                key={promo.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3.5 hover:bg-slate-50/50 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      {promo.code}
                    </span>
                    <span className="text-xs font-semibold text-slate-900">{promo.name}</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {promo.discountType === "percentage"
                      ? `Discount ${promo.discountValue}%`
                      : `Discount ${formatVnd(promo.discountValue)}`}
                    {promo.usageLimit ? ` • Usage limit: ${promo.usageLimit}` : ""}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTogglePromo(promo.id, promo.isActive)}
                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                      promo.isActive
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                    title={promo.isActive ? "Click to suspend" : "Click to activate"}
                  >
                    {promo.isActive ? "Active" : "Inactive"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal: Create / Edit Fee Policy */}
      {showFeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-5 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-sm font-bold text-slate-900">
                {feeFormData.id ? "Edit Fee Policy" : "Create New Fee Policy"}
              </h2>
              <button
                type="button"
                onClick={() => setShowFeeModal(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

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
                    onChange={(e) => setFeeFormData({ ...feeFormData, code: e.target.value })}
                    className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs font-mono uppercase text-slate-800 focus:outline-none focus:border-slate-400"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-700">
                    Scope (Facility)
                  </span>
                  <select
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
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-700">Fee Type <span className="text-red-500">*</span></span>
                  <select
                    value={feeFormData.feeType}
                    onChange={(e) => setFeeFormData({ ...feeFormData, feeType: e.target.value })}
                    className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-400"
                  >
                    {feeTypes.map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-700">Calculation Method <span className="text-red-500">*</span></span>
                  <select
                    value={feeFormData.calculationMethod}
                    onChange={(e) => setFeeFormData({ ...feeFormData, calculationMethod: e.target.value })}
                    className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-400"
                  >
                    {calculationMethods.map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-700">Fixed Amount (₫)</span>
                  <input
                    type="number"
                    step="1000"
                    placeholder="e.g. 50000"
                    value={feeFormData.amount}
                    onChange={(e) => setFeeFormData({ ...feeFormData, amount: e.target.value })}
                    className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-400"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-700">Rate Percent (%)</span>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 5"
                    value={feeFormData.ratePercent}
                    onChange={(e) => setFeeFormData({ ...feeFormData, ratePercent: e.target.value })}
                    className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-400"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-700">Grace Days</span>
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
                  <input
                    type="date"
                    value={feeFormData.validFrom}
                    onChange={(e) => setFeeFormData({ ...feeFormData, validFrom: e.target.value })}
                    className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-700">Valid To (Optional)</span>
                  <input
                    type="date"
                    value={feeFormData.validTo}
                    onChange={(e) => setFeeFormData({ ...feeFormData, validTo: e.target.value })}
                    className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
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

      {/* Modal: Create Promotion */}
      {showPromoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-sm font-bold text-slate-900">Create New Promotional Voucher</h2>
              <button
                type="button"
                onClick={() => setShowPromoModal(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePromo} className="space-y-3.5">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-700">
                  Voucher Code <span className="text-red-500">*</span>
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER20"
                  value={promoForm.code}
                  onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value })}
                  className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs font-mono uppercase text-slate-800 focus:outline-none focus:border-slate-400"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-700">
                  Campaign Name <span className="text-red-500">*</span>
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Summer Opening Special"
                  value={promoForm.name}
                  onChange={(e) => setPromoForm({ ...promoForm, name: e.target.value })}
                  className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                />
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-700">Discount Type</span>
                  <select
                    value={promoForm.discountType}
                    onChange={(e) => setPromoForm({ ...promoForm, discountType: e.target.value })}
                    className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-400"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₫)</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-700">
                    Discount Value <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder={promoForm.discountType === "percentage" ? "10" : "50000"}
                    value={promoForm.discountValue}
                    onChange={(e) => setPromoForm({ ...promoForm, discountValue: e.target.value })}
                    className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-400"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-700">Usage Limit</span>
                <input
                  type="number"
                  min="1"
                  value={promoForm.usageLimit}
                  onChange={(e) => setPromoForm({ ...promoForm, usageLimit: e.target.value })}
                  className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                />
              </label>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPromoModal(false)}
                  className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPromo}
                  className="rounded-md bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition disabled:opacity-50"
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
