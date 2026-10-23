import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Save, Plus, X, Tag, Receipt, Warehouse, AlertTriangle, CheckCircle2 } from "lucide-react";
import operationsService from "../api/operationsService";
import { useManagerFacility } from "../context/ManagerFacilityContext";

function formatCurrency(val) {
  if (val == null || isNaN(val)) return "0 ₫";
  return `${Number(val).toLocaleString("en-US")} ₫`;
}


function ManagerPricing() {
  const { facilityId, activeFacility } = useManagerFacility();

  const [rates, setRates] = useState([]);
  const [editedRates, setEditedRates] = useState({});
  const [dirtyIds, setDirtyIds] = useState(new Set());
  const [promotions, setPromotions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  // Modal voucher
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoForm, setPromoForm] = useState({
    code: "",
    name: "",
    discountType: "percentage",
    discountValue: "",
    usageLimit: "100",
  });
  const [savingPromo, setSavingPromo] = useState(false);

  // Fetch real data from backend
  const loadData = useCallback(async () => {
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

      const items = ratesRes?.items ?? [];
      setRates(items);
      setEditedRates({});
      setDirtyIds(new Set());
      setPromotions(promosRes?.items ?? []);
    } catch (err) {
      setError(err?.message || "Failed to load pricing configurations from server.");
    } finally {
      setLoading(false);
    }
  }, [facilityId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle rate input edit
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

  // Save rates changes
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
      await loadData();
    } catch (err) {
      setError(err?.message || "Failed to save rate updates.");
    } finally {
      setSaving(false);
    }
  };

  // Toggle promo status
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

  // Create new promotion
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
      await loadData();
    } catch (err) {
      setError(err?.message || "Failed to create promotion voucher.");
    } finally {
      setSavingPromo(false);
    }
  };

  return (
    <div className="reference-dashboard">
      {/* Top Toolbar matching Dashboard */}
      <div className="reference-toolbar">
        <div>
          <div className="flex items-center gap-3">
            <h1>Pricing &amp; Rate Policies</h1>
            <span className="reference-pill">
              {activeFacility ? `Facility: ${activeFacility.name} (${activeFacility.code})` : "Network Wide"}
            </span>
          </div>
          <p className="reference-muted mt-1">
            Configure monthly rental rates by unit dimension, establish ancillary penalty surcharges, and govern promotional vouchers.
          </p>
        </div>

        <div className="reference-toolbar-actions">
          {dirtyIds.size > 0 && (
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

          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="reference-refresh"
            title="Refresh pricing data"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {notice && (
        <div role="status" className="mb-4 flex items-center gap-2 rounded-2xl bg-[#e2fff2] px-4 py-3 text-xs font-semibold text-[#173000] border border-[#b3fa65]">
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

      {/* 3 Metric Cards matching Dashboard */}
      <div className="mb-6 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <div className="reference-card p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-[#767679]">
            <span>Unit Types &amp; Rates</span>
            <Warehouse size={18} className="text-[#14121b]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#14121b]">
            {loading ? "..." : `${rates.length} unit types`}
          </div>
          <div className="mt-1">
            <span className="reference-badge lime">Active In Network</span>
          </div>
        </div>

        <div className="reference-card p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-[#767679]">
            <span>Ancillary Fee Policies</span>
            <Receipt size={18} className="text-[#14121b]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#14121b]">
            {loading ? "..." : `${fees.length} fee rules`}
          </div>
          <div className="mt-1 text-xs text-[#767679]">Overdue penalty, key loss, cleaning fees</div>
        </div>

        <div className="reference-card p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-[#767679]">
            <span>Promotions &amp; Vouchers</span>
            <Tag size={18} className="text-[#14121b]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#14121b]">
            {loading ? "..." : `${promotions.filter((p) => p.isActive).length} active campaigns`}
          </div>
          <div className="mt-1 text-xs text-[#767679]">Total {promotions.length} created campaigns</div>
        </div>
      </div>

      {/* Main Rates Table */}
      <section className="reference-card reference-table-card mb-6">
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

      {/* Promotions */}
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

      {/* Modal: Create Promotion */}
      {showPromoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm reference-card !bg-white p-6 shadow-2xl">
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
