import { useState } from "react";
import { usePricingPolicy } from "../hooks/usePricingPolicy";

function formatCurrency(value) {
  return `${value.toLocaleString("vi-VN")} ₫`;
}

const emptyVoucherForm = {
  code: "",
  name: "",
  description: "",
  discountType: "percentage",
  discountValue: "",
  maxDiscountAmount: "",
  usageLimit: "",
  validFrom: "",
  validTo: "",
};

function AdminPricingPolicy() {
  const {
    versionBanner,
    header,
    headerActions,
    priceTerms,
    priceMatrix,
    basePrices,
    updateBasePrice,
    depositPercent,
    setDepositPercent,
    latePenaltyPercent,
    setLatePenaltyPercent,
    graceDays,
    setGraceDays,
    serviceFees,
    cancellationPolicy,
    cancellationNote,
    vouchers,
    activeVoucherIds,
    toggleVoucher,
    createVoucher,
    yieldRecommendation,
    loading,
    saving,
    error,
    notice,
    dismissNotice,
    dismissError,
    saveRateChanges,
    reload,
  } = usePricingPolicy();

  const [showVoucherForm, setShowVoucherForm] = useState(false);
  const [voucherForm, setVoucherForm] = useState(emptyVoucherForm);

  const updateVoucherForm = (field, value) => setVoucherForm((prev) => ({ ...prev, [field]: value }));

  async function submitVoucherForm(event) {
    event.preventDefault();
    const payload = {
      code: voucherForm.code,
      name: voucherForm.name,
      description: voucherForm.description || undefined,
      discountType: voucherForm.discountType,
      discountValue: Number(voucherForm.discountValue) || 0,
      maxDiscountAmount: voucherForm.maxDiscountAmount ? Number(voucherForm.maxDiscountAmount) : undefined,
      usageLimit: voucherForm.usageLimit ? Number(voucherForm.usageLimit) : undefined,
      validFrom: voucherForm.validFrom ? new Date(voucherForm.validFrom).toISOString() : undefined,
      validTo: voucherForm.validTo ? new Date(voucherForm.validTo).toISOString() : undefined,
      isActive: true,
    };
    const success = await createVoucher(payload);
    if (success) {
      setShowVoucherForm(false);
      setVoucherForm(emptyVoucherForm);
    }
  }

  function handleHeaderAction(actionId) {
    if (actionId === "reset") reload();
    else if (actionId === "save") saveRateChanges();
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold text-[#58657a]">
        <span className="rounded-full bg-[#0b1c30] px-2 py-0.5 text-[9px] font-bold text-white">{versionBanner.version}</span>
        <span>{versionBanner.scope}</span>
        <span className="ml-auto text-[#8996a9]">
          {versionBanner.editor} ({versionBanner.timestamp}) • <span className="font-bold text-[#1d5fe5] cursor-pointer hover:underline">View History</span>
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[20px] font-bold">{header.title}</h1>
            <span className="rounded-full bg-[#eef4ff] px-2 py-0.5 text-[9px] font-bold text-[#1d5fe5]">SYSTEM-WIDE</span>
          </div>
          <p className="mt-1 max-w-[560px] text-[11px] text-[#8996a9]">{header.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {headerActions.map((action) => (
            <button
              key={action.id}
              type="button"
              disabled={saving && action.id === "save"}
              onClick={() => handleHeaderAction(action.id)}
              className={`flex items-center gap-1.5 rounded-[8px] px-3 py-2 text-[11px] font-bold disabled:opacity-60 ${
                action.id === "save" ? "bg-[#1d5fe5] text-white" : "border border-[#dfe7f5] text-[#3a475a]"
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">{action.icon}</span>
              {action.id === "save" && saving ? "Đang lưu..." : action.label}
            </button>
          ))}
        </div>
      </div>

      {notice && (
        <p role="status" className="mt-3 rounded-[8px] bg-[#e7f8ee] px-3 py-2 text-[10px] font-semibold text-[#0e7b4c]">
          {notice}
          <button type="button" onClick={dismissNotice} className="ml-2 font-bold underline">Đóng</button>
        </p>
      )}
      {error && (
        <p role="alert" className="mt-3 rounded-[8px] bg-[#fdecec] px-3 py-2 text-[10px] font-semibold text-[#c0362c]">
          {error}
          <button type="button" onClick={dismissError} className="ml-2 font-bold underline">Đóng</button>
        </p>
      )}

      <div className="mt-5 rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-[13px] font-bold">
              <span className="rounded-full bg-[#1d5fe5] px-1.5 py-0.5 text-[9px] font-bold text-white">1</span>
              Rental Rate Matrix by Term &amp; Unit Category
            </div>
            <p className="mt-1 text-[10px] text-[#8996a9]">Edit 1-month base price — extended terms calculate discounts dynamically. Unit: VND/month (VAT incl.).</p>
          </div>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[11px]">
            <thead>
              <tr className="border-b border-[#eef1f8] text-[9px] font-bold uppercase tracking-[0.04em] text-[#8996a9]">
                <th className="py-2 pr-2">Unit Type &amp; Facility</th>
                {priceTerms.map((term) => (
                  <th key={term.id} className={`py-2 px-2 text-right ${term.highlight ? "text-[#1d5fe5]" : ""}`}>
                    {term.label}
                    <div className="font-semibold normal-case text-[#8996a9]">{term.note}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={priceTerms.length + 1} className="py-4 text-center text-[#8996a9]">Đang tải bảng giá...</td></tr>
              ) : priceMatrix.length === 0 ? (
                <tr><td colSpan={priceTerms.length + 1} className="py-4 text-center text-[#8996a9]">Chưa có bậc giá nào.</td></tr>
              ) : (
                priceMatrix.map((unit) => (
                  <tr key={unit.id} className="border-b border-[#f2f5fb]">
                    <td className="py-2.5 pr-2">
                      <div className="flex items-center gap-1.5 font-semibold">
                        {unit.label}
                        {unit.badge && <span className="rounded-full bg-[#eef4ff] px-1.5 py-0.5 text-[8px] font-bold text-[#1d5fe5]">{unit.badge}</span>}
                      </div>
                      <div className="text-[9px] text-[#8996a9]">{unit.spec}</div>
                    </td>
                    {unit.prices.map((price) => (
                      <td key={price.termId} className="py-2.5 px-2 text-right">
                        {price.termId === "m1" ? (
                          <input
                            value={basePrices[unit.id]}
                            onChange={(event) => updateBasePrice(unit.id, event.target.value)}
                            className="w-24 rounded-[6px] border border-[#dfe7f5] px-1.5 py-1 text-right text-[11px] font-semibold"
                          />
                        ) : (
                          <span className={price.termId === "m12" ? "font-bold text-[#1d5fe5]" : "font-semibold text-[#3a475a]"}>
                            {formatCurrency(price.amount)}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
          <div className="flex items-center gap-1.5 text-[13px] font-bold">
            <span className="rounded-full bg-[#1d5fe5] px-1.5 py-0.5 text-[9px] font-bold text-white">2</span>
            Security Deposit &amp; Late Penalty Policies
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-[10px] border border-[#eef1f8] p-3">
              <div className="text-[11px] font-bold">Security Deposit Ratio</div>
              <p className="mt-0.5 text-[9px] text-[#8996a9]">Protects facility property &amp; IoT lock hardware</p>
              <div className="mt-2 flex items-center gap-1.5">
                <input
                  value={depositPercent}
                  onChange={(event) => setDepositPercent(event.target.value)}
                  className="w-16 rounded-[6px] border border-[#dfe7f5] px-2 py-1 text-[11px] font-semibold"
                />
                <span className="text-[10px] text-[#8996a9]">% = 01 month rental rate</span>
              </div>
            </div>

            <div className="rounded-[10px] border border-[#eef1f8] p-3">
              <div className="text-[11px] font-bold">Late Penalty Rate</div>
              <p className="mt-0.5 text-[9px] text-[#8996a9]">Accrues daily after past due threshold</p>
              <div className="mt-2 flex items-center gap-1.5">
                <input
                  value={latePenaltyPercent}
                  onChange={(event) => setLatePenaltyPercent(event.target.value)}
                  className="w-16 rounded-[6px] border border-[#dfe7f5] px-2 py-1 text-[11px] font-semibold"
                />
                <span className="text-[10px] text-[#8996a9]">% / day past due</span>
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-[10px] border border-[#eef1f8] p-3">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-bold">Automated Latch PIN Suspension</div>
              <span className="rounded-full bg-[#fdecec] px-1.5 py-0.5 text-[8px] font-bold text-[#c0362c]">IoT System</span>
            </div>
            <p className="mt-0.5 text-[9px] text-[#8996a9]">If payment remains outstanding past grace period, lock PIN and access rights are automatically revoked.</p>
            <div className="mt-2 flex items-center gap-1.5">
              <input
                value={graceDays}
                onChange={(event) => setGraceDays(event.target.value)}
                className="w-16 rounded-[6px] border border-[#dfe7f5] px-2 py-1 text-[11px] font-semibold"
              />
              <span className="text-[10px] text-[#8996a9]">days grace period</span>
            </div>
          </div>

          <div className="mt-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.04em] text-[#8996a9]">Ancillary &amp; Operating Service Fees</div>
            <div className="mt-1.5 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {loading ? (
                <p className="text-[9px] text-[#8996a9]">Đang tải phụ phí...</p>
              ) : serviceFees.length === 0 ? (
                <p className="text-[9px] text-[#8996a9]">Chưa có phụ phí nào.</p>
              ) : (
                serviceFees.map((fee) => (
                  <div key={fee.id} className="rounded-[8px] border border-[#eef1f8] p-2">
                    <div className="text-[9px] text-[#8996a9]">{fee.label}</div>
                    <div className="mt-0.5 text-[11px] font-bold">{fee.value}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
          <div className="flex items-center gap-1.5 text-[13px] font-bold">
            <span className="rounded-full bg-[#1d5fe5] px-1.5 py-0.5 text-[9px] font-bold text-white">3</span>
            Reservation Cancellation &amp; Deposit Refund Policy
          </div>
          <p className="mt-1 text-[10px] text-[#8996a9]">Calculates refund percentage according to cancellation notice timeframe prior to move-in.</p>

          <div className="mt-3 space-y-2">
            {cancellationPolicy.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between rounded-[10px] border border-[#eef1f8] p-2.5">
                <div>
                  <div className="text-[11px] font-bold">{rule.label}</div>
                  <div className="text-[9px] text-[#8996a9]">{rule.note}</div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    rule.refundPercent === 100
                      ? "bg-[#e7f8ee] text-[#0e7b4c]"
                      : rule.refundPercent === 0
                      ? "bg-[#fdecec] text-[#c0362c]"
                      : "bg-[#fff2d8] text-[#a15c00]"
                  }`}
                >
                  {rule.refundPercent}% Refund
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-[8px] bg-[#eef4ff] p-2.5 text-[10px] text-[#3a475a]">
            <span className="font-bold text-[#1d5fe5]">B2B Refund Procedure: </span>
            {cancellationNote}
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-[13px] font-bold">
              <span className="rounded-full bg-[#1d5fe5] px-1.5 py-0.5 text-[9px] font-bold text-white">4</span>
              Promotional Campaigns &amp; Active Vouchers
            </div>
            <p className="mt-1 text-[10px] text-[#8996a9]">Manage promotional discount campaigns and toggle their active status.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowVoucherForm(true)}
            className="flex items-center gap-1.5 rounded-[8px] bg-[#1d5fe5] px-3 py-1.5 text-[10px] font-bold text-white"
          >
            <span className="material-symbols-outlined text-[14px]">add</span>
            Create New Voucher Campaign
          </button>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          {loading ? (
            <p className="text-[10px] text-[#8996a9]">Đang tải chương trình khuyến mãi...</p>
          ) : vouchers.length === 0 ? (
            <p className="text-[10px] text-[#8996a9]">Chưa có chương trình khuyến mãi nào.</p>
          ) : (
            vouchers.map((voucher) => {
              const isActive = activeVoucherIds.has(voucher.id);
              return (
                <div key={voucher.id} className="rounded-[10px] border border-[#eef1f8] p-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[#eef4ff] px-2 py-0.5 text-[9px] font-bold text-[#1d5fe5]">{voucher.tag}</span>
                    <button
                      onClick={() => toggleVoucher(voucher.id)}
                      className={`h-4 w-8 rounded-full transition ${isActive ? "bg-[#1d5fe5]" : "bg-[#dfe7f5]"}`}
                    >
                      <span className={`block h-3 w-3 rounded-full bg-white transition ${isActive ? "translate-x-4" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                  <div className="mt-1.5 text-[12px] font-bold text-[#1d5fe5]">{voucher.code}</div>
                  <div className="mt-0.5 text-[10px] text-[#3a475a]">{voucher.description}</div>
                  <div className="mt-0.5 text-[10px] font-semibold text-[#58657a]">{voucher.detail}</div>

                  <div className="mt-2 flex items-center justify-between border-t border-[#eef1f8] pt-2 text-[9px]">
                    <span className="font-semibold text-[#58657a]">{voucher.condition}</span>
                    <span className="text-[#8996a9]">Hết hạn: {voucher.expiry}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {showVoucherForm && (
        <dialog
          open
          aria-labelledby="voucher-form-title"
          className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-lg rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-xl backdrop:bg-black/40"
        >
          <form onSubmit={submitVoucherForm}>
            <div className="flex items-center justify-between">
              <h2 id="voucher-form-title" className="text-[14px] font-bold">Create New Voucher Campaign</h2>
              <button type="button" onClick={() => setShowVoucherForm(false)} className="text-[11px] font-semibold text-[#58657a] underline">
                Đóng
              </button>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-[10px] font-semibold text-[#3a475a]">
                Mã voucher *
                <input required value={voucherForm.code} onChange={(event) => updateVoucherForm("code", event.target.value)} className="rounded-[6px] border border-[#dfe7f5] px-2 py-1.5 text-[11px]" />
              </label>
              <label className="flex flex-col gap-1 text-[10px] font-semibold text-[#3a475a]">
                Tên chương trình *
                <input required value={voucherForm.name} onChange={(event) => updateVoucherForm("name", event.target.value)} className="rounded-[6px] border border-[#dfe7f5] px-2 py-1.5 text-[11px]" />
              </label>
              <label className="flex flex-col gap-1 text-[10px] font-semibold text-[#3a475a] sm:col-span-2">
                Mô tả
                <input value={voucherForm.description} onChange={(event) => updateVoucherForm("description", event.target.value)} className="rounded-[6px] border border-[#dfe7f5] px-2 py-1.5 text-[11px]" />
              </label>
              <label className="flex flex-col gap-1 text-[10px] font-semibold text-[#3a475a]">
                Loại giảm giá *
                <select value={voucherForm.discountType} onChange={(event) => updateVoucherForm("discountType", event.target.value)} className="rounded-[6px] border border-[#dfe7f5] px-2 py-1.5 text-[11px]">
                  <option value="percentage">Phần trăm (%)</option>
                  <option value="fixed">Số tiền cố định (₫)</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-[10px] font-semibold text-[#3a475a]">
                Giá trị giảm *
                <input required type="number" min="0" step="0.01" value={voucherForm.discountValue} onChange={(event) => updateVoucherForm("discountValue", event.target.value)} className="rounded-[6px] border border-[#dfe7f5] px-2 py-1.5 text-[11px]" />
              </label>
              {voucherForm.discountType === "percentage" && (
                <label className="flex flex-col gap-1 text-[10px] font-semibold text-[#3a475a]">
                  Giảm tối đa (₫)
                  <input type="number" min="0" step="0.01" value={voucherForm.maxDiscountAmount} onChange={(event) => updateVoucherForm("maxDiscountAmount", event.target.value)} className="rounded-[6px] border border-[#dfe7f5] px-2 py-1.5 text-[11px]" />
                </label>
              )}
              <label className="flex flex-col gap-1 text-[10px] font-semibold text-[#3a475a]">
                Giới hạn lượt dùng
                <input type="number" min="1" value={voucherForm.usageLimit} onChange={(event) => updateVoucherForm("usageLimit", event.target.value)} className="rounded-[6px] border border-[#dfe7f5] px-2 py-1.5 text-[11px]" />
              </label>
              <label className="flex flex-col gap-1 text-[10px] font-semibold text-[#3a475a]">
                Hiệu lực từ *
                <input required type="datetime-local" value={voucherForm.validFrom} onChange={(event) => updateVoucherForm("validFrom", event.target.value)} className="rounded-[6px] border border-[#dfe7f5] px-2 py-1.5 text-[11px]" />
              </label>
              <label className="flex flex-col gap-1 text-[10px] font-semibold text-[#3a475a]">
                Hiệu lực đến *
                <input required type="datetime-local" value={voucherForm.validTo} onChange={(event) => updateVoucherForm("validTo", event.target.value)} className="rounded-[6px] border border-[#dfe7f5] px-2 py-1.5 text-[11px]" />
              </label>
            </div>

            <button type="submit" disabled={saving} className="mt-4 w-full rounded-[8px] bg-[#1d5fe5] py-2 text-[11px] font-bold text-white disabled:opacity-60">
              {saving ? "Đang tạo..." : "Tạo chương trình khuyến mãi"}
            </button>
          </form>
        </dialog>
      )}

      <div className="mt-5 rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
        <div className="text-[13px] font-bold">Dynamic Yield &amp; Occupancy Balancing</div>
        <p className="mt-1 max-w-[640px] text-[10px] text-[#8996a9]">{yieldRecommendation.note}</p>

        <div className="mt-3 flex flex-wrap items-center gap-6">
          <div>
            <div className="text-[9px] font-bold uppercase text-[#8996a9]">Hub #04 Capacity</div>
            <div className="text-[19px] font-bold">{yieldRecommendation.occupancy}</div>
          </div>
          <div>
            <div className="text-[9px] font-bold uppercase text-[#8996a9]">Recommended Rate Increase</div>
            <div className="text-[19px] font-bold text-[#0e7b4c]">{yieldRecommendation.suggestion}</div>
          </div>
          <div className="flex flex-1 flex-wrap gap-3">
            <div className="flex h-16 flex-1 items-center justify-center rounded-[10px] bg-[#0b1c30] px-3 text-center text-[9px] font-semibold text-white/70">
              Zone A - Floor 1 Cold Storage Climate Zone
            </div>
            <div className="flex h-16 flex-1 items-center justify-center rounded-[10px] bg-[#0b1c30] px-3 text-center text-[9px] font-semibold text-white/70">
              Zone B &amp; Drive-up Garage - Heavy Duty Bay
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminPricingPolicy;
