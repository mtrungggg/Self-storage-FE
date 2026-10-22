import { useCallback, useEffect, useState } from "react";
import operationsService from "../api/operationsService";
import { useManagerFacility } from "../context/ManagerFacilityContext";

function formatCurrency(val) {
  if (val == null || isNaN(val)) return "0 ₫";
  return `${Number(val).toLocaleString("vi-VN")} ₫`;
}

function formatFeeValue(fee) {
  if (fee.calculationMethod === "percentage") {
    return `${fee.ratePercent || 0}% / ngày`;
  }
  return formatCurrency(fee.amount);
}

function ManagerPricing() {
  const { facilityId, activeFacility } = useManagerFacility();

  const [rates, setRates] = useState([]);
  const [editedRates, setEditedRates] = useState({});
  const [dirtyIds, setDirtyIds] = useState(new Set());

  const [fees, setFees] = useState([]);
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
      const [ratesRes, feesRes, promosRes] = await Promise.all([
        operationsService.getPricingRates({
          facilityId: facilityId || undefined,
          pageSize: 50,
        }),
        operationsService.getPricingFees({
          facilityId: facilityId || undefined,
          pageSize: 50,
        }),
        operationsService.getPromotions({ pageSize: 50 }),
      ]);

      const items = ratesRes?.items ?? [];
      setRates(items);
      const initEdited = {};
      items.forEach((r) => {
        initEdited[r.id] = {
          monthlyRate: r.monthlyRate,
          depositAmount: r.depositAmount,
          bookingFee: r.bookingFee,
        };
      });
      setEditedRates(initEdited);
      setDirtyIds(new Set());

      setFees(feesRes?.items ?? []);
      setPromotions(promosRes?.items ?? []);
    } catch (err) {
      setError(err?.message || "Không thể tải dữ liệu bảng giá từ máy chủ.");
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
      setNotice("Đã lưu thay đổi bảng giá thành công!");
      setTimeout(() => setNotice(""), 3500);
      setDirtyIds(new Set());
      await loadData();
    } catch (err) {
      setError(err?.message || "Không thể lưu thay đổi bảng giá.");
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
      setNotice(next ? "Đã bật khuyến mãi." : "Đã tạm dừng khuyến mãi.");
      setTimeout(() => setNotice(""), 3000);
    } catch (err) {
      setPromotions((prev) =>
        prev.map((p) => (p.id === promoId ? { ...p, isActive: currentStatus } : p))
      );
      setError(err?.message || "Không thể đổi trạng thái mã khuyến mãi.");
    }
  };

  // Create promo submit
  const handleCreatePromo = async (e) => {
    e.preventDefault();
    setSavingPromo(true);
    setError("");
    try {
      const now = new Date();
      const nextYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      await operationsService.createPromotion({
        code: promoForm.code.trim().toUpperCase(),
        name: promoForm.name.trim(),
        discountType: promoForm.discountType,
        discountValue: Number(promoForm.discountValue) || 0,
        usageLimit: Number(promoForm.usageLimit) || 100,
        validFrom: now.toISOString(),
        validTo: nextYear.toISOString(),
        isActive: true,
      });
      setNotice(`Đã tạo mã khuyến mãi ${promoForm.code.toUpperCase()}!`);
      setTimeout(() => setNotice(""), 3500);
      setShowPromoModal(false);
      setPromoForm({
        code: "",
        name: "",
        discountType: "percentage",
        discountValue: "",
        usageLimit: "100",
      });
      await loadData();
    } catch (err) {
      setError(err?.message || "Không thể tạo mã khuyến mãi.");
    } finally {
      setSavingPromo(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-black tracking-tight text-[#0b1c30]">
            Bảng Giá &amp; Chính Sách
          </h1>
          <p className="mt-0.5 text-xs text-[#58657a]">
            {activeFacility ? `Cơ sở: ${activeFacility.name} (${activeFacility.code})` : "Cơ sở vận hành"} • Đồng bộ trực tiếp từ máy chủ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#dfe7f5] bg-white px-3.5 text-xs font-bold text-[#3a475a] hover:bg-[#f8faff] transition shadow-2xs"
          >
            <span className={`material-symbols-outlined text-[16px] ${loading ? "animate-spin" : ""}`}>
              refresh
            </span>
            Làm mới
          </button>

          {dirtyIds.size > 0 && (
            <button
              type="button"
              onClick={handleSaveRates}
              disabled={saving}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#1d5fe5] px-4 text-xs font-bold text-white shadow-2xs hover:bg-[#1550c7] transition disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              {saving ? "Đang lưu..." : `Lưu thay đổi (${dirtyIds.size})`}
            </button>
          )}
        </div>
      </div>

      {notice && (
        <div role="status" className="flex items-center gap-2 rounded-xl bg-[#ecfdf3] px-4 py-2.5 text-xs font-bold text-[#027a48] border border-[#a6f4c5]">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{notice}</span>
        </div>
      )}

      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-xl bg-[#fff1f3] px-4 py-2.5 text-xs font-bold text-[#b42318] border border-[#fecdca]">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#dfe7f5] bg-white p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#475467]">
            <span className="material-symbols-outlined text-[18px] text-[#1d5fe5]">warehouse</span>
            Loại Ô Kho &amp; Đơn Giá
          </div>
          <div className="mt-2 text-xl font-black text-[#0b1c30]">
            {loading ? "..." : `${rates.length} loại ô`}
          </div>
          <div className="mt-0.5 text-[11px] font-medium text-[#12b76a]">Đang áp dụng tại kho</div>
        </div>

        <div className="rounded-2xl border border-[#dfe7f5] bg-white p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#475467]">
            <span className="material-symbols-outlined text-[18px] text-[#7f56d9]">receipt_long</span>
            Quy Định Phụ Phí
          </div>
          <div className="mt-2 text-xl font-black text-[#0b1c30]">
            {loading ? "..." : `${fees.length} khoản phí`}
          </div>
          <div className="mt-0.5 text-[11px] font-medium text-[#475467]">Phí trễ hạn, mất khóa</div>
        </div>

        <div className="rounded-2xl border border-[#dfe7f5] bg-white p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#475467]">
            <span className="material-symbols-outlined text-[18px] text-[#b54708]">local_offer</span>
            Mã Khuyến Mãi
          </div>
          <div className="mt-2 text-xl font-black text-[#0b1c30]">
            {loading ? "..." : `${promotions.filter((p) => p.isActive).length} mã đang chạy`}
          </div>
          <div className="mt-0.5 text-[11px] font-medium text-[#b54708]">Tổng {promotions.length} mã tạo</div>
        </div>
      </div>

      {/* Main Rates Table */}
      <div className="overflow-hidden rounded-2xl border border-[#eaecf0] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#eaecf0] px-4 py-3">
          <h2 className="text-sm font-black text-[#0b1c30]">
            Bảng Đơn Giá Thuê Theo Loại Ô
          </h2>
          <span className="text-[11px] font-medium text-[#8996a9]">
            Nhập trực tiếp để điều chỉnh giá • Đơn vị: VNĐ / tháng
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[#eaecf0] bg-[#f8f9fc] text-[11px] font-bold text-[#475467]">
                <th className="py-2.5 px-4">Loại Ô Kho</th>
                <th className="py-2.5 px-4 text-right">Giá Thuê / Tháng (₫)</th>
                <th className="py-2.5 px-4 text-right">Tiền Cọc (₫)</th>
                <th className="py-2.5 px-4 text-right">Phí Giữ Chỗ (₫)</th>
                <th className="py-2.5 px-4 text-center">Hiệu Lực</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaecf0]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs font-bold text-[#8996a9]">
                    <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-[#1d5fe5] border-t-transparent mb-1" />
                    <div>Đang tải bảng giá từ máy chủ...</div>
                  </td>
                </tr>
              ) : rates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-xs text-[#8996a9]">
                    Chưa có cấu hình giá nào cho cơ sở này.
                  </td>
                </tr>
              ) : (
                rates.map((rate) => {
                  const edited = editedRates[rate.id] || {};
                  const isDirty = dirtyIds.has(rate.id);

                  return (
                    <tr
                      key={rate.id}
                      className={`hover:bg-[#fcfdfd] transition ${
                        isDirty ? "bg-[#fffbf0]" : ""
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-[#0b1c30]">
                          {rate.unitTypeName}
                        </div>
                        <div className="text-[10px] text-[#58657a]">
                          {rate.facilityName}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <input
                          type="number"
                          step="1000"
                          value={edited.monthlyRate ?? rate.monthlyRate}
                          onChange={(e) =>
                            handleRateChange(rate.id, "monthlyRate", e.target.value)
                          }
                          className="w-32 rounded-lg border border-[#dfe7f5] px-2 py-1 text-right text-xs font-bold text-[#0b1c30] outline-none transition focus:border-[#1d5fe5]"
                        />
                      </td>

                      <td className="py-3 px-4 text-right">
                        <input
                          type="number"
                          step="1000"
                          value={edited.depositAmount ?? rate.depositAmount}
                          onChange={(e) =>
                            handleRateChange(rate.id, "depositAmount", e.target.value)
                          }
                          className="w-28 rounded-lg border border-[#dfe7f5] px-2 py-1 text-right text-xs font-medium text-[#475467] outline-none transition focus:border-[#1d5fe5]"
                        />
                      </td>

                      <td className="py-3 px-4 text-right">
                        <span className="font-medium text-[#475467]">
                          {formatCurrency(rate.bookingFee)}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="rounded-md bg-[#f2f4f7] px-2 py-0.5 text-[10px] font-bold text-[#475467]">
                          {rate.validFrom ? new Date(rate.validFrom).toLocaleDateString("vi-VN") : "Hiện hành"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Columns: Fees & Promotions */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Ancillary Fees */}
        <div className="rounded-2xl border border-[#eaecf0] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#eaecf0] pb-2.5">
            <h2 className="text-sm font-black text-[#0b1c30]">Quy Định Phụ Phí &amp; Phạt</h2>
            <span className="text-[11px] font-medium text-[#8996a9]">Áp dụng tự động</span>
          </div>

          <div className="mt-3 space-y-2">
            {loading ? (
              <p className="py-4 text-center text-xs text-[#8996a9]">Đang tải phụ phí...</p>
            ) : fees.length === 0 ? (
              <p className="py-4 text-center text-xs text-[#8996a9]">Chưa có quy định phụ phí nào.</p>
            ) : (
              fees.map((fee) => (
                <div
                  key={fee.id}
                  className="flex items-center justify-between rounded-xl border border-[#eaecf0] bg-[#fafcff] p-3 transition hover:shadow-2xs"
                >
                  <div>
                    <div className="font-extrabold text-[#0b1c30]">{fee.code}</div>
                    <div className="text-[10px] text-[#58657a]">
                      Loại: {fee.feeType} {fee.facilityName ? `• ${fee.facilityName}` : "• Toàn hệ thống"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-[#b54708]">
                      {formatFeeValue(fee)}
                    </div>
                    <span className="inline-block rounded bg-[#d1fadf] px-1.5 py-0.5 text-[9px] font-bold text-[#027a48]">
                      {fee.isActive ? "Hoạt động" : "Tạm dừng"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Promotions */}
        <div className="rounded-2xl border border-[#eaecf0] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#eaecf0] pb-2.5">
            <h2 className="text-sm font-black text-[#0b1c30]">Mã Giảm Giá &amp; Khuyến Mãi</h2>
            <button
              type="button"
              onClick={() => setShowPromoModal(true)}
              className="inline-flex items-center gap-1 rounded-lg bg-[#1d5fe5] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[#1550c7] transition"
            >
              <span className="material-symbols-outlined text-[13px]">add</span>
              Tạo mã mới
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {loading ? (
              <p className="py-4 text-center text-xs text-[#8996a9]">Đang tải mã khuyến mãi...</p>
            ) : promotions.length === 0 ? (
              <p className="py-4 text-center text-xs text-[#8996a9]">Chưa có mã khuyến mãi nào.</p>
            ) : (
              promotions.map((promo) => (
                <div
                  key={promo.id}
                  className="flex items-center justify-between rounded-xl border border-[#eaecf0] bg-[#fafcff] p-3 transition hover:shadow-2xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-[#eef4ff] px-2 py-0.5 font-mono text-xs font-extrabold text-[#1d5fe5]">
                        {promo.code}
                      </span>
                      <span className="text-xs font-bold text-[#0b1c30]">{promo.name}</span>
                    </div>
                    <div className="mt-1 text-[10px] text-[#58657a]">
                      {promo.discountType === "percentage"
                        ? `Giảm ${promo.discountValue}%`
                        : `Giảm ${formatCurrency(promo.discountValue)}`}
                      {promo.usageLimit ? ` • Giới hạn: ${promo.usageLimit} lượt` : ""}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleTogglePromo(promo.id, promo.isActive)}
                      className={`h-5 w-9 rounded-full transition-colors ${
                        promo.isActive ? "bg-[#1d5fe5]" : "bg-[#dfe7f5]"
                      }`}
                      title={promo.isActive ? "Nhấp để tạm dừng" : "Nhấp để kích hoạt"}
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
        </div>
      </div>

      {/* Modal: Create Promotion */}
      {showPromoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#eaecf0] pb-2.5">
              <h3 className="text-sm font-extrabold text-[#0b1c30]">Tạo Mã Khuyến Mãi Mới</h3>
              <button
                type="button"
                onClick={() => setShowPromoModal(false)}
                className="text-[#8996a9] hover:text-[#0b1c30]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreatePromo} className="mt-3 space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[#3a475a]">Mã Voucher (Code) *</label>
                <input
                  type="text"
                  required
                  placeholder="VOUCHER10"
                  value={promoForm.code}
                  onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#dfe7f5] px-3 py-1.5 text-xs font-bold uppercase text-[#0b1c30] outline-none focus:border-[#1d5fe5]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#3a475a]">Tên chương trình *</label>
                <input
                  type="text"
                  required
                  placeholder="Giảm giá mùa hè"
                  value={promoForm.name}
                  onChange={(e) => setPromoForm({ ...promoForm, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#dfe7f5] px-3 py-1.5 text-xs font-medium text-[#0b1c30] outline-none focus:border-[#1d5fe5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-[#3a475a]">Hình thức *</label>
                  <select
                    value={promoForm.discountType}
                    onChange={(e) => setPromoForm({ ...promoForm, discountType: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[#dfe7f5] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0b1c30] outline-none focus:border-[#1d5fe5]"
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định (₫)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#3a475a]">Mức giảm *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder={promoForm.discountType === "percentage" ? "10" : "50000"}
                    value={promoForm.discountValue}
                    onChange={(e) => setPromoForm({ ...promoForm, discountValue: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[#dfe7f5] px-3 py-1.5 text-xs font-bold text-[#0b1c30] outline-none focus:border-[#1d5fe5]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#3a475a]">Lượt sử dụng tối đa</label>
                <input
                  type="number"
                  min="1"
                  value={promoForm.usageLimit}
                  onChange={(e) => setPromoForm({ ...promoForm, usageLimit: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#dfe7f5] px-3 py-1.5 text-xs font-medium text-[#0b1c30] outline-none focus:border-[#1d5fe5]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPromoModal(false)}
                  className="rounded-xl border border-[#dfe7f5] px-3 py-1.5 text-xs font-bold text-[#3a475a] hover:bg-[#f8faff]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingPromo}
                  className="rounded-xl bg-[#1d5fe5] px-4 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-[#1550c7] disabled:opacity-60"
                >
                  {savingPromo ? "Đang tạo..." : "Xác nhận tạo"}
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
