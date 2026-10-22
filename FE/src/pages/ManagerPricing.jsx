import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Save, Plus, X, Tag, Receipt, Warehouse, AlertTriangle, CheckCircle2 } from "lucide-react";
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
      setEditedRates({});
      setDirtyIds(new Set());

      setFees(feesRes?.items ?? []);
      setPromotions(promosRes?.items ?? []);
    } catch (err) {
      setError(err?.message || "Không thể tải bảng giá từ máy chủ.");
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
    } catch (err) {
      setPromotions((prev) =>
        prev.map((p) => (p.id === promoId ? { ...p, isActive: currentStatus } : p))
      );
      setError(err?.message || "Không thể cập nhật trạng thái khuyến mãi.");
    }
  };

  // Create new promotion
  const handleCreatePromo = async (e) => {
    e.preventDefault();
    if (!promoForm.code.trim() || !promoForm.name.trim() || !promoForm.discountValue) {
      setError("Vui lòng điền đầy đủ thông tin mã khuyến mãi.");
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
      setNotice("Đã tạo mã khuyến mãi thành công!");
      setTimeout(() => setNotice(""), 3500);
      await loadData();
    } catch (err) {
      setError(err?.message || "Không thể tạo mã khuyến mãi.");
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
            <h1>Bảng giá &amp; Chính sách</h1>
            <span className="reference-pill">
              {activeFacility ? `Cơ sở: ${activeFacility.name} (${activeFacility.code})` : "Toàn bộ hệ thống"}
            </span>
          </div>
          <p className="reference-muted mt-1">
            Điều chỉnh biểu phí thuê theo kích thước ô kho, quy định các khoản phạt và quản lý voucher ưu đãi.
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
              {saving ? "Đang lưu..." : `Lưu thay đổi (${dirtyIds.size})`}
            </button>
          )}

          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="reference-refresh"
            title="Làm mới bảng giá"
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
            <strong>Thông báo</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* 3 Metric Cards matching Dashboard */}
      <div className="mb-6 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <div className="reference-card p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-[#767679]">
            <span>Loại ô kho &amp; Đơn giá</span>
            <Warehouse size={18} className="text-[#14121b]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#14121b]">
            {loading ? "..." : `${rates.length} loại ô`}
          </div>
          <div className="mt-1">
            <span className="reference-badge lime">Đang áp dụng</span>
          </div>
        </div>

        <div className="reference-card p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-[#767679]">
            <span>Quy định phụ phí</span>
            <Receipt size={18} className="text-[#14121b]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#14121b]">
            {loading ? "..." : `${fees.length} khoản phí`}
          </div>
          <div className="mt-1 text-xs text-[#767679]">Phí trễ hạn, phạt hư hại, mất khóa</div>
        </div>

        <div className="reference-card p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-[#767679]">
            <span>Mã khuyến mãi &amp; Voucher</span>
            <Tag size={18} className="text-[#14121b]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#14121b]">
            {loading ? "..." : `${promotions.filter((p) => p.isActive).length} mã đang chạy`}
          </div>
          <div className="mt-1 text-xs text-[#767679]">Tổng cộng {promotions.length} mã đã tạo</div>
        </div>
      </div>

      {/* Main Rates Table */}
      <section className="reference-card reference-table-card mb-6">
        <div className="reference-card-heading">
          <div>
            <h2>Bảng đơn giá thuê theo loại ô kho</h2>
            <p className="reference-muted">
              Nhập trực tiếp số tiền vào các ô để điều chỉnh mức giá • Đơn vị tính: VNĐ / tháng
            </p>
          </div>
          <span className="reference-pill">{rates.length} cấu hình giá</span>
        </div>

        <div className="reference-table-scroll">
          <table className="reference-table">
            <thead>
              <tr>
                <th scope="col">Loại ô kho</th>
                <th scope="col" className="text-right">Giá thuê / tháng (₫)</th>
                <th scope="col" className="text-right">Tiền đặt cọc (₫)</th>
                <th scope="col" className="text-right">Phí giữ chỗ (₫)</th>
                <th scope="col" className="text-center">Ngày hiệu lực</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-[#767679]">
                    Đang tải bảng giá từ máy chủ...
                  </td>
                </tr>
              ) : rates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-[#767679]">
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
                            ? new Date(rate.validFrom).toLocaleDateString("vi-VN")
                            : "Hiện hành"}
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

      {/* Two Columns: Ancillary Fees & Promotions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Ancillary Fees */}
        <section className="reference-card p-5">
          <div className="reference-card-heading mb-3">
            <div>
              <h2>Quy định phụ phí &amp; Phạt vi phạm</h2>
              <p className="reference-muted">Các khoản phí tự động tính vào hóa đơn khi phát sinh</p>
            </div>
            <span className="reference-pill">{fees.length} khoản phí</span>
          </div>

          <div className="space-y-2.5">
            {loading ? (
              <p className="py-6 text-center text-xs text-[#767679]">Đang tải phụ phí...</p>
            ) : fees.length === 0 ? (
              <p className="py-6 text-center text-xs text-[#767679]">Chưa có quy định phụ phí nào.</p>
            ) : (
              fees.map((fee) => (
                <div
                  key={fee.id}
                  className="flex items-center justify-between rounded-2xl border border-[#ededed] bg-white p-3.5 transition hover:shadow-2xs"
                >
                  <div>
                    <div className="font-bold text-[#14121b]">{fee.code}</div>
                    <div className="text-[10px] text-[#767679] mt-0.5">
                      Loại: {fee.feeType} {fee.facilityName ? `• ${fee.facilityName}` : "• Toàn hệ thống"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-[#b54708]">
                      {formatFeeValue(fee)}
                    </div>
                    <span
                      className={`reference-status !text-[8px] !py-0.5 !px-2 mt-1 ${
                        fee.isActive ? "active" : "inactive"
                      }`}
                    >
                      {fee.isActive ? "Áp dụng" : "Tạm ngưng"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Promotions */}
        <section className="reference-card p-5">
          <div className="reference-card-heading mb-3">
            <div>
              <h2>Mã giảm giá &amp; Khuyến mãi</h2>
              <p className="reference-muted">Chương trình ưu đãi áp dụng khi khách hàng thuê kho</p>
            </div>
            <button
              type="button"
              onClick={() => setShowPromoModal(true)}
              className="reference-button-primary !py-1 !px-3 !text-xs"
            >
              <Plus size={13} /> Tạo mã mới
            </button>
          </div>

          <div className="space-y-2.5">
            {loading ? (
              <p className="py-6 text-center text-xs text-[#767679]">Đang tải mã khuyến mãi...</p>
            ) : promotions.length === 0 ? (
              <p className="py-6 text-center text-xs text-[#767679]">Chưa có mã khuyến mãi nào.</p>
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
                        ? `Giảm ${promo.discountValue}%`
                        : `Giảm ${formatCurrency(promo.discountValue)}`}
                      {promo.usageLimit ? ` • Giới hạn: ${promo.usageLimit} lượt` : ""}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleTogglePromo(promo.id, promo.isActive)}
                      className={`h-5 w-9 rounded-full transition-colors cursor-pointer ${
                        promo.isActive ? "bg-black" : "bg-slate-200"
                      }`}
                      title={promo.isActive ? "Nhấp để tạm ngưng" : "Nhấp để kích hoạt"}
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
      </div>

      {/* Modal: Create Promotion */}
      {showPromoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm reference-card !bg-white p-6 shadow-2xl">
            <div className="reference-card-heading mb-4 pb-3 border-b border-[#ededed]">
              <h2>Tạo mã khuyến mãi mới</h2>
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
                  Mã Voucher (Code) <span className="text-red-500">*</span>
                </span>
                <input
                  type="text"
                  required
                  placeholder="VD: GIAM20"
                  value={promoForm.code}
                  onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value })}
                  className="reference-input uppercase font-mono"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-[#25232c]">
                  Tên chương trình ưu đãi <span className="text-red-500">*</span>
                </span>
                <input
                  type="text"
                  required
                  placeholder="VD: Khuyến mãi khai trương"
                  value={promoForm.name}
                  onChange={(e) => setPromoForm({ ...promoForm, name: e.target.value })}
                  className="reference-input"
                />
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-[#25232c]">Hình thức</span>
                  <select
                    value={promoForm.discountType}
                    onChange={(e) => setPromoForm({ ...promoForm, discountType: e.target.value })}
                    className="reference-select"
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed">Cố định (₫)</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-[#25232c]">
                    Mức giảm <span className="text-red-500">*</span>
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
                <span className="mb-1 block text-xs font-semibold text-[#25232c]">Lượt dùng tối đa</span>
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
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingPromo}
                  className="reference-button-primary"
                >
                  {savingPromo ? "Đang tạo..." : "Xác nhận tạo mã"}
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
